import { motion } from 'motion/react';

export default function VoiceFeedbackOverlay({ isListening }: { isListening: boolean }) {
  if (!isListening) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] pointer-events-none flex items-center justify-center bg-editorial-bg/40 backdrop-blur-sm"
    >
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-64 h-64 rounded-full bg-red-600/30 flex items-center justify-center shadow-[0_0_100px_rgba(220,38,38,0.5)]"
        >
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-32 h-32 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.8)]"
            >
                <span className="text-editorial-text font-mono text-sm tracking-widest uppercase">LISTENING</span>
            </motion.div>
        </motion.div>
    </motion.div>
  );
};
