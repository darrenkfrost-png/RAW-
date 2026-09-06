import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumb from '../components/Breadcrumb';
import { BookOpen, FileText, ArrowRight, Target, Play, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Atmosphere } from '../components/common/Atmosphere';
import { machineText } from "../lib/machineText";

const categories = ['All', 'Training', 'Nutrition', 'Recovery', 'Sleep', 'Hydration'];

const intelNodes = [
  { id: 1, type: 'Recovery', title: 'Cold Exposure and the Parasympathetic System', excerpt: 'How thermal stress triggers advanced recovery states and regulates cortisol.', products: ['PRTCL_5'] },
  { id: 2, type: 'Nutrition', title: 'Creatine: Beyond Muscular Output', excerpt: 'The cognitive and cellular benefits of consistent creatine supplementation.', products: ['PRTCL_4'] },
  { id: 3, type: 'Training', title: 'Combat Training Recovery Essentials', excerpt: 'Managing impact stress and joint resilience after heavy sparring.', products: ['PRTCL_5', 'PRTCL_6'] },
  { id: 4, type: 'Hydration', title: 'Electrolytes: The Engine of Cellular Energy', excerpt: 'Why water alone drains your performance capacity during high output.', products: ['PRTCL_3'] },
  { id: 5, type: 'Nutrition', title: 'Building Your First Supplement Stack', excerpt: 'A zero-BS guide to foundational nutrition for new athletes.', products: ['PRTCL_1', 'PRTCL_3'] },
  { id: 6, type: 'Sleep', title: 'Nervous System Regulation Before Sleep', excerpt: 'Magnesium, melatonin, and the architecture of deep rest.', products: ['PRTCL_2'] },
];

const courses = [
  { id: 1, title: 'Tactical Conditioning // V1', level: 'Elite', modules: 12, instructor: 'Staff_O', status: 'Active' },
  { id: 2, title: 'Bio-Kinetic Restoration', level: 'Standard', modules: 8, instructor: 'N_Systems', status: 'Locked' },
  { id: 3, title: 'Combat Nutrition Architecture', level: 'Elite', modules: 14, instructor: 'Dietary_X', status: 'Active' },
];

