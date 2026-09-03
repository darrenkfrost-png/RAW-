import { Atmosphere } from '../components/common/Atmosphere';
import Breadcrumb from '../components/Breadcrumb';
import { motion } from "motion/react";
import { Truck, Globe, ShieldCheck, Clock, MapPin, Package } from "lucide-react";
import MagneticWrapper from "../components/MagneticWrapper";

export default function Logistics() {
  return (
    <div className="pt-32 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-screen relative bg-editorial-bg">
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-red-900/10 blur-[250px] pointer-events-none rounded-full mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-red-900/10 blur-[200px] pointer-events-none rounded-full mix-blend-screen" />
      <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
      
      <Breadcrumb items={[{ label: 'Company', path: '/manifesto' }, { label: 'Logistics', active: true }]} />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="mb-24 xl:mb-32 relative z-10"
      >
        <span className="font-mono text-[13px] text-red-500 font-bold tracking-[0.6em] mb-12 block uppercase flex items-center gap-5 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-editorial-border bg-editorial-bg/50 backdrop-blur-md w-fit px-8 py-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" />
          System_Protocol // L-001
        </span>
        <h1 className="text-7xl md:text-9xl xl:text-[180px] font-black uppercase tracking-[-0.03em] mb-12 leading-[0.8] text-editorial-text drop-shadow-[0_15px_40px_rgba(0,0,0,0.1)] relative">
          Global<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-900 drop-shadow-[0_0_40px_rgba(220,38,38,0.4)] pb-4 mt-4 inline-block relative z-10">Logistics</span>
          <div className="absolute top-1/2 left-0 w-full h-[300px] bg-red-900/10 blur-[150px] -z-10 mix-blend-screen pointer-events-none" />
        </h1>
        <p className="max-w-5xl text-editorial-text-muted font-light text-2xl xl:text-4xl leading-[1.3] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-l-2 border-red-600/50 pl-8 md:pl-12 py-4 bg-gradient-to-r from-red-900/5 to-transparent">
           Our distribution network is architected for maximum efficiency. Operating through highly coordinated hubs across the globe to ensure your RAW gear and supplements reach your sector securely and on schedule.
        </p>
      </motion.div>

      {/* Atmospheric World Map Visualization */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-40 h-[400px] md:h-[600px] xl:h-[800px] border border-editorial-border rounded-[4rem] relative overflow-hidden group/map shadow-depth-3 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[size:100px_100px] bg-repeat opacity-[0.98]"
      >
        <Atmosphere glowOpacity={0.03} gridMode="dots" intensity="medium" />
        <div className="absolute inset-0 bg-editorial-bg opacity-40 pointer-events-none" />
        
        {/* Abstract Map Grid */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-10 opacity-20">
            <div className="w-full h-full border border-white/5 bg-[cyan-500]/5 flex items-center justify-center rounded-[3rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px] opacity-10" />
                <Globe className="w-[80%] h-[80%] text-white/5 animate-[pulse_8s_ease-in-out_infinite]" />
            </div>
        </div>

        {/* Floating Data Points */}
        {[
          { top: '30%', left: '20%', label: 'NA_VAN_HUUB' },
          { top: '45%', left: '48%', label: 'EU_BER_NODE' },
          { top: '60%', left: '75%', label: 'APAC_BKK_CTR' },
          { top: '15%', left: '85%', label: 'RU_MOW_STA' },
          { top: '75%', left: '30%', label: 'SA_GRU_UNIT' }
        ].map((point, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ delay: 0.5 + i * 0.2 }}
             className="absolute flex flex-col items-center gap-2 pointer-events-none"
             style={{ top: point.top, left: point.left }}
           >
              <div className="w-4 h-4 bg-red-600 rounded-full animate-ping shadow-[0_0_15px_#dc2626]" />
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-1.5 shadow-[0_0_10px_#dc2626]" />
              <div className="mt-2 bg-editorial-bg/80 backdrop-blur-md border border-editorial-border-light px-3 py-1 rounded-md">
                 <span className="font-mono text-[8px] text-editorial-text font-black tracking-widest uppercase">{point.label}</span>
              </div>
           </motion.div>
        ))}

        {/* Global Stats Overlay */}
        <div className="absolute bottom-10 left-10 xl:bottom-20 xl:left-20 flex flex-col gap-6 bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-premium">
           <div className="space-y-2">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">ACTIVE_OPERATIVES</span>
              <div className="text-4xl font-black text-white lining-nums">1.4k</div>
           </div>
           <div className="h-px w-full bg-white/5" />
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                 <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest">TRANSIT_FLEET</span>
                 <span className="text-sm font-bold text-emerald-500">100%_AVAIL</span>
              </div>
              <div className="space-y-1">
                 <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest">SYS_UPTIME</span>
                 <span className="text-sm font-bold text-red-500">99.98%</span>
              </div>
           </div>
        </div>

        <div className="absolute top-10 right-10 xl:top-20 xl:right-20 pointer-events-none">
           <div className="flex flex-col gap-4 text-right">
              <span className="font-mono text-[10px] text-red-600 font-black uppercase tracking-[0.6em] animate-pulse">DEPLOYMENT_V_MATRIX</span>
              <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block opacity-60">LIVE_TELEMETRY: <span className="text-white">ON</span></span>
           </div>
        </div>
      </motion.section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 relative z-10">
         {[
           { icon: <Globe className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Global Reach", desc: "Operating in 100+ countries with localized fulfillment nodes to dramatically reduce sector deployment times." },
           { icon: <Clock className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Rapid Deployment", desc: "Express protocols active. Priority orders fulfill within 24-48 hours inside core urban sectors." },
           { icon: <ShieldCheck className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Secure Transit", desc: "All shipments secured using military-grade packaging protocols. Full operative tracking." },
           { icon: <Package className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Stealth Packaging", desc: "Available for special operations. Gear arrives in unmarked, resilient tech-woven containers." },
           { icon: <Truck className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Freight Protocols", desc: "Complimentary ground-level transport enabled for all orders exceeding operational payload thresholds (100+ credits)." },
           { icon: <MapPin className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Live Tracking", desc: "Direct neural-link to courier network. Access real-time GPS nodes via your central dashboard." },
         ].map((card, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, scale: 0.95, y: 50 }}
             whileInView={{ opacity: 1, scale: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
             className="p-12 xl:p-16 border border-editorial-border bg-editorial-bg rounded-[3rem] hover:border-red-500/40 transition-all duration-[1000ms] ease-[0.16,1,0.3,1] group cursor-crosshair shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_100px_rgba(220,38,38,0.2)] transform-gpu hover:-translate-y-4 relative overflow-hidden flex flex-col justify-between backdrop-blur-2xl"
           >
              <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_linear_infinite] transition-opacity duration-1000 pointer-events-none mix-blend-screen" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-red-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-screen pointer-events-none" />
              <div>
                <div className="mb-12 bg-editorial-bg p-8 rounded-[2rem] border border-editorial-border w-fit group-hover:border-red-500/40 group-hover:bg-red-950/20 shadow-[0_10px_30px_rgba(0,0,0,0.08)] group-hover:shadow-[0_0_50px_rgba(220,38,38,0.3)] transition-all duration-[1000ms] relative z-10">
                  {card.icon}
                </div>
                <h3 className="text-3xl xl:text-5xl font-black uppercase mb-8 tracking-tighter text-editorial-text transition-colors duration-[1000ms] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] relative z-10 leading-none group-hover:text-red-100">{card.title}</h3>
                <p className="text-xl xl:text-2xl text-editorial-text-muted font-light leading-relaxed relative z-10">{card.desc}</p>
              </div>
              <div className="mt-16 w-full h-[4px] bg-editorial-text/5 group-hover:bg-red-500/20 transition-colors duration-[1000ms] relative overflow-hidden rounded-full">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-400 w-0 group-hover:w-full transition-all duration-[1500ms] ease-[0.16,1,0.3,1] shadow-[0_0_15px_#dc2626]" />
             </div>
           </motion.div>
         ))}
      </div>

      {/* Expanded Infrastructure View */}
      <section className="mt-40 space-y-24">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="w-12 h-[2px] bg-red-600" />
                    <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-[0.4em] font-black">Infrastructure_Allocation</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-editorial-text">Sector Fulfillment <span className="text-red-600 italic">Matrix</span></h2>
            </div>
            <div className="flex gap-4 p-4 bg-editorial-bg/60 border border-editorial-border rounded-2xl backdrop-blur-xl">
                 <div className="flex flex-col gap-1 pr-6 border-r border-editorial-border">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">ACTIVE_HUBS</span>
                    <span className="text-2xl font-black text-white">24</span>
                 </div>
                 <div className="flex flex-col gap-1 px-6">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">AVG_TRANSIT</span>
                    <span className="text-2xl font-black text-red-500">2.4d</span>
                 </div>
            </div>
         </div>

         <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-editorial-surface/40 border border-editorial-border rounded-[3rem] p-10 lg:p-16 relative overflow-hidden group/pipeline shadow-depth-3">
               <div className="absolute top-0 right-0 p-10 opacity-5">
                   <Package className="w-40 h-40" />
               </div>
               <h3 className="text-sans font-black text-4xl uppercase tracking-tight text-white mb-10 flex items-center gap-5">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  Pipeline_Flow
               </h3>
               
               <div className="space-y-8 relative z-10">
                  {[
                    { label: "Intake_Protocol", status: "Active", progress: 100 },
                    { label: "Molecular_Scanning", status: "Active", progress: 100 },
                    { label: "Secure_Encapsulation", status: "Active", progress: 85 },
                    { label: "Sector_Routing", status: "Pending", progress: 0 },
                  ].map((step, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between items-center text-[11px] font-mono font-black uppercase tracking-widest">
                            <span className="text-editorial-text-muted">{step.label}</span>
                            <span className={step.progress === 100 ? "text-emerald-500" : "text-red-500"}>{step.status}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${step.progress}%` }}
                                transition={{ duration: 1.5, delay: i * 0.2 }}
                                className={`h-full ${step.progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-600 shadow-[0_0_10px_#dc2626]'}`}
                            />
                        </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-editorial-bg border border-editorial-border rounded-[3rem] p-10 lg:p-16 relative overflow-hidden group/sectors shadow-depth-3">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
               <h3 className="text-sans font-black text-4xl uppercase tracking-tight text-white mb-10">Global_Sectors</h3>
               <div className="grid grid-cols-2 gap-6 relative z-10">
                  {[
                    { node: "Sector_Alpha", region: "NA_WEST", status: "OPTIMAL" },
                    { node: "Sector_Delta", region: "EU_CENTRAL", status: "NOMINAL" },
                    { node: "Sector_Sigma", region: "ASIA_SOUTH", status: "PEAK_LOAD" },
                    { node: "Sector_Omega", region: "AU_EAST", status: "OPTIMAL" },
                  ].map((node, i) => (
                    <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-red-500/20 transition-all group/node">
                        <div className="flex justify-between items-start mb-4">
                            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-black">{node.region}</span>
                            <div className={`w-2 h-2 rounded-full ${node.status === 'PEAK_LOAD' ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
                        </div>
                        <h4 className="text-editorial-text font-black text-xl uppercase tracking-tighter mb-2">{node.node}</h4>
                        <span className={`text-[10px] font-mono font-bold tracking-widest ${node.status === 'PEAK_LOAD' ? 'text-yellow-500' : 'text-zinc-600'}`}>{node.status}</span>
                    </div>
                  ))}
               </div>
               <div className="mt-10 p-6 border border-editorial-border bg-editorial-surface/40 rounded-3xl text-center">
                   <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-black">All Sectors Synchronized // {new Date().toLocaleTimeString()}</p>
               </div>
            </div>
         </div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-32 xl:mt-48 p-16 xl:p-24 border border-editorial-border bg-editorial-bg relative overflow-hidden rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] group"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent pointer-events-none transition-opacity duration-1000 group-hover:opacity-100 opacity-50 mix-blend-screen" />
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent opacity-50" />
        <div className="max-w-6xl relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16 mx-auto">
           <div className="text-center xl:text-left">
             <div className="flex items-center gap-4 mb-8 justify-center xl:justify-start">
               <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#dc2626]" />
               <span className="font-mono text-[12px] text-red-500 font-bold uppercase tracking-[0.4em]">Override_Enabled</span>
             </div>
             <h2 className="text-6xl xl:text-8xl font-black uppercase tracking-tighter mb-8 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] leading-[0.9]">Urgent Supply <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)] pb-4 inline-block mt-2">Request?</span></h2>
             <p className="text-editorial-text-muted font-light max-w-2xl text-xl xl:text-2xl leading-relaxed mx-auto xl:mx-0 border-l border-red-500/30 pl-6">
               If your sector requires immediate supply payload drops, please contact logistics support directly. Our operatives are standing by to override standard protocols.
             </p>
           </div>
           <MagneticWrapper>
             <button className="px-16 py-10 bg-red-600 text-white font-black uppercase tracking-[0.4em] text-[14px] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-[800ms] ease-[0.16,1,0.3,1] rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.4)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] relative flex items-center justify-center gap-5 w-full md:w-auto overflow-hidden group/btn border-b-[4px] border-red-800 active:border-b-0 active:translate-y-[2px] transform-gpu hover:-translate-y-2">
               <span className="relative z-10 flex items-center gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] group-hover/btn:drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
                  <ShieldCheck className="w-6 h-6"/> Contact Logistics Node
               </span>
               <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
             </button>
           </MagneticWrapper>
        </div>
      </motion.div>
    </div>
  );
}
