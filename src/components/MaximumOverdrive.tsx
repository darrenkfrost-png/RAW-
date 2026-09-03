import { useEffect, useRef } from 'react';
import { useUI } from '../context/UIContext';
import { motion, AnimatePresence } from 'motion/react';
import { AlertOctagon } from 'lucide-react';

export default function MaximumOverdrive() {
  const { is110Percent, setIs110Percent } = useUI();
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!is110Percent) {
      if (audioCtxRef.current) {
         audioCtxRef.current.close();
         audioCtxRef.current = null;
      }
      return;
    }

    const startAudio = () => {
       const ctx = new window.AudioContext();
       audioCtxRef.current = ctx;

       const osc = ctx.createOscillator();
       osc.type = 'sawtooth';
       osc.frequency.setValueAtTime(55, ctx.currentTime);
       osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);

       const gainNode = ctx.createGain();
       gainNode.gain.setValueAtTime(0, ctx.currentTime);
       gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
       gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

       osc.connect(gainNode);
       gainNode.connect(ctx.destination);
       osc.start();
       osc.stop(ctx.currentTime + 1.5);

       // Siren noise
       setInterval(() => {
          if (!audioCtxRef.current) return;
          const siren = ctx.createOscillator();
          siren.type = 'square';
          siren.frequency.setValueAtTime(400, ctx.currentTime);
          siren.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.5);
          siren.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1);

          const sirenGain = ctx.createGain();
          sirenGain.gain.setValueAtTime(0.05, ctx.currentTime);
          
          siren.connect(sirenGain);
          sirenGain.connect(ctx.destination);
          siren.start();
          siren.stop(ctx.currentTime + 1);
       }, 1000);
    };

    startAudio();

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [is110Percent]);

  return (
    <AnimatePresence>
      {is110Percent && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[9999] pointer-events-none mix-blend-color-dodge flex items-center justify-center"
        >
           <div className="absolute inset-0 bg-red-600/20 animate-pulse" />
           <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" 
           />
           <div className="absolute inset-0 scanline-overlay opacity-100" />
           
           <motion.div 
             animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
             transition={{ repeat: Infinity, duration: 0.5 }}
             className="relative z-10 flex flex-col items-center gap-4 text-red-500 glitch drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]"
             data-text="110% PROTOCOL ACTIVE"
           >
             <AlertOctagon className="w-32 h-32" />
             <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mix-blend-screen text-center">
               110% PROTOCOL<br />ACTIVE
             </h1>
           </motion.div>

           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
              <button 
                onClick={() => setIs110Percent(false)}
                className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-editorial-text hover:text-editorial-bg transition-colors glitch"
                data-text="DISENGAGE"
              >
                 DISENGAGE
              </button>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