export default function RawAcademy() {
  const [filter, setFilter] = useState('All');

  const filteredArticles = filter === 'All' 
    ? intelNodes 
    : intelNodes.filter(a => a.type === filter);

  return (
    <div className="min-h-svh bg-editorial-bg pt-32 pb-24 font-sans relative overflow-hidden">
      <Atmosphere glowOpacity={0.04} gridMode="dots" intensity="medium" />
      
      <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative z-10">
        <Breadcrumb items={[{ label: 'System', path: '/performance-system' }, { label: 'Academy', active: true }]} />
        
        {/* Cinematic Header Block */}
        <section className="mb-32">
            <div className="space-y-10">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_#dc2626]">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-mono text-[0.6875rem] text-red-500 uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black">Knowledge_Architecture</span>
               </div>
               <h1 className="font-black text-white uppercase tracking-tighter leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)] text-display-lg">
                  Raw <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900 italic">Academy</span>
               </h1>
               <p className="text-editorial-text-muted font-light max-w-xl text-xl leading-relaxed border-l-2 border-red-900/40 pl-10">
                 Elite performance requires elite understanding. Access our intelligence network on training, recovery, and clinical application.
               </p>
            </div>
        </section>

        {/* Featured Academy Modules */}
        <section className="mb-40 space-y-16">
            <div className="flex items-center gap-8">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white italic">Active_Modules</h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-red-600/50 to-transparent" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {courses.map((course) => (
                    <div key={course.id} className={`fits-its-column p-6 sm:p-8 xl:p-10 rounded-[2.5rem] border transition-all duration-700 group/course relative overflow-hidden ${
                        course.status === 'Locked' 
                        ? 'bg-editorial-bg border-editorial-border opacity-50 grayscale' 
                        : 'bg-editorial-surface/40 border-editorial-border hover:border-red-600/30 shadow-depth-2'
                    }`}>
                        <div className="absolute top-0 right-0 p-8 font-mono text-[0.6875rem] font-black italic text-zinc-800 opacity-20 uppercase tracking-widest">{course.instructor}</div>
                        <div className="flex flex-col h-full gap-8 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${course.status === 'Locked' ? 'bg-zinc-800/20' : 'bg-red-600/10'}`}>
                                {course.status === 'Locked' ? <Lock className="w-6 h-6 text-zinc-600" /> : <Play className="w-6 h-6 text-red-500" />}
                            </div>
                            <div className="space-y-4">
                                <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">{course.level}_PROGRAM // {course.modules}_DOCS</span>
                                <h3 className="title-fit-md font-black text-white uppercase tracking-tighter leading-tight group-hover/course:text-red-500 transition-colors">{course.title}</h3>
                            </div>
                            <div className="mt-auto space-y-3">
                                <button disabled aria-disabled="true" className={`w-full button-${course.status === 'Locked' ? 'secondary' : 'premium'} !py-4 !text-[0.6875rem] relative z-10 opacity-50 cursor-not-allowed`}>
                                    {machineText(course.status === 'Locked' ? 'PREMIUM_LOCKED' : 'LAUNCH_MODULE')}
                                </button>
                                <span className="block text-center font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] text-zinc-500">COMING_SOON</span>
                            </div>
                        </div>
                        {course.status !== 'Locked' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover/course:opacity-100 transition-opacity pointer-events-none" />
                        )}
                    </div>
                ))}
            </div>
        </section>

        {/* Intelligence Filters */}
        <section className="mb-24 space-y-12">
            <div className="flex flex-wrap gap-4 items-center justify-center relative z-10 p-4 bg-editorial-surface/20 backdrop-blur-3xl border border-editorial-border rounded-full w-fit mx-auto">
              {categories.map((c) => (
                 <button 
                   key={c} 
                   onClick={() => setFilter(c)}
                   aria-pressed={filter === c}
                   className={`px-8 py-3 rounded-full font-mono text-[0.6875rem] uppercase font-black tracking-[0.2em] transition-all active:scale-95 ${
                     filter === c 
                     ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                     : 'text-zinc-500 hover:text-white hover:bg-white/5'
                   }`}
                 >
                    {c}
                 </button>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="text-center py-32 bg-editorial-bg border border-editorial-border rounded-[3rem] border-dashed"
              >
                 <span className="font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-widest font-black italic">NO_INTEL_NODES_ALLOCATED_TO_PARAMETER</span>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10 relative z-10">
               <AnimatePresence mode="popLayout">
                 {filteredArticles.map((article) => (
                   <motion.div 
                     layout
                     key={article.id}
                     initial={{ opacity: 0, y: 30 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                     className="fits-its-column bg-editorial-bg border border-editorial-border shadow-depth-2 rounded-[2.5rem] p-6 sm:p-8 xl:p-10 hover:border-red-600/40 hover:bg-editorial-surface/20 transition-all duration-700 group flex flex-col relative"
                   >
                      <div className="flex items-center justify-between mb-10 relative z-10 font-mono text-[0.6875rem] font-black">
                         <div className="flex items-center gap-4">
                           <span className="w-10 h-10 rounded-xl bg-red-900/20 border border-red-500/20 flex items-center justify-center">
                             <FileText className="w-4 h-4 text-red-500" />
                           </span>
                           <span className="text-zinc-500 uppercase tracking-widest">{article.type}</span>
                         </div>
                      </div>
                      
                      <h3 className="title-fit-md font-black text-white uppercase tracking-tighter mb-6 group-hover:text-red-500 transition-colors leading-tight relative z-10 transition-transform duration-700 group-hover:-translate-y-1">{article.title}</h3>
                      <p className="text-editorial-text-muted font-light leading-relaxed mb-12 flex-1 relative z-10 border-l-[3px] border-red-600/20 pl-8 capitalize">
                         "{article.excerpt}"
                      </p>
                      
                      <div className="mt-auto pt-8 border-t border-editorial-border relative z-10 space-y-6">
                         <Link to="/knowledge-core" className="flex items-center justify-between font-mono text-[0.6875rem] text-white uppercase tracking-widest font-black group/link hover:text-red-500 transition-colors">
                           <span>Read Doctrine_v.01</span>
                           <div className="flex gap-2">
                               <ArrowRight className="w-4 h-4 group-hover/link:translate-x-3 transition-transform" />
                               <div className="w-4 h-[1px] bg-red-500 self-center opacity-0 group-hover/link:opacity-100 transition-opacity" />
                           </div>
                         </Link>

                         <div className="flex flex-wrap gap-2 pt-6 border-t border-editorial-border border-dashed">
                            <span className="w-full text-[0.6875rem] font-mono text-zinc-700 uppercase tracking-[0.4em] mb-2 font-black italic">PROTOCOL_SYSLINK:</span>
                            {article.products.map(pid => (
                               <Link key={pid} to={`/knowledge-core?id=${pid}`} className="px-4 py-1.5 bg-white/5 hover:bg-red-600/20 border border-editorial-border-light hover:border-red-500/50 rounded-xl text-[0.6875rem] font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-all flex items-center gap-2 group/tag">
                                 <Target className="w-3 h-3 group-hover/tag:scale-125 transition-transform" /> {pid}
                               </Link>
                            ))}
                         </div>
                      </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
        </section>

      </div>
    </div>
  );
}
