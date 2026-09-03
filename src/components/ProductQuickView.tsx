import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { X, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagneticWrapper from './MagneticWrapper';
import { useUI } from '../context/UIContext';
import { Bot, ArrowRight } from 'lucide-react';

export default function ProductQuickView({ product, isOpen, onClose }: { product: any; isOpen: boolean; onClose: () => void }) {
  const { addToCart } = useCart();
  const { setFocusedProduct, setIsAIChatOpen } = useUI();

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            className="fixed inset-0 bg-editorial-bg/80 backdrop-blur-md z-[9999]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 30, filter: 'blur(20px)' }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[1200px] h-[85vh] flex flex-col md:flex-row bg-editorial-card border border-editorial-border z-[10000] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(0,0,0,0.5)] rounded-[3rem]"
          >
            {/* Edge Highlights */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-50 pointer-events-none mix-blend-overlay" />
            <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent z-50 pointer-events-none mix-blend-overlay" />
            <MagneticWrapper>
              <button 
                onClick={onClose} 
                className="absolute top-8 right-8 z-50 p-4 text-editorial-text-muted hover:text-editorial-text bg-editorial-bg/60 border border-editorial-border-light hover:border-editorial-accent hover:bg-editorial-accent backdrop-blur-xl rounded-full transition-all duration-500 shadow-depth-2 group/close"
              >
                <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-500" />
              </button>
            </MagneticWrapper>

            <div className="w-full md:w-1/2 h-1/2 md:h-full bg-editorial-surface relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none mix-blend-screen opacity-50 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-editorial-bg opacity-60 z-20 mix-blend-multiply" />
              
              {/* Scanline Sweep Upgrade */}
              <motion.div 
                 animate={{ y: ["-10%", "110%"] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-x-0 h-[2px] bg-red-500/80 shadow-[0_0_20px_#dc2626] z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
              />

              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transform-gpu max-w-[80%] mx-auto max-h-[80%] my-auto top-1/2 left-1/2 absolute -translate-x-1/2 -translate-y-1/2 group-hover:scale-[1.1] transition-transform duration-[2000ms] ease-[0.16,1,0.3,1] opacity-80 group-hover:opacity-100 mix-blend-plus-lighter z-0 group-hover:drop-shadow-[0_0_50px_rgba(220,38,38,0.2)]" 
              />
              <div className="absolute top-8 left-8 font-mono text-[10px] text-editorial-text font-bold tracking-[0.4em] uppercase bg-editorial-accent/90 backdrop-blur-xl px-5 py-2.5 z-40 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-3 border border-white/20">
                 <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_#ffffff]" />
                 QUICK_VIEW // {product.id}
              </div>
            </div>

            <div className="w-full md:w-1/2 h-1/2 md:h-full p-10 md:p-16 flex flex-col overflow-y-auto crystal-glass-panel layered-shadows-premium relative">
              <div className="neural-grid-overlay" />
              
              {/* Target bracket lines */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/10 transition-all duration-1000 group-hover:border-red-500/50 pointer-events-none" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/10 transition-all duration-1000 group-hover:border-red-500/50 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-white/10 transition-all duration-1000 group-hover:border-red-500/50 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-white/10 transition-all duration-1000 group-hover:border-red-500/50 pointer-events-none" />

              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen -mr-40 -mt-40" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen -ml-40 -mb-40" />
              
              <div className="relative z-10 w-full">
                <span className="text-meta-premium !text-red-500 mb-6 block flex items-center gap-3 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_5px_currentColor]" /> {product.category}
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-sans font-black uppercase tracking-tighter leading-none mb-8 text-premium drop-shadow-sm">
                  {product.name}
                </h2>
                <div className="text-3xl md:text-4xl font-sans font-black mb-10 border-b border-editorial-border-light pb-8 text-premium drop-shadow-md inline-block w-full">
                   <span className="text-xl text-red-600 font-mono mr-2">£</span>{product.price.replace('£', '')}
                </div>

                <div className="mb-12 text-base md:text-[1.1rem] text-editorial-text-muted font-light leading-relaxed max-w-lg drop-shadow-sm italic">
                   {product.overview || product.description || "ADVANCED FORMULATION / OPTIMIZED FOR ELITE PERFORMANCE. INITIATE DEPLOYMENT TO YOUR SECTOR."}
                </div>
                
                <button 
                  onClick={() => {
                    setFocusedProduct(product);
                    setIsAIChatOpen(true);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-6 bg-editorial-surface/80 backdrop-blur-xl border border-red-600/20 rounded-[1.5rem] hover:border-red-600 hover:bg-editorial-bg transition-all duration-500 group relative mb-12 shadow-depth-2 hover:shadow-[0_15px_40px_rgba(220,38,38,0.2)]"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <Bot className="w-6 h-6 text-red-500 group-hover:animate-pulse drop-shadow-[0_0_8px_currentColor]" />
                    <span className="text-meta-premium opacity-100 !text-editorial-text">NEURAL_PRODUCT_SCAN</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-red-600 group-hover:translate-x-2 transition-transform duration-500" />
                </button>
              </div>

              <div className="mt-auto space-y-4 relative z-10 w-full mb-8">
                 <button 
                  onClick={() => {
                    addToCart(product, 1);
                    onClose();
                  }}
                  className="w-full bg-red-600 text-white py-6 rounded-[1.5rem] font-sans font-black uppercase tracking-[0.25em] text-[11px] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-red-600 hover:border-white group"
                 >
                   AUTHORIZE DEPLOYMENT
                 </button>
                 <Link 
                   to={`/product/${product.id}`} 
                   className="w-full flex justify-center items-center gap-4 bg-transparent border border-editorial-border hover:border-editorial-text/20 text-meta-premium hover:!text-red-500 py-5 rounded-[1.5rem] transition-all duration-500 group shadow-sm"
                 >
                   VIEW ALL INTEL <Search className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                 </Link>
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
