import { motion, useAnimationFrame } from "motion/react";
import { useEffect, useState, useMemo, useRef } from "react";
import * as d3 from "d3";

export default function SystemVisualizer() {
  const [dataPoints, setDataPoints] = useState<{x: number, y: number}[]>(
    Array.from({ length: 60 }, (_, i) => ({ x: i, y: 50 }))
  );
  const timeRef = useRef(0);

  useAnimationFrame((t) => {
    if (t - timeRef.current > 60) {
      setDataPoints((prev) => {
        const nextX = prev[prev.length - 1].x + 1;
        const nextY = 30 + Math.random() * 40 + Math.sin(t / 500) * 10;
        return [...prev.slice(1), { x: nextX, y: nextY }];
      });
      timeRef.current = t;
    }
  });

  const { pathD, areaD } = useMemo(() => {
    const width = 1200;
    const height = 200;
    
    const xScale = d3.scaleLinear()
      .domain([dataPoints[0].x, dataPoints[dataPoints.length - 1].x])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    const line = d3.line<{x: number, y: number}>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveCardinal);

    const area = d3.area<{x: number, y: number}>()
      .x(d => xScale(d.x))
      .y0(height)
      .y1(d => yScale(d.y))
      .curve(d3.curveCardinal);

    return { 
      pathD: line(dataPoints) || "",
      areaD: area(dataPoints) || ""
    };
  }, [dataPoints]);

  return (
    <div className="w-full relative py-48 flex flex-col items-center justify-center group overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="w-full max-w-7xl crystal-glass-panel layered-shadows-premium p-16 overflow-hidden relative transition-all duration-[1500ms] hover:border-red-500/30 hover:shadow-[0_0_100px_rgba(220,38,38,0.1)] rounded-[4rem]">
        {/* Dynamic Backgrounds */}
        <div className="absolute inset-0 bg-editorial-bg opacity-40 z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-zinc-600/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
        <div className="neural-grid-overlay z-0" />
        
        {/* Cinematic Scanline Sweep */}
        <motion.div 
           animate={{ x: ["-100%", "200%"] }}
           transition={{ duration: 4, ease: "linear", repeat: Infinity }}
           className="absolute top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] z-10 pointer-events-none"
        />

        <div className="flex justify-between items-start mb-20 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_#dc2626]" />
                <span className="text-meta-premium">Global_System_Heartbeat</span>
            </div>
            <h3 className="text-4xl text-premium">PROTOCOL_NEURAL_PULSE</h3>
          </div>
          <div className="text-right space-y-4">
            <span className="text-[0.6875rem] text-zinc-600 font-black uppercase block tracking-[0.4em]">SYNC_COEFFICIENT</span>
            <div className="flex items-baseline gap-4 justify-end">
                <span className="text-5xl font-mono font-black text-editorial-text tracking-tight drop-shadow-[0_0_20px_rgba(0,0,0,0.06)]">0.9998</span>
                <span className="text-red-500 font-mono text-xs font-bold font-black tracking-widest">INDEX</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[300px] relative z-10">
          <svg viewBox="0 0 1200 200" className="w-full h-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="neuralLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0" />
                <stop offset="20%" stopColor="#dc2626" />
                <stop offset="80%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="neuralAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(220,38,38,0.15)" />
                <stop offset="100%" stopColor="rgba(220,38,38,0)" />
              </linearGradient>
            </defs>

            <motion.path
                d={areaD}
                fill="url(#neuralAreaGrad)"
                className="opacity-100"
                transition={{ type: "tween", duration: 0.05 }}
            />
            <motion.path
                d={pathD}
                fill="none"
                stroke="url(#neuralLineGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                className="drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                transition={{ type: "tween", duration: 0.05 }}
            />
            
            {/* Pulsing focal point */}
            <motion.circle
               cx={1185}
               cy={d3.scaleLinear().domain([0, 100]).range([200, 0])(dataPoints[dataPoints.length - 1].y)}
               r="6"
               fill="white"
               className="drop-shadow-[0_0_15px_white]"
            />
          </svg>
          
          {/* Horizontal scanning lines */}
          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none">
             {[20, 40, 60, 80].map(top => (
                <div key={top} className="absolute inset-x-0 h-px bg-editorial-text/5" style={{ top: `${top}%` }} />
             ))}
          </div>
        </div>
        
        <div className="flex justify-between mt-16 border-t border-editorial-border pt-12 font-mono text-[0.6875rem] text-editorial-text-muted tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] relative z-10 font-bold uppercase overflow-hidden">
            <div className="flex gap-20">
                <span className="flex items-center gap-4 text-editorial-text">
                   <span className="text-zinc-600">LATENCY_CORE:</span> 0.002MS
                </span>
                <span className="flex items-center gap-4 text-editorial-text">
                   <span className="text-zinc-600">THROUGHPUT:</span> 1.4TB/S
                </span>
                <span className="flex items-center gap-4 text-emerald-500">
                   <span className="text-zinc-600">UPLINK_STABILITY:</span> NOMINAL
                </span>
            </div>
            <div className="flex items-center gap-4 text-red-500 group-hover:animate-pulse">
                SYS_STATUS // COMMAND_ALPHA_SYNC_ACTIVE
            </div>
        </div>
      </div>
    </div>
  );
}
