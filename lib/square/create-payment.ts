import { SquareClient, SquareEnvironment } from "square";
import { randomUUID } from "crypto";

export type SquarePaymentResult = {
  success: boolean;
  paymentId?: string;
  receiptUrl?: string;
  error?: string;
};

/**
 * Charge a card using Square Payments API.
 * @param sourceId - The card token from Square Web Payments SDK
 * @param amountCents - Total amount to charge in cents
 * @param customerEmail - Customer email for receipt
 * @param orderId - Order ID for reference
 */
export async function createSquarePayment(
  sourceId: string,
  amountCents: number,
  customerEmail?: string,
  orderId?: string,
): Promise<SquarePaymentResult> {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  const environment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT;

  if (!accessToken) {
    return { success: false, error: "Square access token not configured" };
  }

  if (!locationId) {
    return { success: false, error: "Square location ID not configured" };
  }

  const squareEnv =
    environment === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox;

  try {
    const client = new SquareClient({
      token: accessToken,
      environment: squareEnv,
    });

    const response = await client.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(amountCents),
        currency: "USD",
      },
      locationId,
      autocomplete: true,
      ...(customerEmail && { buyerEmailAddress: customerEmail }),
      ...(orderId && {
        referenceId: orderId,
        note: `Order ${orderId}`,
      }),
    });

    const payment = response.payment;
    if (payment?.id) {
      return {
        success: true,
        paymentId: payment.id,
        receiptUrl: payment.receiptUrl,
      };
    }

    return { success: false, error: "Payment response missing payment object" };
  } catch (error) {
    console.error("Square payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown Square payment error";
    return { success: false, error: errorMessage };
  }
}
