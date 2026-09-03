import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronDown, Repeat, Layers, Bot, Activity, AlertTriangle, Users, Clock, Zap, Target, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAIContext } from '../context/AIContext';
import { useCompare } from '../context/CompareContext';
import { allProducts } from '../data/products';
import { geminiService } from '../services/geminiService';
import SynergyMatrix from '../components/SynergyMatrix';

export default function CompareProducts() {
  const { selectedItems, toggleProduct, removeProduct } = useCompare();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isVerdictGenerating, setIsVerdictGenerating] = useState(false);
  const [aiVerdict, setAiVerdict] = useState('');
  
  const { updateAIContext, clearAIContext } = useAIContext();

  useEffect(() => {
    updateAIContext({ sourcePage: 'CompareProducts', comparedProducts: selectedItems });
  }, [selectedItems, updateAIContext]);

  useEffect(() => {
    return () => clearAIContext();
  }, [clearAIContext]);

  const generateVerdict = async () => {
    if (selectedItems.length < 2) return;
    setIsVerdictGenerating(true);
    setAiVerdict('');
    
    try {
      const prompt = `Compare these RAW products: ${selectedItems.map(p => `
        Product: ${p.name} 
        Category: ${p.category}
        Use Case: ${p.whatItDoes}
        Stack Role: ${p.stackRole}
        Caution: ${p.cautionLevel}
        Tone: Analyst report`).join('\n')}.
        Provide an AI Verdict on which product is best for specific goals, how to combine them for maximum synergy, and what a responsible performance user needs to watch out for.`;

      const response = await geminiService.analyze(
        prompt,
        "You are the RAW_NEURAL_CORE, an elite product optimization analyst. Provide a serious, data-driven, industrial-style comparative verdict on these RAW Official products. For each product, evaluate its utility in a performance stack, potential synergies, and critical tactical warnings. Act as an expert consultant."
      );

      setAiVerdict(response.text || "VERDICT_GENERATION_FAILED. UPLINK_OFFLINE.");
    } catch (e) {
      console.error(e);
      setAiVerdict("VERDICT_GENERATION_FAILED. UPLINK_OFFLINE.");
    } finally {
      setIsVerdictGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg pt-32 pb-24 font-sans px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative overflow-hidden selection:bg-red-600/30 selection:text-white">
      <div className="absolute top-1/4 -right-1/4 w-[1200px] h-[1200px] bg-red-600/[0.03] blur-[250px] pointer-events-none rounded-full z-0" />
      <div className="absolute bottom-[-10%] -left-1/4 w-[1000px] h-[1000px] bg-red-600/[0.03] blur-[200px] pointer-events-none rounded-full z-0" />
      
      <div className="max-w-[var(--content-max-width)] mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24 relative z-10 pt-10 space-y-10">
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex justify-center items-center gap-6"
           >
              <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-6 bg-red-600 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <span className="font-mono text-[11px] text-editorial-text-muted uppercase tracking-[0.6em] font-black drop-shadow-sm">RAW_NEURAL_DECISION_LAB // V4.0</span>
           </motion.div>
           
           <motion.h1 
             initial={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
             animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
             className="text-7xl md:text-9xl xl:text-[140px] font-sans font-black text-editorial-text uppercase tracking-[-0.05em] mb-12 leading-[0.8] drop-shadow-strong"
           >
             Hardware <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-950 drop-shadow-[0_0_40px_rgba(220,38,38,0.3)]">Decision Matrix</span>
           </motion.h1>
           
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
             className="text-editorial-text-muted font-mono text-[11px] md:text-[13px] tracking-[0.3em] uppercase max-w-4xl mx-auto leading-relaxed border-y border-editorial-border py-10"
           >
             Perform a structural comparative analysis on your prospective stack. Select up to 3 units for diagnostic evaluation and synergistic modeling.
           </motion.p>
        </div>

        {/* Selection Area - Premium HUD Selector */}
        <div className="mb-24 relative z-40 max-w-2xl mx-auto">
          <button 
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            aria-expanded={isSelectorOpen}
            aria-label="Toggle Product Selector"
            className="w-full flex items-center justify-between bg-editorial-bg/80 backdrop-blur-3xl border border-editorial-border-light p-8 rounded-[2rem] hover:border-red-600/50 transition-all duration-700 shadow-premium group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <span className="font-mono text-[11px] text-editorial-text uppercase tracking-[0.4em] font-black flex items-center gap-6 relative z-10">
              <Layers className="w-6 h-6 text-red-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
              Initialize Matrix Registry ({selectedItems.length}/3)
            </span>
            <div className="flex items-center gap-4 relative z-10">
               <div className={`w-2 h-2 rounded-full transition-all duration-500 ${selectedItems.length === 3 ? 'bg-red-600 animate-ping shadow-[0_0_10px_#dc2626]' : 'bg-zinc-800'}`} />
               <ChevronDown className={`w-6 h-6 text-zinc-600 transition-transform duration-700 ease-[0.16,1,0.3,1] ${isSelectorOpen ? 'rotate-180 text-red-500' : ''}`} />
            </div>
          </button>
          
          <AnimatePresence>
            {isSelectorOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full left-0 right-0 mt-6 bg-editorial-surface/95 backdrop-blur-3xl border border-editorial-border-light rounded-[2.5rem] p-6 max-h-[500px] overflow-y-auto custom-scrollbar shadow-premium z-50 lg:w-[120%]"
                style={{ left: '50%', transform: 'translateX(-50%)' }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {allProducts.map(product => {
                    const isSelected = selectedItems.find(p => p.id === product.id);
                    return (
                      <button 
                        key={product.id}
                        onClick={() => toggleProduct(product)}
                        aria-pressed={!!isSelected}
                        aria-label={`Toggle ${product.name}`}
                        className={`flex items-center gap-6 p-5 rounded-2xl border transition-all duration-500 text-left group/item relative overflow-hidden ${isSelected ? 'bg-red-600/10 border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'bg-editorial-bg border-editorial-border hover:border-editorial-border-light hover:bg-editorial-text/[0.03]'}`}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-editorial-bg border border-editorial-border p-2 shrink-0 group-hover/item:scale-110 transition-transform duration-700">
                           <img src={product.image} alt={product.name} className={`w-full h-full object-contain mix-blend-screen transition-all duration-700 ${isSelected ? 'grayscale-0 scale-110' : 'grayscale group-hover/item:grayscale-0'}`} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                           <span className={`block font-sans font-black text-sm uppercase tracking-tight truncate transition-colors duration-500 ${isSelected ? 'text-editorial-text' : 'text-editorial-text-muted group-hover/item:text-editorial-text'}`}>{product.name}</span>
                           <span className="block font-mono text-[9px] text-zinc-600 uppercase tracking-widest">{product.category}</span>
                        </div>
                        {isSelected && (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 bg-red-600 rounded-full p-1.5 shadow-[0_0_15px_#dc2626]">
                              <CheckCircle2 className="w-4 h-4 text-editorial-text" />
                           </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comparison Grid - Premium Units */}
        <AnimatePresence>
          {selectedItems.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-14"
            >
              {selectedItems.map((item, idx) => (
                <motion.div 
                  key={`${item.id}-${idx}`} 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-editorial-bg/60 backdrop-blur-3xl w-full border border-editorial-border-light rounded-[3rem] p-12 flex flex-col hover:border-red-600/30 transition-all duration-[1000ms] shadow-depth-2 hover:shadow-premium relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                  <div className="absolute top-0 left-0 w-32 h-32 bg-red-600/[0.02] blur-[40px] rounded-full group-hover:bg-red-600/[0.05] transition-colors duration-1000" />
                  
                  <button 
                    onClick={() => removeProduct(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="absolute top-10 right-10 p-4 bg-editorial-bg border border-editorial-border hover:border-red-600 hover:bg-red-600 hover:text-white text-zinc-600 rounded-full transition-all duration-700 z-20 shadow-depth-1 group/remove"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" />
                  </button>
                  
                  <div className="aspect-square bg-editorial-bg rounded-[2.5rem] overflow-hidden mb-12 p-12 border border-editorial-border group-hover:border-red-600/20 transition-all duration-1000 shadow-depth-1 relative">
                     <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-screen pointer-events-none z-10" />
                     <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-screen group-hover:scale-125 transition-transform duration-[2000ms] ease-[0.16,1,0.3,1] relative z-0" />
                  </div>
                  
                  <div className="mb-12 relative z-10 border-b border-editorial-border pb-10 space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-2 h-6 bg-red-600 shadow-[0_0_10px_#dc2626]" />
                        <span className="font-mono text-[10px] text-editorial-text-muted uppercase tracking-[0.5em] font-black block group-hover:text-red-500 transition-colors uppercase">{item.category}</span>
                     </div>
                     <h3 className="text-4xl lg:text-5xl font-black text-editorial-text uppercase tracking-tighter leading-[0.8] transition-all duration-700 group-hover:text-red-500">{item.name}</h3>
                     <span className="text-3xl font-black text-editorial-text drop-shadow-strong tracking-tight opacity-40 group-hover:opacity-100 transition-opacity duration-700 font-sans">{item.price}</span>
                  </div>

                  <div className="space-y-8 flex-1 relative z-10">
                    <CompareRow icon={Target} label="MISSION_OBJECTIVE" value={item.whatItDoes} />
                    <CompareRow icon={Zap} label="OPERATIVE_TYPE" value={item.whoItsFor?.join(', ') || 'General use'} />
                    <CompareRow icon={Clock} label="DEPLOYMENT_WINDOW" value={item.idealTime} />
                    <CompareRow icon={Layers} label="PROTOCOL_TIER" value={item.stackRole} />
                    <CompareRow icon={AlertTriangle} label="RISK_PARAMETERS" value={item.cautionLevel} />
                    <CompareRow icon={Users} label="SYNERGISTIC_NODES" value={item.protocolPairings?.join(', ') || 'N/A'} />
                  </div>

                  <div className="mt-16 pt-0 relative z-10">
                     <Link to={`/product/${item.id}`} className="button-premium w-full">
                       <Activity className="w-5 h-5" /> View_Operational_Spec
                     </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="text-center py-40 bg-editorial-bg/40 border border-editorial-border rounded-[4rem] shadow-premium max-w-4xl mx-auto relative overflow-hidden backdrop-blur-3xl group"
            >
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] pointer-events-none" />
               <div className="relative z-10 space-y-12">
                 <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-2 border-red-600/10 rounded-full" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-t-red-600 rounded-full shadow-[0_0_20px_#dc2626]" 
                    />
                    <Layers className="absolute inset-0 m-auto w-12 h-12 text-red-600/30 group-hover:text-red-500 transition-colors duration-1000" />
                 </div>
                 <div className="space-y-4">
                    <span className="font-mono text-[13px] text-red-600 uppercase tracking-[0.8em] font-black block animate-pulse">AWAITING_INPUT_PARAMETERS</span>
                    <p className="text-zinc-600 font-mono max-w-md mx-auto text-xs leading-[2.5] tracking-widest uppercase px-12">Select units from the matrix registry to initiate structural comparative analysis and AI synergy modeling.</p>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Synergy Matrix Integration Segment */}
        {selectedItems.length > 0 && (
          <div className="mt-20 max-w-[1200px] mx-auto relative z-10">
            <SynergyMatrix products={selectedItems} />
          </div>
        )}

        {/* AI Verdict Section - Tactical High-Contrast Report */}
        <AnimatePresence>
           {selectedItems.length > 1 && (
              <motion.div 
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-40 bg-editorial-bg/60 backdrop-blur-3xl border border-editorial-border-light rounded-[3.5rem] p-12 md:p-24 overflow-hidden relative shadow-premium max-w-[1200px] mx-auto group/verdict"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.03] to-transparent pointer-events-none" />
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600 shadow-[0_0_30px_#dc2626]" />
                 
                 <div className="relative z-10 flex flex-col items-center gap-16">
                    <div className="flex flex-col items-center gap-8">
                        <div className="w-24 h-24 bg-editorial-bg border border-red-600/20 rounded-[2.5rem] flex items-center justify-center shadow-depth-3 group-hover/verdict:border-red-600/50 transition-all duration-1000 group-hover/verdict:shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                           <Bot className="w-12 h-12 text-red-600 animate-pulse" />
                        </div>
                        <h3 className="text-5xl md:text-7xl font-black text-editorial-text uppercase tracking-tighter text-center drop-shadow-strong">Neural Synergy Verdict</h3>
                    </div>
                    
                    {!aiVerdict && !isVerdictGenerating ? (
                       <button 
                         onClick={generateVerdict}
                         aria-label="Initialize Deep Analysis"
                         className="button-premium px-16 py-8 text-[11px] group/launch overflow-hidden"
                       >
                          <span className="relative z-10">Initialize_Deep_Analysis</span>
                          <Zap className="w-5 h-5 relative z-10 group-hover/launch:animate-bounce" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/launch:animate-[shimmer_1.5s_infinite]" />
                       </button>
                    ) : (
                       <div className="w-full text-left bg-editorial-bg/40 backdrop-blur-3xl border border-editorial-border rounded-[2.5rem] p-12 md:p-20 font-mono text-editorial-text-muted text-base leading-[2] uppercase whitespace-pre-wrap shadow-inner relative border-l-8 border-l-red-600 transition-all duration-1000 group-hover/verdict:border-l-red-500 scale-[1.02] shadow-premium">
                          <div className="absolute top-8 right-10 flex gap-2">
                             {[1,2,3].map(i => <div key={i} className={`w-1 h-4 bg-red-600/30 ${i === 2 ? 'animate-pulse bg-red-600' : ''}`} />)}
                          </div>
                          
                          {isVerdictGenerating && !aiVerdict ? (
                             <div className="flex flex-col items-center justify-center py-20 gap-8">
                                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                                <span className="text-red-500 font-black tracking-[0.5em] animate-pulse">PROCESSING_SYNERGY_MODELS...</span>
                             </div>
                          ) : (
                             <div className="prose prose-invert max-w-none text-editorial-text font-light tracking-wide text-lg">
                                {aiVerdict}
                                {isVerdictGenerating && <span className="inline-block w-3 h-6 bg-red-600 ml-3 animate-pulse align-middle shadow-[0_0_15px_#dc2626]" />}
                             </div>
                          )}
                          
                          <div className="mt-12 pt-8 border-t border-editorial-border-light flex justify-between items-center opacity-40">
                             <div className="font-mono text-[10px] tracking-widest uppercase">Encryption_State: SECURE</div>
                             <div className="font-mono text-[10px] tracking-widest uppercase">Nodes_Sampled: {selectedItems.length}</div>
                          </div>
                       </div>
                    )}
                 </div>
              </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>

  );
}

function CompareRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex gap-5 items-start group/row">
      <div className="p-3 bg-editorial-surface rounded-xl shrink-0 border border-editorial-border-light group-hover/row:border-editorial-accent/50 group-hover/row:bg-editorial-accent/10 transition-all duration-500 shadow-sm">
        <Icon size={16} className="text-editorial-text-muted group-hover/row:text-editorial-accent transition-colors duration-500" />
      </div>
      <div className="min-w-0 pt-0.5">
        <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-editorial-text-meta font-black mb-1.5">{label}</span>
        <p className="text-sm text-editorial-text-muted font-medium leading-relaxed group-hover/row:text-editorial-text transition-colors duration-300">{value}</p>
      </div>
    </div>
  );
}
