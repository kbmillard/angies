import { Resend } from "resend";
import {
  formatLineItemHtml,
  formatMerchantLineItemHtml,
} from "@/lib/orders/format-line-details";
import type { OrderPayload } from "@/lib/types/order";

export type ResendResult = {
  success: boolean;
  error?: string;
  messageId?: string;
};

/** Requires angieskc.com verified in Resend — override with RESEND_ORDER_FROM */
function getOrderFrom(): string {
  const from = process.env.RESEND_ORDER_FROM?.trim();
  if (from) return from;
  return "Angie's KC <orders@angieskc.com>";
}

/** Only sends when MERCHANT_ORDER_EMAILS is set — otherwise Telegram is the kitchen alert. */
function getMerchantOrderEmails(): string[] {
  const raw = process.env.MERCHANT_ORDER_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function formatMerchantFulfillmentHtml(payload: OrderPayload): string {
  if (payload.fulfillment === "delivery") {
    const addr = payload.customer;
    const parts = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ");
    const cityState = [addr.city, addr.state].filter(Boolean).join(", ");
    return `<strong>Delivery:</strong> ${parts}<br />${cityState} ${addr.postalCode ?? ""}`.trim();
  }
  const location = payload.pickupLocation === "restaurant" ? "Restaurant" : "Truck";
  return `<strong>Pickup:</strong> ${location}`;
}

function formatFulfillmentHtml(payload: OrderPayload): string {
  if (payload.fulfillment === "delivery") {
    const addr = payload.customer;
    const parts = [addr.addressLine1, addr.addressLine2]
      .filter(Boolean)
      .join(", ");
    const cityState = [addr.city, addr.state].filter(Boolean).join(", ");
    return `<strong>🚚 Delivery to:</strong><br />${parts}<br />${cityState} ${addr.postalCode || ""}`;
  }

  const location = payload.pickupLocation === "restaurant" ? "Restaurant" : "Truck";
  return `<strong>📍 Pickup at:</strong> ${location}`;
}

/**
 * Kitchen-ticket email to merchant inbox(es). Runs alongside Telegram.
 */
export async function sendMerchantOrderEmail(
  orderId: string,
  payload: OrderPayload,
): Promise<ResendResult> {
  const to = getMerchantOrderEmails();
  if (to.length === 0) {
    return { success: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[MERCHANT EMAIL]", orderId, "RESEND_API_KEY not configured");
    return { success: false, error: "Resend API key not configured" };
  }

  const resend = new Resend(apiKey);
  const total = ((payload.totalCents ?? 0) / 100).toFixed(2);
  const items = payload.items.map(formatMerchantLineItemHtml).join("");
  const { customer } = payload;

  const customerLines = [
    `<strong>Name:</strong> ${customer.name}`,
    customer.phone
      ? `<strong>Phone:</strong> <a href="tel:${customer.phone.replace(/\D/g, "")}">${customer.phone}</a>`
      : "",
    customer.email
      ? `<strong>Email:</strong> <a href="mailto:${customer.email}">${customer.email}</a>`
      : "",
  ]
    .filter(Boolean)
    .join("<br />");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New order</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #111; max-width: 560px; margin: 0 auto; padding: 16px;">
  <h1 style="margin: 0 0 8px; font-size: 20px;">New order #${orderId}</h1>
  <p style="margin: 0 0 16px; font-size: 18px; font-weight: bold;">Total: $${total}</p>
  <div style="background: #f4f4f4; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
    ${customerLines}
  </div>
  <p style="margin: 0 0 8px;">${formatMerchantFulfillmentHtml(payload)}<br />
  <strong>Requested:</strong> ${payload.requestedTime}</p>
  ${payload.orderNotes ? `<p style="margin: 12px 0;"><strong>Notes:</strong> ${payload.orderNotes}</p>` : ""}
  <h2 style="font-size: 16px; margin: 16px 0 8px;">Items</h2>
  <ul style="padding-left: 20px; margin: 0;">${items}</ul>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: getOrderFrom(),
      to,
      subject: `New order #${orderId} — $${total}`,
      html,
    });

    if (error) {
      console.error("[MERCHANT EMAIL]", orderId, error);
      return { success: false, error: error.message ?? "Resend error" };
    }

    console.log("[MERCHANT EMAIL]", orderId, "sent to", to.join(", "), data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[MERCHANT EMAIL]", orderId, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

/**
 * Send order confirmation email to customer via Resend.
 */
export async function sendCustomerOrderEmail(
  orderId: string,
  payload: OrderPayload,
): Promise<ResendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[CUSTOMER EMAIL]", orderId, "RESEND_API_KEY not configured");
    return { success: false, error: "Resend API key not configured" };
  }

  if (!payload.customer.email) {
    console.warn("[CUSTOMER EMAIL]", orderId, "Customer email not provided");
    return { success: false, error: "Customer email not provided" };
  }

  const resend = new Resend(apiKey);

  const subtotal = ((payload.subtotalCents ?? 0) / 100).toFixed(2);
  const tax = ((payload.taxCents ?? 0) / 100).toFixed(2);
  const tip = ((payload.tipCents ?? 0) / 100).toFixed(2);
  const deliveryFee = ((payload.deliveryFeeCents ?? 0) / 100).toFixed(2);
  const total = ((payload.totalCents ?? 0) / 100).toFixed(2);

  const items = payload.items.map(formatLineItemHtml).join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a1a1a; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">🌮 Angie's KC</h1>
    <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Order Confirmation</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
    <p>Hi ${payload.customer.name},</p>
    <p>Thanks for your order! We've received your request and will have it ready for you.</p>
    
    <div style="background: #fff; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <h2 style="margin: 0 0 10px; font-size: 18px; color: #1a1a1a;">Order #${orderId}</h2>
      <p style="margin: 5px 0; color: #666; font-size: 14px;">
        ${formatFulfillmentHtml(payload)}<br />
        <strong>⏰ Requested:</strong> ${payload.requestedTime}
      </p>
      ${payload.orderNotes ? `<p style="margin: 10px 0 5px; font-size: 14px;"><strong>💬 Special instructions:</strong><br />${payload.orderNotes}</p>` : ""}
    </div>
    
    <h3 style="margin: 20px 0 10px; font-size: 16px;">Your Order:</h3>
    <ul style="list-style: none; padding: 0; margin: 0 0 20px;">
      ${items}
    </ul>
    
    <div style="border-top: 2px solid #ddd; padding-top: 15px; margin-top: 15px;">
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">$${subtotal}</td>
        </tr>
        <tr>
          <td>Tax:</td>
          <td style="text-align: right;">$${tax}</td>
        </tr>
        ${tip !== "0.00" ? `<tr><td>Tip:</td><td style="text-align: right;">$${tip}</td></tr>` : ""}
        ${deliveryFee !== "0.00" ? `<tr><td>Delivery Fee:</td><td style="text-align: right;">$${deliveryFee}</td></tr>` : ""}
        <tr style="font-weight: bold; font-size: 16px; border-top: 1px solid #ddd;">
          <td style="padding-top: 8px;">Total:</td>
          <td style="text-align: right; padding-top: 8px;">$${total}</td>
        </tr>
      </table>
    </div>
    
    <div style="margin-top: 30px; padding: 15px; background: #fffbea; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Questions?</strong> Text or call us at the number on our website. We're here to help!
      </p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p style="margin: 0;">Angie's KC - Authentic Mexican Food</p>
    <p style="margin: 5px 0 0;">
      <a href="https://angieskc.com" style="color: #0066cc; text-decoration: none;">angieskc.com</a>
    </p>
  </div>
</body>
</html>
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: getOrderFrom(),
      to: payload.customer.email,
      subject: `Order Confirmation - #${orderId}`,
      html,
    });

    if (error) {
      console.error("[CUSTOMER EMAIL]", orderId, error);
      return { success: false, error: error.message ?? "Resend error" };
    }

    console.log("[CUSTOMER EMAIL]", orderId, "sent to", payload.customer.email, data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("[CUSTOMER EMAIL]", orderId, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
