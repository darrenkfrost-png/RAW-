import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useUI } from "../context/UIContext";

/**
 * THE DOOR — RAW's introduction.
 *
 * What was here before was a loading screen wearing a brand's clothes: a fake
 * progress bar counting to a fixed 4.5 seconds, two product images flashed
 * subliminally at 5% opacity where nobody could read them, and a button
 * labelled INITIALIZE_SYSTEM. It said "software booting". RAW is not software.
 *
 * This says what the brand says. The packaging's own line — DON'T GO IN RAW /
 * GO IN WITH — carries the sequence, the mark builds out of the concentric
 * rings printed on the boxes, and the way in is a real invitation rather than
 * a system command.
 *
 * THREE THINGS IT REFUSES TO DO
 *  - It never holds anyone hostage. Skip is on screen from the first frame,
 *    Enter/Space/Escape all open the door, and so does clicking anywhere once
 *    the sequence has played. A first-time visitor who wants the shop should
 *    never have to wait for choreography to finish.
 *  - It never claims to be loading. The old progress bar was theatre — it
 *    animated to 100% on a timer with nothing behind it. A brand that says
 *    "no catch" on its front page should not open with a fake measurement.
 *  - It never ignores prefers-reduced-motion: that setting gets the finished
 *    frame immediately, with the door already open.
 */

const BEATS = [
  { at: 0, line: null },
  { at: 900, line: "DON'T GO IN RAW" },
  { at: 2100, line: "GO IN WITH" },
] as const;

export default function IntroScreen() {
  const { hasCompletedIntro, setIntroCompleted } = useUI();
  const prefersReduced = useReducedMotion();
  const [beat, setBeat] = useState(0);
  const [open, setOpen] = useState(false);
  const closing = useRef(false);

  const enter = () => {
    if (closing.current) return;
    closing.current = true;
    setIntroCompleted(true);
  };

  useEffect(() => {
    if (hasCompletedIntro) return;

    if (prefersReduced) {
      setBeat(BEATS.length - 1);
      setOpen(true);
      return;
    }

    const timers = BEATS.map((b, i) => setTimeout(() => setBeat(i), b.at));
    const doorTimer = setTimeout(() => setOpen(true), 3100);
    return () => { timers.forEach(clearTimeout); clearTimeout(doorTimer); };
  }, [hasCompletedIntro, prefersReduced]);

  // Every reasonable "let me in" gesture works, not just the button.
  useEffect(() => {
    if (hasCompletedIntro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") { e.preventDefault(); enter(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasCompletedIntro]);

  if (hasCompletedIntro) return null;

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.div
      key="intro"
      exit={{ opacity: 0, filter: "blur(12px)", scale: 1.04 }}
      transition={{ duration: 0.7, ease }}
      /* z above every floating hub and the diagnostics frame (500 / 1000):
         at z-200 the voice buttons and the uptime chip drew ON TOP of the
         door and sat over the Skip control. A gate has nothing above it. */
      className="fixed inset-0 z-[1100] bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none"
      onClick={() => open && enter()}
      role="dialog"
      aria-label="RAW Official — enter the site"
    >
      {/* THE RINGS — the packaging's own concentric print, drawn in light.
          They expand once, settle, and become the room the mark sits in. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1 + i * 0.55, opacity: 0.5 - i * 0.09 }}
            transition={{ duration: 2.6, delay: i * 0.12, ease }}
            className="absolute rounded-full border border-red-600/40"
            style={{ width: "34vmin", height: "34vmin" }}
          />
        ))}
        {/* The deep glow behind them — the boxes photograph like this. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.2, ease }}
          className="absolute w-[70vmin] h-[70vmin] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.22),transparent_65%)] blur-2xl"
        />
      </div>

      {/* A single horizontal light bar — the product photography's signature. */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 0.9, 0.35] }}
        transition={{ duration: 1.8, ease, times: [0, 0.4, 1] }}
        className="absolute left-0 right-0 top-1/2 h-[2px] origin-center bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_40px_#dc2626] pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* THE MARK */}
        <motion.img
          src="/brand/raw-logo-red.png"
          alt="RAW Official"
          initial={{ opacity: 0, scale: 1.35, filter: "blur(24px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.6, ease }}
          className="h-20 md:h-28 object-contain drop-shadow-[0_0_45px_rgba(220,38,38,0.55)]"
        />

        {/* THE LINE — the brand's own words, one clause at a time. */}
        <div className="h-24 md:h-28 mt-10 md:mt-12 flex flex-col items-center justify-start gap-2">
          <AnimatePresence mode="popLayout">
            {beat >= 1 && (
              <motion.p
                key="a"
                initial={{ opacity: 0, y: 14, letterSpacing: "0.6em" }}
                animate={{ opacity: 0.75, y: 0, letterSpacing: "0.35em" }}
                transition={{ duration: 1, ease }}
                className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-white/70"
              >
                {BEATS[1].line}
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence mode="popLayout">
            {beat >= 2 && (
              <motion.p
                key="b"
                initial={{ opacity: 0, y: 14, letterSpacing: "0.6em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.35em" }}
                transition={{ duration: 1, ease }}
                className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-red-400"
              >
                {BEATS[2].line}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* THE WAY IN */}
        <AnimatePresence>
          {open && (
            <motion.button
              key="enter"
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); enter(); }}
              autoFocus
              className="group relative mt-4 px-12 py-5 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-[0.45em] text-white overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <span className="relative z-10">Enter</span>
              <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-25deg]" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Honest strapline, readable, at full opacity — not a 5% flash. */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: open ? 0.45 : 0 }}
          transition={{ duration: 1.2, ease }}
          className="mt-8 font-mono text-[9px] uppercase tracking-[0.3em] text-white/45"
        >
          Train with intent · Recover with purpose
        </motion.p>
      </div>

      {/* Always available, from the very first frame. */}
      <button
        onClick={(e) => { e.stopPropagation(); enter(); }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.35em] text-white/25 hover:text-white/80 transition-colors px-6 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full"
      >
        Skip
      </button>
    </motion.div>
  );
}
