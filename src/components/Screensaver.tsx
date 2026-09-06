import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Film, X, SkipForward, Check, Clock, Type, Shuffle, ListVideo } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useUI } from "../context/UIContext";
import { VIDEO_LIBRARY, videoById, nextVideo, ambientVideos } from "../data/videoLibrary";
import CinemaFilm from "./common/CinemaFilm";

/**
 * THE SCREENSAVER — RAW takes the whole screen when the room goes quiet.
 *
 * Arrives after a minute of stillness, or instantly from the button in the
 * header. Full-bleed film, the mark, the line, a clock, and a shelf of films
 * and settings that slides out from the left edge.
 *
 * ⚠️ IT LEAVES ONLY WHEN IT IS TOLD TO — DARREN'S RULE.
 *
 * It used to wake on any pointer movement, which meant a nudge of the desk
 * killed the film mid-shot. Now the ONLY ways out are deliberate:
 *
 *   - pressing the RAW mark in the middle (it is a real button, labelled),
 *   - the Exit button on the shelf,
 *   - the Escape key.
 *
 * Escape stays because a full-screen layer with no keyboard escape is a trap
 * for anyone who cannot use a pointer, and because a browser's own full-screen
 * habits have taught everyone that Escape gets you out.
 *
 * Because nothing else dismisses it, the mark must ANNOUNCE that it is the way
 * out rather than sitting there looking decorative. So it breathes: a ring
 * pulses out of it every few seconds and the line beneath brightens with it —
 * often enough to be noticed, slow enough not to nag.
 *
 * THE REST OF THE CARE
 *  - The idle clock is paused while it is showing, or it re-arms against
 *    itself. It resets on keystrokes too, so it cannot ambush someone filling
 *    in the signup form.
 *  - It never appears over a dialog or the intro, and never on first paint.
 *  - Data Saver means it never triggers itself; the header button still works,
 *    because then it was asked for.
 *  - Play-all: when a film ends it hands over to the next, so a long sit
 *    watches the whole library rather than one clip on repeat.
 */

const IDLE_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;

