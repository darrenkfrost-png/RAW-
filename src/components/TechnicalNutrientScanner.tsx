import React, { useState, useRef, useMemo } from "react";
import { motion, useAnimationFrame } from "motion/react";
import { Activity, Zap, Target, Thermometer, Database } from "lucide-react";
import MagneticWrapper from "./MagneticWrapper";

interface DataNode {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}

const nodes: DataNode[] = [
  { label: "BIO_AVAILABILITY", value: 98.4, unit: "%", color: "text-red-500", icon: <Zap className="w-4 h-4" /> },
  { label: "RECOVERY_COEFFICIENT", value: 4.2, unit: "X", color: "text-blue-500", icon: <Activity className="w-4 h-4" /> },
  { label: "NEURAL_DENSITY", value: 88, unit: "%", color: "text-emerald-500", icon: <Target className="w-4 h-4" /> },
  { label: "THERMAL_STABILITY", value: 36.6, unit: "°C", color: "text-orange-500", icon: <Thermometer className="w-4 h-4" /> }
];

export default function TechnicalNutrientScanner() {  const [activeNode, setActiveNode] = useState(0);
  const [dataPoints, setDataPoints] = useState<number[]>(Array(40).fill(40));
  const timeRef = useRef(0);

  useAnimationFrame((t) => {
    if (t - timeRef.current > 50) {
      setDataPoints((prev) => [...prev.slice(1), Math.random() * 60 + 20]);
      timeRef.current = t;
    }
  });

  const pathD = useMemo(() => {
    const width = 800;
    const height = 300;
    const step = width / (dataPoints.length - 1);
    
    return dataPoints.reduce((acc, point, i) => {
      const x = i * step;
      const y = height - (point / 100) * height;
      if (i === 0) return `M ${x} ${y}`;
      return `${acc} L ${x} ${y}`;
    }, "");
  }, [dataPoints]);

  return (
    <div className="w-full crystal-glass-panel layered-shadows-premium p-12 lg:p-20 relative overflow-hidden group mt-32">
      {/* Refined Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.1),transparent_70%)] pointer-events-none opacity-100" />
      <div className="neural-grid-overlay" />
      
      <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-12 gap-20">
        {/* Left Side: Real-time Oscilloscope */}
        <div className="lg:col-span-7 space-y-16 flex flex-col justify-between">
          <div className="flex justify-between items-end border-b border-editorial-border pb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-12 h-12 bg-red-600/10 rounded-2xl border border-red-500/20 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse rounded-2xl" />
                </div>
                <span className="text-[0.75rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]">QUANTUM_TELEMETRY_FEED</span>
              </div>
              <h4 className="text-4xl font-sans font-black text-editorial-text uppercase tracking-tighter">BIO_KINETIC_STREAM</h4>
            </div>
            <div className="text-right">
              <span className="text-[0.6875rem] text-editorial-text-muted font-black uppercase block tracking-[0.4em] mb-3">INTEGRITY_READOUT</span>
              <span className="text-2xl text-emerald-500 font-mono font-black uppercase tracking-tight flex items-center gap-4 justify-end">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-[pulse_1s_infinite] shadow-[0_0_15px_currentColor]" /> 99.98%
              </span>
            </div>
          </div>

          <div className="h-[400px] w-full border border-editorial-border bg-editorial-bg/40 relative overflow-hidden rounded-[3rem] shadow-depth-2">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px]" />
            
            <svg viewBox="0 0 800 300" className="w-full h-full p-10" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="teleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" />
                        <stop offset="100%" stopColor="#dc262600" />
                    </linearGradient>
                </defs>
                <motion.path 
                    d={pathD}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3"
                    className="drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                    transition={{ type: "tween", duration: 0.05 }}
                />
                <motion.path 
                    d={`${pathD} L 800 300 L 0 300 Z`}
                    fill="url(#teleGrad)"
                    className="opacity-20"
                    transition={{ type: "tween", duration: 0.05 }}
                />
            </svg>

            {/* Scanning line */}
            <motion.div 
               animate={{ x: ["0%", "100%", "0%"] }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-red-500 to-transparent shadow-[0_0_20px_#ef4444]"
            />
          </div>
        </div>
        
        {/* Right Side: Node Selectors */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {nodes.map((node, i) => (
            <MagneticWrapper key={i}>
              <button
                onMouseEnter={() => setActiveNode(i)}
                className={`w-full text-left p-10 transition-all duration-[800ms] ease-[0.16,1,0.3,1] border backdrop-blur-2xl rounded-[2rem] transform-gpu ${
                  activeNode === i 
                  ? 'bg-editorial-bg border border-red-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.15),inset_0_0_30px_rgba(220,38,38,0.15)] scale-100' 
                  : 'bg-editorial-bg/60 border-editorial-border hover:border-editorial-text/20 hover:bg-editorial-surface/80 hover:scale-[0.98]'
                }`}
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-5">
                    <span className={`p-3 rounded-xl border transition-colors duration-[800ms] shadow-[0_10px_20px_rgba(0,0,0,0.08)] ${activeNode === i ? 'bg-red-600/10 border-red-500/30 text-red-500 drop-shadow-[0_0_10px_#ef4444]' : 'bg-editorial-surface border-editorial-border text-zinc-600'}`}>
                      {node.icon}
                    </span>
                    <span className={`text-[0.75rem] font-black tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] uppercase transition-colors duration-[800ms] ${activeNode === i ? 'text-editorial-text drop-shadow-[0_0_15px_rgba(0,0,0,0.08)]' : 'text-editorial-text-muted'}`}>
                      {node.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-4 pl-[4.5rem]">
                  <span className={`text-6xl font-sans font-black tracking-[-0.03em] transition-colors duration-[800ms] drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] ${activeNode === i ? 'text-editorial-text' : 'text-zinc-700'}`}>
                    {activeNode === i ? node.value.toFixed(1) : "---"}
                  </span>
                  <span className={`text-[0.8125rem] font-bold tracking-widest transition-colors duration-[800ms] ${activeNode === i ? 'text-red-500' : 'text-zinc-800'}`}>{node.unit}</span>
                </div>
              </button>
            </MagneticWrapper>
          ))}
        </div>
      </div>
    </div>
  );
}
