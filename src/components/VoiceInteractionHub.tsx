import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Sparkles, X, Loader2, Volume2, ChevronDown } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useSettings } from '../context/SettingsContext';
import MagneticWrapper from './MagneticWrapper';

export default function VoiceInteractionHub() {
  const { isAIChatOpen, setIsAIChatOpen, isVoiceCommandActive, setIsVoiceCommandActive, chromeHidden, toggleChrome } = useUI();
  const hidden = chromeHidden.includes('voiceHub');
  const { startListening, stopListening, isListening, transcript, aiResponse, error, speak, voiceState, audioLevel, voiceMode } = useVoiceControl();
  const { settings } = useSettings();

  const isMicActive = voiceState !== 'idle' && voiceState !== 'error';
  const isExpanded = (isMicActive || transcript || aiResponse) && voiceMode === 'command';

  /* Minimised: dropped below the bottom edge rather than unmounted. The voice
     engine keeps its state, so putting the panel away mid-dictation does not
     abandon what was being said — it only stops taking up the middle of the
     screen. */
  return (
    <div 
      className={`fixed left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center pointer-events-none transition-all duration-700 ${voiceState === 'listening' ? 'scale-105' : 'scale-100'} ${hidden ? 'translate-y-[200%] opacity-0' : ''}`}
      aria-hidden={hidden || undefined}
      style={{ bottom: 'calc(1.5rem + 2.75rem + env(safe-area-inset-bottom))' }}
    >
      {/* Put it away. The RAW mark bottom-left brings it back. */}
      {!hidden && (
        <button
          onClick={() => toggleChrome('voiceHub')}
          aria-label="Minimise the voice panel"
          title="Minimise voice panel"
          className="pointer-events-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/50 backdrop-blur-md transition-colors hover:border-red-500/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}
      
      {/* Expanded State / Visualizer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 pointer-events-auto flex flex-col items-center w-[300px] sm:w-[400px]"
          >
            <div className={`w-full overflow-hidden rounded-[2rem] border bg-black/80 backdrop-blur-xl shadow-2xl p-6 flex flex-col items-center gap-4 ${
                error || voiceState === 'error' ? 'border-red-900/50 shadow-[0_0_40px_rgba(220,38,38,0.2)]' :
                voiceState === 'processing' ? 'border-amber-900/30 shadow-[0_0_40px_rgba(245,158,11,0.1)]' :
                voiceState === 'speaking' ? 'border-teal-900/30 shadow-[0_0_40px_rgba(20,184,166,0.1)]' :
                'border-red-900/30'
            }`}>
              
               <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${
                        voiceState === 'listening' ? 'bg-red-500 animate-pulse' : 
                        voiceState === 'processing' ? 'bg-amber-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]' : 
                        voiceState === 'speaking' ? 'bg-teal-500 animate-pulse' : 
                        voiceState === 'error' ? 'bg-red-600' : 
                        'bg-zinc-600'
                     }`} />
                     <span className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em]">
                         {error ? 'SYSTEM_ERROR' : voiceState.toUpperCase()}
                     </span>
                  </div>
                  {settings.voiceContinuous && voiceState !== 'error' && (
                     <div className="text-[9px] px-2 py-0.5 rounded-full bg-red-950/50 text-red-400 border border-red-900/50 uppercase tracking-wider font-bold">
                       Continuous
                     </div>
                  )}
               </div>

                {/* Dynamic Visualizer based on Audio Level */}
                <div className="h-20 w-full flex items-center justify-center gap-1.5 my-4 px-2">
                   {voiceState === 'listening' ? (
                        // Reactive visualizer
                        Array.from({ length: 32 }).map((_, i) => {
                           // Create a symmetrical wave pattern
                           const centerDist = Math.abs(15.5 - i) / 15.5;
                           const heightFactor = Math.max(0.15, 1 - centerDist);
                           const noise = Math.random() * 0.15;
                           // audioLevel drives the scale aggressively
                           const scaleY = Math.max(0.1, (audioLevel * 4 + noise) * heightFactor);
                           return (
                               <motion.div 
                                  key={i} 
                                  className="w-1.5 bg-gradient-to-t from-red-600 via-red-500 to-red-400 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                                  animate={{ scaleY: Math.max(0.1, scaleY * 6) }} 
                                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                  style={{ height: '100%', transformOrigin: 'center' }}
                               />
                           )
                        })
                   ) : voiceState === 'speaking' ? (
                        // Artificial visualizer for speaking
                        Array.from({ length: 32 }).map((_, i) => (
                           <motion.div 
                             key={i} 
                             className="w-1.5 bg-gradient-to-t from-teal-600 via-teal-400 to-teal-300 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                             style={{ height: '100%', transformOrigin: 'center' }}
                             animate={{ scaleY: [0.2, Math.random() * 0.9 + 0.1, 0.2] }}
                             transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut" }}
                           />
                        ))
                   ) : voiceState === 'processing' ? (
                        <div className="relative flex items-center justify-center">
                           <motion.div 
                             animate={{ rotate: 360 }}
                             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                             className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full"
                           />
                           <Loader2 className="w-6 h-6 text-amber-500 animate-spin absolute" />
                        </div>
                   ) : (
                       // Idle flat line
                       <div className="w-full h-[2px] bg-white/10 rounded-full" />
                  )}
               </div>

               {/* Transcript Area */}
               <div className="w-full text-left max-h-[40vh] overflow-y-auto custom-scrollbar p-2 space-y-4 pr-3">
                  {transcript && (
                      <motion.div 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-inner"
                      >
                          <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mb-2 block">Command_Telemetry_In</span>
                          <p className="text-sm md:text-base font-medium text-white/90 leading-relaxed font-sans tracking-tight">
                              {transcript}
                          </p>
                      </motion.div>
                  )}
                  {aiResponse && (
                      <motion.div 
                         initial={{ opacity: 0, x: 10 }}
                         animate={{ opacity: 1, x: 0 }}
                         className="bg-red-600/10 rounded-2xl p-5 border border-red-500/20 relative group shadow-depth-inset"
                      >
                          <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-3 bg-red-600" />
                                 <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] text-meta-premium">Neural_Core_Out</span>
                              </div>
                              <MagneticWrapper strength={0.2}>
                                <button 
                                    type="button"
                                    onClick={() => speak(aiResponse)}
                                    className={`p-2 rounded-xl transition-all duration-500 flex items-center gap-2 group/speaker ${voiceState === 'speaking' ? 'bg-red-600 text-white shadow-[0_0_15px_#dc2626]' : 'text-red-500/70 hover:text-red-400 group-hover:bg-red-500/10'}`}
                                    title="Neural Synthesis"
                                >
                                    <Volume2 className={`w-5 h-5 ${voiceState === 'speaking' ? 'animate-pulse' : ''}`} />
                                    <span className="text-[9px] font-black uppercase tracking-widest hidden group-hover/speaker:inline-block">Read Aloud</span>
                                </button>
                              </MagneticWrapper>
                          </div>
                          <div className="relative">
                            <p className="text-sm md:text-base font-medium text-white/90 leading-relaxed font-sans tracking-tight whitespace-pre-wrap max-h-[30vh] overflow-y-auto custom-scrollbar pr-2 py-1">
                                {aiResponse}
                            </p>
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-red-600/5 to-transparent pointer-events-none" />
                          </div>
                      </motion.div>
                  )}
                  {!transcript && !aiResponse && (
                      <div className="py-10 text-center space-y-4">
                         <p className="text-sm md:text-base font-medium text-white/30 uppercase tracking-[0.3em] font-mono animate-pulse">
                             {voiceState === 'listening' ? "Link_Active_Awaiting_Freq..." : "Neutral_Interaction_Standby"}
                         </p>
                      </div>
                  )}
                  {error && (
                     <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl flex items-center gap-3">
                        <div className="w-1 h-8 bg-red-600" />
                        <p className="text-red-400 text-[11px] font-mono font-bold tracking-widest uppercase">{error}</p>
                     </div>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pill Controls */}
      <div className="pointer-events-auto flex items-center justify-center gap-2 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl relative">
        <MagneticWrapper strength={0.2}>
          <motion.button
            onClick={() => {
              if (isMicActive) {
                stopListening();
                setIsVoiceCommandActive(false);
              } else {
                startListening('command');
                setIsVoiceCommandActive(true);
              }
            }}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
              isMicActive 
                ? 'bg-red-600 border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                : 'bg-white/5 border border-white/5 hover:border-white/20 text-white/70 hover:text-white hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isMicActive ? "Stop Voice Input" : "Start Voice Input"}
          >
            {isMicActive ? <MicOff size={20} className="text-white" /> : <Mic size={20} />}
          </motion.button>
        </MagneticWrapper>

        {isExpanded && (
            <motion.button
               initial={{ width: 0, opacity: 0 }}
               animate={{ width: 'auto', opacity: 1 }}
               exit={{ width: 0, opacity: 0 }}
               onClick={() => setIsVoiceCommandActive(false)}
               aria-label="Stop completely"
               className="h-12 px-4 rounded-full bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-white/50 text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap overflow-hidden transition-colors"
            >
               <X className="w-3 h-3" /> Stop
            </motion.button>
        )}

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        <MagneticWrapper strength={0.2}>
          <motion.button
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle AI Advisor"
          >
             <Sparkles className={`w-5 h-5 ${isAIChatOpen ? 'text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]' : ''}`} />
          </motion.button>
        </MagneticWrapper>
      </div>
    </div>
  );
}
