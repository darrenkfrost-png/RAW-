import React from 'react';
import { motion } from 'motion/react';
import Breadcrumb from '../components/Breadcrumb';
import { Activity, Zap, RefreshCw, Layers } from 'lucide-react';

const systems = [
  {
    id: '01',
    title: 'TRAIN',
    subtitle: 'Sport, combat, discipline, strength, movement.',
    description: 'The foundation of output. We build gear and systems designed for the harsh realities of physical exertion and combat sports. No compromises, just resilience.',
    icon: Activity,
    color: 'text-red-500',
    bg: 'bg-red-500/10'
  },
  {
    id: '02',
    title: 'FUEL',
    subtitle: 'Nutrients, hydration, protein, adaptogens, minerals.',
    description: 'What you put in determines what you get out. Our formulations are stripped of filler and engineered with clinically studied compounds to support cellular energy, power output, and cognitive drive.',
    icon: Zap,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: '03',
    title: 'RECOVER',
    subtitle: 'Sleep, cold exposure, magnesium, nervous system regulation.',
    description: 'Growth happens in the silence. Mastering the parasympathetic state is critical. We provide the tools for active restoration, thermal stress adaptation, and deep sleep architecture.',
    icon: RefreshCw,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    id: '04',
    title: 'REPEAT',
    subtitle: 'Consistency, tracking, protocol building, output optimisation.',
    description: 'Discipline is the sustained application of the system. Build your protocol, adhere to it relentlessly, and compound your gains over time.',
    icon: Layers,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  }
];

export default function PerformanceSystem() {
  return (
    <div className="min-h-svh bg-editorial-bg pt-40 pb-32 font-sans overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_var(--tw-gradient-stops))] from-red-600/[0.08] via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      </div>

      <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative z-10">
        <Breadcrumb items={[{ label: 'System', active: true }]} />
        
        {/* Hero: Neural Architecture */}
        <div className="text-center mb-40 relative">
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-4 px-6 py-3 bg-editorial-bg rounded-full border border-editorial-border-light mb-12 backdrop-blur-3xl shadow-depth-2"
           >
              <div className="relative">
                 <div className="w-3 h-3 rounded-full bg-red-600 animate-ping absolute inset-0" />
                 <div className="w-3 h-3 rounded-full bg-red-600 relative" />
              </div>
              <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black">THE_PERFORMANCE_SYSTEM</span>
           </motion.div>
           
           <h1 className="font-black text-editorial-text uppercase tracking-tighter mb-12 leading-[0.8] relative text-display-lg">
             <motion.span 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="block"
             >OPERATIONAL</motion.span>
             <motion.span 
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
               className="text-red-600 block italic -mt-2 drop-shadow-[0_0_50px_rgba(220,38,38,0.3)]"
             >SYSTEMS</motion.span>
           </h1>

           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.5 }}
             className="text-editorial-text-muted font-medium max-w-3xl mx-auto text-lg md:text-xl leading-relaxed uppercase tracking-tight"
           >
             Performance does not exist in isolation. It requires a holistic integration of athletic culture, recovery science, and cognitive readiness.
           </motion.p>

           {/* Hero Accents */}
           <div className="absolute top-1/2 left-0 w-32 h-[1px] bg-red-600/20 -translate-y-1/2 hidden lg:block" />
           <div className="absolute top-1/2 right-0 w-32 h-[1px] bg-red-600/20 -translate-y-1/2 hidden lg:block" />
        </div>

        {/* System Grid: The OS Vibe */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 relative pb-20">
          
          {/* Connector Matrix */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none border-x border-editorial-border mx-auto max-w-[0.5px]" />
          <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-red-600/20 to-transparent pointer-events-none" />

          {systems.map((sys, idx) => (
            <motion.div 
              key={sys.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group relative"
            >
               {/* Background Glow */}
               <div className={`absolute -inset-2 bg-gradient-to-br from-red-600/0 to-red-600/0 group-hover:from-red-600/10 transition-all duration-1000 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100`} />

               <div className="p-10 lg:p-14 bg-editorial-bg/60 border border-editorial-border rounded-[3rem] hover:border-red-600/40 transition-all duration-1000 group relative overflow-hidden backdrop-blur-3xl shadow-depth-1 hover:shadow-premium">
                  
                  {/* Tactical ID */}
                  <div className="absolute top-10 right-10 flex flex-col items-end opacity-20 group-hover:opacity-100 transition-opacity duration-700">
                     <span className="font-mono font-black text-editorial-text leading-none text-display-sm">0{idx + 1}</span>
                     <div className="h-[2px] w-20 bg-red-600 mt-2 scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-700" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-8 mb-16">
                     <div className="relative w-20 h-20 flex items-center justify-center bg-editorial-bg rounded-[2rem] border border-editorial-border-light shadow-depth-2 group-hover:scale-110 transition-transform duration-700">
                        <div className="absolute inset-0 bg-red-600/5 rounded-[2rem] animate-pulse" />
                        <sys.icon className={`w-8 h-8 text-editorial-text group-hover:text-red-500 transition-colors duration-700`} />
                     </div>
                     <div className="h-[1px] flex-1 bg-editorial-text/5 group-hover:bg-red-600/20 transition-colors duration-700" />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-8">
                    <div>
                       <h2 className="text-4xl lg:text-5xl font-black text-editorial-text uppercase tracking-tighter mb-4 transition-colors duration-700 group-hover:text-editorial-text">{sys.title}</h2>
                       <p className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-[0.4em] font-black">{sys.subtitle}</p>
                    </div>

                    <p className="text-editorial-text-muted font-medium leading-relaxed text-base lg:text-lg">
                       {sys.description}
                    </p>

                    {/* Telemetry Dots */}
                    <div className="pt-8 flex flex-wrap gap-3">
                       {['HORMESIS', 'ADAPTATION', 'OUTPUT', 'RECOVERY'].map((tag, i) => (
                         <div key={i} className="px-4 py-2 bg-editorial-text/5 border border-editorial-border rounded-full font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-widest group-hover:border-red-600/20 group-hover:text-editorial-text transition-all duration-700">
                            {tag}_INIT
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Geometric Accents */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 opacity-10 group-hover:opacity-100 transition-all duration-1000">
                     <div className="absolute right-0 bottom-0 w-full h-[1px] bg-red-600" />
                     <div className="absolute right-0 bottom-0 h-full w-[1px] bg-red-600" />
                  </div>

                  {/* Scanline Effect */}
                  <div className="absolute inset-x-0 h-[100%] bg-gradient-to-b from-transparent via-red-600/[0.03] to-transparent -top-full group-hover:top-full transition-all duration-[2000ms] pointer-events-none" />
               </div>
            </motion.div>
          ))}
        </div>

        {/* Global Footer Accent */}
        <div className="mt-32 pt-20 border-t border-editorial-border text-center relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent shadow-[0_0_20px_rgba(220,38,38,0.3)]" />
           <div className="flex flex-col items-center gap-8">
              <p className="font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-[0.3em] sm:tracking-[0.8em] [overflow-wrap:anywhere] font-black">CONTINUOUS_SYSTEM_UPGRADE</p>
              <div className="flex gap-4">
                 {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-6 bg-red-600/20 border border-editorial-border" />)}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
