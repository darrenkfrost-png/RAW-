import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Command, Key, Mic, Activity, Eye, Layout, Cpu, ShieldCheck } from 'lucide-react';

interface DiscoveryHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscoveryHub({ isOpen, onClose }: DiscoveryHubProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const shortcutSections = [
    {
      title: "System Navigation & Overlays",
      icon: Layout,
      items: [
        { keys: ["⌘", "B"], label: "Toggle Navigation Sidebar" },
        { keys: ["⌘", "T"], label: "Toggle Main Terminal / System Logs" },
        { keys: ["⌘", "P"], label: "Toggle Neural Command Terminal" },
        { keys: ["⌘", "Shift", "K"], label: "Trigger Gemini AI Neural Core" },
        { keys: ["/"], label: "Toggle Inventory Search Mode" },
        { keys: ["⌘", "J"], label: "Toggle System Discovery Hub" },
        { keys: ["Ctrl", "Shift", "H"], label: "Toggle System Health Diagnostics" },
        { keys: ["⌘", ","], label: "Toggle Real-time Settings" },
      ]
    },
    {
      title: "Active Core Telemetry",
      icon: Activity,
      items: [
        { keys: ["Hover"], label: "Access Diagnostics Panel details" },
        { keys: ["Range"], label: "Adjust Interface scale dynamic resolution" },
        { keys: ["Buttons"], label: "Select Render Fidelity preset profiles" },
      ]
    },
    {
      title: "Voice Commands",
      icon: Mic,
      items: [
        { keys: ["Say", "Navigate Home"], label: "Return immediately to raw-landing" },
        { keys: ["Say", "Open Chat"], label: "Open the active advisor dialog drawer" },
        { keys: ["Say", "Toggle theme"], label: "Cycle system UI presentation visual themes" },
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[10000] bg-editorial-bg/85 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-4 top-16 md:top-24 max-w-4xl mx-auto z-[10001] crystal-glass-panel layered-shadows-premium p-8 md:p-12 overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.03] to-transparent pointer-events-none mix-blend-screen" />
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent pointer-events-none" />
            <div className="neural-grid-overlay" />

            <div className="flex items-center justify-between border-b border-editorial-border pb-6 mb-8 shrink-0 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)] soft-glow-field">
                  <Command className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-sans font-black cinematic-gradient-text text-xl uppercase tracking-wider">System Discovery Hub</h3>
                  <p className="font-mono text-[9px] text-editorial-text-muted uppercase tracking-[0.2em] mt-1">RAW_SYSTEM_GUIDE // OPERATIONAL_MANUAL</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-3 hover:bg-white/5 rounded-xl border border-editorial-border hover:border-white/20 transition-all text-zinc-500 hover:text-white"
                aria-label="Close Discovery Hub"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Layout of Manual Info */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-10 pr-2 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortcutSections.map((sect, slotIdx) => (
                  <div
                    key={slotIdx}
                    className="p-6 bg-editorial-bg border border-editorial-border rounded-[2rem] flex flex-col relative overflow-hidden group hover:border-red-500/20 transition-all duration-500"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-600/[0.02] to-transparent pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-6">
                      <sect.icon className="w-4 h-4 text-red-500" />
                      <h4 className="font-mono text-[10px] font-black tracking-[0.25em] uppercase text-zinc-400">{sect.title}</h4>
                    </div>

                    <div className="space-y-4 flex-1">
                      {sect.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-2 border-b border-white/[0.02] last:border-0 pb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {item.keys.map((kbd, kbdIdx) => (
                              <kbd
                                key={kbdIdx}
                                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md font-mono text-[9px] text-white font-bold uppercase select-none tracking-widest"
                              >
                                {kbd}
                              </kbd>
                            ))}
                          </div>
                          <span className="text-xs text-editorial-text-muted font-medium tracking-tight">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Verification Card */}
              <div className="p-6 bg-red-600/5 border border-red-600/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-500/20 text-red-500">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-sm text-white uppercase tracking-wider">Interface Calibration Nominal</h5>
                    <p className="text-xs text-editorial-text-muted mt-0.5">Dual-layer keyboard listeners, real-time FPS stabilizers, and voice engine connections active.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-editorial-bg border border-editorial-border px-4 py-2 rounded-xl text-center">
                    <span className="block text-[8px] font-bold text-zinc-600 uppercase">Latency</span>
                    <span className="font-mono text-xs text-emerald-500">2ms</span>
                  </div>
                  <div className="bg-editorial-bg border border-editorial-border px-4 py-2 rounded-xl text-center">
                    <span className="block text-[8px] font-bold text-zinc-600 uppercase">Status</span>
                    <span className="font-mono text-xs text-red-500">Optimal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-editorial-border shrink-0 text-center relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[9px] text-zinc-600 tracking-widest uppercase">
              <span>RAW_CORE_COMPILER // RUNNING_STATE_STABLE</span>
              <span>UTC TIME_SYNC // SECURE_UPLINK</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
