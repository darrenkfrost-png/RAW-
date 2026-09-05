import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumb from '../components/Breadcrumb';
import { Database, Search, ArrowRight, ShieldCheck, Copy, Plus, Activity, BookOpen } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { rawProductContentBank as part1 } from '../data/rawProductContent';
import { rawProductContentBank2 } from '../data/rawProductContent2';
import { rawProductContentBank3 } from '../data/rawProductContent3';
import { rawProductContentBank4 } from '../data/rawProductContent4';
import { rawProductContentBank5 } from '../data/rawProductContent5';
import { allProducts } from '../data/products';
import { useUI } from '../context/UIContext';
import { useToast } from '../components/common/Toast';

const rawProductContentBank = [
  ...part1,
  ...rawProductContentBank2,
  ...rawProductContentBank3,
  ...rawProductContentBank4,
  ...rawProductContentBank5
].map(item => {
  // Every content record shares its name with a product in products.ts, which
  // already carries the real category — so the shop and this index agree.
  // (Keyword-guessing from the name put Capsules under Apparel and left the
  // Combat filter permanently empty.)
  const product = allProducts.find(p => p.name === item.name);
  return { ...item, category: product?.category ?? 'Nutrients', productId: product?.id };
});

export default function KnowledgeCore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  // The Academy links here as /knowledge-core?id=PRTCL_x — arrive with that entry open and in view.
  const [searchParams] = useSearchParams();
  const [expandedId, setExpandedId] = useState<string | null>(() => searchParams.get('id'));
  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;
    const el = document.getElementById('kc-' + id);
    if (el) el.scrollIntoView({ block: 'center' });
  }, [searchParams]);
  
  const { setActiveReaderItem } = useUI();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const categories = ['All', 'Nutrients', 'Recovery', 'Accessories', 'Apparel', 'Combat'];

  const filteredContent = useMemo(() => {
    return rawProductContentBank.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.shortBenefit.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (item: any) => {
    const text = `PROTOCOL: ${item.name}\nBENEFIT: ${item.shortBenefit}\nOVERVIEW: ${item.overview}`;
    navigator.clipboard.writeText(text)
      .then(() => addToast(`${item.name} intelligence copied.`, 'success'))
      .catch(() => addToast('Copy failed — clipboard access was refused.', 'error'));
  };

  return (
    <div className="min-h-svh bg-editorial-bg pt-32 pb-24 font-sans px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)]">
      <div className="max-w-[var(--content-max-width)] mx-auto">
        <Breadcrumb items={[{ label: 'System', path: '/performance-system' }, { label: 'Knowledge Core', active: true }]} />
        
        {/* Header */}
        <div className="text-center mb-24 relative z-10 space-y-8">
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex justify-center items-center gap-5"
           >
              <div className="flex gap-1.5">
                {[1,2,3].map(i => <div key={i} className={`w-1 h-4 bg-red-600 ${i === 2 ? 'animate-pulse' : ''}`} />)}
              </div>
              <span className="font-mono text-[0.6875rem] text-editorial-accent uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black">PRODUCT_INTEL_BANK</span>
           </motion.div>
           <motion.h1 
             initial={{ scale: 1.05, opacity: 0, filter: "blur(10px)" }}
             animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
             transition={{ duration: 1.2 }}
             className="font-black text-editorial-text uppercase tracking-[-0.05em] leading-[0.8] drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-display-lg"
           >
             Knowledge Core
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="text-editorial-text-muted font-mono text-[0.6875rem] md:text-[0.8125rem] tracking-[0.3em] uppercase max-w-2xl mx-auto leading-relaxed border-y border-editorial-border py-8"
           >
             Complete intelligence indexing. Access protocol methodologies, product applications, and pairing directives.
           </motion.p>
           <div className="font-mono text-[0.6875rem] text-red-500 tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] font-black flex items-center justify-center gap-5">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_#dc2626]"></span>
              SYNCHRONIZED_UNITS: {filteredContent.length}
           </div>
        </div>

        {/* Filters & Search - Premium HUD Style */}
        <div className="mb-16 flex flex-col xl:flex-row gap-6 justify-between items-center bg-editorial-bg/60 backdrop-blur-3xl p-6 rounded-[2rem] border border-editorial-border-light relative z-20 shadow-premium">
           <div className="flex items-center gap-6 flex-1 w-full relative group/search">
             <Search className="w-6 h-6 text-zinc-600 group-focus-within/search:text-red-500 transition-colors absolute left-6" />
             <input 
               type="text" 
               placeholder="INITIALIZE_SEARCH_PROTOCOL..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               aria-label="Search knowledge base"
               className="w-full bg-editorial-bg border border-editorial-border rounded-2xl pl-16 pr-6 py-5 text-editorial-text focus:outline-none focus:border-red-500/50 transition-all font-mono text-[0.6875rem] uppercase tracking-[0.3em] font-black placeholder:text-zinc-800 shadow-inner focus:shadow-[0_0_30px_rgba(220,38,38,0.1)]"
             />
           </div>
           <div className="flex items-center gap-3 overflow-x-auto w-full xl:w-auto pb-4 xl:pb-0">
             {categories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={`shrink-0 px-8 py-5 rounded-2xl font-mono text-[0.6875rem] uppercase font-black tracking-[0.3em] transition-all duration-500 ${selectedCategory === cat ? 'bg-red-600 text-white shadow-[0_10px_20px_rgba(220,38,38,0.3)]' : 'bg-editorial-text/5 text-editorial-text-muted hover:text-editorial-text hover:border-editorial-border-light border border-transparent'}`}
                 aria-pressed={selectedCategory === cat}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>

        {/* Content Bank */}
        <div className="space-y-6 relative z-10">
          {filteredContent.map((item) => (
            <div key={item.id} id={'kc-' + item.id} className="bg-editorial-bg/40 backdrop-blur-3xl border border-editorial-border rounded-[2rem] overflow-hidden transition-all duration-[800ms] hover:border-red-500/30 hover:bg-editorial-surface/60 group/item shadow-depth-1">
               <button 
                 onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                 className="p-10 cursor-pointer flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10 group w-full text-left"
                 aria-expanded={expandedId === item.id}
                 aria-label={expandedId === item.id ? `Collapse details for ${item.name}` : `Expand details for ${item.name}`}
               >
                 <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-6">
                       <span className="font-mono text-[0.6875rem] text-red-500 font-black uppercase tracking-[0.4em] drop-shadow-[0_0_8px_currentColor]">DATA_ID: {item.id}</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                       <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-[0.4em] font-black group-hover:text-editorial-text transition-colors">{item.category}</span>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black text-editorial-text uppercase tracking-tighter group-hover:text-red-500 transition-all duration-700">{item.name}</h3>
                    <p className={`text-editorial-text-muted font-light text-lg ${expandedId === item.id ? '' : 'line-clamp-2 md:line-clamp-1'} md:group-hover:line-clamp-none transition-all duration-[1000ms] leading-relaxed group-hover:text-editorial-text`}>{item.shortBenefit}</p>
                 </div>
                 <div className="shrink-0 flex items-center justify-center w-16 h-16 bg-editorial-text/5 rounded-full group-hover:bg-red-600 group-hover:text-white transition-all duration-700 border border-editorial-border group-hover:border-editorial-border-light shadow-depth-1">
                    <ArrowRight className={`w-6 h-6 transition-transform duration-700 ease-[0.16,1,0.3,1] ${expandedId === item.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} aria-hidden="true" />
                 </div>
               </button>

               <AnimatePresence>
                 {expandedId === item.id && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                     className="overflow-hidden border-t border-editorial-border"
                   >
                      <div className="p-10 xl:p-16 bg-editorial-bg/50 backdrop-blur-3xl relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.02] to-transparent pointer-events-none" />
                        
                        {/* Quick Actions Row */}
                        <div className="flex flex-wrap items-center gap-4 mb-16 border-b border-editorial-border-light pb-12 relative z-10">
                           <button onClick={() => navigate(item.productId != null ? `/product/${item.productId}` : '/shop')} className="button-premium" aria-label={`View ${item.name} in Shop`}>
                              <Activity className="w-4 h-4" /> View_Asset
                           </button>
                           <button onClick={() => navigate('/protocol-builder')} className="button-secondary" aria-label="Open Protocol Builder">
                              <Plus className="w-4 h-4" /> Open_Protocol_Builder
                           </button>
                           <button onClick={() => navigate('/compare')} className="button-secondary" aria-label="Open Compare">
                              <Database className="w-4 h-4" /> Open_Compare
                           </button>
                           <button onClick={() => setActiveReaderItem(item)} className="button-secondary text-amber-500 border-amber-500/20 hover:border-amber-500/50 flex items-center gap-2" aria-label={`Open ${item.name} in Immersive Reader`}>
                              <BookOpen className="w-4 h-4" /> Open_Doc_Reader
                           </button>
                           <button onClick={() => handleCopy(item)} className="p-4 bg-editorial-text/5 hover:bg-editorial-text/10 text-editorial-text rounded-xl transition-all ml-auto hover:scale-110" aria-label="Copy intelligence to clipboard">
                              <Copy className="w-5 h-5" />
                           </button>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 relative z-10">
                           <div className="space-y-12">
                              <InfoBlock label="Molecular Overview" content={item.overview} />
                              <InfoBlock label="Operational Mechanism" content={item.whatItDoes} />
                              <InfoList label="Targeted Benefits" items={item.keyBenefits} highlight />
                           </div>
                           <div className="space-y-12">
                              <InfoList label="Intended Operatives" items={item.whoItsFor} />
                              <InfoList label="Synergistic Protocol Pairings" items={item.protocolPairings} />
                              <InfoBlock label="Deployment Strategy" content={item.suggestedUse} />
                              
                              <div className="p-10 bg-red-900/10 border border-red-500/20 rounded-[2rem] flex items-start gap-8 relative overflow-hidden group/notice shadow-depth-1">
                                 <div className="absolute inset-x-0 top-0 h-[1px] bg-red-600/30" />
                                 <ShieldCheck className="w-8 h-8 text-red-500 shrink-0 mt-1 drop-shadow-[0_0_10px_currentColor]" />
                                 <div className="space-y-3">
                                   <span className="font-mono text-[0.6875rem] text-red-500 uppercase font-black tracking-[0.4em] block drop-shadow-sm">RESPONSIBLE_USE_DIRECTIVE</span>
                                   <p className="text-editorial-text-muted leading-relaxed font-light text-base md:text-lg">{item.responsibleUse}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          ))}
          
          {filteredContent.length === 0 && (
             <div className="text-center py-20 bg-editorial-bg rounded-2xl border border-editorial-border">
                <Database className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
                <h4 className="font-black text-editorial-text uppercase tracking-tight text-xl mb-2">NO_MATCHING_UNITS_FOUND</h4>
                <p className="text-editorial-text-muted font-light text-sm">Try another product name, category, protocol, or benefit keyword.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, content }: { label: string, content: string }) {
  return (
    <div>
       <span className="block font-mono text-[0.6875rem] text-editorial-text-muted uppercase font-bold tracking-widest mb-3 border-b border-editorial-border pb-2">{label}</span>
       <p className="text-sm text-editorial-text font-light leading-relaxed">{content}</p>
    </div>
  );
}

function InfoList({ label, items, highlight }: { label: string, items: string[], highlight?: boolean }) {
  return (
    <div>
       <span className="block font-mono text-[0.6875rem] text-editorial-text-muted uppercase font-bold tracking-widest mb-3 border-b border-editorial-border pb-2">{label}</span>
       <ul className="space-y-2">
         {items.map((item, i) => (
           <li key={i} className="text-sm text-editorial-text font-light flex items-start gap-3">
             <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${highlight ? 'bg-red-500' : 'bg-editorial-text/20'}`} />
             <span className="leading-relaxed">{item}</span>
           </li>
         ))}
       </ul>
    </div>
  );
}
