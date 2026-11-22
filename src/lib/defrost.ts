/**
 * RUNNING INSIDE DEFROST.WORLD, OR ON OUR OWN DOMAIN.
 *
 * DEFROST.WORLD hosts this site as static files in a sandboxed frame at
 * defrost-world.com/sites/<slug>/ and adds its own layer on top: read aloud,
 * the Oracle, voice commands. A few things cannot work in that frame, and this
 * is the one place that decides which world we are in, so the rest of the app
 * never has to guess.
 *
 * ⚠️ THE RULE THIS SERVES: NOTHING IS TAKEN AWAY. On rawofficial.co and on our
 * own staging host, every one of these answers is "no" and the site behaves
 * exactly as it always has. The DEFROST branches are additions and graceful
 * fallbacks, never replacements.
 *
 * ⚠️ AND NOTHING HERE PRETENDS. Where a feature genuinely cannot run inside the
 * frame, the visitor is told plainly and sent to the real site. A silent
 * failure, or a button that looks like it worked, is worse than an honest
 * sentence.
 */

declare global {
  interface Window {
    /** Set by DEFROST to the owner's own website. Non-empty = we are inside. */
    __defrostWebsite?: string;
  }
}

/** The owner's own website, as DEFROST gave it to us. Empty if not inside. */
export function ownerWebsite(): string {
  if (typeof window === 'undefined') return '';
  const w = window.__defrostWebsite;
  return typeof w === 'string' ? w.trim() : '';
}

/**
 * Are we running inside DEFROST.WORLD?
 *
 * ⚠️ TWO SIGNALS, BECAUSE THE DOCUMENTED ONE CAN ARRIVE LATE. `__defrostWebsite`
 * is the signal DEFROST promises, and it is checked first. But it is injected
 * by the host, and if it ever landed after our scripts ran, the router would
 * already have been chosen — and choosing wrong there breaks every link on the
 * site. So being served from a /sites/<slug>/ mount counts on its own.
 *
 * ⚠️ AND IT MUST NOT ALSO REQUIRE BEING IN A FRAME. It did at first, and
 * scripts/mountcheck.mjs caught what that cost: open a mounted address in a
 * tab of its own — which is what DEFROST's own "open in new tab" does, and what
 * anyone sharing a link does — and the frame test failed, the app chose path
 * routing, and the whole site rendered "This page doesn't exist". The mount
 * path is the honest signal; our own hosts never serve from one.
 */
export function insideDefrost(): boolean {
  if (typeof window === 'undefined') return false;
  if (ownerWebsite()) return true;
  return /\/sites\/[^/]+\//.test(window.location.pathname);
}

/** Where to send someone for anything this frame cannot do. */
export const OWN_SITE = 'https://rawofficial.co';

/**
 * Send a visitor to the real shop.
 *
 * ⚠️ DEFROST NEVER TAKES PAYMENTS, AND A FRAME CANNOT HOLD A CHECKOUT. On our
 * own domain the store opens in a panel, as it always has. Inside DEFROST that
 * panel would be a frame inside a sandboxed frame — which the store's own
 * headers refuse anyway — so the visitor gets a new tab on the real site
 * instead. Same destination, one that actually arrives.
 */
export function openStore(openPanel: () => void): void {
  if (!insideDefrost()) {
    openPanel();
    return;
  }
  const target = ownerWebsite() || OWN_SITE;
  window.open(target, '_blank', 'noopener,noreferrer');
}
