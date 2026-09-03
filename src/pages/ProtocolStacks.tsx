import React from 'react';
import { motion } from 'motion/react';
import { allProducts } from '../data/products';
import { Link } from 'react-router-dom';
import { ArrowRight, Box, Layers, Target, Shield, Zap, Cpu, Activity, Info, Plus } from 'lucide-react';
import { Atmosphere } from '../components/common/Atmosphere';

const stacks = [
  {
    id: 'strength',
    title: 'RAW_STRENGTH_PROTOCOL',
    target: 'For gym users, lifters, and power-output training.',
    description: 'Designed to maximize muscular output, promote hypertrophy, and ensure sustained power during intense training cycles.',
    products: allProducts.filter(p => p.category === 'Nutrients' || p.name.includes('Creatine') || p.id === 4 || p.id === 6),
    intensity: 'High',
    synergy: 'Pairs with Recovery Protocol'
  },
  {
    id: 'recovery',
    title: 'RAW_RECOVERY_PROTOCOL',
    target: 'For cold exposure, sleep, nervous system reset.',
    description: 'A complete restoration system targeting the parasympathetic nervous system, muscle tissue repair, and deep rest.',
    products: allProducts.filter(p => p.name.includes('Ice') || p.name.includes('Magnesium')),
    intensity: 'Passive',
    synergy: 'Essential after Strength/Combat'
  },
  {
    id: 'combat',
    title: 'RAW_COMBAT_PROTOCOL',
    target: 'For fighters, sparring, impact readiness.',
    description: 'Specialized gear and support built for the rigors of combat sports, impact absorption, and tactical movement.',
    products: allProducts.filter(p => p.category === 'Combat' || p.category === 'Apparel'),
    intensity: 'Extreme',
    synergy: 'Pairs with Hydration Protocol'
  },
  {
    id: 'longevity',
    title: 'RAW_LONGEVITY_PROTOCOL',
    target: 'For optimized cellular aging and DNA repair.',
    description: 'Advanced molecular support system targeting telomere preservation, NAD+ levels, and metabolic efficiency.',
    products: allProducts.filter(p => [10, 11, 12, 13].includes(p.id)),
    intensity: 'Strategic',
    synergy: 'Foundation for all protocols'
  },
  {
    id: 'sleep',
    title: 'RAW_SLEEP_CALM_PROTOCOL',
    target: 'For deep rest, nervous system down-regulation.',
    description: 'A targeted formula designed to lower heart rate variability, reduce cortisol, and induce deep delta wave sleep.',
    products: allProducts.filter(p => [2, 10, 11].includes(p.id)),
    intensity: 'Passive',
    synergy: 'Restoration Catalyst'
  },
  {
    id: 'hydration',
    title: 'RAW_HYDRATION_PROTOCOL',
    target: 'For cellular fluid balance and heat tolerance.',
    description: 'Optimize electrical gradients in the body, prevent muscular cramping, and sustain high output in extreme temperature conditions.',
    products: allProducts.filter(p => [8, 14, 1].includes(p.id)),
    intensity: 'Vital',
    synergy: 'Performance Moderator'
  },
  {
    id: 'beginner',
    title: 'RAW_BEGINNER_PROTOCOL',
    target: 'For those initiating a foundational performance routine.',
    description: 'The zero-BS entry point. Provides exactly what you need to start rebuilding tissue and fueling workouts without unnecessary complexity.',
    products: allProducts.filter(p => [7, 8, 9].includes(p.id)),
    intensity: 'Base',
    synergy: 'First Deployment'
  }
];

