export type CloverEnv = "sandbox" | "production";

export type CloverCardElement = {
  mount: (target: string | HTMLElement) => void;
  createToken?: () => Promise<{ token?: string }>;
  unmount?: () => void;
  destroy?: () => void;
};

export type CloverElementsInstance = {
  create: (type: string, styles?: Record<string, unknown>) => CloverCardElement;
};

export type CloverInstance = {
  elements: () => CloverElementsInstance;
  createToken: () => Promise<{ token?: string; id?: string } | string>;
};

export type CloverConstructor = new (
  publicToken: string,
  options?: { merchantId?: string; environment?: string },
) => CloverInstance;

declare global {
  interface Window {
    Clover?: CloverConstructor;
  }
}

export {};
