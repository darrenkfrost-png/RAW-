import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { Crosshair, Target, Shield, Zap } from "lucide-react";

interface TargetInfo {
  id: string;
  label: string;
  x: number;
  y: number;
  stat: string;
}

const targets: TargetInfo[] = [
  { id: "head", label: "NEURAL_IMPACT", x: 50, y: 15, stat: "98.2%_EFFICIENCY" },
  { id: "chest", label: "CORE_STABILITY", x: 50, y: 40, stat: "STABLE" },
  { id: "limbs", label: "PHASE_OUTPUT", x: 25, y: 60, stat: "OPTIMIZED" },
  { id: "reflex", label: "SYNAPTIC_LATENCY", x: 75, y: 55, stat: "1.2MS" }
];

export default function CombatTargetZone() {
  const [activeTarget, setActiveTarget] = useState<TargetInfo | null>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 10 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 10 });

  const rotateX = useTransform(springY, [-100, 100], [5, -5]);
  const rotateY = useTransform(springX, [-100, 100], [-5, 5]);

  return (
    <div className="w-full bg-editorial-bg border border-editorial-border p-16 relative overflow-hidden group rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.1)]">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-24 xl:gap-32 items-center">
        {/* Silhouette Visualization */}
        <div 
          className="relative aspect-[3/4] bg-editorial-bg border border-red-900/10 flex items-center justify-center overflow-hidden perspective-1000 rounded-[3rem] shadow-[inset_0_0_80px_rgba(0,0,0,0.1),0_20px_50px_rgba(220,38,38,0.05)] group/scanner"
          onMouseMove={(e) => {
             const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
             mouseX.set(e.clientX - left - width / 2);
             mouseY.set(e.clientY - top - height / 2);
          }}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
        >
          {/* Scanning Grid Backdrop */}
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(#dc2626_1px,transparent_1px),linear-gradient(90deg,#dc2626_1px,transparent_1px)] bg-[size:40px_40px] mix-blend-screen transition-opacity duration-1000 group-hover/scanner:opacity-[0.1]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50 mix-blend-screen pointer-events-none" />
          
          <motion.div 
            style={{ rotateX, rotateY }} 
            className="relative w-full h-full flex items-center justify-center py-20"
          >
             {/* Simple SVG Silhouette */}
             <svg viewBox="0 0 200 400" className="h-full w-auto opacity-20 filter grayscale invert drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-1000 group-hover/scanner:drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                <path d="M100 20 C120 20 130 30 130 50 C130 70 120 80 100 80 C80 80 70 70 70 50 C70 30 80 20 100 20 Z" fill="currentColor" />
                <path d="M70 85 L130 85 L145 150 L145 220 L120 400 L80 400 L55 220 L55 150 Z" fill="currentColor" />
             </svg>

             {/* Interactive Target Nodes */}
             {targets.map((target) => (
                <motion.button
                   key={target.id}
                   onMouseEnter={() => setActiveTarget(target)}
                   onMouseLeave={() => setActiveTarget(null)}
                   style={{ left: `${target.x}%`, top: `${target.y}%` }}
                   className="absolute group/node z-20"
                >
                   <div className="relative">
                      <motion.div
                        animate={{ scale: [1, 2, 1], opacity: [0.6, 0.1, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-red-600 rounded-full blur-[4px] mix-blend-screen"
                      />
                      <div className={`w-5 h-5 rounded-full border border-editorial-border-light transition-all duration-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-sm ${activeTarget?.id === target.id ? 'bg-red-600 border-red-400 scale-125 shadow-[0_0_20px_rgba(220,38,38,0.6)]' : 'bg-editorial-bg/90 hover:border-red-500/80 hover:bg-red-900/50 hover:scale-110'}`}>
                         <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${activeTarget?.id === target.id ? 'bg-editorial-text' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} />
                      </div>
                   </div>
                </motion.button>
             ))}
          </motion.div>

          <motion.div 
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent z-10 pointer-events-none drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] mix-blend-screen"
          />
        </div>



        {/* Diagnostic Panel */}
        <div className="space-y-16">
            <div>
              <div className="flex items-center gap-6 mb-10">
                 <div className="p-3 bg-red-600/10 rounded-xl border border-red-500/20 shadow-[0_5px_15px_rgba(220,38,38,0.2)]">
                   <Crosshair className="w-6 h-6 text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                 </div>
                 <span className="font-mono text-[12px] text-editorial-text-muted tracking-[0.5em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] font-bold">Combat_Efficiency_Model</span>
              </div>
              <h2 className="font-sans font-black text-6xl md:text-8xl xl:text-[100px] uppercase tracking-[-0.03em] leading-[0.8] mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">TARGET <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">ACQUISITION</span></h2>
              <p className="text-xl xl:text-2xl text-editorial-text-muted font-light leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-l-2 border-red-600 pl-6 bg-gradient-to-r from-red-900/10 to-transparent py-2">
                 Our combat protocols prioritize biomechanical alignment and kinetic energy preservation. Every movement is optimized for speed and structural integrity.
              </p>
            </div>

            <div className="bg-editorial-bg/80 border border-editorial-border p-16 min-h-[300px] flex flex-col justify-center relative rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl transition-all duration-[1000ms] hover:border-red-500/30 hover:shadow-[0_30px_80px_rgba(220,38,38,0.15)] overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-red-900/5 to-transparent mix-blend-screen pointer-events-none" />
               <AnimatePresence mode="wait">
                  {activeTarget ? (
                    <motion.div
                      key={activeTarget.id}
                      initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                      transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
                      className="space-y-10 relative z-10"
                    >
                       <div className="flex justify-between items-end border-b border-editorial-border-light pb-6">
                          <span className="font-mono text-[14px] text-red-500 font-black tracking-[0.4em] drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] flex items-center gap-4">
                             <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_currentColor]" /> {activeTarget.label}
                          </span>
                          <span className="font-mono text-[11px] text-editorial-text-muted tracking-[0.2em] bg-editorial-text/5 px-4 py-2 rounded-lg">REF_{activeTarget.id.toUpperCase()}</span>
                       </div>
                       <div className="font-sans font-black text-6xl md:text-7xl italic text-editorial-text tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.1)] relative">
                           {activeTarget.stat}
                           <div className="absolute -inset-4 bg-red-600/10 blur-[30px] -z-10 mix-blend-screen" />
                       </div>
                       <div className="flex gap-8 pt-4">
                          <div className="flex items-center gap-4 bg-editorial-bg p-4 rounded-xl border border-editorial-border shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)]">
                             <Shield className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_currentColor]" />
                             <span className="font-mono text-[11px] text-emerald-500 tracking-[0.2em] font-bold">STABILITY_LOCKED</span>
                          </div>
                          <div className="flex items-center gap-4 bg-editorial-bg p-4 rounded-xl border border-editorial-border shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)]">
                             <Zap className="w-5 h-5 text-red-600 drop-shadow-[0_0_8px_currentColor]" />
                             <span className="font-mono text-[11px] text-red-600 tracking-[0.2em] font-bold">ENERGY_MAX</span>
                          </div>
                       </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center text-center space-y-8 relative z-10"
                    >
                       <div className="relative">
                          <motion.div 
                             animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                             className="absolute inset-0 bg-red-600 rounded-full blur-[20px]"
                          />
                          <Target className="w-20 h-20 text-zinc-800 drop-shadow-[0_0_20px_rgba(0,0,0,0.1)] relative z-10" />
                       </div>
                       <span className="font-mono text-[12px] text-zinc-600 tracking-[0.5em] uppercase font-bold">Awaiting_Target_Lock...</span>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-12 border-t border-editorial-border pt-12">
               <div className="space-y-5 bg-editorial-bg/40 p-6 rounded-2xl border border-editorial-border">
                  <span className="text-[12px] font-black uppercase text-editorial-text-muted tracking-[0.4em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] block">Active Protocol</span>
                  <div className="text-lg xl:text-xl text-editorial-text tracking-[0.3em] font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] flex items-center gap-3">
                     <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" /> STRIKE_SYNC_V4
                  </div>
               </div>
               <div className="space-y-5 bg-editorial-bg/40 p-6 rounded-2xl border border-editorial-border">
                  <span className="text-[12px] font-black uppercase text-editorial-text-muted tracking-[0.4em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] block">System Status</span>
                  <div className="text-lg xl:text-xl text-red-500 tracking-[0.3em] font-black italic drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] flex items-center gap-3">
                     <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]" /> PRODUCTION_READY
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
