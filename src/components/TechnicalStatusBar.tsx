import { motion, AnimatePresence } from "motion/react";
import { useUI } from "../context/UIContext";
import { useSettings } from "../context/SettingsContext";
import { Maximize, Settings2, Sliders, Zap, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Tooltip } from "./common/Tooltip";

export default function TechnicalStatusBar() {
  const { 
    uiScale, 
    setUIScale, 
    setIsWallpaperMode, 
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
      className="fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-500 ease-[var(--layout-transition-ease)] bg-editorial-surface/95 backdrop-blur-3xl border-t border-editorial-border flex items-center justify-end px-3 sm:px-8 pointer-events-auto transform-gpu shadow-[0_-10px_40px_rgba(0,0,0,0.8)] group/statusbar"
      style={{
        transform: hidden ? 'translateY(100%)' : undefined,
        height: 'calc(2.75rem + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Cinematic Edge Highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/20 to-transparent opacity-0 group-hover/statusbar:opacity-100 transition-opacity duration-1000 mix-blend-screen" />
      <div className="flex items-center gap-3 sm:gap-6 h-full">


        <div className="flex items-center h-full sm:border-l border-white/5 sm:pl-6 gap-2">

          <Tooltip content="ENV_MODE_TOGGLE">
            <button 
              onClick={() => setIsWallpaperMode(true)}
              aria-label="Enter wallpaper canvas mode"
              className="flex min-h-11 min-w-11 items-center justify-center gap-3 p-2 rounded-lg text-meta-premium opacity-40 hover:opacity-100 hover:bg-white/5 transition-all duration-300 group"
            >
              <Maximize className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline text-[0.6875rem] uppercase font-black">Canvas</span>
            </button>
          </Tooltip>

          <div className="relative flex items-center">
            <button 
              onClick={() => setShowScaleSlider(!showScaleSlider)}
              aria-expanded={showScaleSlider}
              aria-label={`Interface scale settings, ${Math.round(uiScale * 100)}%`}
              className={`flex min-h-11 items-center justify-center gap-3 p-2 rounded-lg transition-all duration-300 group ${showScaleSlider ? 'bg-red-600/20 text-red-500' : 'text-meta-premium opacity-40 hover:opacity-100 hover:bg-white/5'}`}
            >
              <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              <span className="hidden md:inline text-[0.6875rem] uppercase font-black">Res:</span> <span className="font-bold text-editorial-text text-[0.6875rem]">{Math.round(uiScale * 100)}%</span>
            </button>

            <AnimatePresence>
              {showScaleSlider && (
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  /* Below sm the popover is FIXED and spans the viewport minus a margin: anchored right-0 to the
                     Res button it ran 91px off the left edge of a 375px phone. The status bar's own transform makes
                     it the containing block, so left/right here are measured from the bar, which is full-width. */
                  className="fixed left-4 right-4 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] sm:absolute sm:left-auto sm:right-0 sm:bottom-14 max-w-[calc(100vw-2rem)] sm:min-w-[280px] bg-editorial-surface/98 backdrop-blur-3xl border border-white/10 p-6 sm:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-2xl z-[1000]"
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
                      aria-label="Interface scale"
                      onChange={(e) => setUIScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer outline-none accent-red-600"
                      style={{
                        backgroundImage: `linear-gradient(to right, #dc2626 ${(uiScale - 0.5) / 1 * 100}%, #18181b ${(uiScale - 0.5) / 1 * 100}%)`
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-4 text-[0.6875rem] font-mono font-bold text-zinc-600 uppercase">
                    <span>50%</span>
                    <span className="text-white">100%</span>
                    <span>150%</span>
                  </div>
                  
                  <button 
                    onClick={() => setUIScale(1)}
                    className="mt-8 w-full bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white py-3 transition-all duration-300 font-black uppercase text-[0.6875rem] tracking-widest rounded-xl"
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
                        type="button"
                        aria-pressed={settings.visualFidelity === level}
                        onClick={() => updateSettings({ visualFidelity: level })}
                        className={`py-3 px-2 rounded-xl text-[0.6875rem] font-black tracking-widest uppercase transition-all duration-300 border ${settings.visualFidelity === level ? 'bg-red-600/10 border-red-600 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/20 hover:text-white'}`}
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
        
        <div className="hidden md:flex items-center gap-6 border-l border-white/5 pl-8 h-8 ml-4">
           <div className="flex flex-col items-end">
              <span className="text-[0.6875rem] font-mono font-bold text-zinc-700 tracking-[0.4em] uppercase mb-0.5">CLOCK</span>
              <span className="font-mono font-black text-[0.75rem] text-white tracking-widest uppercase">UTC: {timeString}</span>
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
