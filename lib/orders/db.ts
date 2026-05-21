import { getSql } from "@/lib/db/sql";
import type { CustomerInfo, OrderPayload } from "@/lib/types/order";

export type Customer = {
  customer_id: number;
  email: string;
  phone: string;
  name: string;
  first_order_at: Date;
  last_order_at: Date;
  total_orders: number;
  lifetime_value_cents: number;
};

export type OrderRecord = {
  order_id: string;
  customer_id: number;
  payment_mode: "request" | "square";
  fulfillment_type: "pickup" | "delivery";
  pickup_location?: string;
  requested_time: string;
  order_notes?: string;
  subtotal_cents: number;
  tax_cents: number;
  tip_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  square_payment_id?: string;
  square_receipt_url?: string;
  delivery_address_line1?: string;
  delivery_address_line2?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_postal_code?: string;
};

/**
 * Find or create customer by email, fallback to phone if email not found.
 * Updates customer stats if returning customer.
 */
export async function upsertCustomer(
  customer: CustomerInfo,
  orderTotalCents: number,
): Promise<Customer | null> {
  const sql = getSql();
  if (!sql) return null;

  const email = customer.email?.trim().toLowerCase() || "";
  const phone = customer.phone?.trim() || "";
  const name = customer.name?.trim() || "";

  // Try to find by email first
  let existing: Customer[] = [];
  if (email) {
    existing = await sql<Customer[]>`
      SELECT * FROM customers 
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;
  }

  // Fallback: try phone if email didn't match
  if (existing.length === 0 && phone) {
    existing = await sql<Customer[]>`
      SELECT * FROM customers 
      WHERE phone = ${phone}
      LIMIT 1
    `;
  }

  // Update existing customer
  if (existing.length > 0) {
    const updated = await sql<Customer[]>`
      UPDATE customers
      SET 
        last_order_at = NOW(),
        total_orders = total_orders + 1,
        lifetime_value_cents = lifetime_value_cents + ${orderTotalCents},
        updated_at = NOW()
      WHERE customer_id = ${existing[0].customer_id}
      RETURNING *
    `;
    return updated[0] ?? null;
  }

  // Create new customer
  const created = await sql<Customer[]>`
    INSERT INTO customers (
      email,
      phone,
      name,
      first_order_at,
      last_order_at,
      total_orders,
      lifetime_value_cents
    )
    VALUES (
      ${email},
      ${phone},
      ${name},
      NOW(),
      NOW(),
      1,
      ${orderTotalCents}
    )
    RETURNING *
  `;

  return created[0] ?? null;
}

/**
 * Insert order record and line items.
 */
export async function insertOrder(
  orderId: string,
  customerId: number,
  payload: OrderPayload,
  squarePaymentId?: string,
  squareReceiptUrl?: string,
): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  // Insert order
  await sql`
    INSERT INTO orders (
      order_id,
      customer_id,
      payment_mode,
      fulfillment_type,
      pickup_location,
      requested_time,
      order_notes,
      subtotal_cents,
      tax_cents,
      tip_cents,
      delivery_fee_cents,
      total_cents,
      square_payment_id,
      square_receipt_url,
      delivery_address_line1,
      delivery_address_line2,
      delivery_city,
      delivery_state,
      delivery_postal_code
    )
    VALUES (
      ${orderId},
      ${customerId},
      ${payload.paymentMode},
      ${payload.fulfillment},
      ${payload.pickupLocation ?? null},
      ${payload.requestedTime},
      ${payload.orderNotes ?? null},
      ${payload.subtotalCents ?? 0},
      ${payload.taxCents ?? 0},
      ${payload.tipCents ?? 0},
      ${payload.deliveryFeeCents ?? 0},
      ${payload.totalCents ?? 0},
      ${squarePaymentId ?? null},
      ${squareReceiptUrl ?? null},
      ${payload.customer.addressLine1 ?? null},
      ${payload.customer.addressLine2 ?? null},
      ${payload.customer.city ?? null},
      ${payload.customer.state ?? null},
      ${payload.customer.postalCode ?? null}
    )
  `;

  // Insert line items
  for (const line of payload.items) {
    await sql`
      INSERT INTO order_lines (
        order_id,
        menu_item_id,
        name,
        description,
        image_url,
        unit_price_cents,
        quantity,
        notes,
        selected_meat,
        modifiers_json,
        selected_options_json,
        includes_fries
      )
      VALUES (
        ${orderId},
        ${line.menuItemId},
        ${line.name},
        ${line.description ?? null},
        ${line.imageUrl ?? null},
        ${line.unitPriceCents ?? 0},
        ${line.quantity},
        ${line.notes ?? null},
        ${line.selectedMeat ?? null},
        ${line.modifiers ? JSON.stringify(line.modifiers) : null},
        ${line.selectedOptions ? JSON.stringify(line.selectedOptions) : null},
        ${line.includesFries ?? false}
      )
    `;
  }

  return true;
}
