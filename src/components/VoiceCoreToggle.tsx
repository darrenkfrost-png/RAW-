import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';
import MagneticWrapper from './MagneticWrapper';

export default function VoiceCoreToggle() {
  const { startListening, stopListening, isListening } = useVoiceControl();

  return (
    <div className="fixed bottom-16 left-10 z-[500]">
      <MagneticWrapper strength={0.5}>
        <motion.button
          onClick={() => isListening ? stopListening() : startListening()}
          className={`w-20 h-20 flex items-center justify-center rounded-full border transition-all ${
            isListening 
              ? 'bg-red-600 border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse' 
              : 'bg-editorial-bg/50 border-editorial-border-light hover:border-editorial-text/20 text-editorial-text hover:bg-editorial-bg/80'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isListening ? <MicOff size={28} className="animate-pulse" /> : <Mic size={28} />}
        </motion.button>
      </MagneticWrapper>
    </div>
  );
}
