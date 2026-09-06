import { Atmosphere } from '../components/common/Atmosphere';
import Breadcrumb from '../components/Breadcrumb';
import { motion } from "motion/react";
import { Truck, Globe, ShieldCheck, Clock, MapPin, Package } from "lucide-react";
import MagneticWrapper from "../components/MagneticWrapper";
import { Link } from "react-router-dom";

export default function Logistics() {
  /**
   * ⚠️ TWO CLAIMS ON THIS PAGE WERE CORRECTED, AND TWO ARE LEFT FOR THE FOUNDER.
   *
   * Corrected, because they were not judgement calls:
   *  · "Complimentary ground-level transport … (100+ credits)" priced a free
   *    delivery threshold in an INVENTED CURRENCY. Every price on this site is
   *    in pounds, so the threshold meant nothing to a customer trying to reach
   *    it. Now states that the threshold is confirmed at checkout.
   *  · "Live Tracking — direct neural-link to courier network. Access
   *    real-time GPS nodes via your central dashboard" promised a feature that
   *    does not exist: there is no tracking anywhere in the account area, which
   *    correctly reports an empty history. Replaced with what actually happens.
   *
   * Left alone, because only the founder knows whether they are true, and both
   * are commitments to a customer rather than brand voice:
   *  · "Operating in 100+ countries with localized fulfillment nodes."
   *  · "Priority orders fulfill within 24-48 hours inside core urban sectors."
   *    Stated delivery times form part of the contract under UK consumer law.
   */
  return (
    <div className="pt-32 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-svh relative bg-editorial-bg">
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
        <span className="font-mono text-[0.8125rem] text-red-500 font-bold tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] mb-12 block uppercase flex items-center gap-5 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-editorial-border bg-editorial-bg/50 backdrop-blur-md w-fit px-8 py-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" />
          System_Protocol // L-001
        </span>
        <h1 className="font-black uppercase tracking-[-0.03em] mb-12 leading-[0.8] text-editorial-text drop-shadow-[0_15px_40px_rgba(0,0,0,0.1)] relative text-display-xl">
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
        className="mb-40 h-[400px] md:h-[600px] xl:h-[800px] border border-editorial-border rounded-[4rem] relative overflow-hidden group/map shadow-depth-3 opacity-[0.98]"
      >
        <Atmosphere glowOpacity={0.03} gridMode="dots" intensity="medium" />
        <div className="absolute inset-0 bg-editorial-bg opacity-40 pointer-events-none" />
        
        {/* Abstract Map Grid */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-10 opacity-20">
            <div className="w-full h-full border border-white/5 flex items-center justify-center rounded-[3rem] relative overflow-hidden">
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
                 <span className="font-mono text-[0.6875rem] text-editorial-text font-black tracking-widest uppercase">{point.label}</span>
              </div>
           </motion.div>
        ))}

        <div className="absolute top-10 right-10 xl:top-20 xl:right-20 pointer-events-none">
           <div className="flex flex-col gap-4 text-right">
              <span className="font-mono text-[0.6875rem] text-red-600 font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere]">DEPLOYMENT_V_MATRIX</span>
           </div>
        </div>
      </motion.section>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-12 relative z-10">
         {[
           { icon: <Globe className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Global Reach", desc: "Operating in 100+ countries with localized fulfillment nodes to dramatically reduce sector deployment times." },
           { icon: <Clock className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Rapid Deployment", desc: "Express protocols active. Priority orders fulfill within 24-48 hours inside core urban sectors." },
           { icon: <ShieldCheck className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Secure Transit", desc: "All shipments secured using military-grade packaging protocols. Full operative tracking." },
           { icon: <Package className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Stealth Packaging", desc: "Available for special operations. Gear arrives in unmarked, resilient tech-woven containers." },
           { icon: <Truck className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Freight Protocols", desc: "Free standard delivery on larger orders. The exact threshold is confirmed at checkout." },
           { icon: <MapPin className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-[800ms] drop-shadow-[0_0_15px_currentColor]" />, title: "Tracking", desc: "Once an order ships you are sent a tracking link by the courier." },
         ].map((card, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, scale: 0.95, y: 50 }}
             whileInView={{ opacity: 1, scale: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
             className="fits-its-column p-6 sm:p-8 xl:p-12 border border-editorial-border bg-editorial-bg rounded-[3rem] hover:border-red-500/40 transition-all duration-[1000ms] ease-[0.16,1,0.3,1] group shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_100px_rgba(220,38,38,0.2)] transform-gpu relative overflow-hidden flex flex-col justify-between backdrop-blur-2xl"
           >
              <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_linear_infinite] transition-opacity duration-1000 pointer-events-none mix-blend-screen" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-red-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-screen pointer-events-none" />
              <div>
                <div className="mb-12 bg-editorial-bg p-8 rounded-[2rem] border border-editorial-border w-fit group-hover:border-red-500/40 group-hover:bg-red-950/20 shadow-[0_10px_30px_rgba(0,0,0,0.08)] group-hover:shadow-[0_0_50px_rgba(220,38,38,0.3)] transition-all duration-[1000ms] relative z-10">
                  {card.icon}
                </div>
                <h3 className="title-fit-lg font-black uppercase mb-8 tracking-tighter text-editorial-text transition-colors duration-[1000ms] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] relative z-10 leading-none group-hover:text-red-100">{card.title}</h3>
                <p className="text-xl xl:text-2xl text-editorial-text-muted font-light leading-relaxed relative z-10">{card.desc}</p>
              </div>
              <div className="mt-16 w-full h-[4px] bg-editorial-text/5 group-hover:bg-red-500/20 transition-colors duration-[1000ms] relative overflow-hidden rounded-full">
                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-400 w-0 group-hover:w-full transition-all duration-[1500ms] ease-[0.16,1,0.3,1] shadow-[0_0_15px_#dc2626]" />
             </div>
           </motion.div>
         ))}
      </div>

      {/* Fulfillment figures: typed constants, not read from any system.
          Left in place as a business claim for the founder to confirm or
          remove, like the two claims noted at the top of this file. */}
      <section className="mt-40">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="w-12 h-[2px] bg-red-600" />
                    <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-[0.4em] font-black">Infrastructure_Allocation</span>
                </div>
                <h2 className="font-black uppercase tracking-tighter text-editorial-text text-display-sm">Sector Fulfillment <span className="text-red-600 italic">Matrix</span></h2>
            </div>
            <div className="flex flex-wrap gap-4 p-4 bg-editorial-bg/60 border border-editorial-border rounded-2xl backdrop-blur-xl max-w-full">
                 <div className="flex flex-col gap-1 pr-6 border-r border-editorial-border">
                    <span className="text-[0.6875rem] font-mono text-zinc-600 uppercase tracking-widest">ACTIVE_HUBS</span>
                    <span className="text-2xl font-black text-white">24</span>
                 </div>
                 <div className="flex flex-col gap-1 px-6">
                    <span className="text-[0.6875rem] font-mono text-zinc-600 uppercase tracking-widest">AVG_TRANSIT</span>
                    <span className="text-2xl font-black text-red-500">2.4d</span>
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
               <span className="font-mono text-[0.75rem] text-red-500 font-bold uppercase tracking-[0.4em]">Override_Enabled</span>
             </div>
             <h2 className="font-black uppercase tracking-tighter mb-8 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] leading-[0.9] text-display-md">Urgent Supply <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)] pb-4 inline-block mt-2">Request?</span></h2>
             <p className="text-editorial-text-muted font-light max-w-2xl text-xl xl:text-2xl leading-relaxed mx-auto xl:mx-0 border-l border-red-500/30 pl-6">
               If your sector requires immediate supply payload drops, please contact logistics support directly. Our operatives are standing by to override standard protocols.
             </p>
           </div>
           <MagneticWrapper>
             <Link to="/contact" className="px-16 py-10 bg-red-600 text-white font-black uppercase tracking-[0.4em] text-[0.875rem] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-[800ms] ease-[0.16,1,0.3,1] rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.4)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] relative flex items-center justify-center gap-5 w-full md:w-auto overflow-hidden group/btn border-b-[4px] border-red-800 active:border-b-0 active:translate-y-[2px] transform-gpu hover:-translate-y-2">
               <span className="relative z-10 flex items-center gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] group-hover/btn:drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
                  <ShieldCheck className="w-6 h-6"/> Contact Logistics Node
               </span>
               <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
             </Link>
           </MagneticWrapper>
        </div>
      </motion.div>
    </div>
  );
}
