# Order System Implementation Guide

## What Was Built

Your order system now includes:

1. **Customer Profiles** - Tracks repeat customers by email/phone with order history
2. **Order Persistence** - All orders saved to Postgres with full details
3. **Square Payments** - Server-side credit card charging via Square API
4. **Telegram Notifications** - Instant push notifications to Angie's group chat
5. **Customer Email Receipts** - Professional itemized confirmations via Resend

## Database Schema

Three new tables were created:

### `customers`
- Tracks unique customers by email (primary) and phone (secondary)
- Detects returning customers automatically
- Records order history and lifetime value

### `orders`
- Links to customer record
- Stores fulfillment details, totals, Square payment info
- Includes delivery address for delivery orders

### `order_lines`
- Itemized order details (what they ordered)
- Modifiers, selected meats, special instructions

## Environment Variables Setup

You need to configure these in your `.env` file and Vercel dashboard:

### 1. Square (Already Have)
```bash
NEXT_PUBLIC_SQUARE_APPLICATION_ID="sandbox-sq0idb-..."
NEXT_PUBLIC_SQUARE_LOCATION_ID="LHZRYEZ..."
NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
SQUARE_ACCESS_TOKEN="EAAAl7dS8SEhLEUpEms-..."
```

**When ready for production:**
- Change `NEXT_PUBLIC_SQUARE_ENVIRONMENT=production`
- Replace sandbox credentials with production keys from Square dashboard

### 2. Telegram (For Angie's Notifications)
```bash
TELEGRAM_BOT_TOKEN="8313797403:AAGgY1AK95GcFHCMRLi7NtgYSP5xL4ijG3o"
TELEGRAM_ORDERS_CHAT_ID="-5059689651"
```

**Already configured!** The "AngiesKC" group is set up and ready.

To add Angie:
1. Tell Angie to download Telegram app
2. Share the group invite link with her
3. She clicks the link and joins the "AngiesKC" group
4. Done! She'll now receive all order notifications

### 3. Resend (For Customer Emails)
```bash
RESEND_API_KEY="re_..."
```

**Setup steps:**
1. Go to https://resend.com and sign up (free tier)
2. Verify your account
3. Go to API Keys → Create API Key
4. Copy the key (starts with `re_...`)
5. Add to your `.env` and Vercel environment variables

**Optional - Custom Domain (order@angieskc.com):**
1. In Resend dashboard, go to Domains → Add Domain
2. Enter `angieskc.com`
3. Add the DNS records Resend provides to your domain registrar
4. Wait for verification (~1 hour)
5. Update `lib/notifications/resend.ts` line 82:
   ```typescript
   from: "Angie's KC <order@angieskc.com>",
   ```

For now, it will send from `onboarding@resend.dev` which works fine for testing.

## Order Flow

When a customer submits an order:

1. **Customer is upserted** - Found by email → phone → created new
2. **Square charge** (if payment mode is "square") - Card is charged via Square API
3. **Order is saved** - All order data persists to Postgres
4. **Telegram alert sent** - Angie's phone buzzes with order details
5. **Customer email sent** - Professional receipt with itemized order
6. **Response returned** - Order ID and success message to frontend

## Telegram Notification Format

Angie will receive messages like:

```
🚨 NEW ORDER #ANG-6H3K9 🚨

👤 Customer: John Doe
📧 john@email.com
📱 913-555-1234

💵 Total: $24.50
📍 Pickup at Truck
⏰ Requested: Today at 12:30 PM

🌮 ORDER:
• 2x Carne Asada Tacos
  → No onions, extra cilantro
• 1x California Burrito
• 1x Diet Coke

💬 Notes: "Please have ready by 12:30, running late!"
```

On mobile, phone numbers and emails are **clickable** - she can tap to call/text customers.

## Customer Email Format

Customers receive a professional HTML email with:
- Order number and fulfillment details
- Itemized list with prices
- Subtotal, tax, tip, delivery fee breakdown
- Total amount
- Angie's KC branding

## Testing in Sandbox

You can test the complete flow right now with your sandbox Square keys:

1. Make sure all env vars are set in `.env`
2. Run `npm run dev`
3. Go to the menu and add items to cart
4. Checkout with a test card number (Square sandbox accepts `4111 1111 1111 1111`)
5. Watch for:
   - Order confirmation on the website
   - Telegram message in the "AngiesKC" group
   - Email to the customer address you entered

**Sandbox limitations:**
- Square charges won't be real money
- Test card numbers only

## Going to Production

When ready to accept real orders:

1. **Get production Square keys:**
   - Log in to Square dashboard
   - Get production Application ID, Location ID, and Access Token
   
2. **Update environment variables:**
   ```bash
   NEXT_PUBLIC_SQUARE_ENVIRONMENT=production
   NEXT_PUBLIC_SQUARE_APPLICATION_ID="sq0idp-..."
   NEXT_PUBLIC_SQUARE_LOCATION_ID="..."
   SQUARE_ACCESS_TOKEN="..."
   ```

3. **Update in Vercel:**
   - Go to Vercel project settings → Environment Variables
   - Update all Square variables
   - Redeploy

4. **Test with a real card** (yours) to verify everything works

5. **You're live!** Real customers can now place orders and pay with real credit cards

## Customer Profile Benefits

Because you're tracking customers, you can now:

- See all orders from a specific customer in the database
- Track repeat customers automatically
- Calculate customer lifetime value
- Build loyalty features later (e.g., "5th burrito free!")
- Pre-fill checkout for returning customers (future feature)
- Send marketing emails to past customers (future feature)

## Files Created/Modified

**New files:**
- `lib/orders/ensure-tables.ts` - Database schema
- `lib/orders/db.ts` - Customer and order database helpers
- `lib/square/create-payment.ts` - Square payment charging
- `lib/notifications/telegram.ts` - Telegram bot notifications
- `lib/notifications/resend.ts` - Customer email confirmations

**Modified files:**
- `app/api/orders/route.ts` - Complete order processing flow
- `.env.example` - Documentation for all new env vars
- `package.json` - Added `square` and `resend` dependencies

## Next Steps

1. **Add Resend API key** to your environment variables
2. **Invite Angie** to the "AngiesKC" Telegram group
3. **Test sandbox flow** end-to-end
4. **Get production Square keys** when ready to go live
5. **Optional:** Set up custom email domain (order@angieskc.com)

## Questions?

- **"Can multiple people receive notifications?"** - Yes! Anyone in the "AngiesKC" Telegram group will get order alerts.
- **"How much does this cost?"** - Telegram is 100% free forever. Resend free tier is 3,000 emails/month. Square charges standard credit card processing fees (2.6% + 10¢).
- **"Can I see past orders?"** - Yes! Query the `orders` table in your Postgres database. You can build an admin panel for this later.
- **"What if email fails?"** - The order still saves and Angie still gets the Telegram notification. Email failures don't block orders.
