import { memo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Search, Target, ShieldCheck, Layers, Plus, ExternalLink } from "lucide-react";
import { useProtocol } from "../../context/ProtocolContext";
import { useCompare } from "../../context/CompareContext";
import LazyImage from "../LazyImage";
import { Tooltip } from "./Tooltip";
import { useUI } from "../../context/UIContext";
import { Product } from "../../types";

export interface ProductCardProps {
  key?: React.Key;
  product: Product;
  idx: number;
  onQuickView?: (product: Product) => void;
}

function ProductCardComponent({ product, idx, onQuickView }: ProductCardProps) {
  const { setFocusedProduct, setIsAIChatOpen, setInitialAction } = useUI();
  const { addToProtocol } = useProtocol();
  const { toggleProduct, selectedItems } = useCompare();
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  
  const glintX = useTransform(mouseX, [-0.5, 0.5], ["-50%", "150%"]);
  const glintY = useTransform(mouseY, [-0.5, 0.5], ["-50%", "150%"]);

  const isCompared = selectedItems.some(p => p.id === product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleNeuralScan = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFocusedProduct(product);
    setInitialAction('SCAN');
    setIsAIChatOpen(true);
  };

  const handleAIAnalyze = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFocusedProduct(product);
    setInitialAction('SCAN');
    setIsAIChatOpen(true);
  };

  return (
    <motion.div 
      ref={cardRef}
      role="article"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      layout
      whileHover={{ y: -16, scale: 1.02 }}
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: "preserve-3d",
        willChange: "transform, opacity, box-shadow" 
      }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
      className="group hover-neural-scan flex flex-col h-full bg-editorial-card border border-editorial-border-light rounded-[3rem] p-10 transition-all duration-1000 hover:shadow-[0_80px_160px_-40px_rgba(0,0,0,0.8),0_0_120px_rgba(220,38,38,0.25)] hover:border-red-600/70 overflow-hidden relative shadow-depth-3 backdrop-blur-3xl"
    >
      {/* 3D Content Wrapper */}
      <div style={{ transform: "translateZ(80px)", transformStyle: "preserve-3d" }} className="flex flex-col h-full">
        
        {/* Holographic Glint */}
        <motion.div 
           style={{ left: glintX, top: glintY }}
           className="absolute w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-1000 mix-blend-overlay rotate-45" 
        />

        {/* Background Hub Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.35),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-[1500ms] pointer-events-none mix-blend-plus-lighter" />
        
        {/* HUD Scanning Line */}
        <div className="absolute inset-x-0 h-[2px] bg-red-600/80 top-0 z-50 group-hover:animate-scan pointer-events-none opacity-0 group-hover:opacity-100 shadow-[0_0_20px_#dc2626]" />

        <Link 
          to={`/product/${product.id}`} 
          className="block relative aspect-[4/5] overflow-hidden bg-editorial-bg rounded-[2.5rem] group/image border border-white/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] group-hover:border-red-600/40 group-hover:shadow-[inset_0_0_80px_rgba(220,38,38,0.1),0_0_50px_rgba(220,38,38,0.2)] transition-all duration-1000"
          style={{ transform: "translateZ(40px)" }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-editorial-bg via-transparent to-transparent opacity-80 group-hover/image:opacity-100 transition-all duration-1000 z-10" />
            
            {/* Moving Scanner Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-1000">
               <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.2)_1px,transparent_1px)] bg-[size:100%_4px] animate-scan-slow" />
            </div>

            <LazyImage 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain p-14 transition-transform duration-[3000ms] ease-fluid group-hover/image:scale-[1.18] z-0"
              containerClassName="w-full h-full flex items-center justify-center absolute inset-0 mix-blend-screen"
            />
            
            {/* Top Badges - HUD Style */}
            <div className="absolute top-10 left-10 flex flex-col gap-5 z-30 transition-all duration-700">
               <div className="flex items-center gap-3 bg-red-600 text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.5em] rounded-full shadow-[0_0_25px_rgba(220,38,38,0.6)] border border-white/20">
                  <Target size={14} className="animate-pulse" /> {product.category}
               </div>
               <div className="flex items-center gap-3 bg-editorial-bg/80 backdrop-blur-3xl border border-white/5 px-8 py-3 text-[10px] font-black uppercase tracking-[0.5em] rounded-full shadow-2xl text-meta-premium group-hover/image:text-emerald-400 group-hover/image:border-emerald-500/40 transition-all duration-700">
                  <ShieldCheck size={14} className="group-hover:animate-pulse" /> SCAN_VERIFIED
               </div>
            </div>

            <div className="absolute top-10 right-10 z-30 opacity-0 group-hover/image:opacity-100 transition-all duration-1000">
               <div className="font-mono text-emerald-500 text-[10px] font-black tracking-widest bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 rounded-xl backdrop-blur-3xl">
                  FIDELITY: 100%
               </div>
            </div>

            {/* Neural Metadata Overlay (Bottom) */}
            <div className="absolute bottom-12 left-12 right-12 z-30 opacity-0 group-hover/image:opacity-100 transition-all duration-[1200ms] translate-y-8 group-hover/image:translate-y-0 hidden lg:flex justify-between items-end">
               <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-[2px] w-20 bg-red-600 shadow-[0_0_20px_#dc2626]" />
                    <div className="text-meta-premium !opacity-100 !text-[11px] tracking-[0.6em] font-black">CORE_{product.id.toString().padStart(4, '0')}</div>
                  </div>
                  <div className="flex flex-col gap-4">
                     <div className="flex gap-2 items-center">
                        <span className="text-meta-premium !opacity-60 !text-[9px] font-bold">BIOMETRIC_STABILITY</span>
                        <div className="flex gap-1">
                           {[1,1,1,1,1,0,0,0].map((v, i) => (
                             <motion.div 
                               key={i} 
                               initial={{ opacity: 0.2 }}
                               animate={{ opacity: v ? [0.4, 1, 0.4] : 0.1 }}
                               transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                               className={`w-1.5 h-4 rounded-full ${v ? 'bg-red-600 shadow-[0_0_8px_#dc2626]' : 'bg-white/10'}`} 
                             />
                           ))}
                        </div>
                     </div>
                     <div className="text-meta-premium !opacity-60 !text-[9px] flex gap-6 font-bold">
                        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> BIO_SYNC: [OPTIMAL]</span>
                        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> PURITY: 99.9%</span>
                     </div>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-4">
                  <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                     <motion.div 
                       initial={{ width: 0 }}
                       whileInView={{ width: "85%" }}
                       transition={{ duration: 2, ease: "circOut" }}
                       className="h-full bg-red-600 shadow-[0_0_12px_#dc2626]" 
                     />
                  </div>
                  <span className="font-mono text-[8px] text-zinc-600 font-black tracking-[0.6em] uppercase flex items-center gap-2">
                    <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                    SYSTEM_LINK_ACTIVE
                  </span>
               </div>
            </div>

            {/* Quick Actions Hover Reveal */}
            <div className="absolute inset-x-0 bottom-32 flex items-center justify-center gap-6 z-40 opacity-0 group-hover/image:opacity-100 transition-all duration-700 scale-90 group-hover/image:scale-100">
               <Tooltip content="NEURAL_COMPARE">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleProduct(product); }}
                    className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all duration-700 backdrop-blur-3xl hover:scale-110 active:scale-90 ${isCompared ? 'bg-red-600 border-red-500 text-white shadow-[0_0_50px_#dc2626]' : 'bg-editorial-bg/80 border-white/10 text-editorial-text hover:border-red-600/60 hover:bg-red-950/20'}`}
                    aria-label={`${isCompared ? 'Remove' : 'Add'} ${product.name} to comparison`}
                    aria-pressed={isCompared}
                  >
                    <Layers className={`w-8 h-8 ${isCompared ? 'animate-pulse' : ''}`} />
                  </button>
               </Tooltip>

               <Tooltip content="QUICK_PROCURE">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToProtocol(product); }}
                    className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center transition-all duration-700 hover:bg-white hover:text-red-950 hover:scale-110 active:scale-90 border border-transparent shadow-[0_20px_60px_rgba(220,38,38,0.4)]"
                    aria-label={`Add ${product.name} to protocol`}
                  >
                    <Plus className="w-10 h-10" />
                  </button>
               </Tooltip>
            </div>
        </Link>
        
        <div className="mt-14 flex flex-col flex-1 relative z-10" style={{ transform: "translateZ(30px)" }}>
          <h3 className="text-premium text-4xl xl:text-5xl leading-[0.85] mb-8 group-hover:text-red-500 transition-colors duration-700 tracking-tighter">
            {product.name}
          </h3>
          <p className="text-meta-premium line-clamp-2 mb-14 min-h-[3.5em] leading-[1.8] opacity-60 group-hover:opacity-100 transition-opacity duration-1000 !text-[12px] italic">
            // {product.shortBenefit || `Biological optimization protocol initialized for performance.`}
          </p>
          
          <div className="mt-auto pt-12 border-t border-white/[0.05] space-y-10">
             <div className="flex items-center justify-between">
                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-[2px] bg-red-600" />
                      <span className="text-meta-premium opacity-40 !text-[10px]">LOGISTICS_VAL.EXE</span>
                   </div>
                   <div className="flex items-baseline gap-3 relative">
                      <span className="text-2xl text-red-600 font-mono font-black italic drop-shadow-[0_0_10px_rgba(220,38,38,0.4)]" aria-hidden="true">£</span>
                      <span className="font-sans font-black text-5xl lg:text-6xl tracking-tighter text-premium drop-shadow-[0_0_30px_rgba(0,0,0,0.1)]">{product.price.toString().replace('£', '')}</span>
                      <span className="sr-only">Price: {product.price}</span>
                   </div>
                </div>
                <button 
                  onClick={handleNeuralScan}
                  className="w-20 h-20 bg-editorial-bg border border-white/5 rounded-[2rem] flex items-center justify-center transition-all duration-1000 hover:border-red-600/60 hover:shadow-[0_0_40px_rgba(220,38,38,0.3)] group/scan shadow-depth-2 backdrop-blur-3xl"
                  aria-label="Neural Scan"
                >
                  <Search className="w-8 h-8 text-zinc-700 group-hover/scan:text-red-500 transition-all duration-700 group-hover/scan:scale-110" />
                </button>
             </div>
             
              <div className="grid grid-cols-2 gap-6 pb-2">
                 <Link to={`/product/${product.id}`} className="button-secondary py-6 text-[11px] tracking-[0.4em] font-black flex items-center justify-center gap-4 group/btn" aria-label={`View data core for ${product.name}`}>
                   DATA_CORE <ExternalLink className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                 </Link>
                 <button 
                   onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToProtocol(product); }}
                   className="button-premium py-6 text-[11px] tracking-[0.4em] !rounded-[1.5rem] shadow-glow"
                   aria-label={`Execute protocol initialization for ${product.name}`}
                 >
                   EXEC_INIT
                 </button>
              </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ProductCardComponent);
