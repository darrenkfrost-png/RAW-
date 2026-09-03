import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Activity } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useVoiceControl } from '../hooks/useVoiceControl';
import MagneticWrapper from './MagneticWrapper';

export default function NeuralToggle() {
  const { isAIChatOpen, setIsAIChatOpen } = useUI();
  const { startListening, stopListening, isListening } = useVoiceControl();

  return (
    <div className="fixed bottom-16 right-10 z-[500]">
      <MagneticWrapper strength={0.5}>
        <motion.button
          onClick={() => { 
            const willOpen = !isAIChatOpen;
            setIsAIChatOpen(willOpen);
            if (willOpen) {
              startListening();
            } else {
              stopListening();
            }
          }}
          className="relative w-20 h-20 flex items-center justify-center group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* External Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-red-600/30 rounded-full"
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_#dc2626]" />
          </motion.div>
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border border-editorial-border-light rounded-full border-dashed"
          />
          <motion.div 
            animate={{ rotate: 180 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border border-red-900/20 rounded-full"
          >
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full opacity-50" />
          </motion.div>
          
          {/* Main Core */}
          <div className="absolute inset-6 bg-editorial-bg border border-editorial-border-light rounded-full shadow-[0_0_40px_rgba(220,38,38,0.3)] group-hover:shadow-[0_0_60px_rgba(220,38,38,0.7)] transition-all duration-500 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-red-900/10" />
            
            {/* Neural Pulse Inner */}
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-red-600/30 blur-2xl"
            />
            
            {/* Binary Stream Overlay (Visual) */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none font-mono text-[6px] text-red-500 flex flex-wrap gap-1 leading-none p-2 animate-pulse">
               {Array.from({ length: 20 }).map((_, i) => <span key={i}>{Math.random() > 0.5 ? '1' : '0'}</span>)}
            </div>
          </div>

          {/* Icon / Glyph */}
          <div className="relative z-10 text-editorial-text group-hover:text-red-500 transition-all duration-500 transform group-hover:scale-110">
            {isAIChatOpen ? (
               <Activity className="w-8 h-8 animate-pulse text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
            ) : (
               <div className="relative">
                  <Sparkles className="w-8 h-8 drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]" />
                  <motion.div 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_#dc2626]"
                  />
               </div>
            )}
          </div>
          
          {/* Scanning Line overlay */}
          <motion.div 
            animate={{ y: [-48, 48] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-6 right-6 h-[2px] bg-red-500/60 blur-[1px] z-20 pointer-events-none shadow-[0_0_10px_#dc2626]"
          />

          {/* Label (Desktop only) */}
          <div className="absolute right-full mr-6 top-1/2 -translate-y-1/2 hidden md:block">
            <AnimatePresence>
              {!isAIChatOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-editorial-bg/80 backdrop-blur-md border border-editorial-border px-4 py-2 rounded-lg whitespace-nowrap"
                >
                  <span className="text-[9px] font-black tracking-[0.4em] text-editorial-text-muted uppercase">
                    INITIALIZE_ <span className="text-editorial-text">NEURAL_SYNC</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </MagneticWrapper>
    </div>
  );
}
