import { getSql } from "@/lib/db/sql";

let orderTablesReady = false;

export async function ensureOrderTables(): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  if (orderTablesReady) return true;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      first_order_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_order_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      total_orders INT NOT NULL DEFAULT 1,
      lifetime_value_cents BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique 
    ON customers (LOWER(email))
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS customers_phone_idx 
    ON customers (phone)
    WHERE phone != ''
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      order_id TEXT PRIMARY KEY,
      customer_id BIGINT NOT NULL REFERENCES customers (customer_id) ON DELETE RESTRICT,
      payment_mode TEXT NOT NULL CHECK (payment_mode IN ('request', 'square')),
      fulfillment_type TEXT NOT NULL CHECK (fulfillment_type IN ('pickup', 'delivery')),
      pickup_location TEXT,
      requested_time TEXT NOT NULL,
      order_notes TEXT,
      subtotal_cents INT NOT NULL,
      tax_cents INT NOT NULL,
      tip_cents INT NOT NULL,
      delivery_fee_cents INT NOT NULL,
      total_cents INT NOT NULL,
      square_payment_id TEXT,
      square_receipt_url TEXT,
      delivery_address_line1 TEXT,
      delivery_address_line2 TEXT,
      delivery_city TEXT,
      delivery_state TEXT,
      delivery_postal_code TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS orders_customer_id_idx 
    ON orders (customer_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS orders_created_at_idx 
    ON orders (created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS order_lines (
      line_id BIGSERIAL PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders (order_id) ON DELETE CASCADE,
      menu_item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      unit_price_cents INT NOT NULL,
      quantity INT NOT NULL,
      notes TEXT,
      selected_meat TEXT,
      modifiers_json TEXT,
      selected_options_json TEXT,
      includes_fries BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS order_lines_order_id_idx 
    ON order_lines (order_id)
  `;

  orderTablesReady = true;
  return true;
}
