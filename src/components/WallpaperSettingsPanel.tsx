import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useUI } from '../context/UIContext';

export default function WallpaperSettingsPanel() {
  const { settings, setSettings } = useSettings();
  const { isWallpaperSettingsOpen, setIsWallpaperSettingsOpen } = useUI(); // Need to add isWallpaperSettingsOpen to UIContext

  const wallpapers = ['crystal_cascade', 'living_shell', 'polyrhythm', 'network', 'waves', 'matrix', 'grid', 'rain', 'dna', 'circuit', 'aurora', 'performance_focus'];

  return (
    <AnimatePresence>
      {isWallpaperSettingsOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed bottom-24 left-10 z-[100] w-[300px] crystal-glass-panel layered-shadows-premium p-6"
        >
          <div className="absolute inset-0 z-0 pointer-events-none neural-grid-overlay" />
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="font-black tracking-widest text-sm text-editorial-text flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-red-600" />
                VIRTUAL_ENV
            </h2>
            <button onClick={() => setIsWallpaperSettingsOpen(false)}><X className="w-5 h-5 text-editorial-text-muted" /></button>
          </div>
          
          <div className="space-y-4 relative z-10">
             <div className="h-64 overflow-y-auto pr-2 custom-scrollbar space-y-2">
               {wallpapers.map(w => (
                   <button 
                      key={w}
                      onClick={() => setSettings(prev => ({...prev, activeWallpaper: w}))}
                      className={`block w-full text-left p-3 rounded-xl border ${settings.activeWallpaper === w ? 'border-red-600 bg-red-600/10' : 'border-editorial-border bg-editorial-surface/30 hover:border-zinc-700 hover:bg-editorial-surface/80 transition-all duration-300'}`}
                   >
                      <span className="font-mono text-[10px] uppercase">{w.replace(/_/g, ' ')}</span>
                   </button>
               ))}
             </div>
             
             <div className="mt-6 pt-6 border-t border-editorial-border-light">
                <label className="font-mono text-[9px] uppercase text-editorial-text-muted mb-2 block tracking-widest">
                  ANIMATION_SPEED: {settings.wallpaperSpeed.toFixed(1)}x
                </label>
                <input 
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={settings.wallpaperSpeed}
                  onChange={e => setSettings(prev => ({...prev, wallpaperSpeed: parseFloat(e.target.value)}))}
                  className="w-full h-1 bg-editorial-text/10 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
