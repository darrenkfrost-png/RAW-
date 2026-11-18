/**
 * WHERE THIS APP IS ACTUALLY SERVED — one value, used by everything that has
 * to write an absolute address (the sitemap, robots.txt, the share preview in
 * index.html).
 *
 * ⚠️ THIS IS NOT rawofficial.co, AND THAT IS DELIBERATE.
 *
 * rawofficial.co is the founder's live WordPress/WooCommerce shop. It takes
 * real orders and it is not going anywhere. This app is a separate experience
 * that sits alongside it and embeds it for the shop; the two are different
 * sites on different addresses.
 *
 * Pointing the sitemap at rawofficial.co was a real and measured mistake: it
 * told Google that /showcase, /our-story, /raw-cares, /gallery and most of the
 * other 77 pages lived there, and every one of them 404s on that domain —
 * those pages only exist here. A sitemap full of dead addresses is worse than
 * no sitemap at all.
 *
 * Change this ONE line if the app is ever moved to its own address (a
 * subdomain, say). `npm run build:sitemap` rewrites the sitemap and the
 * robots.txt Sitemap line from it, and `npm run verify` fails if the address
 * written here does not actually serve these pages.
 */
export const SITE_ORIGIN = "https://skyblue-reindeer-199095.hostingersite.com";

/** The shop is a different site, on its own domain, and keeps taking orders. */
export const SHOP_ORIGIN = "https://rawofficial.co";
