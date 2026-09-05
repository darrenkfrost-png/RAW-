import type { Product } from "../types";
import { getHighResImageUrl } from "./utils";
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE_E164,
  PAYMENTS_ENABLED,
  PRICE_CURRENCY,
  availabilityUrl,
  priceToNumber,
} from "./site";

/**
 * WHAT A SEARCH ENGINE IS TOLD ABOUT THIS SITE.
 *
 * The site published no structured data at all, which for a shop is a real
 * commercial gap: it is the difference between a plain blue link and a result
 * carrying the product's picture, brand and price. Everything here is built
 * from the catalogue that is already on the page — nothing is invented for the
 * benefit of a crawler.
 *
 * ⚠️ THE RULES THIS FILE KEEPS
 *
 *  - NO OFFER WHILE THE CHECKOUT IS SHUT. An `offers` block tells Google the
 *    thing can be bought at that price, and Google will happily show "In stock
 *    · £11.99" to a shopper. The checkout currently refuses every order, so
 *    publishing that would send people to a page that cannot serve them. The
 *    price appears the moment PAYMENTS_ENABLED is true, and not before.
 *  - NO RATINGS. There are no reviews, so there is no aggregateRating. An
 *    invented star rating in a search result is the most visible lie a site
 *    can tell.
 *  - NO SKU, NO GTIN. The catalogue has an internal id, not a merchant code.
 *    Passing the id off as a SKU would be a number pretending to be a fact.
 *  - NO sameAs. The footer's social icons point at the platforms' own home
 *    pages rather than RAW's accounts, so there is nothing truthful to link.
 *
 * It is injected client-side, which Google renders and reads. Facebook and X
 * do not run JavaScript, but they read og: tags rather than JSON-LD, so this
 * is the one that has to run in the browser and the one that can.
 */

type Json = Record<string, unknown>;

export function organizationSchema(origin: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: origin,
    logo: `${origin}/brand/app-icon-512.png`,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE_E164,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      telephone: CONTACT_PHONE_E164,
      areaServed: "GB",
      availableLanguage: "English",
    },
  };
}

export function websiteSchema(origin: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: origin,
  };
}

export function productSchema(product: Product, origin: string): Json {
  const description =
    product.description || product.overview || product.shortBenefit || undefined;

  const schema: Json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: `${origin}/product/${product.id}`,
    image: getHighResImageUrl(product.image),
    category: product.category,
    brand: { "@type": "Brand", name: BRAND_NAME },
  };
  if (description) schema.description = description;

  /* The offer is the part that invites a purchase, so it waits for a checkout
     that can accept one. See the rules at the top of this file. */
  if (PAYMENTS_ENABLED) {
    const price = priceToNumber(product.price);
    const availability = availabilityUrl(product.stockStatus);
    if (price !== null) {
      const offer: Json = {
        "@type": "Offer",
        price,
        priceCurrency: PRICE_CURRENCY,
        url: `${origin}/product/${product.id}`,
      };
      if (availability) offer.availability = availability;
      schema.offers = offer;
    }
  }

  return schema;
}

export function breadcrumbSchema(
  trail: { name: string; path: string }[],
  origin: string,
): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: `${origin}${step.path}`,
    })),
  };
}
