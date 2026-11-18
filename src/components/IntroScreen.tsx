import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUI } from "../context/UIContext";
import CinemaFilm from "./common/CinemaFilm";

/**
 * THE DOOR — RAW's introduction, played over the opening of The RAW Box.
 *
 * The founder's own unboxing film carries it: the closed black box with the
 * mark, the lid lifting to "A BETTER YOU STARTS NOW" printed on the contours
 * inside, the pens, the bottle, the whole contents laid out. The words on
 * screen are the ones printed on the packaging itself — nothing invented, and
 * nothing claimed about what is in the box.
 *
 * ⚠️ THE BEATS FOLLOW THE FILM, NOT A STOPWATCH. They used to be setTimeouts
 * from mount, which is fine until the film takes two seconds to arrive — then
 * every line lands on the wrong shot and the choreography reads as broken. The
 * clock starts on the first frame actually painted (onPlaying), so "A BETTER
 * YOU STARTS NOW" always lands as the lid comes up. If no frame ever arrives —
 * Data Saver, a refusal to autoplay, a dead file — a fallback starts the same
 * clock after a moment, so the sequence plays over the poster and the door
 * still opens. Choreography that can be stranded by a missing file is a trap.
 *
 * THE FILM IS SHOWN AT ITS OWN SHAPE. It was shot vertically. Stretched across
 * a monitor it would be cropped to a third of itself, so it plays contained,
 * at its true proportion, and the space either side is filled by its own light
 * — the same frames, mirrored and blurred (see CinemaFilm). No second
 * download: that wash is painted from the frames already on screen.
 *
 * FOUR THINGS IT REFUSES TO DO
 *  - It never holds anyone hostage. Skip is on screen from the first frame,
 *    Enter/Space/Escape all open the door, and so does clicking anywhere once
 *    the sequence has played. A first-time visitor who wants the shop should
 *    never have to wait for choreography to finish.
 *  - It never claims to be loading. The original progress bar was theatre — it
 *    animated to 100% on a timer with nothing behind it. A brand that says
 *    "no catch" on its front page should not open with a fake measurement.
 *  - It never ignores prefers-reduced-motion: that setting gets the finished
 *    frame immediately, with the door already open and the film held still.
 *  - It never spends a phone's data allowance unasked. Data Saver gets the
 *    poster and the words, never the film.
 */

/* Each line is printed on the box in the film. The timings are the shots they
   belong to, measured against the footage. */
/* ⚠️ THESE TIMES WERE READ OFF THE FILM, NOT GUESSED. Frames every half second:
   the box is still shut at 3.0s and the lid is fully up at 4.0s, so the line
   printed inside it — "A BETTER YOU STARTS NOW" — was landing on a closed box
   at 3.4s. It now arrives at 4.3s, just after the lid reveals those same words,
   and the screen says what the box says at the moment the box says it. */
const BEATS = [
  { at: 1500, line: "THE RAW BOX", tone: "white" },       // closed, mark facing us
  { at: 4300, line: "A BETTER YOU STARTS NOW", tone: "red" }, // lid up, line revealed
  { at: 6800, line: "PURE · POWERFUL · PROVEN", tone: "white" }, // hands into the contents
] as const;

const DOOR_AT = 8400;
/** If the film never paints a frame, the sequence still has to run. */
const FALLBACK_START = 1200;

const FILM = {
  wide: "/media/intro/raw-box.mp4",
  narrow: "/media/intro/raw-box-sm.mp4",
  poster: "/media/intro/raw-box-poster.jpg",
};

