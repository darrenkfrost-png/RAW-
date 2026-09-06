import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Volume2, Square } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

/**
 * HIGHLIGHT ANY TEXT, PRESS PLAY, HEAR IT.
 *
 * Darren asked for a read-aloud control on the information pages: select a
 * passage and a play button appears to read it in the free voice. That voice is
 * the browser's own speech synthesiser — already installed on every phone and
 * laptop, nothing to sign up for, no request leaving the machine, and no cost.
 *
 * ⚠️ RULES THIS KEEPS, BECAUSE A THING THAT FLOATS OVER THE PAGE CAN EASILY
 * BECOME A NUISANCE
 *
 *  - It only appears for a real passage: at least a dozen characters, and only
 *    inside <main>. Selecting a menu item or a price does not summon it.
 *  - It never appears while you are typing. A selection inside an input or a
 *    textarea is yours, not something to read at you.
 *  - It is position:fixed and re-reads the selection's rectangle on scroll, so
 *    it stays with the words rather than drifting off or vanishing.
 *  - Escape stops the voice. So does clicking it again, selecting something
 *    else, or leaving the page — speech that outlives its page is the worst
 *    version of this feature.
 *  - Long passages are capped. Speech engines mangle or silently drop very long
 *    utterances, so it reads the first part of an enormous selection rather
 *    than appearing to fail.
 *  - The button is a real <button> with a label, reachable by keyboard, and the
 *    voice inherits the rate and pitch from the site's own settings panel.
 */

const MIN_CHARS = 12;
const MAX_CHARS = 3500;

export default function SelectionReader() {
  const { settings } = useSettings();
  const [rect, setRect] = useState<{ top: number; left: number } | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const textRef = useRef("");
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const place = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;

    const text = sel.toString().trim();
    if (text.length < MIN_CHARS) return null;

    const node = sel.anchorNode;
    const el = node && (node.nodeType === 1 ? (node as Element) : node.parentElement);
    if (!el) return null;

    /* Not while they are typing, and not for the furniture around the page. */
    if (el.closest("input, textarea, [contenteditable='true']")) return null;
    if (!el.closest("main")) return null;

    const r = sel.getRangeAt(0).getBoundingClientRect();
    if (!r || (r.width === 0 && r.height === 0)) return null;

    textRef.current = text.slice(0, MAX_CHARS);
    /* ⚠️ CLAMPED TO THE WINDOW, BOTH WAYS. The button is position:fixed, so an
       unclamped rectangle puts it off-screen the moment the selection is above
       or below the fold — caught in testing at top:1384 in a 900px window,
       where it existed, reported itself visible, and could not be seen. */
    return {
      top: Math.min(Math.max(12, r.top - 52), window.innerHeight - 64),
      left: Math.min(Math.max(72, r.left + r.width / 2), window.innerWidth - 72),
    };
  }, []);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  useEffect(() => {
    if (!supported) return;

    const update = () => setRect(place());
    /* mouseup and keyup rather than selectionchange: selectionchange fires for
       every character as a drag grows, and the button would jitter. */
    const onUp = () => window.setTimeout(update, 0);
    const onScroll = () => setRect((cur) => (cur ? place() : cur));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { stop(); setRect(null); }
      else onUp();
    };

    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("keyup", onKey);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      /* Speech does not stop when its page unmounts unless it is told to. */
      window.speechSynthesis.cancel();
    };
  }, [place, stop, supported]);

  const speak = useCallback(() => {
    if (!supported) return;
    if (speaking) { stop(); return; }

    window.speechSynthesis.cancel(); // whatever else was talking, this replaces it
    const utterance = new SpeechSynthesisUtterance(textRef.current);
    utterance.rate = settings.voiceRate || 1;
    utterance.pitch = settings.voicePitch || 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang === navigator.language && v.localService) ||
      voices.find((v) => v.lang.startsWith(navigator.language.slice(0, 2))) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [settings.voicePitch, settings.voiceRate, speaking, stop, supported]);

  if (!supported || !rect) return null;

  return createPortal(
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} /* keep the selection alive through the click */
      onClick={speak}
      aria-label={speaking ? "Stop reading the selected text" : "Read the selected text aloud"}
      style={{ top: rect.top, left: rect.left }}
      className="fixed z-[9000] -translate-x-1/2 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/15 bg-black/85 px-5 py-2.5 font-mono text-[0.6875rem] font-black uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-colors duration-300 hover:border-red-500/60 hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
    >
      {speaking ? <Square className="h-3.5 w-3.5 fill-current text-red-500" /> : <Volume2 className="h-4 w-4 text-red-500" />}
      {speaking ? "Stop" : "Read aloud"}
    </button>,
    document.body,
  );
}
