import { allProducts } from "./products";

/**
 * PER-PAGE TITLES AND SHARE PREVIEWS.
 *
 * Every route used to carry the same title and the same description: browser
 * tabs were indistinguishable, a search engine saw one page, and a link to the
 * campaign shared as the generic brand blurb rather than the campaign itself.
 * For a brand whose visitors arrive from Instagram, TikTok and YouTube onto
 * specific pages, that is the first impression being thrown away.
 *
 * ⚠️ EVERY LINE HERE DESCRIBES WHAT IS ACTUALLY ON THE PAGE. No invented
 * counts, no claims the page does not make, and nothing about a product beyond
 * what its own record says — a share preview is a promise about what someone
 * will find when they arrive.
 */

export interface PageMeta {
  title: string;
  description: string;
  /** Overrides the default share card where a page has its own image. */
  image?: string;
}

const SUFFIX = "RAW Official";

const STATIC: Record<string, PageMeta> = {
  "/": {
    title: `${SUFFIX} | Performance & Recovery Protocol`,
    description:
      "Train with intent, recover with purpose. Performance nutrition, recovery equipment and combat gear from RAW Official.",
  },
  "/shop": {
    title: `The Archive — ${SUFFIX}`,
    description:
      "Every RAW product in one place: nutrition, recovery, combat and apparel.",
  },
  "/showcase": {
    title: `Showcase — ${SUFFIX}`,
    description:
      "Campaign films, photography, and the brand in the wild — including the full RAW Official video archive.",
  },
  "/stay-safe": {
    title: "Stay Safe With RAW — 100,000 free condoms. No catch.",
    description:
      "Sex is part of life. Protection should be too. Sign up and we post you a pack — not samples, not free with purchase. Free means free.",
    image: "/brand/share-card.jpg",
  },
  "/stay-safe/feedback": {
    title: "Tell us what you thought — Stay Safe With RAW",
    description: "Nine questions, about two minutes. Honest beats glowing.",
    image: "/brand/share-card.jpg",
  },
  "/nutrients": { title: `Nutrients — ${SUFFIX}`, description: "Fuel with intent: RAW performance nutrition." },
  "/recovery": { title: `Recovery — ${SUFFIX}`, description: "Rest, restore, return stronger. RAW recovery equipment." },
  "/combat": { title: `Combat — ${SUFFIX}`, description: "Combat gear and apparel built for real contact." },
  "/gallery": { title: `Visual Gallery — ${SUFFIX}`, description: "The RAW range, photographed." },
  "/compare": { title: `Compare — ${SUFFIX}`, description: "Put RAW products side by side." },
  "/our-story": { title: `Our Story — ${SUFFIX}`, description: "How RAW started, and what it is for." },
  "/manifesto": { title: `Manifesto — ${SUFFIX}`, description: "What RAW stands for." },
  "/raw-cares": { title: `RAW Cares — ${SUFFIX}`, description: "The work RAW does beyond the product." },
  "/academy": { title: `RAW Academy — ${SUFFIX}`, description: "Training and recovery, explained." },
  "/knowledge-core": { title: `Knowledge Core — ${SUFFIX}`, description: "Reference material on training, nutrition and recovery." },
  "/contact": { title: `Contact — ${SUFFIX}`, description: "Get in touch with RAW Official." },
  "/account": { title: `Account — ${SUFFIX}`, description: "Your RAW account." },
  "/checkout": { title: `Checkout — ${SUFFIX}`, description: "Complete your RAW order." },
  "/logistics": { title: `Delivery & Returns — ${SUFFIX}`, description: "How RAW ships, and how returns work." },
  "/privacy-policy": { title: `Privacy Policy — ${SUFFIX}`, description: "How RAW handles your data." },
  "/terms-of-use": { title: `Terms of Use — ${SUFFIX}`, description: "The terms for using this site." },
  "/protocol-builder": { title: `Protocol Builder — ${SUFFIX}`, description: "Build a stack around your own training." },
  "/protocol-stacks": { title: `Protocol Stacks — ${SUFFIX}`, description: "Ready-made RAW protocol stacks." },
  "/performance-system": { title: `Performance System — ${SUFFIX}`, description: "How the RAW range fits together." },
  "/analytics": { title: `Analytics — ${SUFFIX}`, description: "System telemetry." },
  "/defrost": { title: `DeFrost OS — ${SUFFIX}`, description: "The DeFrost OS desktop." },
};

export const metaForPath = (path: string): PageMeta => {
  if (STATIC[path]) return STATIC[path];

  // A product link is the one most likely to be shared, so it names the item.
  const product = path.startsWith("/product/")
    ? allProducts.find((p) => String(p.id) === path.split("/")[2])
    : null;
  if (product) {
    return {
      title: `${product.name} — ${SUFFIX}`,
      // The product's own words, never a generated claim.
      description: product.shortBenefit || `${product.name} from RAW Official.`,
      image: product.image,
    };
  }

  if (path.startsWith("/category/")) {
    const name = decodeURIComponent(path.split("/")[2] || "").replace(/-/g, " ");
    return { title: `${name} — ${SUFFIX}`, description: `RAW ${name} products.` };
  }

  /* ⚠️ AN UNLISTED ROUTE IS NOT A MISSING PAGE.
     This used to return the not-found title for anything absent from the map
     above — so /defrost, a page that renders perfectly, announced itself as
     "Page not found" in the browser tab, in history and to a screen reader.
     A hand-kept list will always fall behind the router, so the fallback now
     builds a decent title from the address instead of asserting a 404. The
     real 404 page sets its own metadata (see NotFound), which is the only
     place that actually knows the route did not match. */
  const segment = path.split("/").filter(Boolean).pop() || "";
  const name = segment
    .replace(/-/g, " ")
    // The first letter of each WORD. The \b matters: without it every
    // letter is capitalised, and the literal backspace previously here
    // matched nothing at all.
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: name ? `${name} — ${SUFFIX}` : `${SUFFIX} | Performance & Recovery Protocol`,
    description: "Train with intent, recover with purpose.",
  };
};