export default function ProtocolStacks() {
  return (
    <div className="min-h-screen bg-editorial-bg pt-32 pb-24 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] font-sans relative overflow-hidden">
      <Atmosphere glowOpacity={0.05} gridMode="lines" intensity="medium" />
      
      <div className="max-w-[var(--content-max-width)] mx-auto relative z-10">
        <div className="mb-48 flex flex-col lg:grid lg:grid-cols-2 gap-20 items-end">
           <div className="space-y-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-6"
              >
                <div className="flex gap-2">
                  {[1,2,3].map(i => <div key={i} className="w-1.5 h-8 bg-red-600 shadow-[0_0_15px_#dc2626]" style={{ animation: `pulse 2s infinite ${i * 0.2}s` }} />)}
                </div>
                <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-[0.5em] font-black">Curated_Records // Archive_v2.5</span>
              </motion.div>
              <h1 className="text-7xl md:text-9xl xl:text-[160px] font-black text-white uppercase tracking-tighter leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                Performance <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 italic">Stacks</span>
              </h1>
              <p className="text-xl xl:text-3xl text-editorial-text-muted font-light leading-relaxed max-w-2xl border-l-4 border-red-600/50 pl-10 py-4 shadow-[inset_20px_0_40px_rgba(220,38,38,0.05)]">
                Pre-configured performance architectures. Designed to eliminate guesswork and optimize specific functional outcomes for athletes and operators.
              </p>
           </div>
           
           <div className="w-full">
              <div className="p-10 bg-editorial-surface/40 backdrop-blur-3xl border border-editorial-border rounded-[3rem] shadow-depth-3 relative overflow-hidden group/sys">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-center mb-10">
                      <h3 className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest font-black flex items-center gap-3">
                        <Cpu className="w-4 h-4" /> System_Hierarchy
                      </h3>
                      <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                  </div>
                  <div className="space-y-8">
                      {[
                        { label: "Strength_Index", value: 92 },
                        { label: "Restoration_Pulse", value: 45 },
                        { label: "Combat_Readiness", level: "Elite" }
                      ].map((stat, i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                                <span>{stat.label}</span>
                                <span>{stat.level || `${stat.value}%`}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: typeof stat.value === 'number' ? `${stat.value}%` : "100%" }}
                                  transition={{ duration: 1.5, delay: i * 0.2 }}
                                  className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]"
                                />
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
           </div>
        </div>

        <div className="space-y-40 md:space-y-64 relative z-10">
          {stacks.map((stack, idx) => (
            <motion.section 
              key={stack.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="grid lg:grid-cols-12 gap-20 xl:gap-32 items-start group/section"
            >
              <div className="lg:col-span-4 lg:sticky lg:top-40 space-y-12">
                <div className="space-y-10">
                  <div className="flex items-center gap-6">
                     <span className="font-mono text-[11px] text-red-500 font-black uppercase tracking-[0.5em] transition-all duration-700 group-hover/section:tracking-[0.8em]">PROTOCOL_{idx < 9 ? '0' : ''}{idx + 1}</span>
                     <div className="h-[1px] flex-1 bg-editorial-text/5 group-hover/section:bg-red-600/30 transition-all duration-700" />
                  </div>
                  <h2 className="text-5xl lg:text-7xl font-black text-editorial-text uppercase tracking-tighter leading-[0.85] group-hover/section:text-red-500 transition-colors duration-700 italic">{stack.title}</h2>
                </div>

                <div className="space-y-8">
                    <div className="p-10 bg-editorial-surface/40 backdrop-blur-3xl border border-editorial-border rounded-[2.5rem] border-l-4 border-l-red-600 shadow-depth-2 hover:shadow-depth-3 transition-all">
                      <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest font-black block mb-4">Target_Objective</span>
                      <p className="font-sans text-xl text-white uppercase leading-tight font-black">{stack.target}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-black/20 border border-white/5 rounded-2xl">
                           <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest block mb-2">Intensity</span>
                           <span className="text-sm font-black text-white">{stack.intensity}</span>
                        </div>
                        <div className="p-6 bg-black/20 border border-white/5 rounded-2xl">
                           <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest block mb-2">Synergy</span>
                           <span className="text-sm font-black text-white">{stack.synergy}</span>
                        </div>
                    </div>
                </div>

                <p className="text-xl text-editorial-text-muted font-light leading-relaxed group-hover/section:text-white transition-colors duration-700 pr-10">
                   {stack.description}
                </p>
                
                <div className="pt-6">
                <Link to={`/protocol-stacks/${stack.id}`} className="button-premium !py-6 group/btn w-full text-center sm:w-auto">
                   Initialize Protocol <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-3 transition-transform" />
                </Link>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid sm:grid-cols-2 gap-10">
                  {stack.products.slice(0, 4).map((product, pIdx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: pIdx * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link 
                        to={`/product/${product.id}`}
                        className="group/card bg-editorial-surface/20 backdrop-blur-3xl border border-editorial-border p-10 rounded-[3rem] hover:border-red-600/30 transition-all duration-[1000ms] flex flex-col h-full shadow-depth-2 hover:bg-black/40 overflow-hidden relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.03] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />
                        
                        <div className="aspect-square bg-black/40 rounded-[2.5rem] overflow-hidden mb-12 relative border border-white/5 shadow-depth-1 group-hover/card:scale-[1.02] transition-transform duration-[1500ms]">
                           <div className="absolute inset-0 bg-editorial-surface opacity-0 group-hover/card:opacity-10 transition-opacity z-10" />
                           <img src={product.image} alt={product.name} className="w-full h-full object-contain p-12 mix-blend-screen scale-110 group-hover/card:scale-[1.25] transition-transform duration-[2000ms] ease-fluid" />
                           <div className="absolute top-6 right-6 w-10 h-10 bg-editorial-bg border border-white/5 rounded-xl flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-700 translate-x-4 group-hover/card:translate-x-0">
                               <Plus className="w-4 h-4 text-red-500" />
                           </div>
                        </div>
                        
                        <div className="flex-1 space-y-6 relative z-10">
                          <span className="font-mono text-[10px] text-red-500 uppercase tracking-[0.5em] block font-black transition-all duration-700 group-hover/card:tracking-[0.7em]">{product.category}</span>
                          <h3 className="font-black text-editorial-text uppercase text-3xl lg:text-4xl leading-[0.8] tracking-tighter transition-all duration-1000 group-hover:text-red-500">{product.name}</h3>
                          <p className="text-editorial-text-muted font-light leading-relaxed group-hover/card:text-editorial-text transition-colors text-base line-clamp-3">
                             {product.description || "Every batch of this premium performance architecture undergoes a multi-phase validation cycle."}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-16 pt-10 border-t border-editorial-border/30 relative z-10 group/foo">
                          <span className="font-sans font-black text-3xl text-white group-hover/card:text-red-500 transition-colors">{product.price}</span>
                          <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.4em] font-black group-hover/foo:text-white transition-all transform-gpu group-hover/foo:translate-x-[-8px]">
                             View_Spec <div className="w-12 h-[1px] bg-red-600/20 group-hover/foo:w-24 group-hover/foo:bg-red-600 transition-all duration-1000" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Comparative Matrix Expansion */}
        <section className="mt-64 pt-48 border-t border-editorial-border relative">
             <div className="flex flex-col lg:flex-row justify-between items-end mb-32 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-5">
                       <span className="w-12 h-[1px] bg-red-600" />
                       <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-[0.5em] font-black">Comparative_Performance_Matrix</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white">Cross-Protocol <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 italic">Benchmarks</span></h2>
                </div>
                <div className="p-8 bg-editorial-surface/20 border border-editorial-border rounded-3xl max-w-md">
                   <p className="text-sm text-editorial-text-muted font-light leading-relaxed">System-wide data analysis of stack utilization across all sectors. Benchmarks based on 10,000+ operative deployments.</p>
                </div>
             </div>

             <div className="overflow-x-auto relative z-10 -mx-6 px-6 lg:mx-0 lg:px-0">
                <table className="w-full border-collapse">
                   <thead>
                      <tr className="border-b border-editorial-border">
                         <th className="py-10 text-left font-mono text-[10px] text-zinc-600 uppercase tracking-widest font-black">Protocol_Core</th>
                         <th className="py-10 text-center font-mono text-[10px] text-zinc-600 uppercase tracking-widest font-black">Output_Impact</th>
                         <th className="py-10 text-center font-mono text-[10px] text-zinc-600 uppercase tracking-widest font-black">Bio_Stress_Index</th>
                         <th className="py-10 text-center font-mono text-[10px] text-zinc-600 uppercase tracking-widest font-black">Deployment</th>
                         <th className="py-10 text-right font-mono text-[10px] text-zinc-600 uppercase tracking-widest font-black">Status</th>
                      </tr>
                   </thead>
                   <tbody>
                      {stacks.map((stack, i) => (
                        <tr key={i} className="border-b border-editorial-border/30 hover:bg-white/5 transition-colors group/row">
                           <td className="py-10">
                              <span className="block font-black text-xl lg:text-2xl text-white uppercase tracking-tight group-hover/row:text-red-500 transition-colors">{stack.title.replace('RAW_', '').replace('_PROTOCOL', '')}</span>
                              <span className="block font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-2">{stack.id}_SYS_ID</span>
                           </td>
                           <td className="py-10 text-center">
                              <div className="flex items-center justify-center gap-1">
                                 {[1,2,3,4,5].map(star => (
                                   <div key={star} className={`w-1.5 h-6 rounded-full ${star <= (i % 2 === 0 ? 5 : 4) ? 'bg-red-600 shadow-[0_0_8px_#dc2626]' : 'bg-white/5'}`} />
                                 ))}
                              </div>
                           </td>
                           <td className="py-10 text-center">
                               <span className="font-mono text-[11px] font-black text-white">{i * 12 + 40}%</span>
                           </td>
                           <td className="py-10 text-center">
                              <span className="px-5 py-2 bg-editorial-surface border border-editorial-border rounded-xl font-mono text-[9px] text-zinc-500 uppercase font-black">{stack.intensity}</span>
                           </td>
                           <td className="py-10 text-right">
                              <div className="flex items-center justify-end gap-3 font-mono text-[9px] font-black text-emerald-500">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" /> VERIFIED
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
        </section>

      </div>
    </div>
  );
}
