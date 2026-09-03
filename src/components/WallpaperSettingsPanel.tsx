import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings2, Film, MonitorPlay } from 'lucide-react';
import { VIDEO_LIBRARY } from '../data/videoLibrary';
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

             {/* ── THE FILM BEHIND THE SITE ─────────────────────────────── */}
             <div className="pb-5 border-b border-editorial-border-light">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] uppercase text-editorial-text-muted tracking-widest flex items-center gap-2">
                    <Film className="w-3 h-3 text-red-600" /> VIDEO_WALLPAPER
                  </span>
                  <button
                    onClick={() => setSettings(prev => ({...prev, videoWallpaper: !prev.videoWallpaper}))}
                    aria-pressed={settings.videoWallpaper}
                    aria-label="Toggle video wallpaper"
                    className={`w-9 h-5 rounded-full transition-colors relative ${settings.videoWallpaper ? 'bg-red-600' : 'bg-zinc-800'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.videoWallpaper ? 'left-[1.15rem]' : 'left-0.5'}`} />
                  </button>
                </div>

                {settings.videoWallpaper && (
                  <>
                    <label className="font-mono text-[9px] uppercase text-editorial-text-muted mb-2 block tracking-widest">
                      OPACITY: {Math.round(settings.videoWallpaperOpacity * 100)}%
                    </label>
                    <input
                      type="range" min="0.05" max="1" step="0.01"
                      value={settings.videoWallpaperOpacity}
                      aria-label="Video wallpaper opacity"
                      onChange={e => setSettings(prev => ({...prev, videoWallpaperOpacity: parseFloat(e.target.value)}))}
                      className="w-full h-1 bg-editorial-text/10 rounded-lg appearance-none cursor-pointer accent-red-600 mb-4"
                    />
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[9px] uppercase text-editorial-text-muted tracking-widest">SHUFFLE_FILMS</span>
                      <button
                        onClick={() => setSettings(prev => ({...prev, videoWallpaperShuffle: !prev.videoWallpaperShuffle}))}
                        aria-pressed={settings.videoWallpaperShuffle}
                        aria-label="Shuffle the wallpaper film"
                        className={`w-9 h-5 rounded-full transition-colors relative ${settings.videoWallpaperShuffle ? 'bg-red-600' : 'bg-zinc-800'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.videoWallpaperShuffle ? 'left-[1.15rem]' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto pr-1 custom-scrollbar space-y-1.5">
                      {VIDEO_LIBRARY.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSettings(prev => ({...prev, videoWallpaperId: v.id}))}
                          className={`block w-full text-left px-3 py-2 rounded-lg border transition-all ${settings.videoWallpaperId === v.id ? 'border-red-600 bg-red-600/10 text-red-300' : 'border-editorial-border text-editorial-text-muted hover:border-zinc-700'}`}
                        >
                          <span className="font-mono text-[9px] uppercase tracking-wider">{v.label}</span>
                          {/* The heavy remote masters are marked, so choosing one
                              on a phone is a decision rather than a surprise. */}
                          {!v.light && (
                            <span className="ml-2 font-mono text-[8px] uppercase text-amber-500/70">
                              {v.megabytes ? `${v.megabytes}MB` : 'HD'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
             </div>

             {/* ── THE SCREENSAVER ──────────────────────────────────────── */}
             <div className="pb-5 border-b border-editorial-border-light">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] uppercase text-editorial-text-muted tracking-widest flex items-center gap-2">
                    <MonitorPlay className="w-3 h-3 text-red-600" /> SCREENSAVER
                  </span>
                  <button
                    onClick={() => setSettings(prev => ({...prev, screensaverEnabled: !prev.screensaverEnabled}))}
                    aria-pressed={settings.screensaverEnabled}
                    aria-label="Toggle screensaver"
                    className={`w-9 h-5 rounded-full transition-colors relative ${settings.screensaverEnabled ? 'bg-red-600' : 'bg-zinc-800'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.screensaverEnabled ? 'left-[1.15rem]' : 'left-0.5'}`} />
                  </button>
                </div>
                <label className="font-mono text-[9px] uppercase text-editorial-text-muted mb-2 block tracking-widest">
                  AFTER: {Math.round(settings.screensaverDelayMs / 1000)}s
                </label>
                <input
                  type="range" min="15" max="600" step="15"
                  value={Math.round(settings.screensaverDelayMs / 1000)}
                  aria-label="Screensaver idle delay in seconds"
                  onChange={e => setSettings(prev => ({...prev, screensaverDelayMs: parseInt(e.target.value, 10) * 1000}))}
                  className="w-full h-1 bg-editorial-text/10 rounded-lg appearance-none cursor-pointer accent-red-600 mb-3"
                />
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] uppercase text-editorial-text-muted tracking-widest">SHUFFLE_FILMS</span>
                  <button
                    onClick={() => setSettings(prev => ({...prev, screensaverShuffle: !prev.screensaverShuffle}))}
                    aria-pressed={settings.screensaverShuffle}
                    aria-label="Shuffle the screensaver film"
                    className={`w-9 h-5 rounded-full transition-colors relative ${settings.screensaverShuffle ? 'bg-red-600' : 'bg-zinc-800'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.screensaverShuffle ? 'left-[1.15rem]' : 'left-0.5'}`} />
                  </button>
                </div>
                <button
                  onClick={() => window.dispatchEvent(new Event('raw:screensaver'))}
                  className="w-full py-2.5 rounded-lg border border-red-600/40 bg-red-600/10 text-red-300 font-mono text-[9px] uppercase tracking-[0.25em] hover:bg-red-600/20 transition-colors"
                >
                  Start now
                </button>
             </div>

             <span className="font-mono text-[9px] uppercase text-editorial-text-muted tracking-widest block">GENERATIVE_ENV</span>
             <div className="h-40 overflow-y-auto pr-2 custom-scrollbar space-y-2">
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
