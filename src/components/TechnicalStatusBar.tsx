import { motion, AnimatePresence } from "motion/react";
import { useUI } from "../context/UIContext";
import { useSettings } from "../context/SettingsContext";
import { Cpu, Maximize, Settings2, Sliders, Wifi, Activity, MessageSquare, Terminal, Hash, ShieldCheck, Zap, ChevronDown } from "lucide-react";
import { useState, useEffect, memo, useMemo } from "react";
import { Tooltip } from "./common/Tooltip";

const StatusIndicator = memo(({ label, color, icon: Icon, value }: { label: string, color: string, icon?: any, value?: string }) => (
  <Tooltip content={`${label.toUpperCase()}_LINK: ${value || 'ACTIVE'}`}>
    <div className="flex items-center gap-3 text-meta-premium opacity-50 hover:opacity-100 transition-opacity duration-500 cursor-help group pr-6 border-r border-editorial-border/30 last:border-0 h-4 relative">
      {/* Indicator Glow */}
      <div className="absolute inset-x-0 -bottom-1 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]" style={{ backgroundColor: color }} />
      {Icon && <Icon className={`w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-500 relative z-10`} style={{ color }} />}
      <span className="hidden lg:inline relative z-10">{label}:</span>
      <span className="font-bold uppercase relative z-10" style={{ color: color, textShadow: `0 0 10px ${color}` }}>{value || "NOMINAL"}</span>
    </div>
  </Tooltip>
));

