/** Fallback visit lines when location data is not yet available. */
export const FOOTER_VISIT_FALLBACK = {
  restaurant: {
    address: "",
    cityLine: "",
  },
  truck: {
    address: "",
    detail: "",
    cityLine: "",
  },
  hoursPrimary: "Hours posted when available — see Instagram for updates",
} as const;
