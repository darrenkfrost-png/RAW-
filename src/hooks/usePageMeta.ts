import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { metaForPath } from "../data/pageMeta";
import { allProducts } from "../data/products";
import {
  breadcrumbSchema,
  organizationSchema,
  productSchema,
  websiteSchema,
} from "../lib/structuredData";

/**
 * Applies the current route's title, share preview and structured data.
 *
 * ⚠️ THIS IS CLIENT-SIDE, WHICH MATTERS FOR ONE CASE AND NOT THE OTHER.
 *
 * Browser tabs, history entries, bookmarks and screen-reader announcements all
 * read the live document, so they get the right title immediately — that is
 * most of the benefit and it works today.
 *
 * Social scrapers are the exception: Facebook, X and LinkedIn read the HTML as
 * served and do not run JavaScript, so they will still see index.html's tags
 * for deep links. Saying so plainly rather than implying this fixes sharing
 * everywhere. The real fix for that is pre-rendering at build time, which is a
 * larger change; the campaign's own card is already correct in index.html, so
 * the most-shared link — the campaign — previews properly regardless.
 *
 * Google is not in that exception: it renders the page before indexing it, so
 * the JSON-LD written below is read. What it says, and what it deliberately
 * does not say, is set out in src/lib/structuredData.ts.
 */
const setMeta = (selector: string, attr: "name" | "property", key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

/**
 * One script tag, replaced on every route. Marked with a data attribute so it
 * is this hook's own and nothing else's — appending a second block per
 * navigation would leave a page describing itself several times over.
 */
const setJsonLd = (blocks: Record<string, unknown>[]) => {
  const SELECTOR = 'script[type="application/ld+json"][data-raw-ld]';
  const existing = document.head.querySelector<HTMLScriptElement>(SELECTOR);
  if (blocks.length === 0) {
    existing?.remove();
    return;
  }
  const el = existing ?? document.createElement("script");
  if (!existing) {
    el.type = "application/ld+json";
    el.setAttribute("data-raw-ld", "");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(blocks.length === 1 ? blocks[0] : blocks);
};

export function usePageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = metaForPath(pathname);

    document.title = meta.title;
    setMeta('meta[name="description"]', "name", "description", meta.description);
    setMeta('meta[property="og:title"]', "property", "og:title", meta.title);
    setMeta('meta[property="og:description"]', "property", "og:description", meta.description);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", meta.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", meta.description);
    if (meta.image) {
      setMeta('meta[property="og:image"]', "property", "og:image", meta.image);
      setMeta('meta[name="twitter:image"]', "name", "twitter:image", meta.image);
    }

    // A canonical link keeps duplicate-looking routes from competing.
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    const origin = window.location.origin;
    link.href = origin + pathname;

    // og:url has to move with the page too, or every share claims to be the home page.
    setMeta('meta[property="og:url"]', "property", "og:url", origin + pathname);

    const blocks: Record<string, unknown>[] = [];
    if (pathname === "/") {
      blocks.push(organizationSchema(origin), websiteSchema(origin));
    }
    const onProduct = /^\/product\/(\d+)$/.exec(pathname);
    if (onProduct) {
      const product = allProducts.find((p) => p.id === Number(onProduct[1]));
      if (product) {
        blocks.push(
          productSchema(product, origin),
          breadcrumbSchema(
            [
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop" },
              { name: product.name, path: `/product/${product.id}` },
            ],
            origin,
          ),
        );
      }
    }
    setJsonLd(blocks);
  }, [pathname]);
}
