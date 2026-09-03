import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Film, X } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { VIDEO_LIBRARY, videoById } from "../data/videoLibrary";

/**
 * THE SCREENSAVER — RAW takes the whole screen when the room goes quiet.
 *
 * Arrives after a minute of stillness, or instantly from the button in the
 * header. Full-bleed film, the mark, the line, a clock, and a shelf of other
 * films that slides out when the pointer finds the left edge.
 *
 * THE HARD PART IS LEAVING, NOT ARRIVING
 *
 * A screensaver that will not go away is worse than no screensaver. So:
 *  - Any real input dismisses it: pointer, key, wheel, touch.
 *  - EXCEPT input aimed at its own film shelf. Reaching for "play the combat
 *    reel" must not be read as "wake up" — that would make the shelf
 *    impossible to use, which is the classic way this feature is broken.
 *  - The idle clock is paused while it is showing. Otherwise the timer keeps
 *    running underneath and re-arms against itself.
 *  - Typing never counts as idling: the timer resets on keystrokes too, so it
 *    cannot ambush someone filling in the signup form.
 *  - It never appears over a dialog or the intro, and never on first paint.
 */

const IDLE_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

export default function Screensaver() {
  const { settings, updateSettings } = useSettings();
  const [active, setActive] = useState(false);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [clock, setClock] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Input that lands inside our own chrome must not dismiss us. A ref rather
     than state because the window listener reads it on every event and must
     never see a stale value. */
  const overChrome = useRef(false);

  const asset = videoById(settings.screensaverVideoId);

  const dismiss = useCallback(() => {
    setActive(false);
    setShelfOpen(false);
  }, []);

  /* Data Saver means "do not spend my allowance on decoration". Arriving
     unasked with a full-screen film is exactly that, so on a metered
     connection the screensaver never triggers ITSELF — the header button
     still works, because then it was asked for. */
  const saveData =
    typeof navigator !== "undefined" && Boolean((navigator as any).connection?.saveData);

  // The idle clock. Rebuilt whenever the setting changes or we wake.
  useEffect(() => {
    if (!settings.screensaverEnabled || active || saveData) return;

    const arm = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setActive(true), Math.max(10000, settings.screensaverDelayMs));
    };

    const onActivity = () => arm();
    arm();
    IDLE_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      if (timer.current) clearTimeout(timer.current);
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [settings.screensaverEnabled, settings.screensaverDelayMs, active, saveData]);

  // Manual trigger from anywhere in the app.
  useEffect(() => {
    const open = () => setActive(true);
    window.addEventListener("raw:screensaver", open);
    return () => window.removeEventListener("raw:screensaver", open);
  }, []);

  // Waking up.
  useEffect(() => {
    if (!active) return;

    const wake = () => { if (!overChrome.current) dismiss(); };
    // A pointer that has merely arrived over the shelf should not wake us, so
    // the guard is checked at event time rather than bound at listen time.
    IDLE_EVENTS.forEach((e) => window.addEventListener(e, wake, { passive: true }));

    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const clockTimer = setInterval(tick, 15000);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, wake));
      clearInterval(clockTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, dismiss]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[1200] cursor-none bg-black"
          role="dialog"
          aria-label="RAW screensaver"
        >
          <video
            key={asset.src}
            src={asset.src}
            poster={asset.poster}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

          {/* ── BRAND ─────────────────────────────────────────────────── */}
          <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
            <motion.img
              src="/brand/raw-logo-red.png"
              alt="RAW Official"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-16 object-contain drop-shadow-[0_0_45px_rgba(220,38,38,0.55)] md:h-24"
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 0.75, y: 0 }}
              transition={{ duration: 1.4, delay: 0.3 }}
              className="mt-8 font-mono text-[10px] uppercase tracking-[0.45em] text-white/70 md:text-[11px]"
            >
              Train with intent · Recover with purpose
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ duration: 1.4, delay: 0.5 }}
              className="mt-3 font-mono text-[9px] uppercase tracking-[0.35em] text-red-400/60"
            >
              #StaySafeWithRAW
            </motion.p>
          </div>

          {/* Clock, and the way out — stated, so nobody wonders. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2">
            <span className="font-sans text-3xl font-black tracking-tight text-white/80">{clock}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/30">
              Move to resume
            </span>
          </div>

          {/* ── THE FILM SHELF ────────────────────────────────────────────
              A strip on the left edge; hovering it slides the list out. It is
              marked as our own chrome so using it does not dismiss the very
              screen it is controlling. */}
          <div
            onPointerEnter={() => { overChrome.current = true; setShelfOpen(true); }}
            onPointerLeave={() => { overChrome.current = false; setShelfOpen(false); }}
            className="absolute inset-y-0 left-0 z-10 flex cursor-default items-center"
          >
            <div className="flex h-full w-8 items-center justify-center bg-gradient-to-r from-black/70 to-transparent">
              <Film size={14} className="text-white/30" />
            </div>

            <AnimatePresence>
              {shelfOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="max-h-[80vh] w-64 overflow-y-auto rounded-r-2xl border border-l-0 border-white/10 bg-black/85 p-4 backdrop-blur-xl"
                >
                  <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.35em] text-white/40">
                    Choose a film
                  </p>
                  <div className="space-y-1.5">
                    {VIDEO_LIBRARY.map((v) => {
                      const on = v.id === settings.screensaverVideoId;
                      return (
                        <button
                          key={v.id}
                          onClick={() => updateSettings({ screensaverVideoId: v.id })}
                          className={`block w-full rounded-lg border px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                            on
                              ? "border-red-500 bg-red-600/15 text-red-300"
                              : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={dismiss}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70 transition-colors hover:border-red-500 hover:text-white"
                  >
                    <X size={12} /> Exit
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Fired by the header button — any component can raise the screensaver. */
export const openScreensaver = () => window.dispatchEvent(new Event("raw:screensaver"));
