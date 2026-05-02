import { NextResponse } from "next/server";
import type { CartLine, CustomerInfo, FulfillmentType, PickupLocationId } from "@/lib/types/order";

type PaymentMode = "request" | "clover";

type Body = {
  paymentMode?: PaymentMode;
  /** @deprecated use paymentMode: "clover" instead */
  mode?: "request" | "payment";
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
  cloverToken?: string;
};

function resolvePaymentMode(body: Body): PaymentMode {
  if (body.paymentMode === "clover") return "clover";
  if (body.paymentMode === "request") return "request";
  if (body.mode === "payment") return "clover";
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

  if (paymentMode === "clover") {
    const token = body.cloverToken;
    if (!token || typeof token !== "string" || token.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid Clover token" },
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

  if (paymentMode === "request") {
    const orderId = `REQ-${Date.now()}`;
    return NextResponse.json({
      ok: true,
      orderId,
      paymentMode: "request",
      message: "Order request received. We’ll confirm pricing and pickup time.",
    });
  }

  const orderId = `LHL-${Date.now().toString(36).toUpperCase()}`;
  return NextResponse.json({
    ok: true,
    orderId,
    paymentMode: "clover",
    message: "Payment recorded.",
    echo: {
      fulfillment: body.fulfillment,
      lineCount: body.items.length,
      totalCents: body.totalCents,
    },
  });
}
