import type { CustomerInfo, OrderPayload } from "@/lib/types/order";
import { formatLineItemTelegram } from "@/lib/orders/format-line-details";

export type TelegramNotificationResult = {
  success: boolean;
  error?: string;
};

function formatCustomerInfo(customer: CustomerInfo): string {
  const parts: string[] = [];

  parts.push(`👤 Customer: ${customer.name}`);

  if (customer.email) {
    parts.push(`📧 ${customer.email}`);
  }

  if (customer.phone) {
    parts.push(`📱 ${customer.phone}`);
  }

  return parts.join("\n");
}

function formatFulfillment(payload: OrderPayload): string {
  if (payload.fulfillment === "delivery") {
    const addr = payload.customer;
    const parts = [addr.addressLine1, addr.addressLine2]
      .filter(Boolean)
      .join(", ");
    const cityState = [addr.city, addr.state].filter(Boolean).join(", ");
    return `🚚 Delivery to:\n${parts}\n${cityState} ${addr.postalCode || ""}`.trim();
  }

  const location = payload.pickupLocation === "restaurant" ? "Restaurant" : "Truck";
  return `📍 Pickup at ${location}`;
}

function displayOrderNumber(orderId: string): string {
  return orderId.replace(/^(ANG|REQ)-/i, "");
}

function formatPaymentLine(
  payload: OrderPayload,
  squareReceiptUrl?: string,
): string {
  if (payload.paymentMode === "square") {
    const receipt = squareReceiptUrl?.trim();
    return receipt
      ? `💳 PAID via Square\n🧾 ${receipt}`
      : "💳 PAID via Square";
  }
  return "📋 Order request (confirm pricing at pickup)";
}

/**
 * Send order notification to Telegram bot chat (personal or group).
 */
export async function sendTelegramOrderNotification(
  orderId: string,
  payload: OrderPayload,
  options?: { squareReceiptUrl?: string },
): Promise<TelegramNotificationResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ORDERS_CHAT_ID;

  if (!botToken) {
    console.warn("TELEGRAM_BOT_TOKEN not configured, skipping notification");
    return { success: false, error: "Bot token not configured" };
  }

  if (!chatId) {
    console.warn("TELEGRAM_ORDERS_CHAT_ID not configured, skipping notification");
    return { success: false, error: "Chat ID not configured" };
  }

  const totalDollars = ((payload.totalCents ?? 0) / 100).toFixed(2);
  const items = payload.items.map(formatLineItemTelegram).join("\n");
  const num = displayOrderNumber(orderId);

  const message = `
#NEWORDER
${num}

${formatPaymentLine(payload, options?.squareReceiptUrl)}

${formatCustomerInfo(payload.customer)}

💵 Total: $${totalDollars}
${formatFulfillment(payload)}
⏰ Requested: ${payload.requestedTime}

🌮 ORDER:
${items}
${payload.orderNotes ? `\n💬 Notes: "${payload.orderNotes}"` : ""}
`.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Telegram API error:", errorText);
      return { success: false, error: `Telegram API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
