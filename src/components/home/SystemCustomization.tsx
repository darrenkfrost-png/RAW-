import { motion, AnimatePresence } from "motion/react";
import { Settings, Terminal, Eye } from "lucide-react";
import { useEffect } from "react";
import { useUI } from "../../context/UIContext";
import SystemVisualizer from "../SystemVisualizer";

export function SystemCustomization() {
  const { visualFidelity, setVisualFidelity, diagnosticsActive, setDiagnosticsActive, setIs110Percent } = useUI();
  
  useEffect(() => {
    if (visualFidelity >= 110) {
      setIs110Percent(true);
      setTimeout(() => setVisualFidelity(100), 500);
    }
  }, [visualFidelity, setIs110Percent, setVisualFidelity]);

  return (
    <section className="py-32 xl:py-48 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto border-t border-editorial-border-light relative overflow-hidden bg-editorial-bg z-10">
       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-editorial-accent/20 to-transparent rounded-full" />
       <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none mix-blend-screen">
           <span className="font-sans font-black text-[15vw] leading-[0.8] uppercase text-editorial-text">SETTINGS</span>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center relative z-10">
          <div className="space-y-12">
             <div className="flex items-center gap-6 p-4 bg-editorial-card rounded-2xl border border-editorial-border-light backdrop-blur-sm w-fit">
                <Settings className="w-6 h-6 text-editorial-accent" />
                <span className="font-mono text-[11px] text-editorial-text-muted uppercase tracking-[0.4em] font-black">Protocol_Adjustment // CUSTOMIZATION</span>
             </div>
             <h2 className="font-sans font-black text-6xl md:text-8xl xl:text-[120px] uppercase tracking-tighter leading-[0.85] text-editorial-text">
                Tailor <br /> Your <br /> <span className="text-editorial-accent">Reality</span>
             </h2>

             <p className="text-editorial-text-muted font-light max-w-xl leading-relaxed text-lg">
                Adjust the visual fidelity and diagnostic density of your RAW experience. Normal bounds operate safely up to 100%. Pushing the slider to 110% engages total overdrive. Proceed with extreme caution.
             </p>
             
                 <div className="space-y-16 pt-8">
                <div className="space-y-8 crystal-glass-panel layered-shadows-premium p-10 relative overflow-hidden group/slider hover:border-red-500/30 transition-all duration-500">
                   <div className="flex justify-between items-center relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-editorial-text flex items-center gap-4">
                         <div className="w-2 h-2 rounded-full bg-editorial-accent animate-pulse soft-glow-field" /> Visual_Fidelity
                      </span>
                      <span className="font-mono text-[14px] text-editorial-accent font-black">{visualFidelity}%</span>
                   </div>
                   <input 
                      type="range" 
                      min="0" 
                      max="110" 
                      value={visualFidelity} 
                      onChange={(e) => {
                         const val = parseInt(e.target.value);
                         setVisualFidelity(val);
                      }}
                      className="w-full h-2 bg-editorial-surface appearance-none cursor-pointer rounded-full relative z-10 accent-editorial-accent transition-all duration-300"
                   />
                </div>
                
                <button 
                   onClick={() => setDiagnosticsActive(!diagnosticsActive)}
                   className={`w-full flex items-center justify-between p-8 xl:p-10 rounded-[2rem] border transition-all duration-500 shadow-subtle relative overflow-hidden group/btn hover:scale-[1.01] ${diagnosticsActive ? 'bg-editorial-card border-editorial-accent/50 text-editorial-text' : 'bg-editorial-surface border-editorial-border-light hover:border-editorial-border-light text-editorial-text-muted'}`}
                >
                   <div className="flex items-center gap-8 relative z-10">
                      <div className={`p-4 rounded-[1.25rem] transition-all duration-500 border ${diagnosticsActive ? 'bg-editorial-accent/10 text-editorial-accent border-editorial-accent/30' : 'bg-editorial-bg border-editorial-border-light text-zinc-600'}`}>
                         <Terminal className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                         <h4 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${diagnosticsActive ? 'text-editorial-text' : 'group-hover/btn:text-editorial-text'}`}>Realtime_Diagnostics</h4>
                         <p className={`text-[10px] uppercase mt-1 tracking-widest font-mono font-black transition-all duration-500 flex items-center gap-3 ${diagnosticsActive ? 'text-editorial-accent' : 'text-zinc-600'}`}>
                            {diagnosticsActive && <span className="w-1.5 h-1.5 bg-editorial-accent rounded-full animate-pulse" />}
                            ENABLE_ACTIVE_HUD_OVERLAY
                         </p>
                      </div>
                   </div>
                   <div 
                      className={`w-16 h-8 rounded-full relative transition-all duration-500 border ${diagnosticsActive ? 'bg-editorial-accent border-editorial-accent' : 'bg-editorial-bg border-editorial-border-light'}`}
                   >
                      <motion.div 
                         animate={{ x: diagnosticsActive ? 32 : 0 }}
                         transition={{ type: "spring", stiffness: 500, damping: 30 }}
                         className={`absolute top-0 left-0 w-8 h-8 rounded-full shadow-md border ${diagnosticsActive ? 'bg-editorial-text border-white' : 'bg-zinc-700 border-zinc-600'}`}
                      />
                   </div>
                </button>
             </div>
          </div>
          
          <div className="relative aspect-square bg-editorial-bg/90 p-2 border border-red-900/40 overflow-hidden rounded-[4rem] shadow-[inset_0_0_80px_rgba(0,0,0,0.15),0_40px_100px_rgba(0,0,0,0.15)] backdrop-blur-3xl group">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] mix-blend-screen" />
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none mix-blend-screen" />
             <div className="absolute top-0 left-0 w-full p-8 lg:p-10 flex justify-between items-center bg-editorial-bg/60 backdrop-blur-3xl z-10 border-b border-red-900/30">
                <span className="font-mono text-[11px] text-red-500 uppercase tracking-[0.5em] font-bold drop-shadow-[0_0_8px_#dc2626]">UI_STABILITY_FEEDBACK</span>
                <Eye className="w-6 h-6 text-red-500 drop-shadow-[0_0_10px_currentColor] group-hover:animate-ping" />
             </div>
             
             <div className="h-full flex items-center justify-center relative">
                <div className="relative w-[320px] h-[320px] lg:w-[400px] lg:h-[400px]">
                   {[1, 2, 3].map(i => (
                      <motion.div 
                         key={i}
                         animate={{ 
                            rotate: i % 2 === 0 ? -360 : 360,
                            scale: [1, 1.05 + i * 0.03, 1],
                            opacity: [0.3, 0.7, 0.3]
                         }}
                         transition={{ 
                            duration: 12 + i * 4, 
                            repeat: Infinity, 
                            ease: "linear" 
                         }}
                         className={`absolute inset-0 border rounded-full ${i === 2 ? 'border-dashed border-red-500/40' : 'border-editorial-border-light'} shadow-[0_0_30px_rgba(220,38,38,0.1)]`}
                      />
                   ))}
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-editorial-bg/80 rounded-full backdrop-blur-2xl m-8 border border-red-500/20 shadow-[inset_0_0_60px_rgba(0,0,0,0.15),0_10px_30px_rgba(0,0,0,0.1)] z-10">
                      <span className="font-sans font-black text-8xl lg:text-9xl text-editorial-text italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_0_30px_rgba(0,0,0,0.08)] transition-all duration-[1000ms]">{visualFidelity}</span>
                      <span className="font-mono text-[11px] lg:text-[13px] text-red-500 font-bold tracking-[0.6em] mt-4 drop-shadow-[0_0_10px_currentColor] flex items-center gap-3">
                         <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" />
                         FPS_OPTIMAL
                      </span>
                   </div>
                </div>
                
                {/* Floating HUD Points */}
                <motion.div 
                   animate={{ y: [0, -25, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute top-[25%] right-[15%] p-5 bg-editorial-bg/90 border border-red-500/30 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.15)] backdrop-blur-2xl z-20"
                >
                   <div className="flex items-center gap-4 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shadow-[0_0_15px_currentColor]" />
                      <div className="w-6 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                         <motion.div 
                           animate={{ x: ["-100%", "100%"] }}
                           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                           className="h-full w-full bg-red-500"
                         />
                      </div>
                   </div>
                   <span className="font-mono text-[10px] text-editorial-text-muted font-bold tracking-[0.4em] uppercase">SYNC_STAT</span>
                </motion.div>
             </div>
             
             <div className="absolute bottom-0 left-0 w-full p-8 lg:p-12 bg-editorial-bg/80 backdrop-blur-3xl border-t border-red-900/30 z-20 flex justify-between items-end shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
                 <div className="space-y-4">
                    <span className="font-mono text-[10px] text-emerald-500 uppercase tracking-[0.5em] font-bold flex items-center gap-4 drop-shadow-[0_0_8px_currentColor]">
                       <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_currentColor]" /> System_Healthy
                    </span>
                    <div className="flex gap-2.5">
                       {[1, 2, 3, 4, 5, 6].map(i => <motion.div key={i} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }} className="w-2 h-5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] rounded-sm" />)}
                    </div>
                 </div>
                 <span className="font-mono text-[14px] text-editorial-text font-bold tracking-[0.4em] bg-editorial-text/5 border border-editorial-border-light px-6 py-3 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.03),0_10px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">0X9821_AA</span>
             </div>
          </div>
       </div>
       <SystemVisualizer />
    </section>
  );
}
