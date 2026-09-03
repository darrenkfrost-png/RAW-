import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { useUI } from "../context/UIContext";
import { allProducts } from "../data/products";

const PRODUCT_IMAGES = allProducts.map(p => p.image);

export default function IntroScreen() {
  const { hasCompletedIntro, setIntroCompleted } = useUI();
  const [ready, setReady] = useState(false);
  const [introPhase, setIntroPhase] = useState(0);

  useEffect(() => {
    if (hasCompletedIntro) return;

    const phase1 = setTimeout(() => setIntroPhase(1), 1000);
    const phase2 = setTimeout(() => setIntroPhase(2), 2500);
    const timer = setTimeout(() => {
      setReady(true);
    }, 4500); 

    return () => {
      clearTimeout(phase1);
      clearTimeout(phase2);
      clearTimeout(timer);
    };
  }, [hasCompletedIntro]);

  if (hasCompletedIntro) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black opacity-80" />
      
      {/* Neural Grid Grid */}
      <motion.div 
        animate={{ 
          backgroundPosition: ["0px 0px", "0px 100px"],
          opacity: [0, 0.15, 0.15]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* Cinematic Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 mix-blend-screen">
          <motion.div 
            animate={{
              y: ["100vh", "-100vh"],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            className="absolute left-1/4 w-[1px] h-32 bg-gradient-to-t from-transparent via-red-500 to-transparent shadow-[0_0_10px_#ef4444]"
          />
          <motion.div 
            animate={{
              y: ["100vh", "-100vh"],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity, delay: 2 }}
            className="absolute right-1/4 w-[1px] h-48 bg-gradient-to-t from-transparent via-red-500 to-transparent shadow-[0_0_10px_#ef4444]"
          />
      </div>

      {/* Product Image Subliminal Flashes */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 mix-blend-screen pointer-events-none filter blur-sm">
        {introPhase === 1 && (
           <motion.img 
             initial={{ scale: 1.5, opacity: 0 }}
             animate={{ scale: 1, opacity: [0, 0.8, 0] }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             src={PRODUCT_IMAGES[0]}
             className="w-1/2 h-1/2 object-contain"
           />
        )}
        {introPhase === 2 && (
           <motion.img 
             initial={{ scale: 1.5, opacity: 0 }}
             animate={{ scale: 1, opacity: [0, 0.8, 0] }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             src={PRODUCT_IMAGES[1]}
             className="w-1/2 h-1/2 object-contain"
           />
        )}
      </div>

      {/* Brand & Interaction */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <motion.div 
            initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)", y: 20 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 relative group"
        >
            <div className="absolute inset-0 bg-red-600/30 blur-[60px] animate-pulse pointer-events-none mix-blend-screen" />
            <img src="/brand/raw-logo-red.png" alt="RAW Official" className="relative h-24 md:h-36 object-contain filter drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]" />
            
            {/* Horizontal Light Sweep */}
            <motion.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
              className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-30deg] pointer-events-none mix-blend-overlay"
            />
        </motion.div>

        <AnimatePresence mode="wait">
            {ready ? (
                <motion.button 
                    key="begin-button"
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
                    whileHover={{ scale: 1.05, letterSpacing: "0.6em" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIntroCompleted(true)}
                    className="px-14 py-6 bg-white text-black font-black uppercase tracking-[0.5em] text-[10px] md:text-xs rounded-full shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)] transition-all duration-500 overflow-hidden relative group"
                >
                    <span className="relative z-10">INITIALIZE_SYSTEM</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 z-20 font-black tracking-[0.5em] transition-opacity duration-300">
                      INITIALIZE_SYSTEM
                    </span>
                </motion.button>
            ) : (
                <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full space-y-4 px-6 relative"
                >
                    <div className="font-mono text-zinc-500 text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-center mb-6 flex items-center justify-center gap-3">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                        {introPhase === 0 ? "CONNECTING_TO_CORE..." : introPhase === 1 ? "ANALYZING_BIOMETRICS..." : "LOADING_ENVIRONMENT..."}
                    </div>
                    <div className="h-[1px] w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 4.5, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-red-800 via-red-500 to-red-400 shadow-[0_0_20px_#dc2626]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        
        {/* Skip intro button */}
        {!ready && (
           <button 
             onClick={() => setIntroCompleted(true)}
             className="absolute -bottom-24 font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors"
           >
             [ SKIP_SEQUENCE ]
           </button>
        )}
      </div>
    </div>
  );
}
