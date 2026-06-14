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
      payment_mode TEXT NOT NULL CHECK (payment_mode IN ('request', 'square', 'checkout_link')),
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

  // Migrate existing DBs created before checkout_link payment mode
  await sql`
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_mode_check
  `;
  await sql`
    ALTER TABLE orders ADD CONSTRAINT orders_payment_mode_check
    CHECK (payment_mode IN ('request', 'square', 'checkout_link'))
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
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT
  `;
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_payment_link_id TEXT
  `;
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_order_id TEXT
  `;
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_checkout_url TEXT
  `;

  await sql`
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check
  `;
  await sql`
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
    CHECK (
      payment_status IS NULL
      OR payment_status IN ('pending', 'paid', 'failed', 'abandoned')
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS orders_square_order_id_idx
    ON orders (square_order_id)
    WHERE square_order_id IS NOT NULL
  `;

  await sql`
    UPDATE orders
    SET payment_status = 'paid'
    WHERE payment_status IS NULL
      AND payment_mode IN ('square', 'request')
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
