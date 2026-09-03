import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PanelTop, PanelLeft, PanelBottom, Mic, Maximize2 } from "lucide-react";
import { useUI, CHROME_PARTS, type ChromePart } from "../context/UIContext";

/**
 * THE BRAND MARK IS THE WAY BACK.
 *
 * ⚠️ THE RULE THIS EXISTS TO ENFORCE: NOTHING MAY HIDE WITHOUT LEAVING A DOOR.
 *
 * Every hide control in the app puts its panel away and nothing else. If the
 * only way back were the panel you just hid, full-screen mode would be a trap
 * — and the visitor who cleared the header to read something would have no
 * route back to the navigation at all.
 *
 * So this mark appears the moment anything is put away, and it is the single
 * place everything comes back from. It is deliberately the RAW logo rather
 * than a generic chevron: in a screen stripped of its furniture, the one
 * remaining control should still say whose site this is.
 *
 * Hovering it opens the list, so a visitor can bring back just the header, or
 * just the voice panel, instead of the all-or-nothing that would force them
 * to re-hide three things they were happy without.
 */

const LABELS: Record<ChromePart, { label: string; icon: typeof PanelTop }> = {
  header: { label: "Top bar", icon: PanelTop },
  sidebar: { label: "Side bar", icon: PanelLeft },
  statusBar: { label: "Status bar", icon: PanelBottom },
  voiceHub: { label: "Voice panel", icon: Mic },
};

export default function ChromeRestore() {
  const { chromeHidden, toggleChrome, restoreChrome } = useUI();
  const [open, setOpen] = useState(false);

  const anythingHidden = chromeHidden.length > 0;

  return (
    <AnimatePresence>
      {anythingHidden && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          /* Bottom-left: out of the way of the cart and the voice dock on the
             right, and clear of the status bar's own corner. */
          className="fixed bottom-6 left-6 z-[1150] flex flex-col items-start gap-2"
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mb-1 w-52 rounded-2xl border border-white/10 bg-black/90 p-3 backdrop-blur-xl shadow-2xl"
              >
                <p className="mb-3 px-1 font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
                  Bring back
                </p>

                <div className="space-y-1">
                  {CHROME_PARTS.filter((p) => chromeHidden.includes(p)).map((p) => {
                    const { label, icon: Icon } = LABELS[p];
                    return (
                      <button
                        key={p}
                        onClick={() => toggleChrome(p)}
                        className="flex w-full items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 transition-colors hover:border-red-500/60 hover:text-white"
                      >
                        <Icon size={12} className="text-red-500" />
                        {label}
                      </button>
                    );
                  })}
                </div>

                {chromeHidden.length > 1 && (
                  <button
                    onClick={restoreChrome}
                    className="mt-2 w-full rounded-lg bg-red-600 py-2.5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-500"
                  >
                    Restore all
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* The mark itself. A single click restores everything, so nobody has
              to discover the hover menu to escape full-screen mode. */}
          <button
            onClick={restoreChrome}
            aria-label={`Restore interface (${chromeHidden.length} hidden)`}
            title="Restore interface"
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl transition-all duration-500 hover:border-red-500 hover:shadow-[0_0_35px_rgba(220,38,38,0.35)]"
          >
            <img
              src="/brand/raw-logo-red.png"
              alt=""
              className="h-6 w-auto object-contain opacity-80 transition-opacity duration-500 group-hover:opacity-100"
            />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 font-mono text-[9px] font-black text-white">
              {chromeHidden.length}
            </span>
            <Maximize2
              size={10}
              className="absolute bottom-1.5 right-1.5 text-white/25 transition-colors group-hover:text-red-400"
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
