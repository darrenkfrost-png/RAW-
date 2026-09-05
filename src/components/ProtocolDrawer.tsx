import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProtocol } from '../context/ProtocolContext';
import { Layers, X, Trash2, ArrowRight, Zap, Copy, Crosshair, AlertTriangle } from 'lucide-react';
import { getHighResImageUrl } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useCart } from '../context/CartContext';
import { useToast } from './common/Toast';

export default function ProtocolDrawer() {
  const { protocolItems, removeFromProtocol, clearProtocol } = useProtocol();
  const [isOpen, setIsOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const navigate = useNavigate();
  const { chromeHidden } = useUI();
  const { addToast } = useToast();
  const { items: cartItems, addToCart, setIsCartOpen } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /* Escape closes the drawer. The listener exists only while it is open, so
     it cannot fire from another overlay after this one has gone. */
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const totalEstimate = protocolItems.reduce((acc, p) => acc + Number(p.price.replace('£', '')), 0);

  const analysis = useMemo(() => {
    const cats: Record<string, number> = {};
    let protein = false;
    let pre = false;
    let recovery = false;

    protocolItems.forEach(item => {
       cats[item.category] = (cats[item.category] || 0) + 1;
       const name = item.name.toLowerCase();
       if (name.includes('protein')) protein = true;
       if (name.includes('pre-workout')) pre = true;
       /* 'Recovery' as a category holds only hardware (ice bath, knee
          support, lounger); the supplements that do the same job carry
          stackRole 'recovery'. Either counts. */
       if (item.category === 'Recovery' || item.stackRole === 'recovery') recovery = true;
    });

    const warnings = [];
    const missing = [];

    if (!protein && protocolItems.length > 2) missing.push('Baseline Protein');
    if (!recovery && protocolItems.length > 2) missing.push('Recovery Core');
    
    if (pre && protocolItems.find(p => p.name.toLowerCase().includes('coffee'))) {
      warnings.push('High Stimulant Load Detected (Pre-Workout + Coffee).');
    }

    return { cats, warnings, missing };
  }, [protocolItems]);

  /* Prices in the catalogue already carry their £ sign. */
  const handleCopy = async () => {
     const text = `MY RAW PROTOCOL\n\n` + protocolItems.map(p => `- ${p.name} (${p.price})`).join('\n') + `\n\nESTIMATED TOTAL: £${totalEstimate.toFixed(2)}`;
     try {
       await navigator.clipboard.writeText(text);
       addToast('Protocol copied to clipboard');
     } catch {
       addToast('Clipboard unavailable — copy was blocked by the browser', 'error');
     }
  };

  /* The checkout reads the CART, not this stack. Sending the stack there means
     putting each item in the cart first (once — never doubling a line that is
     already in it), then going to the checkout without popping the cart drawer
     open on the way. */
  const handleSendToCheckout = () => {
    protocolItems
      .filter(p => !cartItems.some(c => c.id === p.id))
      .forEach(p => addToCart(p, 1));
    setIsCartOpen(false);
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Floating Toggle Button — the red MY_PROTOCOL chip, bottom right.
          It is furniture like the rest and hides with it. The DRAWER itself is
          untouched: hiding the chip must not strip a visitor of a stack they
          have already built, only of the badge advertising it. */}
      <AnimatePresence>
        {!isOpen && !chromeHidden.includes('protocolChip') && (
          <motion.button
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            aria-label={`Open my protocol stack, ${protocolItems.length} ${protocolItems.length === 1 ? 'item' : 'items'}`}
            /* Slot 2 of the corner dock (.raw-dock-stack, src/index.css).
               On a phone the label is dropped and the chip becomes a 44px
               square so it cannot overlap the other corner controls. */
            className="raw-dock-stack fixed z-50 bg-editorial-bg/90 backdrop-blur-xl border-l-[3px] border-red-600 border-y border-r border-editorial-border-light p-3 sm:px-6 sm:py-4 min-h-11 min-w-11 rounded-[1.25rem] sm:rounded-[2rem] flex items-center justify-center gap-0 sm:gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] group hover:bg-editorial-bg transition-all duration-[600ms]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent pointer-events-none mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <Layers className="w-6 h-6 text-red-500 group-hover:animate-pulse" />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center font-mono text-[0.6875rem] font-black text-white outline outline-4 outline-[#020202]">
                {protocolItems.length}
              </div>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-widest font-bold">Active Stack</span>
              <span className="font-sans font-black text-sm text-editorial-text uppercase tracking-tight">MY_PROTOCOL</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="protocol-drawer-title"
            className="fixed inset-y-0 right-0 z-[110] w-full md:w-[450px] bg-editorial-bg/95 backdrop-blur-3xl border-l border-editorial-border flex flex-col shadow-[-30px_0_100px_rgba(0,0,0,0.15)]"
          >
             {/* Header */}
            <div className="p-8 border-b border-editorial-border relative overflow-hidden shrink-0">
               <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent shadow-[0_0_15px_#dc2626]" />
               <div className="flex justify-between items-start mb-6 relative z-10">
                 <div>
                   <div className="flex items-center gap-2 mb-2 block">
                     <div className="w-2 h-2 bg-red-600 rounded-full animate-ping opacity-70 shadow-[0_0_8px_#dc2626]" />
                     <span className="text-[0.6875rem] font-black tracking-[0.4em] text-red-500 uppercase">OUTPUT_SUPPORT_QUEUE</span>
                   </div>
                   <h2 id="protocol-drawer-title" className="text-3xl font-sans font-black text-editorial-text uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">MY_PROTOCOL_STACK</h2>
                 </div>
                 <button ref={closeButtonRef} onClick={() => setIsOpen(false)} aria-label="Close Protocol Stack" className="p-3 bg-editorial-bg rounded-xl hover:bg-red-950/30 text-editorial-text-muted hover:text-red-500 transition-colors border border-editorial-border hover:border-red-500/50 group">
                    <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 </button>
               </div>

               {/* Advanced Action Row */}
               <div className="flex gap-2 relative z-10 overflow-x-auto custom-scrollbar pb-2">
                 <button aria-expanded={showAnalysis} onClick={() => setShowAnalysis(!showAnalysis)} className={`shrink-0 px-4 py-2 flex items-center gap-2 font-mono text-[0.6875rem] uppercase font-bold tracking-widest rounded-lg border transition-all ${showAnalysis ? 'bg-red-600 text-white border-red-500' : 'bg-editorial-text/5 text-editorial-text-muted border-editorial-border-light hover:border-editorial-text/20 hover:text-editorial-text'}`}>
                    <Zap className="w-3 h-3" /> Analyse
                 </button>
                 <button 
                  onClick={handleCopy}
                  aria-label="Copy Protocol Summary"
                  className="shrink-0 px-4 py-2 bg-editorial-text/5 text-editorial-text-muted border border-editorial-border-light hover:border-editorial-text/20 hover:text-editorial-text flex items-center gap-2 font-mono text-[0.6875rem] uppercase font-bold tracking-widest rounded-lg transition-all"
                 >
                    <Copy className="w-3 h-3" /> Copy Summary
                 </button>
                 <button aria-label="Clear Protocol Stack" onClick={clearProtocol} className="shrink-0 px-4 py-2 bg-editorial-text/5 text-editorial-text-muted border border-editorial-border-light hover:border-editorial-text/20 hover:text-editorial-text flex items-center gap-2 font-mono text-[0.6875rem] uppercase font-bold tracking-widest rounded-lg transition-all ml-auto">
                    <Trash2 className="w-3 h-3" /> Clear
                 </button>
               </div>
            </div>

            {/* Items and Analysis */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               <AnimatePresence>
                  {showAnalysis && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-b border-editorial-border overflow-hidden"
                     >
                        <div className="p-8 bg-red-950/10 space-y-6">
                           <h3 className="font-mono text-[0.6875rem] text-red-500 uppercase tracking-widest font-bold">Protocol Analysis</h3>
                           
                           {/* Category Balance */}
                           <div>
                              <span className="text-[0.6875rem] text-editorial-text-muted uppercase font-mono tracking-widest mb-3 block">Category Balance</span>
                              <div className="grid grid-cols-2 gap-2">
                                 {Object.entries(analysis.cats).map(([cat, count]) => (
                                    <div key={cat} className="p-3 bg-editorial-bg border border-editorial-border rounded-xl flex justify-between items-center">
                                       <span className="font-sans font-black text-[0.6875rem] text-editorial-text uppercase tracking-tight">{cat}</span>
                                       <span className="font-mono text-[0.6875rem] text-editorial-text-muted">{count as number}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           {/* Missing & Warnings */}
                           {(analysis.missing.length > 0 || analysis.warnings.length > 0) && (
                              <div className="space-y-4 pt-4 border-t border-editorial-border">
                                 {analysis.missing.length > 0 && (
                                    <div className="flex items-start gap-3 p-3 bg-editorial-surface/50 border border-editorial-border-light rounded-xl">
                                       <Crosshair className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                       <div>
                                          <span className="block font-mono text-[0.6875rem] text-blue-500 uppercase tracking-widest font-bold mb-1">Missing Elements</span>
                                          <p className="text-editorial-text-muted text-xs font-light">{analysis.missing.join(', ')}</p>
                                       </div>
                                    </div>
                                 )}
                                 {analysis.warnings.length > 0 && (
                                    <div className="flex items-start gap-3 p-3 bg-red-950/30 border border-red-500/20 rounded-xl">
                                       <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                       <div>
                                          <span className="block font-mono text-[0.6875rem] text-red-500 uppercase tracking-widest font-bold mb-1">Stack Warning</span>
                                          <p className="text-editorial-text-muted text-xs font-light">{analysis.warnings.join(', ')}</p>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

               <div className="p-8 space-y-4">
                 <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-[0.3em] font-bold flex justify-between mb-4">
                   <span>ACTIVE_SELECTIONS</span>
                   <span>TOTAL: {protocolItems.length} UNITS</span>
                 </span>
              
               <AnimatePresence>
                 {protocolItems.map((item, idx) => (
                   <motion.div
                     key={item.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ delay: idx * 0.1, duration: 0.5 }}
                     className="flex items-stretch gap-4 p-4 bg-editorial-bg border border-editorial-border rounded-2xl group hover:border-red-500/30 hover:bg-editorial-bg transition-colors"
                   >
                     <div className="w-20 h-20 bg-editorial-bg rounded-xl overflow-hidden border border-editorial-border relative">
                       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-900/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity mix-blend-screen" />
                       <img src={getHighResImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover mix-blend-screen grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                     </div>
                     <div className="flex-1 flex flex-col justify-between py-1">
                       <div>
                         <h4 className="font-sans font-black text-[0.8125rem] uppercase tracking-tight text-editorial-text mb-1 line-clamp-2 leading-tight">{item.name}</h4>
                         <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-widest">{item.category}</span>
                       </div>
                       <div className="flex justify-between items-end mt-2">
                         <span className="font-mono text-[0.75rem] font-bold text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">{item.price}</span>
                         <button 
                           onClick={() => removeFromProtocol(item.id)} aria-label="Remove item"
                           className="text-zinc-600 hover:text-red-500 transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
             </div>

            {/* Footer */}
            <div className="p-8 border-t border-editorial-border bg-editorial-bg shrink-0">
              <div className="flex justify-between items-end mb-8">
                <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-[0.3em] font-bold">Estimated Cost</span>
                <span className="font-mono text-2xl font-black text-editorial-text flex items-start">
                   <span className="text-red-500 text-base mt-0.5 mr-1 drop-shadow-[0_0_8px_currentColor]">£</span>
                   {totalEstimate.toFixed(2)}
                </span>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleSendToCheckout}
                  disabled={protocolItems.length === 0}
                  aria-disabled={protocolItems.length === 0}
                  className="w-full bg-red-600 border-b-[3px] border-red-800 hover:border-white text-white hover:bg-editorial-text hover:text-editorial-bg rounded-2xl font-black uppercase tracking-[0.4em] text-[0.6875rem] px-6 py-5 transition-all duration-[600ms] flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_15px_30px_rgba(220,38,38,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transform-gpu active:translate-y-1 active:border-b-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-600 disabled:hover:text-white"
                >
                  <span className="relative z-10 transition-colors">Send Stack to Checkout</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform duration-[600ms]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