export default function Screensaver() {
  const { settings, updateSettings } = useSettings();
  const { hasCompletedIntro } = useUI();
  const [active, setActive] = useState(false);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [clock, setClock] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Rotation: each time the screensaver wakes it draws a different film, so
     the same one never opens twice in a row. Choosing one from the shelf pins
     it for that showing — an explicit choice outranks the shuffle — and the
     rotation resumes next time. */
  const [rotated, setRotated] = useState<string | null>(null);
  const asset = videoById(rotated || settings.screensaverVideoId);

  const dismiss = useCallback(() => {
    setActive(false);
    setShelfOpen(false);
  }, []);

  /** The whole library plays through, in order, when Play all is on. */
  const advance = useCallback(() => {
    const pool = settings.screensaverShuffle ? ambientVideos() : VIDEO_LIBRARY;
    const list = pool.length ? pool : VIDEO_LIBRARY;
    if (settings.screensaverShuffle) { setRotated(nextVideo(list).id); return; }
    const here = list.findIndex((v) => v.id === asset.id);
    setRotated(list[(here + 1) % list.length].id);
  }, [asset.id, settings.screensaverShuffle]);

  /* Data Saver means "do not spend my allowance on decoration". Arriving
     unasked with a full-screen film is exactly that, so on a metered
     connection the screensaver never triggers ITSELF — the header button
     still works, because then it was asked for. */
  const saveData =
    typeof navigator !== "undefined" && Boolean((navigator as any).connection?.saveData);

  // The idle clock. Rebuilt whenever the setting changes or we wake.
  useEffect(() => {
    if (!settings.screensaverEnabled || active || saveData || !hasCompletedIntro) return;

    const arm = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        // Over a dialog (cart drawer, image viewer, any modal) the film would
        // bury what the visitor was doing — wait another round instead.
        if (document.querySelector('[role="dialog"], [aria-modal="true"]')) { arm(); return; }
        setActive(true);
      }, Math.max(10000, settings.screensaverDelayMs));
    };

    const onActivity = () => arm();
    arm();
    IDLE_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      if (timer.current) clearTimeout(timer.current);
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [settings.screensaverEnabled, settings.screensaverDelayMs, active, saveData, hasCompletedIntro]);

  // Every arrival draws a fresh film.
  useEffect(() => {
    if (active && settings.screensaverShuffle) setRotated(nextVideo(ambientVideos()).id);
    if (!active) setRotated(null);
  }, [active, settings.screensaverShuffle]);

  // Manual trigger from anywhere in the app.
  useEffect(() => {
    const open = () => setActive(true);
    window.addEventListener("raw:screensaver", open);
    return () => window.removeEventListener("raw:screensaver", open);
  }, []);

  // While it is showing: the clock, the scroll lock, and the one keyboard exit.
  useEffect(() => {
    if (!active) return;

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKey);

    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const clockTimer = setInterval(tick, 15000);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      clearInterval(clockTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, dismiss]);

  const campaign = VIDEO_LIBRARY.filter((v) => v.hasBurnedInText);
  const reels = VIDEO_LIBRARY.filter((v) => !v.hasBurnedInText);

  const filmButton = (v: (typeof VIDEO_LIBRARY)[number]) => {
    const on = v.id === asset.id;
    return (
      <button
        key={v.id}
        onClick={() => { setRotated(v.id); updateSettings({ screensaverVideoId: v.id }); }}
        aria-pressed={on}
        className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
          on
            ? "border-red-500 bg-red-600/15 text-red-300"
            : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
        }`}
      >
        {/* A frame from the film reads faster than its name — but most reels
            carry no poster, and an empty grey box reads as a broken image. Those
            get the mark instead. */}
        <span
          aria-hidden="true"
          className={`flex h-9 w-14 shrink-0 items-center justify-center rounded bg-cover bg-center ${
            v.poster ? "" : "bg-gradient-to-br from-red-600/25 to-black"
          }`}
          style={v.poster ? { backgroundImage: `url("${v.poster}")` } : undefined}
        >
          {!v.poster && <Film size={12} className="text-red-400/70" />}
        </span>
        <span className="min-w-0 font-mono text-[0.6875rem] uppercase tracking-[0.12em]">
          <span className="block break-words">{v.label}</span>
          {v.megabytes && v.megabytes > 20 && (
            <span className="mt-0.5 block text-white/35">{v.megabytes}MB</span>
          )}
        </span>
      </button>
    );
  };

  const toggle = (
    label: string,
    on: boolean,
    onClick: () => void,
    Icon: typeof Shuffle,
  ) => (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left font-mono text-[0.6875rem] uppercase tracking-[0.14em] transition-colors ${
        on ? "border-red-500/60 bg-red-600/10 text-white" : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
      }`}
    >
      <Icon size={12} className={on ? "text-red-400" : "text-white/40"} />
      <span className="min-w-0 flex-1 break-words">{label}</span>
      {on && <Check size={12} className="shrink-0 text-red-400" />}
    </button>
  );

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[1200] bg-black"
          role="dialog"
          aria-label="RAW screensaver"
        >
          {/* ⚠️ THE REELS ARE SQUARE AND THE SCREENS ARE NOT. object-cover threw away
              a third of a 2160x2160 reel on a 16:9 monitor, and its sides on a phone.
              fit="contain" shows the whole film whatever the device, and the space
              left over is filled by the film itself, mirrored and blurred. */}
          <CinemaFilm
            key={asset.id}
            src={asset.src}
            poster={asset.poster}
            fit="contain"
            narrow="play"
            loop={!settings.screensaverPlayAll}
            onEnded={settings.screensaverPlayAll ? advance : undefined}
            className="absolute inset-0 overflow-hidden"
            bandClassName="h-full w-full object-contain opacity-90"
            washClassName="absolute inset-0 h-full w-full scale-125 object-cover opacity-55 blur-3xl"
            posterWallClassName="absolute inset-0 scale-125 bg-cover bg-center opacity-30 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/70" />
          {/* A soft plate behind the wordmark and the line under it, so they read
              over any frame the rotation lands on. */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_28%_at_50%_45%,rgba(0,0,0,0.65),transparent_70%)]" />

          {/* ── BRAND, AND THE WAY OUT ───────────────────────────────────
              The mark IS the exit. It breathes so that is discoverable. */}
          <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
            <motion.button
              type="button"
              onClick={dismiss}
              aria-label="Exit the screensaver and return to the site"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative cursor-pointer rounded-full p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {/* The pulse: a ring leaving the mark every few seconds. */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border border-red-500/50"
                animate={{ opacity: [0, 0.55, 0], scale: [0.85, 1.35, 1.55] }}
                transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3.4, ease: "easeOut" }}
              />
              <motion.img
                src="/brand/raw-logo-red.png"
                alt=""
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3.4, ease: "easeInOut" }}
                className="h-16 object-contain drop-shadow-[0_0_45px_rgba(220,38,38,0.55)] transition-transform duration-500 group-hover:scale-105 md:h-24"
              />
            </motion.button>

            <motion.p
              animate={{ opacity: [0.45, 0.95, 0.45] }}
              transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3.4, ease: "easeInOut" }}
              className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.4em] text-white/80"
            >
              Press the mark to resume
            </motion.p>

            {settings.screensaverShowTagline && (
              <>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 0.75, y: 0 }}
                  transition={{ duration: 1.4, delay: 0.3 }}
                  className="mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.45em] text-white/70"
                >
                  Train with intent · Recover with purpose
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  transition={{ duration: 1.4, delay: 0.5 }}
                  className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-red-400/60"
                >
                  #StaySafeWithRAW
                </motion.p>
              </>
            )}
          </div>

          {settings.screensaverShowClock && (
            <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2">
              <span className="font-sans text-3xl font-black tracking-tight text-white/80">{clock}</span>
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.4em] text-white/45">
                {asset.label}
              </span>
            </div>
          )}

          {/* ── THE SHELF ─────────────────────────────────────────────────
              A strip on the left edge; hovering or tapping it slides the panel
              out — the films, and the settings that used to live only in the
              header panel. On touch, pointerleave fires the moment the finger
              lifts, which would shut the shelf the same tap opened, so a touch
              pointer leaving is ignored. */}
          <div
            onPointerEnter={() => setShelfOpen(true)}
            onPointerLeave={(e) => { if (e.pointerType !== "touch") setShelfOpen(false); }}
            onClick={() => setShelfOpen(true)}
            className="absolute inset-y-0 left-0 z-10 flex cursor-default items-center"
          >
            <div className="flex h-full w-9 items-center justify-center bg-gradient-to-r from-black/70 to-transparent">
              <Film size={14} className="text-white/40" />
            </div>

            <AnimatePresence>
              {shelfOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="max-h-[88vh] w-72 overflow-y-auto rounded-r-2xl border border-l-0 border-white/10 bg-black/90 p-4 backdrop-blur-xl"
                >
                  <p className="mb-3 mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-white/40">
                    Playback
                  </p>
                  <div className="space-y-1.5">
                    <button
                      onClick={advance}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 px-3 py-2 text-left font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-white/60 transition-colors hover:border-white/30 hover:text-white"
                    >
                      <SkipForward size={12} className="text-white/40" /> Next film
                    </button>
                    {toggle("Play all", settings.screensaverPlayAll, () => updateSettings({ screensaverPlayAll: !settings.screensaverPlayAll }), ListVideo)}
                    {toggle("Shuffle", settings.screensaverShuffle, () => updateSettings({ screensaverShuffle: !settings.screensaverShuffle }), Shuffle)}
                    {toggle("Show clock", settings.screensaverShowClock, () => updateSettings({ screensaverShowClock: !settings.screensaverShowClock }), Clock)}
                    {toggle("Show tagline", settings.screensaverShowTagline, () => updateSettings({ screensaverShowTagline: !settings.screensaverShowTagline }), Type)}
                  </div>

                  <p className="mb-3 mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-white/40">
                    Reels
                  </p>
                  <div className="space-y-1.5">{reels.map(filmButton)}</div>

                  <p className="mb-3 mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-white/40">
                    Campaign
                  </p>
                  <div className="space-y-1.5">{campaign.map(filmButton)}</div>

                  <button
                    onClick={dismiss}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-white/70 transition-colors hover:border-red-500 hover:text-white"
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
