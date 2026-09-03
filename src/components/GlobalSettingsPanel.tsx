import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings as SettingsIcon, AlertTriangle, Monitor, Activity, Eye, Zap, Mic, RotateCcw } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useSettings, allAITones } from '../context/SettingsContext';
import { useToast } from './common/Toast';

const GlobalSettingsPanel = () => {
  const { isGlobalSettingsOpen, setIsGlobalSettingsOpen } = useUI();
  const { settings, updateSettings } = useSettings();
  const { addToast } = useToast();

  const handleResetToBaseline = () => {
    updateSettings({
      activeWallpaper: 'polyrhythm',
      wallpaperColor: '#dc2626',
      wallpaperSpeed: 1,
      wallpaperBrightness: 1,
      aiVoiceTone: 'technical',
      voiceRate: 1,
      voicePitch: 1,
      voiceContinuous: false,
      visualFidelity: 'balanced',
      realtimeDiagnostics: true,
      motionIntensity: 'standard',
      uiStabilityFeedback: true,
    });
    addToast("SYSTEM render profile restored to default baselines", "success");
  };

  return (
    <AnimatePresence>
      {isGlobalSettingsOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex justify-end"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-editorial-bg/60 backdrop-blur-sm"
            onClick={() => setIsGlobalSettingsOpen(false)}
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-editorial-bg border-l border-editorial-border-light h-full overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-editorial-bg/90 backdrop-blur-md border-b border-editorial-border-light p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-editorial-text-muted" />
                <h2 className="text-editorial-text font-mono text-sm tracking-widest uppercase">System_Render_Profile</h2>
              </div>
              <button 
                onClick={() => setIsGlobalSettingsOpen(false)}
                className="text-editorial-text-muted hover:text-editorial-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-10">
              {/* AI Voice Tone */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-editorial-text">
                    <Mic className="w-4 h-4 text-red-500" />
                    <h3 className="font-mono text-xs uppercase tracking-widest">AI_Voice_Tone</h3>
                  </div>
                  <span className="text-[10px] font-mono text-editorial-text-muted uppercase">{settings.aiVoiceTone}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {allAITones.map(tone => (
                    <button
                      key={tone}
                      onClick={() => updateSettings({ aiVoiceTone: tone })}
                      className={`py-3 px-4 rounded-lg font-mono text-[10px] uppercase transition-all duration-300 border hover:scale-[1.02] active:scale-[0.98] ${settings.aiVoiceTone === tone ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-editorial-surface border-editorial-border text-white-muted hover:border-editorial-border-light hover:text-editorial-text'}`}
                    >
                      {tone.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Fidelity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-editorial-text">
                    <Eye className="w-4 h-4 text-red-500" />
                    <h3 className="font-mono text-xs uppercase tracking-widest">Visual_Fidelity</h3>
                  </div>
                  <span className="text-[10px] font-mono text-editorial-text-muted uppercase">{settings.visualFidelity}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {(['low', 'balanced', 'high', 'overdrive'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => updateSettings({ visualFidelity: level })}
                      className={`py-3 px-4 rounded-lg font-mono text-xs uppercase transition-all duration-300 border hover:scale-[1.02] active:scale-[0.98] ${settings.visualFidelity === level ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-editorial-surface border-editorial-border text-white-muted hover:border-editorial-border-light hover:text-editorial-text'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {settings.visualFidelity === 'overdrive' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 bg-orange-900/20 border border-orange-500/30 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-orange-500 font-black text-xs uppercase tracking-wider mb-1">Overdrive_Mode_Active</p>
                          <p className="text-orange-400/80 text-[10px] leading-relaxed">
                            High visual fidelity may increase GPU load on lower-powered devices.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Realtime Diagnostics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-editorial-text">
                    <Activity className="w-4 h-4 text-red-500" />
                    <h3 className="font-mono text-xs uppercase tracking-widest">Realtime_Diagnostics</h3>
                  </div>
                  <button 
                    onClick={() => updateSettings({ realtimeDiagnostics: !settings.realtimeDiagnostics })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.realtimeDiagnostics ? 'bg-red-600' : 'bg-zinc-800'}`}
                  >
                    <motion.div 
                      className="absolute top-1 bottom-1 w-4 bg-editorial-text rounded-full bg-editorial-text shadow-sm"
                      animate={{ left: settings.realtimeDiagnostics ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                    />
                  </button>
                </div>
                <p className="text-editorial-text-muted text-[11px] leading-relaxed">
                  Show optional HUD overlays and system health modules over main content.
                </p>
              </div>

              {/* Motion Intensity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-editorial-text">
                    <Monitor className="w-4 h-4 text-red-500" />
                    <h3 className="font-mono text-xs uppercase tracking-widest">Motion_Intensity</h3>
                  </div>
                  <span className="text-[10px] font-mono text-editorial-text-muted uppercase">{settings.motionIntensity}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {(['reduced', 'standard', 'enhanced'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => updateSettings({ motionIntensity: level })}
                      className={`py-3 px-2 rounded-lg font-mono text-[10px] uppercase transition-all duration-300 border hover:scale-[1.02] active:scale-[0.98] ${settings.motionIntensity === level ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-editorial-surface border-editorial-border text-white-muted hover:border-editorial-border-light hover:text-editorial-text'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-editorial-text-muted text-[11px] leading-relaxed">
                  Control the intensity of parallax, transitions, and interface animation energy.
                </p>
              </div>

              {/* UI Stability Feedback */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-editorial-text">
                    <Zap className="w-4 h-4 text-red-500" />
                    <h3 className="font-mono text-xs uppercase tracking-widest">UI_Stability_Feedback</h3>
                  </div>
                  <button 
                    onClick={() => updateSettings({ uiStabilityFeedback: !settings.uiStabilityFeedback })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.uiStabilityFeedback ? 'bg-red-600' : 'bg-zinc-800'}`}
                  >
                    <motion.div 
                      className="absolute top-1 bottom-1 w-4 bg-editorial-text rounded-full bg-editorial-text shadow-sm"
                      animate={{ left: settings.uiStabilityFeedback ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                    />
                  </button>
                </div>
                <p className="text-editorial-text-muted text-[11px] leading-relaxed">
                  Show small system health indicators such as FPS_OPTIMAL, SYNC_STAT, and SYSTEM_HEALTHY across the interface.
                </p>

                {/* Example preview block */}
                <AnimatePresence>
                  {settings.uiStabilityFeedback && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 flex flex-wrap gap-2"
                    >
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-mono tracking-widest rounded uppercase">FPS_OPTIMAL</span>
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-mono tracking-widest rounded uppercase">SYNC_STAT</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reset to Baseline */}
              <div className="pt-6 border-t border-editorial-border-light">
                <button
                  onClick={handleResetToBaseline}
                  className="w-full py-3.5 px-4 rounded-xl font-mono text-xs uppercase transition-all duration-300 border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0 text-red-500" />
                  Restore System Baselines
                </button>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSettingsPanel;
