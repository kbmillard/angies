export type SquareEnv = "sandbox" | "production";

export type SquareCardTokenResult = {
  status: "OK" | "INVALID" | "ABORT" | "CANCEL" | "ERROR";
  token?: string;
  errors?: Array<{ message: string }>;
};

export type SquareCardFieldState = {
  hasErrorClass: boolean;
  hasFocusClass: boolean;
  isCompletelyValid: boolean;
  isEmpty: boolean;
  isPotentiallyValid: boolean;
};

export type SquareCardInputEventDetail = {
  cardBrand?: string;
  currentState: SquareCardFieldState;
  eventType: string;
  field?: string;
  postalCodeValue?: string;
  previousState?: SquareCardFieldState;
};

export type SquareCardInputEvent = {
  type: string;
  detail: SquareCardInputEventDetail;
};

export type SquareCardEventType =
  | "cardBrandChanged"
  | "errorClassAdded"
  | "errorClassRemoved"
  | "escape"
  | "focusClassAdded"
  | "focusClassRemoved"
  | "postalCodeChanged"
  | "submit";

export type SquareCard = {
  attach: (elementId: string) => Promise<void>;
  tokenize: () => Promise<SquareCardTokenResult>;
  destroy: () => void;
  addEventListener: (
    eventType: SquareCardEventType,
    callback: (event: SquareCardInputEvent) => void,
  ) => void;
};

/** Square Web Payments SDK card style map (selectors → CSS properties). */
export type SquareCardStyle = Record<string, Record<string, string>>;

export type SquareCardOptions = {
  style?: SquareCardStyle;
};

export type SquarePayments = {
  card: (options?: SquareCardOptions) => Promise<SquareCard>;
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
