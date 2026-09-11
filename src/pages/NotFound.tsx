import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Home, ShoppingBag, Radar } from "lucide-react";

/**
 * SIGNAL LOST — the 404.
 *
 * ⚠️ THERE WAS NO CATCH-ALL ROUTE AT ALL. Any address the router did not
 * recognise rendered the layout with an entirely empty main region: header,
 * footer, status bar, and nothing in between. Measured during the route
 * sweep — /no-such-page-xyz returned 0 characters of content.
 *
 * That is the worst possible failure for a brand about to advertise on
 * social media, because it is exactly what a mistyped link, an old campaign
 * URL, or a shared address with a stray character produces: a visitor who
 * arrives, sees a blank page, and concludes the site is broken. They have no
 * way back and no idea anything went wrong.
 *
 * So this says what happened in plain words, keeps the brand's voice, and
 * always offers three real ways onward.
 */
export default function NotFound() {
  const { pathname } = useLocation();

  /* The router is the only thing that knows an address did not match, so the
     404 metadata is set HERE rather than inferred from a list of known routes
     elsewhere.

     ⚠️ "RUNS AFTER usePageMeta, SO IT WINS" WAS WRONG. React runs effects
     child-first, and usePageMeta lives in the Layout ABOVE this page — so it
     ran second and overwrote this title with one invented from the address.
     Measured live: /definitely-not-a-page-xyz was titled "Definitely Not A
     Page Xyz — RAW Official" in the tab, in history and to a screen reader.
     Deferring to the next task lets every effect in this commit finish first.

     noindex matters as much as the title: a single-page app answers every
     address with a 200, so without it Google may index a mistyped link as a
     real page (a "soft 404"). It is removed again when the visitor leaves. */
  useEffect(() => {
    const TITLE = "Page not found — RAW Official";
    const id = window.setTimeout(() => {
      document.title = TITLE;
      for (const sel of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
        document.head.querySelector(sel)?.setAttribute("content", TITLE);
      }
    }, 0);

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    const previous = robots?.getAttribute("content") ?? null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex";

    return () => {
      window.clearTimeout(id);
      if (created) robots?.remove();
      else if (previous !== null) robots?.setAttribute("content", previous);
    };
  }, [pathname]);

  return (
    <div className="section-container flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/10"
      >
        <Radar size={30} className="text-red-500" />
      </motion.div>

      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mb-4 font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-red-500"
      >
        ERROR_404 // SIGNAL_LOST
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="mb-6 font-sans font-black uppercase leading-[0.9] tracking-tight text-display-sm"
      >
        This page
        <br />
        doesn&rsquo;t exist
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="mb-2 max-w-md text-sm leading-relaxed text-editorial-text-muted"
      >
        Nothing is broken — the address just isn&rsquo;t one of ours. It may have
        been mistyped, or it may have moved.
      </motion.p>

      {/* Naming the address that failed turns "it's broken" into something the
          visitor can actually check, and something they can report. */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mb-12 max-w-full truncate font-mono text-[0.6875rem] text-editorial-text-muted/50"
      >
        {pathname}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          to="/"
          className="flex items-center gap-3 rounded-full bg-red-600 px-7 py-4 font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] text-white transition-colors hover:bg-red-500"
        >
          <Home size={14} /> Home
        </Link>
        <Link
          to="/shop"
          className="flex items-center gap-3 rounded-full border border-editorial-border-light px-7 py-4 font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] text-editorial-text-muted transition-colors hover:border-white/30 hover:text-white"
        >
          <ShoppingBag size={14} /> The archive
        </Link>
        <Link
          to="/stay-safe"
          className="flex items-center gap-3 rounded-full border border-editorial-border-light px-7 py-4 font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] text-editorial-text-muted transition-colors hover:border-white/30 hover:text-white"
        >
          Stay Safe
        </Link>
      </motion.div>
    </div>
  );
}
