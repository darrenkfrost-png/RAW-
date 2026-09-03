import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { metaForPath } from "../data/pageMeta";

/**
 * Applies the current route's title and share preview.
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
    link.href = window.location.origin + pathname;
  }, [pathname]);
}
