"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { priceDollarsToCents } from "@/lib/menu/schema";
import {
  itemRequiresOptionSelections,
  optionSelectionsComplete,
  selectionsKey,
} from "@/lib/menu/option-groups";
import { useMenuCatalog } from "@/context/MenuCatalogContext";
import { resolveAnchorScrollId, scrollDocumentToAnchor } from "@/lib/utils/scroll-to-anchor";
import type {
  CartLine,
  CustomerInfo,
  FulfillmentType,
  PickupLocationId,
  OrderStatus,
  TipPreset,
} from "@/lib/types/order";

const TAX_RATE = 0.088;
const DELIVERY_FEE_CENTS = 399;

function newLineId() {
  return `line_${Math.random().toString(36).slice(2, 10)}`;
}

type AddItemOptions = {
  quantity?: number;
  selectedMeat?: string;
  selectedOptions?: Record<string, string>;
};

type OrderContextValue = {
  cart: CartLine[];
  addItem: (menuItemId: string, opts?: AddItemOptions) => void;
  updateQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  fulfillment: FulfillmentType;
  setFulfillment: (f: FulfillmentType) => void;
  pickupLocation: PickupLocationId;
  setPickupLocation: (p: PickupLocationId) => void;
  customer: CustomerInfo;
  setCustomer: (c: Partial<CustomerInfo>) => void;
  requestedTime: string;
  setRequestedTime: (t: string) => void;
  orderNotes: string;
  setOrderNotes: (n: string) => void;
  tipPreset: TipPreset;
  setTipPreset: (t: TipPreset) => void;
  customTipCents: number;
  setCustomTipCents: (n: number) => void;
  cloverToken: string | null;
  setCloverToken: (t: string | null) => void;
  orderDrawerOpen: boolean;
  setOrderDrawerOpen: (v: boolean) => void;
  paymentModalOpen: boolean;
  setPaymentModalOpen: (v: boolean) => void;
  orderStatus: OrderStatus;
  orderError: string | null;
  confirmationId: string | null;
  successMessage: string | null;
  cartHasUnpricedItems: boolean;
  subtotalCents: number;
  taxCents: number;
  deliveryFeeCents: number;
  tipCents: number;
  totalCents: number;
  canOpenPayment: boolean;
  canSendOrderRequest: boolean;
  openOrderPanel: () => void;
  scrollToSection: (id: string, options?: { offset?: number }) => void;
  focusMenu: () => void;
  focusCatering: () => void;
  focusSchedule: () => void;
  /** Clover checkout — requires all lines priced */
  submitOrder: (cloverTokenOverride?: string | null) => Promise<void>;
  /** Order request when any line is unpriced — no card charge */
  submitOrderRequest: () => Promise<void>;
};

const OrderContext = createContext<OrderContextValue | null>(null);

