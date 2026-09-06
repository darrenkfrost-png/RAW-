import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { Crosshair, Target } from "lucide-react";
import { machineText } from "../lib/machineText";

interface TargetInfo {
  id: string;
  label: string;
  x: number;
  y: number;
  stat: string;
}

const targets: TargetInfo[] = [
  { id: "head", label: "HEAD", x: 50, y: 15, stat: "GUARD_&_STRIKE" },
  { id: "chest", label: "CORE", x: 50, y: 40, stat: "BRACE_&_ROTATE" },
  { id: "limbs", label: "LIMBS", x: 25, y: 60, stat: "DRIVE_&_EXTEND" },
  { id: "reflex", label: "REFLEX", x: 75, y: 55, stat: "SEE_&_REACT" }
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
    <div className="w-full bg-editorial-bg border border-editorial-border p-6 sm:p-10 lg:p-16 relative overflow-hidden group rounded-[2rem] sm:rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.1)]">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-24 xl:gap-32 items-center">
        {/* Silhouette Visualization */}
        <div 
          className="relative min-w-0 aspect-[3/4] bg-editorial-bg border border-red-900/10 flex items-center justify-center overflow-hidden perspective-[1000px] rounded-[3rem] shadow-[inset_0_0_80px_rgba(0,0,0,0.1),0_20px_50px_rgba(220,38,38,0.05)] group/scanner"
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
          {/* Grid backdrop */}
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
                   onClick={() => setActiveTarget(target)}
                   aria-pressed={activeTarget?.id === target.id}
                   onFocus={() => setActiveTarget(target)}
                   onBlur={() => setActiveTarget(null)}
                   aria-label={`${target.label.replace(/_/g, " ")} — ${target.stat.replace(/_/g, " ")}`}
                   style={{ left: `${target.x}%`, top: `${target.y}%` }}
                   className="absolute group/node z-20 p-3 -m-3 min-w-11 min-h-11 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full"
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



        {/* Zone detail panel */}
        <div className="fits-its-column min-w-0 space-y-16">
            <div>
              <div className="flex items-center gap-6 mb-10">
                 <div className="p-3 bg-red-600/10 rounded-xl border border-red-500/20 shadow-[0_5px_15px_rgba(220,38,38,0.2)]">
                   <Crosshair className="w-6 h-6 text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                 </div>
                 <span className="font-mono text-[0.75rem] text-editorial-text-muted tracking-[0.3em] sm:tracking-[0.5em] uppercase [overflow-wrap:anywhere] drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] font-bold">{machineText("Combat_Efficiency_Model")}</span>
              </div>
              <h2 className="font-sans font-black uppercase tracking-[-0.03em] leading-[0.8] mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] display-fit" style={{ "--fit": 14 } as React.CSSProperties}>TARGET <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">ACQUISITION</span></h2>
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
                          <span className="font-mono text-[0.875rem] text-red-500 font-black tracking-[0.4em] drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] flex items-center gap-4">
                             <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_currentColor]" /> {activeTarget.label}
                          </span>
                          <span className="font-mono text-[0.6875rem] text-editorial-text-muted tracking-[0.2em] bg-editorial-text/5 px-4 py-2 rounded-lg">REF_{activeTarget.id.toUpperCase()}</span>
                       </div>
                       <div className="font-sans font-black italic text-editorial-text tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.1)] relative text-display-sm">
                           {activeTarget.stat}
                           <div className="absolute -inset-4 bg-red-600/10 blur-[30px] -z-10 mix-blend-screen" />
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
                       <span className="font-mono text-[0.75rem] text-zinc-600 tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] uppercase font-bold">{machineText("Hover_Or_Tap_A_Zone")}</span>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

        </div>
      </div>
    </div>
  );
}
