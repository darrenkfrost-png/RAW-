import { Atmosphere } from '../components/common/Atmosphere';
import Breadcrumb from '../components/Breadcrumb';
import { motion } from "motion/react";
import { useUI } from '../context/UIContext';
import { BookOpen, Volume2 } from 'lucide-react';

export default function Manifesto() {
  const { setActiveReaderItem } = useUI();

  const manifestoReaderItem = {
    id: "raw-manifesto",
    name: "RAW SYSTEM MANIFESTO",
    overview: "We do not exist to maintain the status quo. We are the anomaly in the system. The override switch. We engineer supplements and gear for those who break boundaries, defy limits, and rewrite their own reality.",
    whatItDoes: "Every formula, every thread, every piece of hardware we deploy is meticulously tested in the most demanding combat and recovery scenarios. We do not compromise because the mission does not allow for failure.",
    keyBenefits: [
      "Breaks conventional training boundaries.",
      "Eliminates compromise in active-duty performance.",
      "Forces systemic adaptation and rapid restoration.",
      "Secures absolute operational sovereignty."
    ],
    suggestedUse: "Absorb this text daily before training. Let the conviction settle into your subconscious. Execute with relentless intent and total discipline.",
    responsibleUse: "Do not use these directives as mere motivation. They are code execution coordinates. Apply them strictly to your physiological threshold."
  };

  return (
    <div className="pt-32 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-svh relative overflow-hidden bg-editorial-bg">
      <div className="absolute top-0 left-1/2 -ml-[500px] w-[1200px] h-[1200px] bg-red-900/10 blur-[300px] pointer-events-none rounded-full z-0 mix-blend-screen" />
      <div className="absolute top-[30%] -right-[200px] w-[1000px] h-[1000px] bg-red-950/20 blur-[250px] pointer-events-none rounded-full z-0 mix-blend-screen" />
      <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
      
      <div className="relative z-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <Breadcrumb items={[{ label: 'System', path: '/' }, { label: 'Manifesto', active: true }]} />
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveReaderItem(manifestoReaderItem)}
          className="inline-flex items-center gap-3 bg-red-950/30 hover:bg-red-900/20 border border-red-500/30 text-red-500 hover:text-white px-6 py-3.5 rounded-full font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] shadow-[0_10px_25px_rgba(220,38,38,0.15)] hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)] transition-all duration-300 backdrop-blur-md cursor-pointer group"
        >
          <Volume2 className="w-4 h-4 animate-pulse shrink-0" />
          <span>Vocalize_Core_Narrative</span>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto text-center mb-32 xl:mb-48 relative z-10"
      >
        <div className="flex items-center justify-center gap-5 mb-14 border border-editorial-border bg-editorial-bg/50 backdrop-blur-md w-fit mx-auto px-8 py-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
           <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
           <span className="font-mono text-[0.8125rem] text-red-500 font-black tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] block uppercase drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">Core_Directive // M-001</span>
        </div>
        <h1 className="font-black uppercase tracking-[-0.04em] leading-[0.8] text-editorial-text drop-shadow-[0_15px_40px_rgba(0,0,0,0.15)] relative z-10 px-4 mb-20 text-display-2xl">
          The<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-900 drop-shadow-[0_0_50px_rgba(220,38,38,0.5)] inline-block pb-8 mt-4 relative z-10">Manifesto</span>
          <div className="absolute top-1/2 left-0 w-full h-[400px] bg-red-900/10 blur-[200px] -z-10 mix-blend-screen pointer-events-none" />
        </h1>
      </motion.div>

      <div className="max-w-6xl mx-auto space-y-32 xl:space-y-40 text-3xl font-light leading-snug xl:leading-tight text-editorial-text relative z-10 px-4 text-display-sm">
         <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="relative group"
         >
           <div className="absolute -left-6 md:-left-12 top-0 bottom-0 w-1.5 bg-red-600 shadow-[0_0_20px_#dc2626] transform origin-top group-hover:scale-y-110 transition-transform duration-[1000ms] ease-[0.16,1,0.3,1] rounded-full" />
           <p className="pl-8 md:pl-16 py-8 bg-gradient-to-r from-red-900/10 via-red-900/5 to-transparent rounded-r-[3rem] text-editorial-text font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] leading-[1.3] border border-editorial-border border-l-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.08)]">
             We do not exist to maintain the status quo. We are the anomaly in the system. The override switch. We engineer supplements and gear for those who break boundaries, defy limits, and rewrite their own reality.
           </p>
         </motion.div>

         <motion.p
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="text-editorial-text-muted drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] max-w-5xl tracking-tight leading-[1.35] pl-8 md:pl-16 xl:pl-24 border-l border-editorial-border py-4"
         >
           Every formula, every thread, every piece of hardware we deploy is meticulously tested in the most demanding combat and recovery scenarios. We do not compromise because the mission does not allow for failure.
         </motion.p>
         
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-200px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative p-6 sm:p-12 md:p-32 xl:p-48 border border-editorial-border bg-editorial-bg text-red-500 my-24 sm:my-48 xl:my-64 overflow-hidden shadow-[0_40px_120px_rgba(220,38,38,0.2)] group rounded-[2rem] sm:rounded-[4rem]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-[#050505] to-editorial-bg opacity-90 pointer-events-none z-0 mix-blend-screen" />
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        
        {/* Animated Borders */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-1000 shadow-[0_0_20px_#dc2626] mix-blend-screen" />
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-1000 shadow-[0_0_20px_#dc2626] mix-blend-screen" />
        <div className="absolute left-0 inset-y-0 w-[2px] bg-gradient-to-b from-transparent via-red-600 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-1000 shadow-[0_0_20px_#dc2626] mix-blend-screen" />
        <div className="absolute right-0 inset-y-0 w-[2px] bg-gradient-to-b from-transparent via-red-600 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-1000 shadow-[0_0_20px_#dc2626] mix-blend-screen" />
        
        {/* Corner Accents */}
        <div className="absolute top-10 left-10 w-[3px] h-[50px] bg-red-600 shadow-[0_0_20px_#dc2626] transition-opacity duration-700 z-20 rounded-full" />
        <div className="absolute top-10 left-10 h-[3px] w-[50px] bg-red-600 shadow-[0_0_20px_#dc2626] transition-opacity duration-700 z-20 rounded-full" />
        <div className="absolute bottom-10 right-10 w-[3px] h-[50px] bg-red-600 shadow-[0_0_20px_#dc2626] transition-opacity duration-700 z-20 rounded-full" />
        <div className="absolute bottom-10 right-10 h-[3px] w-[50px] bg-red-600 shadow-[0_0_20px_#dc2626] transition-opacity duration-700 z-20 rounded-full" />
        
        <p className="relative z-30 text-center leading-[1.05] font-black text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] max-w-[1400px] mx-auto uppercase tracking-[-0.03em] mix-blend-screen mt-4 text-display-lg [overflow-wrap:anywhere]">
            "Purity is our weapon.<br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 drop-shadow-[0_10px_40px_rgba(220,38,38,0.8)] block my-16 xl:my-24 hover:scale-105 transition-transform duration-[1500ms] ease-[0.16,1,0.3,1] relative inline-block py-4 z-10 text-display-lg">Performance is our mandate.</span><br /> Only the elite survive the algorithm."
        </p>
      </motion.div>

         <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="text-editorial-text-muted drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] tracking-tight leading-[1.35] pl-8 md:pl-16 xl:pl-24 border-l border-red-500/30 py-4 max-w-6xl relative"
         >
           <div className="absolute -left-[1.5px] top-4 bottom-4 w-[3px] bg-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.5)] rounded-full hidden md:block" />
           <p>This is not a community. It is a syndicate of high-performers operating at peak frequency. By equipping yourself with RAW gear, you accept the protocol: endless iteration, relentless optimization, and total systemic dominance.</p>
         </motion.div>
      </div>
    </div>
  );
}
