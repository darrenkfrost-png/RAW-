import { motion, AnimatePresence } from 'motion/react';
import { X, Settings as SettingsIcon, AlertTriangle, Monitor, Eye, RotateCcw } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useSettings } from '../context/SettingsContext';
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
      voiceRate: 1,
      voicePitch: 1,
      visualFidelity: 'balanced',
      motionIntensity: 'standard',
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
                aria-label="Close settings"
                className="text-editorial-text-muted hover:text-editorial-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-10">
              {/* Visual Fidelity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-editorial-text">
                    <Eye className="w-4 h-4 text-red-500" />
                    <h3 className="font-mono text-xs uppercase tracking-widest">Visual_Fidelity</h3>
                  </div>
                  <span className="text-[0.6875rem] font-mono text-editorial-text-muted uppercase">{settings.visualFidelity}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {(['low', 'balanced', 'high', 'overdrive'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => updateSettings({ visualFidelity: level })}
                      className={`py-3 px-4 rounded-lg font-mono text-xs uppercase transition-all duration-300 border hover:scale-[1.02] active:scale-[0.98] ${settings.visualFidelity === level ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-editorial-surface border-editorial-border text-editorial-text-muted hover:border-editorial-border-light hover:text-editorial-text'}`}
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
                          <p className="text-orange-400/80 text-[0.6875rem] leading-relaxed">
                            High visual fidelity may increase GPU load on lower-powered devices.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Motion Intensity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-editorial-text">
                    <Monitor className="w-4 h-4 text-red-500" />
                    <h3 className="font-mono text-xs uppercase tracking-widest">Motion_Intensity</h3>
                  </div>
                  <span className="text-[0.6875rem] font-mono text-editorial-text-muted uppercase">{settings.motionIntensity}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {(['reduced', 'standard', 'enhanced'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => updateSettings({ motionIntensity: level })}
                      className={`py-3 px-2 rounded-lg font-mono text-[0.6875rem] uppercase transition-all duration-300 border hover:scale-[1.02] active:scale-[0.98] ${settings.motionIntensity === level ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-editorial-surface border-editorial-border text-editorial-text-muted hover:border-editorial-border-light hover:text-editorial-text'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-editorial-text-muted text-[0.6875rem] leading-relaxed">
                  Control the intensity of parallax, transitions, and interface animation energy.
                </p>
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
