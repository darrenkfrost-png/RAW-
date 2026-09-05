/**
 * THE FACTS ABOUT THIS SITE, IN ONE PLACE.
 *
 * ⚠️ THESE WERE COPIES, AND COPIES DRIFT. The three feature flags each lived as
 * a private `const` inside the page that used them, and the contact address was
 * a fourth const inside Contact.tsx. That is survivable while nothing else
 * reads them — but the structured data now published to search engines has to
 * agree with what the site actually does. A page that quietly says "in stock,
 * £11.99" to Google while its own checkout refuses every order is the exact
 * kind of claim this codebase has spent a week removing.
 *
 * One flag, one place. Flip PAYMENTS_ENABLED and the checkout, the buttons and
 * the search-engine offer all change together.
 */

/** Real card payments. While false the checkout refuses honestly and no price is published as an offer. */
export const PAYMENTS_ENABLED = false;

/** Sign-in and profiles. While false the account controls are disabled and tagged COMING_SOON. */
export const ACCOUNTS_ENABLED = false;

/** Customer reviews. While false the review form is not rendered at all. */
export const REVIEWS_ENABLED = false;

export const BRAND_NAME = "RAW Official";

/* Supplied by the founder, 2026-09-05. The display form is his own grouping;
   the E.164 form is what a phone actually dials. */
export const CONTACT_EMAIL = "admin@rawofficial.co";
export const CONTACT_PHONE_DISPLAY = "+44 776 0992 372";
export const CONTACT_PHONE_E164 = "+447760992372";

/** Every price in the catalogue is written "£11.99". */
export const PRICE_CURRENCY = "GBP";

/** "£11.99" -> 11.99. Returns null rather than guessing at anything unexpected. */
export function priceToNumber(price: string): number | null {
  const m = /^£\s*([\d,]+(?:\.\d{1,2})?)$/.exec(price.trim());
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** The catalogue's stock words, in the vocabulary schema.org understands. */
export function availabilityUrl(stockStatus?: string): string | null {
  switch (stockStatus) {
    case "AVAILABLE":
      return "https://schema.org/InStock";
    case "LOW_STOCK":
      return "https://schema.org/LimitedAvailability";
    case "OUT_OF_STOCK":
      return "https://schema.org/OutOfStock";
    case "COMING_SOON":
    case "PREORDER_READY":
      return "https://schema.org/PreOrder";
    default:
      return null; // unknown is not a claim worth making
  }
}
