import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Printer, Download, ExternalLink, MoreVertical } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { allProducts } from "../data/products";
import LazyImage from "./LazyImage";
import { useState } from "react";
import MagneticWrapper from "./MagneticWrapper";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const suggestions = allProducts.slice(10, 13);

  const downloadManifest = () => {
    const manifestText = `PROTOCOL REGISTRY MANIFEST\n==========================\n\n` + 
                         items.map(i => `${i.name}\nQuantity: ${i.quantity} | Value: ${i.price}`).join('\n\n') + 
                         `\n\n--------------------------\nTOTAL VALUE: £${cartTotal.toFixed(2)}\n\nOFFICIAL SOURCE: https://rawofficial.co`;
    
    const blob = new Blob([manifestText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'protocol-manifest.txt';
    a.click();
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
  };

  const printManifest = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const html = `
        <html><head><title>Protocol Registry Manifest</title>
        <style>body { font-family: monospace; padding: 40px; text-transform: uppercase; line-height: 1.6; } h1 { font-size: 24px; border-bottom: 2px solid #000; padding-bottom: 20px; }</style>
        </head><body>
          <h1>Protocol Registry Manifest</h1>
          ${items.map(item => `<div style="margin-bottom: 20px;"><strong>${item.name}</strong><br/>Qty: ${item.quantity} | Val: ${item.price}</div>`).join('')}
          <div style="border-top: 2px solid #000; padding-top: 20px; margin-top: 40px;">
            <h2>Total Value: £${cartTotal.toFixed(2)}</h2>
          </div>
          <div style="margin-top: 40px; font-size: 12px;">
             <strong>Procure Official Loadout:</strong> https://rawofficial.co
          </div>
        </body></html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-editorial-bg/70 backdrop-blur-sm z-[100]"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="cart-drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 35, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-[600px] bg-editorial-bg/98 backdrop-blur-3xl border-l border-editorial-border-light z-[101] flex flex-col shadow-[-50px_0_150px_rgba(0,0,0,0.95)]"
            data-lenis-prevent="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/[0.05] via-transparent to-transparent pointer-events-none mix-blend-screen" />
            
            <div className="relative h-[1px] w-full bg-editorial-text/5 overflow-hidden z-20">
               <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 w-1/3 bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.8)]"
               />
            </div>

            <div className="p-10 lg:p-14 flex justify-between items-center relative z-20 border-b border-editorial-border bg-editorial-bg/40">
              <div className="flex items-center gap-10">
                <div className="relative w-24 h-24 flex items-center justify-center bg-editorial-bg rounded-[2.5rem] border border-editorial-border-light shadow-depth-2 group">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-[2px] border-red-600/10 rounded-[2.5rem] border-t-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                  />
                  <ShoppingBag className="w-10 h-10 text-editorial-text drop-shadow-[0_0_15px_rgba(0,0,0,0.05)]" />
                </div>
                <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-4">
                      <div className="w-2 h-6 bg-red-600" />
                      <h2 className="font-sans font-black text-4xl xl:text-5xl tracking-tighter uppercase leading-none text-premium">Registry</h2>
                   </div>
                  <span className="text-meta-premium">NEURAL_ORDNANCE_ARCHIVE // V2.6</span>
                </div>
              </div>
              <MagneticWrapper>
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="p-6 bg-editorial-text/5 hover:bg-red-600/10 rounded-[2rem] transition-all duration-700 border border-editorial-border hover:border-red-600/40 group/close"
                  aria-label="Close Registry"
                >
                  <X className="w-7 h-7 text-zinc-600 group-hover/close:text-editorial-text group-hover/close:rotate-90 transition-all duration-700" />
                </button>
              </MagneticWrapper>
            </div>

            <div className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scrollbar relative z-20">
              <div className="space-y-16">
                <div className="space-y-8">
                  <AnimatePresence>
                    {items.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-32 flex flex-col items-center justify-center text-center relative"
                      >
                        <div className="absolute inset-0 bg-red-600/5 blur-[100px] rounded-full pointer-events-none" />
                        <div className="relative w-40 h-40 mb-12">
                           <div className="absolute inset-0 border border-editorial-border rounded-full" />
                           <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 border-2 border-dashed border-red-600/20 rounded-full"
                           />
                           <ShoppingBag className="absolute inset-0 m-auto w-12 h-12 text-zinc-800" />
                        </div>
                        <span className="text-meta-premium !text-red-600/40 animate-pulse mb-6 block">NO_DATA_DETECTED</span>
                        <p className="text-meta-premium opacity-60 leading-relaxed px-12">Your registry is currently empty. <br /> Initialize procurement to begin.</p>
                      </motion.div>
                    ) : (
                      items.map((item, idx) => (
                        <motion.div 
                          key={item.id} 
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -40 }}
                          transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          className="flex gap-10 group relative bg-editorial-bg/40 border border-editorial-border p-8 rounded-[3rem] hover:bg-editorial-surface/60 hover:border-red-600/30 transition-all duration-1000 shadow-depth-1 hover:shadow-premium backdrop-blur-3xl overflow-hidden"
                        >
                          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-red-600/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
                          <div className="w-32 xl:w-40 aspect-square bg-editorial-bg rounded-[2rem] border border-editorial-border overflow-hidden relative shadow-inner p-4 shrink-0 transition-all duration-700 group-hover:scale-105">
                             <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-screen pointer-events-none z-10" />
                            <LazyImage 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform duration-[1500ms]" 
                              containerClassName="w-full h-full block"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-2 relative z-10">
                            <div className="space-y-4">
                               <div className="flex justify-between items-start">
                                  <h3 className="text-2xl lg:text-3xl font-black tracking-tighter uppercase leading-[0.9] text-premium pr-10 group-hover:text-red-500 transition-colors duration-700">{item.name}</h3>
                                  <button 
                                    onClick={() => removeFromCart(item.id)} 
                                    className="text-zinc-600 hover:text-red-600 bg-editorial-text/5 p-4 rounded-2xl transition-all duration-700 border border-transparent hover:border-red-600/20 hover:scale-110"
                                    aria-label="Remove item"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                               </div>
                               <div className="flex items-center gap-4">
                                  <span className="text-meta-premium opacity-40">UNIT_VALUE:</span>
                                  <p className="text-2xl font-black tracking-tight text-premium">{item.price}</p>
                               </div>
                            </div>
                            
                            <div className="flex items-center bg-editorial-bg border border-editorial-border rounded-2xl overflow-hidden w-fit shadow-inner">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)} 
                                className="p-5 text-zinc-600 hover:text-editorial-text hover:bg-red-600/20 transition-all duration-500 border-r border-editorial-border"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <span className="w-16 text-center text-lg font-mono font-black text-editorial-text" aria-live="polite" aria-atomic="true">
                                <span className="sr-only">Quantity: </span>{item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)} 
                                className="p-5 text-zinc-600 hover:text-editorial-text hover:bg-red-600/20 transition-all duration-500 border-l border-editorial-border"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Suggested Pairings - Premium Treatment */}
                <div className="pt-20 border-t border-editorial-border space-y-10 relative">
                   <div className="absolute top-0 left-1/2 -ml-[30%] w-[60%] h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent shadow-[0_0_20px_#dc2626]" />
                   <div className="flex items-center justify-between text-editorial-text-muted font-mono text-[10px] uppercase tracking-[0.5em] font-black">
                      <span>Neural_Synergy_Suggestions</span>
                      <div className="flex gap-1.5">
                         {[1,2,3].map(i => <div key={i} className={`w-1 h-3 bg-red-600/30 ${i === 2 ? 'animate-pulse' : ''}`} />)}
                      </div>
                   </div>
                   <div className="grid grid-cols-1 gap-6">
                      {suggestions.map((sug, i) => (
                        <motion.div
                           key={sug.id}
                           initial={{ opacity: 0, x: 20 }}
                           whileInView={{ opacity: 1, x: 0 }}
                           transition={{ duration: 1, delay: i * 0.1 }}
                        >
                           <Link 
                             to={`/product/${sug.id}`} 
                             onClick={() => setIsCartOpen(false)} 
                             className="flex items-center gap-8 group/sug bg-editorial-bg/40 p-6 rounded-[2.5rem] border border-editorial-border hover:border-red-600/40 hover:bg-editorial-surface/60 transition-all duration-1000 shadow-depth-1 relative overflow-hidden"
                           >
                              <div className="absolute inset-0 bg-gradient-to-r from-red-600/[0.02] to-transparent opacity-0 group-hover/sug:opacity-100 transition-opacity" />
                              <div className="w-20 h-20 bg-editorial-bg rounded-2xl overflow-hidden border border-editorial-border p-3 shrink-0 relative transition-transform duration-1000 group-hover/sug:scale-105">
                                 <LazyImage src={sug.image} alt={sug.name} className="w-full h-full object-contain mix-blend-screen opacity-70 group-hover/sug:opacity-100 transition-all duration-1000" containerClassName="w-full h-full" />
                              </div>
                              <div className="flex-1 space-y-2 min-w-0">
                                 <h4 className="text-xl font-black uppercase tracking-tighter truncate text-editorial-text group-hover/sug:text-editorial-text transition-colors duration-700">{sug.name}</h4>
                                 <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase font-black">{sug.price} // {sug.category}</p>
                              </div>
                              <div className="w-14 h-14 rounded-full bg-editorial-text/5 border border-editorial-border-light flex items-center justify-center group-hover/sug:bg-red-600 group-hover/sug:border-red-600 transition-all duration-700 group-hover/sug:shadow-depth-2 shrink-0">
                                <ArrowRight className="w-6 h-6 text-zinc-600 group-hover/sug:text-editorial-text transition-all transform group-hover/sug:translate-x-1" />
                              </div>
                           </Link>
                        </motion.div>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {items.length > 0 && (
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="p-10 lg:p-14 border-t border-editorial-border-light bg-editorial-bg backdrop-blur-3xl space-y-12 relative overflow-visible z-30 shadow-premium"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600 shadow-[0_0_30px_#dc2626]" />
                  
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-4">
                       <span className="text-meta-premium !text-red-600 block !text-sm">TOTAL_CUMULATIVE_VAL</span>
                       <div className="flex items-center gap-4 text-meta-premium opacity-40">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                          LOGISTICS_READY
                       </div>
                    </div>
                    <motion.div 
                      key={cartTotal}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl lg:text-7xl font-sans font-black tracking-tighter flex items-baseline gap-2 text-premium"
                    >
                      <span className="text-2xl text-red-600 font-mono">£</span>
                      {cartTotal.toFixed(2)}
                    </motion.div>
                  </div>
                  
                  <Link 
                    to="/checkout" 
                    onClick={() => setIsCartOpen(false)} 
                    className="button-premium w-full py-8 text-[12px] group relative overflow-hidden"
                  >
                     <span className="relative z-20 flex items-center gap-6 justify-center">
                        Initialize_Execution_Protocol <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-1000" />
                     </span>
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-25deg] group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                  </Link>

                  <div className="flex justify-center gap-8 opacity-50 mix-blend-screen hover:opacity-100 transition-all duration-700 pt-2">
                     <img src="https://rawofficial.co/wp-content/uploads/2025/03/payment.webp" className="h-6 drop-shadow-sm grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
