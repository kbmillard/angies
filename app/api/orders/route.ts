import { NextResponse } from "next/server";
import type { CartLine, CustomerInfo, FulfillmentType, PickupLocationId, OrderPayload } from "@/lib/types/order";
import { ensureOrderTables } from "@/lib/orders/ensure-tables";
import { upsertCustomer, insertOrder } from "@/lib/orders/db";
import { createSquarePayment } from "@/lib/square/create-payment";
import { sendTelegramOrderNotification } from "@/lib/notifications/telegram";
import {
  sendCustomerOrderEmail,
  sendMerchantOrderEmail,
} from "@/lib/notifications/resend";

type PaymentMode = "request" | "square";

type Body = {
  paymentMode?: PaymentMode;
  fulfillment?: FulfillmentType;
  pickupLocation?: PickupLocationId;
  items?: CartLine[];
  customer?: CustomerInfo;
  requestedTime?: string;
  orderNotes?: string;
  subtotalCents?: number | null;
  taxCents?: number | null;
  tipCents?: number | null;
  deliveryFeeCents?: number | null;
  totalCents?: number | null;
  squareToken?: string;
};

function resolvePaymentMode(body: Body): PaymentMode {
  if (body.paymentMode === "square") return "square";
  if (body.paymentMode === "request") return "request";
  return "request";
}

function isCartLine(x: unknown): x is CartLine {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const price = o.unitPriceCents;
  const priceOk = price === null || typeof price === "number";
  return (
    typeof o.id === "string" &&
    typeof o.menuItemId === "string" &&
    typeof o.name === "string" &&
    typeof o.quantity === "number" &&
    priceOk
  );
}

function validateCustomer(customer: CustomerInfo | undefined) {
  if (
    !customer ||
    typeof customer.name !== "string" ||
    customer.name.trim().length < 2 ||
    typeof customer.phone !== "string" ||
    customer.phone.trim().length < 7
  ) {
    return "Customer name and phone are required";
  }
  return null;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const paymentMode = resolvePaymentMode(body);

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart is empty" }, { status: 400 });
  }
  if (!body.items.every(isCartLine)) {
    return NextResponse.json({ ok: false, error: "Invalid line items" }, { status: 400 });
  }

  if (body.fulfillment !== "pickup" && body.fulfillment !== "delivery") {
    return NextResponse.json({ ok: false, error: "Invalid fulfillment" }, { status: 400 });
  }

  const custErr = validateCustomer(body.customer);
  if (custErr) {
    return NextResponse.json({ ok: false, error: custErr }, { status: 400 });
  }

  if (!body.requestedTime || typeof body.requestedTime !== "string") {
    return NextResponse.json(
      { ok: false, error: "Requested time is required" },
      { status: 400 },
    );
  }

  if (body.fulfillment === "delivery") {
    const c = body.customer!;
    const a = c.addressLine1?.trim();
    const city = c.city?.trim();
    const state = c.state?.trim();
    const zip = c.postalCode?.trim();
    if (!a || !city || !state || !zip) {
      return NextResponse.json(
        { ok: false, error: "Delivery requires a full address" },
        { status: 400 },
      );
    }
  }

  if (paymentMode === "square") {
    const token = body.squareToken;
    if (!token || typeof token !== "string" || token.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid Square token" },
        { status: 400 },
      );
    }
    const hasNull = body.items.some((i) => i.unitPriceCents === null);
    if (hasNull) {
      return NextResponse.json(
        { ok: false, error: "Cannot charge while any item has pending pricing" },
        { status: 400 },
      );
    }
    const nums =
      typeof body.subtotalCents === "number" &&
      typeof body.taxCents === "number" &&
      typeof body.tipCents === "number" &&
      typeof body.deliveryFeeCents === "number" &&
      typeof body.totalCents === "number";
    if (!nums) {
      return NextResponse.json({ ok: false, error: "Invalid totals" }, { status: 400 });
    }
  }

  // Ensure database tables exist
  await ensureOrderTables();

  // Build order payload
  const orderPayload: OrderPayload = {
    paymentMode,
    fulfillment: body.fulfillment!,
    pickupLocation: body.pickupLocation,
    items: body.items!,
    customer: body.customer!,
    requestedTime: body.requestedTime!,
    orderNotes: body.orderNotes,
    subtotalCents: body.subtotalCents ?? 0,
    taxCents: body.taxCents ?? 0,
    tipCents: body.tipCents ?? 0,
    deliveryFeeCents: body.deliveryFeeCents ?? 0,
    totalCents: body.totalCents ?? 0,
    squareToken: body.squareToken,
  };

  // 1. Upsert customer
  const customer = await upsertCustomer(
    orderPayload.customer,
    orderPayload.totalCents ?? 0,
  );
  if (!customer) {
    return NextResponse.json(
      { ok: false, error: "Failed to save customer data" },
      { status: 500 },
    );
  }

  // 2. Charge Square if payment mode is square
  let squarePaymentId: string | undefined;
  let squareReceiptUrl: string | undefined;

  if (paymentMode === "square") {
    const paymentResult = await createSquarePayment(
      body.squareToken!,
      orderPayload.totalCents ?? 0,
      orderPayload.customer.email,
    );

    if (!paymentResult.success) {
      return NextResponse.json(
        { ok: false, error: `Payment failed: ${paymentResult.error}` },
        { status: 400 },
      );
    }

    squarePaymentId = paymentResult.paymentId;
    squareReceiptUrl = paymentResult.receiptUrl;
  }

  // 3. Generate order ID
  const orderId =
    paymentMode === "request"
      ? `REQ-${Date.now()}`
      : `ANG-${Date.now().toString(36).toUpperCase()}`;

  // 4. Insert order into database
  const orderInserted = await insertOrder(
    orderId,
    customer.customer_id,
    orderPayload,
    squarePaymentId,
    squareReceiptUrl,
  );

  if (!orderInserted) {
    return NextResponse.json(
      { ok: false, error: "Failed to save order" },
      { status: 500 },
    );
  }

  // 5. Send Telegram notification to Angie (fire and forget)
  sendTelegramOrderNotification(orderId, orderPayload).catch((err) => {
    console.error("[TELEGRAM ERROR]", orderId, err?.message || err);
  });

  // 5b. Merchant email backup
  const merchantEmailResult = await sendMerchantOrderEmail(orderId, orderPayload);
  if (!merchantEmailResult.success) {
    console.error("[MERCHANT EMAIL ERROR]", orderId, merchantEmailResult.error);
  }

  // 6. Customer email confirmation
  const customerEmailResult = await sendCustomerOrderEmail(orderId, orderPayload);
  if (!customerEmailResult.success) {
    console.error("[CUSTOMER EMAIL ERROR]", orderId, customerEmailResult.error);
  }

  // 7. Return success
  if (paymentMode === "request") {
    return NextResponse.json({
      ok: true,
      orderId,
      paymentMode: "request",
      message: "Order request received. We'll confirm pricing and pickup time.",
      merchantEmailSent: merchantEmailResult.success,
      customerEmailSent: customerEmailResult.success,
    });
  }

  return NextResponse.json({
    ok: true,
    orderId,
    paymentMode: "square",
    message: "Payment recorded. You'll receive a confirmation email shortly.",
    receiptUrl: squareReceiptUrl,
    merchantEmailSent: merchantEmailResult.success,
    customerEmailSent: customerEmailResult.success,
  });
}
