import { motion, useAnimationFrame, AnimatePresence } from "motion/react";
import Breadcrumb from '../components/Breadcrumb';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, CartesianGrid } from "recharts";
import { Users, Activity, ShieldCheck, Zap, Server, Terminal, Radio, Bot, Sparkles, AlertTriangle, Cpu, Network } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUI } from "../context/UIContext";
import MagneticWrapper from "../components/MagneticWrapper";
import SystemVisualizer from "../components/SystemVisualizer";
import NeuralTimeline from "../components/NeuralTimeline";

export default function Analytics() {
  const { is110Percent } = useUI();
  const [latencyData, setLatencyData] = useState(() => Array.from({ length: 30 }, (_, i) => ({ time: i, latency: 30 })));
  const [healthData, setHealthData] = useState([
    { name: 'Core', value: 98 },
    { name: 'Memory', value: 72 },
    { name: 'Database', value: 95 },
    { name: 'Network', value: 89 },
  ]);
  const timeRef = useRef(0);


  useAnimationFrame((t) => {
    // Speed up updates in 110% mode
    const updateThreshold = is110Percent ? 50 : 150;
    if (t - timeRef.current > updateThreshold) {
      setLatencyData(prev => {
        const nextTime = prev[prev.length - 1].time + 1;
        // More volatile latency in 110% mode
        const volatility = is110Percent ? 80 : 30;
        const base = is110Percent ? 10 : 20;
        return [...prev.slice(1), { time: nextTime, latency: Math.floor(Math.random() * volatility) + base }];
      });
      setHealthData(prev => prev.map(item => ({
        ...item,
        // Rapid chaotic changes in overdrive
        value: Math.max(is110Percent ? 10 : 50, Math.min(100, item.value + (Math.random() * (is110Percent ? 20 : 4) - (is110Percent ? 10 : 2))))
      })));
      timeRef.current = t;
    }
  });

  // Dynamic colors based on overdrive state
  const mainColor = is110Percent ? "#10b981" : "#dc2626"; // Adjusted to match generic app emerald for 110% mode
  const gridColor = is110Percent ? "#064e3b" : "#27272a";
  const bgCardClass = is110Percent 
    ? "bg-editorial-bg/90 backdrop-blur-3xl border border-emerald-500/40 p-10 rounded-[2rem] relative overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.15)]" 
    : "bg-editorial-bg/80 backdrop-blur-3xl border border-editorial-border p-10 rounded-[2rem] relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.1)]";
  const textTitleClass = is110Percent ? "text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]";
  const textSubClass = is110Percent ? "text-emerald-400 font-bold" : "text-editorial-text-muted font-bold";

  return (
    <div className={`min-h-svh pt-36 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] transition-colors duration-500 relative ${is110Percent ? 'bg-editorial-bg noise-overlay' : 'bg-editorial-bg'}`}>
      {!is110Percent && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-editorial-bg/40 via-transparent to-transparent pointer-events-none opacity-60 mix-blend-screen" />}
      {is110Percent && <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />}
      
      <div className="max-w-[var(--content-max-width)] mx-auto space-y-16 relative z-10">
        <Breadcrumb items={[{ label: 'System', path: '/performance-system' }, { label: 'Analytics', active: true }]} />
        {/* Header */}
        <div className={`border-b pb-12 transition-colors duration-500 mb-20 relative ${is110Percent ? 'border-emerald-500/40' : 'border-red-900/40'}`}>
          <div className="absolute top-0 right-0 w-32 h-[1px] bg-editorial-text opacity-20 hidden md:block" />
          <div className="flex items-center gap-4">
            <span className={`font-mono text-[0.6875rem] xl:text-[0.75rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] flex items-center gap-4 ${is110Percent ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]'}`}>
              <Radio className={`w-6 h-6 ${is110Percent ? 'animate-ping' : 'animate-pulse'}`} /> 
              {is110Percent ? 'OVERRIDE_DIAGNOSTICS // V.MAX' : 'SYSTEM_DIAGNOSTICS // V.04'}
            </span>
          </div>
          <h1 className={`font-sans font-black text-6xl md:text-[100px] xl:text-[140px] uppercase tracking-tighter leading-[0.8] mt-10 relative z-10 ${is110Percent ? 'text-emerald-500 glitch' : 'text-premium drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]'}`} data-text={is110Percent ? 'ORBITAL_TELEMETRY' : 'LIVE_METRICS_FEED'}>
            {is110Percent ? 'ORBITAL_TELEMETRY' : 'INTERNAL_ANALYTICS'}
            {!is110Percent && <br />}
            {!is110Percent && <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-red-600 to-red-900 drop-shadow-[0_0_20px_rgba(220,38,38,0.3)] pb-2 inline-block">MATRIX</span>}
          </h1>
        </div>

        {/* Top Cards */}
        <div className="grid md:grid-cols-4 gap-8 xl:gap-10">
          {[
            { title: "ACTIVE_SESSIONS", value: is110Percent ? "ERR_OVFL" : "2,481", icon: Users, sub: "+14.2%" },
            { title: "NETWORK_LOAD", value: is110Percent ? "999.9" : "124.5", icon: Network, sub: "STABLE" },
            { title: "SYS_INTEGRITY", value: is110Percent ? "110%" : "98.7%", icon: ShieldCheck, sub: "VERIFIED" },
            { title: "CORE_CORES", value: is110Percent ? "INFINITE" : "64_AMD", icon: Cpu, sub: "OVERCLOCKED" },
          ].map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col justify-between ${bgCardClass} group transition-all duration-700 ${is110Percent ? 'hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:border-emerald-500/60 hover:-translate-y-1' : 'hover:border-red-500/30 hover:shadow-[0_30px_80px_rgba(220,38,38,0.1)] hover:-translate-y-1'}`}
            >
              <div className="flex justify-between items-start w-full relative z-10 mb-10">
                <span className={`font-mono text-[0.6875rem] xl:text-[0.75rem] uppercase tracking-[0.4em] ${textSubClass} drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]`}>{card.title}</span>
                <card.icon className={`w-6 h-6 xl:w-8 xl:h-8 ${is110Percent ? 'text-emerald-500 group-hover:animate-spin drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-zinc-600 group-hover:text-red-500 transition-colors duration-500'}`} />
              </div>
              <div className="relative z-10">
                <div className={`text-5xl xl:text-7xl font-black tracking-tighter ${is110Percent ? 'text-emerald-500' : 'text-premium'} ${is110Percent && i === 2 ? 'animate-pulse drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]' : ''}`}>{card.value}</div>
                <div className={`text-[0.6875rem] font-bold mt-2 tracking-[0.3em] font-mono ${is110Percent ? 'text-emerald-400' : 'text-meta-premium'}`}>{card.sub}</div>
              </div>
              
              {/* Scanline effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-${is110Percent ? 'emerald-500' : 'red-600'}/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite] pointer-events-none mix-blend-screen transition-opacity duration-1000`} />
              {!is110Percent && <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />}
            </motion.div>
          ))}
        </div>

        {/* Matrix Grid Visualization */}
        <section className={`p-10 lg:p-16 ${bgCardClass} relative overflow-hidden group`}>
            <div className="flex items-center justify-between mb-16 relative z-10">
                <div>
                    <h3 className={`font-sans font-black text-4xl uppercase tracking-tight ${is110Percent ? 'text-emerald-500' : 'text-white'}`}>Matrix_Allocation</h3>
                    <p className={`font-mono text-[0.6875rem] uppercase tracking-[0.4em] ${textSubClass}`}>Real-time Node Distribution</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">CRITICAL</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-20 gap-2 md:gap-4 relative z-10">
                {Array.from({ length: 80 }).map((_, i) => {
                    const isCritical = Math.random() > 0.9;
                    const isActive = Math.random() > 0.2;
                    return (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.01 }}
                            title={`Node ${i} // ${isActive ? (isCritical ? 'Critical' : 'Nominal') : 'Standby'}`}
                            className={`aspect-square rounded-sm md:rounded-md border ${
                                isActive 
                                    ? isCritical 
                                        ? 'bg-red-600 border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse' 
                                        : is110Percent ? 'bg-emerald-500 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-editorial-text/20 border-white/10'
                                    : 'bg-zinc-900 border-white/5 opacity-40'
                            } transition-all duration-500 hover:scale-125 cursor-crosshair relative group/node`}
                        >
                            <div className="absolute inset-0 opacity-0 group-hover/node:opacity-100 bg-white/20 transition-opacity" />
                        </motion.div>
                    );
                })}
            </div>
            
            {/* Visual HUD Corner Accents */}
            <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-white/10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-white/10 pointer-events-none" />
        </section>

        {/* Charts */}
        <div className="grid xl:grid-cols-2 gap-12">
          {/* Latency Line Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`${bgCardClass} group`}
          >
            {!is110Percent && <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />}
            <div className="flex justify-between items-center mb-12 border-b border-editorial-border pb-8 relative z-10">
              <h3 className={`font-mono text-[0.75rem] xl:text-[0.875rem] uppercase tracking-widest flex items-center gap-4 ${textSubClass}`}>
                <Activity className={`w-6 h-6 ${is110Percent ? 'text-emerald-500 drop-shadow-[0_0_8px_currentColor]' : 'text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]'}`} /> API_LATENCY_TRACKER [MS]
              </h3>
              <div className="px-4 py-1.5 bg-editorial-bg/60 rounded-lg border border-editorial-border-light text-[0.6875rem] font-mono font-bold text-editorial-text-muted flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${is110Percent ? 'bg-emerald-500 shadow-[0_0_5px_currentColor]' : 'bg-red-500 shadow-[0_0_5px_currentColor]'}`} />
                 REALTIME
              </div>
            </div>
            <div className="h-[450px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.5} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke={textSubClass} fontSize={11} fontFamily="monospace" tickLine={false} axisLine={false} domain={is110Percent ? [0, 100] : [0, 80]} tickMargin={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: is110Percent ? '#022c22' : '#09090b', borderColor: mainColor, fontSize: '11px', fontFamily: 'monospace', color: mainColor, borderRadius: '8px', padding: '12px' }} 
                    itemStyle={{ color: mainColor, fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <ReferenceLine y={is110Percent ? 80 : 60} stroke={mainColor} strokeDasharray="3 3" opacity={0.3} />
                  <Line 
                    type="monotone" 
                    dataKey="latency" 
                    stroke={mainColor} 
                    strokeWidth={is110Percent ? 3 : 2}
                    dot={is110Percent ? { r: 3, fill: mainColor, strokeWidth: 0 } : false}
                    activeDot={{ r: 6, fill: is110Percent ? '#fff' : mainColor, stroke: mainColor, strokeWidth: 2 }} 
                    isAnimationActive={false}
                    style={{ filter: `drop-shadow(0 0 8px ${mainColor})` } as any}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Insights & Health Panel */}
          <div className="space-y-12">
             {/* Node Load Chart (Simplified as Bars for the bottom right side of layout if needed, or keeping original) */}
             <motion.div className={bgCardClass}>
                {/* ... (Existing health data chart logic could be here or keep it below) */}
                <div className="flex justify-between items-center mb-8">
                   <h4 className={`font-mono text-[0.6875rem] uppercase tracking-[0.4em] ${textSubClass}`}>Hardware Load Allocation</h4>
                </div>
                 <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={healthData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} width={70} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: is110Percent ? '#022c22' : '#09090b', borderColor: mainColor, fontSize: '11px', fontFamily: 'monospace', color: mainColor, borderRadius: '8px', padding: '8px' }} 
                        itemStyle={{ color: mainColor, fontWeight: 'bold' }}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {healthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={is110Percent ? (entry.value > 90 ? '#ef4444' : '#10b981') : '#dc2626'} />
                        ))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
             </motion.div>
          </div>
        </div>

        {/* Global System Visualization */}
        <div className="pt-20">
           <div className="flex items-center gap-6 mb-12">
              <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
              <h2 className="font-mono text-[0.8125rem] text-editorial-text-muted uppercase tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] font-black">SYST_VISUAL_01</h2>
              <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
           </div>
           <SystemVisualizer />
        </div>

        {/* Neural Timeline */}
        <div className="pt-32">
           <div className="flex flex-col items-center mb-32">
              <span className="text-red-600 font-mono text-[0.75rem] font-black tracking-[0.3em] sm:tracking-[0.8em] [overflow-wrap:anywhere] mb-8 uppercase">EVOLUTIONARY_LOGS</span>
              <h2 className="font-black text-editorial-text uppercase tracking-tighter text-center text-display-md">THE_RAW_PROTOCOL <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900">TIMELINE</span></h2>
           </div>
           <NeuralTimeline />
        </div>
      </div>
    </div>
  );
}
