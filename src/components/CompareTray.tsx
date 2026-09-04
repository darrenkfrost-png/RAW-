import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompare } from "../context/CompareContext";

export default function CompareTray() {
  const { selectedItems, removeProduct } = useCompare();

  if (selectedItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] bg-editorial-surface/90 backdrop-blur-3xl border border-editorial-border p-2 rounded-[2.5rem] shadow-premium flex items-center gap-4"
    >
        <div className="flex -space-x-4 pl-2">
            {selectedItems.map((item) => (
                <div key={item.id} className="w-12 h-12 rounded-[1.2rem] border-[3px] border-editorial-surface bg-editorial-card overflow-hidden relative group/trayitem">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-screen grayscale group-hover/trayitem:scale-110 transition-transform duration-500" />
                    <button 
                        onClick={() => removeProduct(item.id)}
                        className="absolute inset-0 bg-editorial-surface/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                    >
                        <X size={14} className="text-editorial-text" />
                    </button>
                </div>
            ))}
        </div>
        <Link 
            to="/compare" 
            className="px-8 py-4 bg-editorial-text hover:bg-zinc-200 text-editorial-bg rounded-[2rem] font-mono font-black uppercase text-[0.6875rem] tracking-[0.25em] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.04)] hover:scale-[1.02] active:scale-95"
        >
            <Layers size={14} className="text-editorial-accent" /> Compare ({selectedItems.length}/3)
        </Link>
    </motion.div>
  );
}