const VisualWave = memo(() => (
  <div className="hidden xl:flex flex-col justify-center gap-1.5 border-l border-editorial-border pl-8 h-full min-w-[180px] group/wave">
    <div className="flex items-center gap-2.5">
      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#dc2626]" />
      <span className="text-meta-premium opacity-30 !text-[8px] group-hover/wave:opacity-60 transition-opacity">OS_WAVEFORM_GEN</span>
    </div>
    <div className="w-28 h-4 relative overflow-hidden">
      <svg viewBox="0 0 128 24" className="w-full h-full" preserveAspectRatio="none">
        <motion.path
          /* ⚠️ THE `d` MUST BE IN `initial` TOO, not just as an attribute.
             Motion keeps its own map of animated values and writes them to the
             DOM each frame; with `d` animated only in `animate`, that map holds
             undefined on the first frame and motion writes d="undefined",
             which is the console error this app logged on EVERY page (the
             status bar is in the Layout). Traced with a probe installed before
             the app mounts: the writer was motion's own renderSVG. A static
             attribute does not help — motion overwrites it. */
          d="M0 12 Q 16 0, 32 12 T 64 12 T 96 12 T 128 12"
          initial={{ pathLength: 0, opacity: 0, d: "M0 12 Q 16 0, 32 12 T 64 12 T 96 12 T 128 12" }}
          animate={{ 
            pathLength: 1, 
            opacity: 1,
            d: [
              "M0 12 Q 16 0, 32 12 T 64 12 T 96 12 T 128 12",
              "M0 12 Q 16 24, 32 12 T 64 12 T 96 12 T 128 12",
              "M0 12 Q 16 12, 32 12 T 64 12 T 96 12 T 128 12",
              "M0 12 Q 16 0, 32 12 T 64 12 T 96 12 T 128 12",
            ]
          }}
          transition={{
            d: { duration: 4, repeat: Infinity, ease: "linear" },
            pathLength: { duration: 2, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 2, ease: "linear" }
          }}
          fill="none"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-40 drop-shadow-[0_0_8px_#dc2626]"
          style={{ willChange: "d, pathLength, opacity" }}
        />
      </svg>
    </div>
  </div>
));

export default function TechnicalStatusBar() {
  const { 
    uiScale, 
    setUIScale, 
    setIsWallpaperMode, 
    isAIChatOpen,
    setIsAIChatOpen,
    isTerminalOpen,
    setIsTerminalOpen,
    visualFidelity,
    setVisualFidelity,
    chromeHidden,
    toggleChrome
  } = useUI();
  const hidden = chromeHidden.includes('statusBar');
  const { settings, updateSettings } = useSettings();
  const [showScaleSlider, setShowScaleSlider] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = useMemo(() => {
    return time.toISOString().split('T')[1].split('.')[0];
  }, [time]);

  return (
    <div 
      /* Minimised = dropped below the bottom edge. It keeps its height in the
         layout's bottom padding either way, which is deliberate: reclaiming
         44px would reflow the whole page every time this is toggled. */
      className="fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-500 ease-[var(--layout-transition-ease)] bg-editorial-surface/95 backdrop-blur-3xl border-t border-editorial-border flex items-center justify-between px-8 pointer-events-auto transform-gpu shadow-[0_-10px_40px_rgba(0,0,0,0.8)] group/statusbar"
      style={{
        transform: hidden ? 'translateY(100%)' : undefined,
        height: 'calc(2.75rem + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Cinematic Edge Highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/20 to-transparent opacity-0 group-hover/statusbar:opacity-100 transition-opacity duration-1000 mix-blend-screen" />
      <div className="flex items-center h-full relative z-10">
        <StatusIndicator label="Status" color="#ef4444" icon={Cpu} value="Optimal" />
        <StatusIndicator label="Load" color="#a1a1aa" icon={Activity} value="0.12%" />
        <StatusIndicator label="Security" color="#10b981" icon={ShieldCheck} value="Verified" />
        
        {settings.uiStabilityFeedback && (
          <div className="hidden xl:flex items-center gap-4 pl-6 opacity-30 hover:opacity-100 transition-opacity">
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded font-mono text-[9px] uppercase tracking-wider">FPS_90</span>
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded font-mono text-[9px] uppercase tracking-wider">SYNC_LOCK</span>
          </div>
        )}

        <div className="hidden xl:flex items-center gap-5 pl-8 ml-6 border-l border-white/5 h-6">
           <span className="text-meta-premium opacity-30 text-[8px]">CORE_MEM</span>
           <div className="flex gap-[3px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <motion.div 
                  key={i}
                  animate={{ 
                    opacity: [0.1, 0.6, 0.1],
                    backgroundColor: i < 8 ? "#dc2626" : "#27272a" 
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  style={{ willChange: "opacity, background-color" }}
                  className={`w-1 h-3.5 rounded-full ${i < 8 ? 'shadow-[0_0_6px_rgba(220,38,38,0.4)]' : ''}`}
                />
              ))}
           </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-meta-premium opacity-30 group cursor-help ml-10 hover:opacity-80 transition-opacity">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shadow-[0_0_8px_#dc2626]"></div>
          <span className="font-mono text-[10px]">VER: 0.9.1-BETA // RAW_KERNEL</span>
        </div>
      </div>

      <div className="flex items-center gap-6 h-full">
        <VisualWave />

        <div className="hidden sm:flex items-center gap-8 text-meta-premium opacity-40 border-l border-white/5 pl-8 h-8">
           <div className="flex items-center gap-4 hover:opacity-100 transition-opacity duration-500 group cursor-help">
              <Wifi className="w-3.5 h-3.5 text-emerald-500 group-hover:animate-pulse" />
              <span className="text-[10px]">Ping: 2ms</span>
           </div>
        </div>

        <div className="flex items-center h-full border-l border-white/5 pl-6 gap-2">
          <Tooltip content="NEURAL_UPLINK [⌘⇧K]">
            <button 
              onClick={() => setIsAIChatOpen(!isAIChatOpen)}
              className={`flex min-h-11 items-center justify-center gap-3 p-2 rounded-lg transition-all duration-300 group ${isAIChatOpen ? 'bg-red-600/20 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'text-meta-premium opacity-40 hover:opacity-100 hover:bg-white/5'}`}
            >
              <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-[10px] uppercase font-black">AI_CORE</span>
            </button>
          </Tooltip>

          <Tooltip content="SYSTEM_TERMINAL [⌘T]">
            <button 
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className={`flex min-h-11 items-center justify-center gap-3 p-2 rounded-lg transition-all duration-300 group ${isTerminalOpen ? 'bg-red-600/20 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'text-meta-premium opacity-40 hover:opacity-100 hover:bg-white/5'}`}
            >
              <Terminal className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-[10px] uppercase font-black">Terminal</span>
            </button>
          </Tooltip>

          <Tooltip content="ENV_MODE_TOGGLE">
            <button 
              onClick={() => setIsWallpaperMode(true)}
              className="flex min-h-11 items-center justify-center gap-3 p-2 rounded-lg text-meta-premium opacity-40 hover:opacity-100 hover:bg-white/5 transition-all duration-300 group"
            >
              <Maximize className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-[10px] uppercase font-black">Canvas</span>
            </button>
          </Tooltip>

          <div className="relative flex items-center">
            <button 
              onClick={() => setShowScaleSlider(!showScaleSlider)}
              className={`flex min-h-11 items-center justify-center gap-3 p-2 rounded-lg transition-all duration-300 group ${showScaleSlider ? 'bg-red-600/20 text-red-500' : 'text-meta-premium opacity-40 hover:opacity-100 hover:bg-white/5'}`}
            >
              <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              <span className="hidden md:inline text-[10px] uppercase font-black">Res:</span> <span className="font-bold text-editorial-text text-[10px]">{Math.round(uiScale * 100)}%</span>
            </button>

            <AnimatePresence>
              {showScaleSlider && (
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  className="absolute bottom-14 right-0 bg-editorial-surface/98 backdrop-blur-3xl border border-white/10 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] min-w-[280px] rounded-2xl z-[1000]"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4 text-premium">
                      <Sliders className="w-4 h-4 text-red-600" />
                      <span className="font-sans font-black text-xs tracking-[0.2em] uppercase">Interface Scale</span>
                    </div>
                    <span className="text-red-500 font-mono font-black text-xs">{Math.round(uiScale * 100)}%</span>
                  </div>
                  
                  <div className="relative py-2 px-1">
                    <input 
                      type="range" 
                      min="0.5" 
                      max="1.5" 
                      step="0.05"
                      value={uiScale}
                      onChange={(e) => setUIScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer outline-none slider-thumb-red"
                      style={{
                        backgroundImage: `linear-gradient(to right, #dc2626 ${(uiScale - 0.5) / 1 * 100}%, #18181b ${(uiScale - 0.5) / 1 * 100}%)`
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-4 text-[10px] font-mono font-bold text-zinc-600 uppercase">
                    <span>50%</span>
                    <span className="text-white">100%</span>
                    <span>150%</span>
                  </div>
                  
                  <button 
                    onClick={() => setUIScale(1)}
                    className="mt-8 w-full bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white py-3 transition-all duration-300 font-black uppercase text-[10px] tracking-widest rounded-xl"
                  >
                    Reset Optimization
                  </button>

                  <div className="h-[1px] w-full bg-white/5 my-8" />

                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4 text-premium">
                      <Zap className="w-4 h-4 text-red-600" />
                      <span className="font-sans font-black text-xs tracking-[0.2em] uppercase">Render Fidelity</span>
                    </div>
                    <span className="text-red-500 font-mono font-black text-xs uppercase">{settings.visualFidelity}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {(['low', 'balanced', 'high', 'overdrive'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => updateSettings({ visualFidelity: level })}
                        className={`py-3 px-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 border ${settings.visualFidelity === level ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/20 hover:text-white'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex items-center gap-6 border-l border-white/5 pl-8 h-8 ml-4">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-mono font-bold text-zinc-700 tracking-[0.4em] uppercase mb-0.5">TIME_SYNC</span>
              <span className="font-mono font-black text-[12px] text-white tracking-widest uppercase">UTC: {timeString}</span>
           </div>
        </div>
      </div>
      {/* Drop it out of sight. The RAW mark bottom-left brings it back. */}
      <button
        onClick={() => toggleChrome('statusBar')}
        aria-label="Minimise the status bar"
        title="Minimise status bar"
        /* 28px was too small to hit on a phone, and this is the control that
           puts the status bar away — the one a phone user reaches for most. */
        className="ml-4 inline-flex min-h-11 min-w-11 flex-shrink-0 items-center justify-center rounded-lg p-1.5 text-editorial-text-muted transition-colors hover:bg-white/5 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
