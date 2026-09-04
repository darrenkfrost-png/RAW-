import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PanelTop, PanelLeft, PanelBottom, Mic, Bot, Activity, Layers, Scan, Eye, EyeOff, X } from "lucide-react";
import { useUI, CHROME_PARTS, type ChromePart } from "../context/UIContext";

/**
 * THE DISPLAY DOCK — the RAW mark is the way back, and the way out.
 *
 * ⚠️ TWO RULES THIS ENFORCES.
 *
 * 1. NOTHING MAY HIDE WITHOUT LEAVING A DOOR. Every hide control puts away its
 *    own panel and nothing else, so if the only way back were the panel you
 *    just hid, full-screen mode would be a trap.
 *
 * 2. A PHONE MUST BE ABLE TO DO EVERYTHING A DESKTOP CAN. The hide controls in
 *    the header are `hidden lg:block` — invisible below 1024px — so a phone
 *    could never hide anything at all. The panel here therefore HIDES as well
 *    as restores: one control, reachable at any width, that owns the whole
 *    interface.
 *
 * It is deliberately the RAW logo rather than a generic chevron: on a screen
 * stripped of its furniture, the one remaining control should still say whose
 * site it is.
 *
 * MOBILE BEHAVIOUR: hover opens the panel on a pointer device; a tap toggles it
 * on touch, where hover does not exist. Without the tap path the entire feature
 * would be desktop-only — the exact failure this component exists to prevent.
 */

const LABELS: Record<ChromePart, { label: string; icon: typeof PanelTop }> = {
  header: { label: "Top bar", icon: PanelTop },
  sidebar: { label: "Side bar", icon: PanelLeft },
  statusBar: { label: "Status bar", icon: PanelBottom },
  voiceHub: { label: "Voice panel", icon: Mic },
  aiHub: { label: "AI assistant", icon: Bot },
  diagnostics: { label: "Readout chip", icon: Activity },
  protocolChip: { label: "Stack badge", icon: Layers },
  hudFrame: { label: "HUD frame", icon: Scan },
};

export default function ChromeRestore() {
  const { chromeHidden, toggleChrome, restoreChrome, enterFocusMode } = useUI();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const anythingHidden = chromeHidden.length > 0;

  // A tap outside closes the panel. Without this it can only be dismissed by
  // hitting the small mark again, which on a phone is a fiddly target.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // The dock only exists once something is hidden; otherwise it would be one
  // more permanent floating thing on a screen this feature exists to clear.
  if (!anythingHidden) return null;

  return (
    <div
      ref={root}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      /* Bottom-left: clear of the cart, the AI halo and the readout chip, all
         of which live bottom-right. Inset uses safe-area so it clears the home
         indicator on a phone. */
      className="fixed z-[1150] flex flex-col items-start gap-2"
      style={{
        left: "max(1rem, env(safe-area-inset-left))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            /* Width is capped against the viewport so the panel can never be
               wider than a phone: 375px - 2rem of inset leaves 311px. */
            className="mb-1 w-[min(15rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-black/92 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">Display</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close display panel"
                className="flex h-6 w-6 items-center justify-center rounded-md text-white/40 transition-colors hover:text-white"
              >
                <X size={11} />
              </button>
            </div>

            <div className="space-y-1">
              {CHROME_PARTS.map((p) => {
                const { label, icon: Icon } = LABELS[p];
                const hidden = chromeHidden.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => toggleChrome(p)}
                    aria-pressed={!hidden}
                    /* min-h-11 = 44px: the smallest tap target that is reliable
                       on a phone. */
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                      hidden
                        ? "border-white/10 text-white/45 hover:border-red-500/60 hover:text-white"
                        : "border-red-500/40 bg-red-600/10 text-red-200"
                    }`}
                  >
                    <Icon size={12} className={hidden ? "text-white/30" : "text-red-400"} />
                    <span className="flex-1 truncate">{label}</span>
                    {hidden ? <EyeOff size={11} className="opacity-50" /> : <Eye size={11} />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={restoreChrome}
                className="min-h-11 rounded-lg bg-red-600 px-2 font-mono text-[10px] font-black uppercase tracking-[0.15em] text-white transition-colors hover:bg-red-500"
              >
                Show all
              </button>
              <button
                onClick={enterFocusMode}
                className="min-h-11 rounded-lg border border-white/15 px-2 font-mono text-[10px] font-black uppercase tracking-[0.15em] text-white/70 transition-colors hover:border-white/35 hover:text-white"
              >
                Hide all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Display controls — ${chromeHidden.length} hidden`}
        aria-expanded={open}
        title="Display controls"
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/85 backdrop-blur-xl transition-all duration-500 hover:border-red-500 hover:shadow-[0_0_35px_rgba(220,38,38,0.35)]"
      >
        <img
          src="/brand/raw-logo-red.png"
          alt=""
          className="h-6 w-auto object-contain opacity-85 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 font-mono text-[9px] font-black text-white">
          {chromeHidden.length}
        </span>
      </button>
    </div>
  );
}