export default function IntroScreen() {
  const { hasCompletedIntro, setIntroCompleted } = useUI();
  const prefersReduced = useReducedMotion();
  const [beat, setBeat] = useState(-1);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const closing = useRef(false);
  const started = useRef(false);

  /* Chosen once, on mount: a phone gets the 1.2MB cut, a desktop the 2.6MB
     one. Read at render time it would change src mid-play on every resize. */
  const [film] = useState(() => {
    if (typeof window === "undefined") return { src: FILM.wide, play: true };
    const saveData = Boolean((navigator as any).connection?.saveData);
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    return { src: narrow ? FILM.narrow : FILM.wide, play: !saveData };
  });

  const enter = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    /* The door is a dissolve, not a cut: the film swells and goes soft while
       the home page — already mounted underneath — comes up through it. */
    setLeaving(true);
    window.setTimeout(() => setIntroCompleted(true), 560);
  }, [setIntroCompleted]);

  /** Runs the sequence. Called by the film's first frame, or by the fallback. */
  const startSequence = useCallback(() => {
    if (started.current) return;
    started.current = true;
    BEATS.forEach((b, i) => window.setTimeout(() => setBeat(i), b.at));
    window.setTimeout(() => setOpen(true), DOOR_AT);
  }, []);

  useEffect(() => {
    if (hasCompletedIntro) return;

    if (prefersReduced) {
      started.current = true;
      setBeat(BEATS.length - 1);
      setOpen(true);
      return;
    }

    const fallback = window.setTimeout(startSequence, FALLBACK_START);
    return () => window.clearTimeout(fallback);
  }, [hasCompletedIntro, prefersReduced, startSequence]);

  // Every reasonable "let me in" gesture works, not just the button.
  useEffect(() => {
    if (hasCompletedIntro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") { e.preventDefault(); enter(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasCompletedIntro, enter]);

  if (hasCompletedIntro) return null;

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.div
      key="intro"
      animate={leaving ? { opacity: 0, scale: 1.12, filter: "blur(16px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0 }}
      /* ⚠️ THE LEAVE GETS ITS OWN CURVE. On the house easing — an expo-out that
         does most of its work immediately — the gate was 78% faded 136ms in and
         then spent 480ms invisible: a snap with a long tail, not a dissolve.
         A symmetric curve spends the time where it can be seen, so the film
         swells and softens and the home page rises through it evenly. */
      transition={leaving ? { duration: 0.55, ease: [0.55, 0, 0.35, 1] } : { duration: 0.4, ease }}
      /* z above every floating layer; a gate has nothing above it. */
      className="fixed inset-0 z-[1100] bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none"
      onClick={() => open && enter()}
      role="dialog"
      aria-label="RAW Official — enter the site"
    >
      {/* ── THE FILM ───────────────────────────────────────────────────────
          Contained, so the whole box is in shot, with its own light thrown
          on the walls either side. */}
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.2, ease }}
        className="absolute inset-0"
      >
        {film.play && !prefersReduced ? (
          <CinemaFilm
            src={film.src}
            poster={FILM.poster}
            fit="contain"
            narrow="play"
            onPlaying={startSequence}
            aboveGate
            className="absolute inset-0 overflow-hidden"
            bandClassName="h-full w-full object-contain opacity-95"
            washClassName="absolute inset-0 h-full w-full scale-125 object-cover opacity-[0.28] blur-3xl saturate-[0.6]"
            posterWallClassName="absolute inset-0 scale-125 bg-cover bg-center opacity-30 blur-3xl"
          />
        ) : (
          /* Data Saver and reduced motion get the frame, never the film. */
          <>
            <div aria-hidden="true" className="absolute inset-0 scale-125 bg-cover bg-center opacity-[0.28] blur-3xl saturate-[0.6]" style={{ backgroundImage: `url("${FILM.poster}")` }} />
            <img src={FILM.poster} alt="" className="absolute inset-0 h-full w-full object-contain opacity-95" />
          </>
        )}
      </motion.div>

      {/* ⚠️ THE FILM IS THE POINT, SO THE PLATE KEEPS OFF THE MIDDLE OF IT.
          The first version laid a 55% black wash over the whole frame plus a
          heavy vignette, and the box — matte black on white — went to mud. The
          words live at the top and bottom, so the darkening does too: the
          centre band, where the box is, stays clear. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black via-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_48%,transparent,rgba(0,0,0,0.55))]" />

      {/* CINEMA BARS — closed at the start, drawn back as the sequence runs. */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          initial={{ height: "18vh" }}
          animate={{ height: beat >= 0 ? "6vh" : "18vh" }}
          transition={{ duration: 2.4, ease }}
          className={`pointer-events-none absolute inset-x-0 z-20 bg-black ${i ? "bottom-0" : "top-0"}`}
        />
      ))}

      {/* THE RINGS — the packaging's own concentric print, drawn in light. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1 + i * 0.55, opacity: 0.32 - i * 0.055 }}
            transition={{ duration: 2.6, delay: i * 0.12, ease }}
            className="absolute rounded-full border border-red-600/40"
            style={{ width: "34vmin", height: "34vmin" }}
          />
        ))}
      </div>

      {/* A single horizontal light bar — the product photography's signature. */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 0.9, 0.25] }}
        transition={{ duration: 1.8, ease, times: [0, 0.4, 1] }}
        className="absolute left-0 right-0 top-1/2 h-[2px] origin-center bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_40px_#dc2626] pointer-events-none z-10"
      />

      {/* ⚠️ THE MARK SAT ON THE BOX. Centred as one stack, the logo landed
          exactly over the lid and the words over the contents — the film was
          playing behind a wall of our own type. The column now spans the frame
          and pushes to its ends: mark at the top, words at the foot, and the
          middle left to the product. */}
      <div className="relative z-30 flex h-full w-full flex-col items-center justify-between px-6 py-[12vh] text-center">
        {/* THE MARK */}
        <motion.img
          src="/brand/raw-logo-red.png"
          alt="RAW Official"
          initial={{ opacity: 0, scale: 1.35, filter: "blur(24px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.6, ease }}
          className="h-12 md:h-16 object-contain drop-shadow-[0_0_45px_rgba(220,38,38,0.75)]"
        />

        <div className="flex flex-col items-center">
        {/* THE LINES — the box's own words, one at a time, each landing on the
            shot it belongs to.

            ⚠️ NOT mode="wait". That ran the outgoing line's exit to completion
            before the next one began, so between "THE RAW BOX" and the lid
            opening there was most of a second of nothing at all — the sequence
            read as a stall. They share one slot and cross-fade instead, the
            outgoing lifting away as the incoming rises. */}
        <div className="relative flex h-14 w-full items-start justify-center">
          <AnimatePresence>
            {beat >= 0 && (
              <motion.p
                key={beat}
                initial={{ opacity: 0, y: 16, letterSpacing: "0.75em", filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.35em", filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                transition={{ duration: 0.9, ease }}
                className={`absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap font-mono text-[0.6875rem] font-black uppercase sm:text-[0.75rem] ${
                  BEATS[beat].tone === "red"
                    ? "text-red-400 drop-shadow-[0_0_25px_rgba(220,38,38,0.6)]"
                    : "text-white/85"
                }`}
              >
                {BEATS[beat].line}
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
              className="group relative mt-2 px-12 py-5 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-md font-mono text-[0.6875rem] font-bold uppercase tracking-[0.45em] text-white overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 1.2, ease }}
          className="mt-6 max-w-[88vw] font-mono text-[0.625rem] uppercase leading-relaxed tracking-[0.25em] text-white/60 sm:text-[0.6875rem] sm:tracking-[0.3em]"
        >
          Train with intent<span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">Recover with purpose</span>
        </motion.p>
        </div>
      </div>

      {/* Always available, from the very first frame. */}
      <button
        onClick={(e) => { e.stopPropagation(); enter(); }}
        className="absolute bottom-[calc(6vh+1.5rem)] left-1/2 z-30 -translate-x-1/2 font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-white/60 hover:text-white transition-colors px-6 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full"
      >
        Skip
      </button>
    </motion.div>
  );
}
