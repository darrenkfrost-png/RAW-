import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X } from "lucide-react";

/**
 * INSTALL RAW — offered only when the browser actually offers it.
 *
 * ⚠️ THE HONESTY CONSTRAINT, WHICH SHAPES THE WHOLE COMPONENT.
 *
 * The tempting version of this is a permanent "Install our app!" banner. That
 * would be another button claiming a capability it may not have: on iOS Safari
 * and on any browser that has already installed the site, `beforeinstallprompt`
 * never fires and there is nothing to install. Tapping would do nothing —
 * exactly the class of dead control this codebase has spent a long time
 * removing.
 *
 * So the banner does not exist until the browser hands us a real, usable
 * prompt. No event, no banner. When the visitor installs or dismisses it, it
 * does not come back — a nag is worse than an absence.
 *
 * It also never appears on the first visit. Someone who has arrived from an
 * Instagram link has not yet decided they like the place; asking them to
 * install it is asking for commitment before interest.
 */

const SEEN_KEY = "raw_install_dismissed";
const VISITS_KEY = "raw_visit_count";
const SESSION_KEY = "raw_visit_counted"; // sessionStorage: one count per browsing session, not per page load

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let visits = 1;
    try {
      visits = Number(localStorage.getItem(VISITS_KEY) || "0");
      // A reload or a second hard-navigated URL is the same visit: only count
      // once per browsing session, so "first visit" means what it says.
      if (sessionStorage.getItem(SESSION_KEY) !== "1") {
        visits += 1;
        localStorage.setItem(VISITS_KEY, String(visits));
        sessionStorage.setItem(SESSION_KEY, "1");
      }
      if (visits < 1) visits = 1;
    } catch { /* private mode: treat as a first visit */ }

    let dismissed = false;
    try { dismissed = localStorage.getItem(SEEN_KEY) === "1"; } catch { /* ignore */ }

    const onPrompt = (e: Event) => {
      e.preventDefault(); // keep it so we can offer it at a better moment
      if (dismissed || visits < 2) return;
      setDeferred(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
  };

  const install = async () => {
    if (!deferred) return;
    setShow(false);
    try {
      deferred.prompt();
      await deferred.userChoice; // resolves whichever way they answer
    } catch { /* the browser withdrew it; nothing to report */ }
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
    setDeferred(null);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Install RAW Official"
          /* Bottom-centre above the status bar, width-capped so it can never be
             wider than a phone, and clear of the home indicator. */
          className="fixed left-1/2 z-[1160] w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/12 bg-black/92 p-4 shadow-2xl backdrop-blur-xl"
          style={{ bottom: "max(4.5rem, calc(env(safe-area-inset-bottom) + 4rem))" }}
        >
          <div className="flex items-start gap-3">
            <img src="/brand/raw-logo-red.png" alt="" className="mt-0.5 h-5 w-auto object-contain" />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-black uppercase tracking-tight text-white">
                Keep RAW on your home screen
              </p>
              <p className="mt-1 text-[0.75rem] leading-relaxed text-white/55">
                Opens full screen, and the pages you have already seen still work
                without a signal.
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Not now"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-white"
            >
              <X size={13} />
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={install}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 font-mono text-[0.6875rem] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-500"
            >
              <Download size={13} /> Install
            </button>
            <button
              onClick={dismiss}
              className="min-h-11 rounded-xl border border-white/12 px-5 font-mono text-[0.6875rem] font-black uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-white/30 hover:text-white"
            >
              Not now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
