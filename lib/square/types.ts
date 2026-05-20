export type SquareEnv = "sandbox" | "production";

export type SquareCardTokenResult = {
  status: "OK" | "INVALID" | "ABORT" | "CANCEL" | "ERROR";
  token?: string;
  errors?: Array<{ message: string }>;
};

export type SquareCard = {
  attach: (elementId: string) => Promise<void>;
  tokenize: () => Promise<SquareCardTokenResult>;
  destroy: () => void;
};

export type SquarePayments = {
  card: () => Promise<SquareCard>;
};

export type SquarePaymentsFactory = (
  applicationId: string,
  locationId: string,
) => Promise<SquarePayments>;

declare global {
  interface Window {
    Square?: {
      payments: SquarePaymentsFactory;
    };
  }
}
