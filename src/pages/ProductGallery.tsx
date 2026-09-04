import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { allProducts } from "../data/products";
import { useNavigate } from "react-router-dom";

export default function ProductGallery() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const navigate = useNavigate();

  const next = () => setIndex((i) => (i + 1) % allProducts.length);
  const prev = () => setIndex((i) => (i - 1 + allProducts.length) % allProducts.length);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(next, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, allProducts.length]);

  const product = allProducts[index];

  return (
    <div className="pt-32 pb-24 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-svh flex flex-col justify-center">
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-editorial-text mb-16 text-center">Visual Protocol Gallery</h1>
      
      <div className="relative aspect-[16/9] w-full bg-editorial-bg border border-editorial-border-light rounded-2xl overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col md:flex-row items-center"
          >
            <div className="w-full md:w-1/2 h-64 md:h-full relative bg-editorial-surface border-r border-editorial-border">
               <img src={product.image} alt={product.name} className="w-full h-full object-contain p-8" />
            </div>
            <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
               <span className="text-red-500 font-mono text-xs uppercase tracking-widest mb-4">{product.category}</span>
               <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-editorial-text mb-6">{product.name}</h2>
               <p className="text-editorial-text-muted mb-8 font-mono text-sm leading-relaxed">{product.shortBenefit}</p>
               <button 
                 onClick={() => navigate(`/product/${product.id}`)}
                 className="px-8 py-3 bg-editorial-text text-editorial-bg font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 self-start"
               >
                 View Protocol
               </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-20">
            <div className="flex gap-4">
                 <button onClick={prev} aria-label="Previous product" className="p-3 bg-editorial-bg/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md border border-editorial-border-light transition-all">
                   <ChevronLeft className="w-5 h-5" />
                 </button>
                 <button onClick={() => setIsPlaying(!isPlaying)} aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"} className="p-3 bg-editorial-bg/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md border border-editorial-border-light transition-all">
                    {isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/> }
                 </button>
                 <button onClick={next} aria-label="Next product" className="p-3 bg-editorial-bg/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md border border-editorial-border-light transition-all">
                   <ChevronRight className="w-5 h-5"/>
                 </button>
            </div>
            <div className="font-mono text-sm text-editorial-text-muted">{index + 1} / {allProducts.length}</div>
        </div>
      </div>
    </div>
  );
}
