export type FulfillmentType = "pickup" | "delivery";

export type PickupLocationId = "restaurant" | "truck";

export type PaymentMode = "request" | "clover";

export type OrderStatus =
  | "idle"
  | "validating"
  | "submitting"
  | "confirmed"
  | "error";

export type CartModifier = { id: string; label: string; priceCents: number };

export type CartLine = {
  id: string;
  menuItemId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  /** null until menu price is confirmed */
  unitPriceCents: number | null;
  quantity: number;
  notes?: string;
  modifiers?: CartModifier[];
  selectedMeat?: string;
  /** Values keyed by option group id (e.g. format → Gordita Maíz) */
  selectedOptions?: Record<string, string>;
  includesFries?: boolean;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

export type TipPreset = "none" | "15" | "18" | "20" | "custom";

export type OrderPayload = {
  paymentMode: PaymentMode;
  fulfillment: FulfillmentType;
  pickupLocation?: PickupLocationId;
  items: CartLine[];
  customer: CustomerInfo;
  requestedTime: string;
  orderNotes?: string;
  subtotalCents: number | null;
  taxCents: number | null;
  tipCents: number | null;
  deliveryFeeCents: number | null;
  totalCents: number | null;
  cloverToken?: string | null;
};