const initialCustomer: CustomerInfo = {
  name: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

function normMeat(m?: string) {
  return (m ?? "").trim();
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { itemsById } = useMenuCatalog();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("pickup");
  const [pickupLocation, setPickupLocation] = useState<PickupLocationId>("truck");
  const [customer, setCustomerState] = useState<CustomerInfo>(initialCustomer);
  const [requestedTime, setRequestedTime] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [tipPreset, setTipPreset] = useState<TipPreset>("18");
  const [customTipCents, setCustomTipCents] = useState(0);
  const [cloverToken, setCloverToken] = useState<string | null>(null);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setCustomer = useCallback((c: Partial<CustomerInfo>) => {
    setCustomerState((prev) => ({ ...prev, ...c }));
  }, []);

  const cartHasUnpricedItems = useMemo(
    () => cart.some((l) => l.unitPriceCents === null),
    [cart],
  );

  const addItem = useCallback(
    (menuItemId: string, opts?: AddItemOptions) => {
      const item = itemsById.get(menuItemId);
      if (!item) return;
      const qty = opts?.quantity ?? 1;
      const selectedMeat = opts?.selectedMeat;
      const rawSel = opts?.selectedOptions;
      const selectedOptions =
        rawSel && Object.keys(rawSel).length > 0 ? rawSel : undefined;

      if (item.meatChoiceRequired && !selectedMeat?.trim()) return;
      if (
        itemRequiresOptionSelections(item) &&
        !optionSelectionsComplete(item, selectedOptions ?? {})
      ) {
        return;
      }

      const unitPriceCents = priceDollarsToCents(item.price);
      const includesFries = item.includesFries;

      setCart((prev) => {
        const existing = prev.find(
          (l) =>
            l.menuItemId === menuItemId &&
            normMeat(l.selectedMeat) === normMeat(selectedMeat) &&
            selectionsKey(l.selectedOptions) === selectionsKey(selectedOptions) &&
            !(l.notes?.trim()),
        );
        if (existing) {
          return prev.map((l) =>
            l.id === existing.id ? { ...l, quantity: l.quantity + qty } : l,
          );
        }
        const line: CartLine = {
          id: newLineId(),
          menuItemId: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          unitPriceCents,
          quantity: qty,
          selectedMeat: selectedMeat?.trim() || undefined,
          selectedOptions,
          includesFries: includesFries || undefined,
        };
        return [...prev, line];
      });
      setOrderStatus("idle");
      setConfirmationId(null);
      setSuccessMessage(null);
      setCloverToken(null);
    },
    [itemsById],
  );

  const updateQty = useCallback((lineId: string, qty: number) => {
    if (qty < 1) {
      setCart((prev) => prev.filter((l) => l.id !== lineId));
      return;
    }
    setCart((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, quantity: qty } : l)),
    );
    setCloverToken(null);
    setSuccessMessage(null);
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setCart((prev) => prev.filter((l) => l.id !== lineId));
    setCloverToken(null);
    setSuccessMessage(null);
  }, []);

  const subtotalCents = useMemo(
    () =>
      cart.reduce((sum, l) => {
        if (l.unitPriceCents === null) return sum;
        return sum + l.unitPriceCents * l.quantity;
      }, 0),
    [cart],
  );

  const deliveryFeeCents = fulfillment === "delivery" ? DELIVERY_FEE_CENTS : 0;

  const tipCents = useMemo(() => {
    if (cartHasUnpricedItems) return 0;
    if (tipPreset === "none") return 0;
    if (tipPreset === "custom") return Math.max(0, customTipCents);
    const pct = Number(tipPreset) / 100;
    return Math.round(subtotalCents * pct);
  }, [cartHasUnpricedItems, customTipCents, subtotalCents, tipPreset]);

  const taxCents = useMemo(() => {
    if (cartHasUnpricedItems) return 0;
    return Math.round((subtotalCents + deliveryFeeCents) * TAX_RATE);
  }, [cartHasUnpricedItems, deliveryFeeCents, subtotalCents]);

  const totalCents = useMemo(() => {
    if (cartHasUnpricedItems) return 0;
    return subtotalCents + deliveryFeeCents + taxCents + tipCents;
  }, [cartHasUnpricedItems, deliveryFeeCents, subtotalCents, taxCents, tipCents]);

  const deliveryFieldsOk =
    fulfillment === "pickup" ||
    Boolean(
      customer.addressLine1?.trim() &&
        customer.city?.trim() &&
        customer.state?.trim() &&
        customer.postalCode?.trim(),
    );

  const checkoutFormValid = useMemo(() => {
    return (
      cart.length > 0 &&
      customer.name.trim().length > 1 &&
      customer.phone.trim().length > 6 &&
      requestedTime.trim().length > 0 &&
      deliveryFieldsOk
    );
  }, [cart.length, customer, deliveryFieldsOk, requestedTime]);

  const canSendOrderRequest = checkoutFormValid;

  const canOpenPayment = useMemo(() => {
    return checkoutFormValid && !cartHasUnpricedItems;
  }, [cartHasUnpricedItems, checkoutFormValid]);

  const openOrderPanel = useCallback(() => {
    setOrderDrawerOpen(true);
  }, []);

  const scrollToSection = useCallback((id: string, options?: { offset?: number }) => {
    scrollDocumentToAnchor(resolveAnchorScrollId(id), options);
  }, []);

  const focusMenu = useCallback(() => {
    scrollToSection("menu");
  }, [scrollToSection]);

  const focusCatering = useCallback(() => {
    scrollToSection("catering");
  }, [scrollToSection]);

  const focusSchedule = useCallback(() => {
    scrollToSection("schedule");
  }, [scrollToSection]);

  const submitOrderRequest = useCallback(async () => {
    if (!canSendOrderRequest) return;
    setOrderStatus("submitting");
    setOrderError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMode: "request",
          fulfillment,
          pickupLocation: fulfillment === "pickup" ? pickupLocation : undefined,
          items: cart,
          customer,
          requestedTime,
          orderNotes,
          subtotalCents: cartHasUnpricedItems ? null : subtotalCents,
          taxCents: cartHasUnpricedItems ? null : taxCents,
          tipCents: cartHasUnpricedItems ? null : tipCents,
          deliveryFeeCents: cartHasUnpricedItems ? null : deliveryFeeCents,
          totalCents: cartHasUnpricedItems ? null : totalCents,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        orderId?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Order failed");
      }
      setConfirmationId(data.orderId ?? null);
      setSuccessMessage(
        data.message ??
          "Order request received. We’ll confirm pricing and pickup time.",
      );
      setOrderStatus("confirmed");
      setCart([]);
      setCloverToken(null);
    } catch (e) {
      setOrderStatus("error");
      setOrderError(e instanceof Error ? e.message : "Unknown error");
    }
  }, [
    canSendOrderRequest,
    cart,
    cartHasUnpricedItems,
    customer,
    deliveryFeeCents,
    fulfillment,
    orderNotes,
    pickupLocation,
    requestedTime,
    subtotalCents,
    taxCents,
    tipCents,
    totalCents,
  ]);

  const submitOrder = useCallback(
    async (cloverTokenOverride?: string | null) => {
      const token = cloverTokenOverride ?? cloverToken;
      if (cartHasUnpricedItems || !token || !canOpenPayment) return;
      setOrderStatus("submitting");
      setOrderError(null);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMode: "clover",
            fulfillment,
            pickupLocation: fulfillment === "pickup" ? pickupLocation : undefined,
            items: cart,
            customer,
            requestedTime,
            orderNotes,
            subtotalCents,
            taxCents,
            tipCents,
            deliveryFeeCents,
            totalCents,
            cloverToken: token,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          orderId?: string;
          error?: string;
          message?: string;
        };
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Order failed");
        }
        setConfirmationId(data.orderId ?? null);
        setSuccessMessage(data.message ?? "Payment recorded.");
        setOrderStatus("confirmed");
        setPaymentModalOpen(false);
        setCart([]);
        setCloverToken(null);
      } catch (e) {
        setOrderStatus("error");
        setOrderError(e instanceof Error ? e.message : "Unknown error");
      }
    },
    [
      canOpenPayment,
      cart,
      cartHasUnpricedItems,
      cloverToken,
      customer,
      deliveryFeeCents,
      fulfillment,
      orderNotes,
      pickupLocation,
      requestedTime,
      subtotalCents,
      taxCents,
      tipCents,
      totalCents,
    ],
  );

  const value = useMemo<OrderContextValue>(
    () => ({
      cart,
      addItem,
      updateQty,
      removeLine,
      fulfillment,
      setFulfillment,
      pickupLocation,
      setPickupLocation,
      customer,
      setCustomer,
      requestedTime,
      setRequestedTime,
      orderNotes,
      setOrderNotes,
      tipPreset,
      setTipPreset,
      customTipCents,
      setCustomTipCents,
      cloverToken,
      setCloverToken,
      orderDrawerOpen,
      setOrderDrawerOpen,
      paymentModalOpen,
      setPaymentModalOpen,
      orderStatus,
      orderError,
      confirmationId,
      successMessage,
      cartHasUnpricedItems,
      subtotalCents,
      taxCents,
      deliveryFeeCents,
      tipCents,
      totalCents,
      canOpenPayment,
      canSendOrderRequest,
      openOrderPanel,
      scrollToSection,
      focusMenu,
      focusCatering,
      focusSchedule,
      submitOrder,
      submitOrderRequest,
    }),
    [
      addItem,
      canOpenPayment,
      canSendOrderRequest,
      cart,
      cartHasUnpricedItems,
      cloverToken,
      confirmationId,
      customer,
      customTipCents,
      deliveryFeeCents,
      fulfillment,
      openOrderPanel,
      focusCatering,
      focusSchedule,
      focusMenu,
      orderDrawerOpen,
      orderError,
      orderNotes,
      orderStatus,
      paymentModalOpen,
      pickupLocation,
      removeLine,
      requestedTime,
      scrollToSection,
      setCustomer,
      subtotalCents,
      submitOrder,
      submitOrderRequest,
      successMessage,
      taxCents,
      tipCents,
      tipPreset,
      totalCents,
      updateQty,
    ],
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
