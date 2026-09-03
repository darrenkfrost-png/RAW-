import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, Keyboard, Mic, Settings, Eye } from 'lucide-react';

interface ShortcutCheatsheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutCheatsheet({ isOpen, onClose }: ShortcutCheatsheetProps) {
  // Available voice actions mapped representing system capabilities
  const voiceCommands = [
    { cmd: "home / go home", desc: "Navigates to Home workspace" },
    { cmd: "shop / store / products", desc: "Uplinks to unit catalog database" },
    { cmd: "combat / war", desc: "Loads Tactical Combat protocols" },
    { cmd: "nutrients / nutrition", desc: "Accesses biometric calculator & scanner" },
    { cmd: "recovery / heal", desc: "Opens autonomic breathing guide" },
    { cmd: "settings / close settings", desc: "Toggles hardware parameters panel" },
    { cmd: "wallpaper / environment / vibe", desc: "Enters immersive focused dark wall" },
    { cmd: "play / pause / close reader", desc: "Governs systemic vocal narrator stream" },
    { cmd: "low performance / fidelity balanced", desc: "Calibrates rendering and texturizer" },
    { cmd: "fidelity high / overdrive", desc: "Unlocks heavy graphic resolution modules" }
  ];

  const keys = [
    { key: "Ctrl + Shift + K", desc: "Toggles Neural Core / Advisor Drawer" },
    { key: "Ctrl + B", desc: "Toggles sidebar navigational outline" },
    { key: "Ctrl + K", desc: "Initiates system intelligence search" },
    { key: "Ctrl + ,", desc: "Toggles parameters and setting dashboard" },
    { key: "Ctrl + T", desc: "Toggles systemic terminal logs" },
    { key: "Ctrl + P", desc: "Launches the action command palette" },
    { key: "Ctrl + J", desc: "Toggles live product Discovery Hub" },
    { key: "Ctrl + Shift + H", desc: "Toggles real-time performance telemetry HUD" },
    { key: "Esc", desc: "Resets all active modal dialog layouts safely" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" id="shortcuts-modal-overlay">
          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-[0_50px_100px_rgba(0,0,0,0.9)] relative text-zinc-400 overflow-hidden font-mono"
          >
            {/* Ambient Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(239,68,68,0.03),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:30px_30px]" />

            {/* Header branding */}
            <div className="flex justify-between items-start border-b border-zinc-900 pb-5 mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <span className="p-3 bg-red-650/10 border border-red-500/20 text-red-500 rounded-2xl shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                  <Keyboard className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em] block">PROTOCOL DIRECTIVES HUD</span>
                  <h3 className="text-xl font-sans font-black uppercase text-white tracking-widest flex items-center gap-2">INTERFACE CONTROL SIGNALS</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Lists */}
            <div className="relative z-10 space-y-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {/* Keyboard triggers */}
              <div className="space-y-4">
                <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase flex items-center gap-2">
                  <Keyboard className="w-3.5 h-3.5 text-red-500" /> SYSTEM KEYBOARD TELEMETRICS
                </span>
                <div className="grid md:grid-cols-2 gap-4">
                  {keys.map((k) => (
                    <div key={k.key} className="bg-zinc-900/60 border border-zinc-900/80 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold">{k.desc}</span>
                      <kbd className="bg-zinc-950 px-2.5 py-1 text-[10px] rounded border border-zinc-850 font-black text-rose-500 shadow-md">{k.key}</kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voice triggers */}
              <div className="space-y-4 pt-4 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-blue-500" /> NEural VOICE TRANSMISSIONS
                </span>
                <p className="text-[10px] text-zinc-650 font-light leading-relaxed uppercase">Transmit these spoken phrases directly after clicking the dynamic command terminal halo or pressing Ctrl+K.</p>
                <div className="space-y-3.5 pt-2">
                  {voiceCommands.map((v) => (
                    <div key={v.cmd} className="bg-zinc-900/30 border border-zinc-900/60 rounded-xl p-4 flex items-center justify-between text-xs gap-6 hover:border-zinc-800 transition-colors duration-300">
                      <span className="text-white font-bold max-w-[45%] truncate text-[11px] font-mono tracking-widest uppercase text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10">"{v.cmd}"</span>
                      <span className="text-zinc-500 text-right text-[10px] uppercase font-bold">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t border-zinc-900 mt-8 pt-5 text-center text-[9px] text-zinc-650 uppercase font-bold relative z-10">
              UPLINK DEPLOYED SECURELY ON ENCRYPTED PORT 3000
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
