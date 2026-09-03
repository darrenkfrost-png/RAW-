import React from 'react';
import { motion } from 'motion/react';
import { allProducts } from '../data/products';

interface PatternProps {
  patternId: number;
}

export default function ProductVisualPatterns({ patternId }: PatternProps) {
  const products = allProducts.slice(0, 15);

  const getPattern = () => {
    const commonClasses = "absolute flex items-center justify-center p-2 border border-red-900/10 bg-red-950/5 backdrop-blur-[2px]";
    
    switch (patternId) {
      case 1: // Technical Cascade
        return products.map((p, i) => (
          <motion.div key={p.id} className={`${commonClasses} w-24`} initial={{ y: -200, opacity: 0 }} animate={{ y: 1000, opacity: [0, 1, 0] }} transition={{ duration: 6, delay: i * 0.4, ease: "linear", repeat: Infinity }} style={{ left: `${(i % 8) * 12}%` }}>
            <img src={p.image} alt={p.name} className="w-16 h-16 object-contain" />
          </motion.div>
        ));
      case 2: // Grid Matrix
        return products.map((p, i) => (
          <motion.div key={p.id} className={`${commonClasses} w-28 h-28`} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 1, 0], scale: 1 }} transition={{ delay: i * 0.2, duration: 2, repeat: Infinity }} style={{ left: `${(i % 5) * 20}%`, top: `${Math.floor(i / 5) * 33}%` }}>
            <img src={p.image} alt={p.name} className="w-20 h-20 object-contain" />
          </motion.div>
        ));
      case 3: // Helix Spin
          return products.map((p, i) => (
            <motion.div key={p.id} className={`${commonClasses} w-24`} initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: [0, 360], x: Math.cos(i) * 200, y: Math.sin(i) * 200 }} transition={{ duration: 8, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }} style={{ left: '50%', top: '50%' }}>
              <img src={p.image} alt={p.name} className="w-16 h-16 object-contain" />
            </motion.div>
          ));
        case 4: // Horizontal Scrollers (Data Streams)
            return products.map((p, i) => (
              <motion.div key={p.id} className="absolute flex items-center justify-center gap-4 bg-red-950/20" initial={{ x: -300 }} animate={{ x: 2000 }} transition={{ duration: 12, delay: i * 0.8, repeat: Infinity, ease: "linear" }} style={{ top: `${(i % 4) * 25}%` }}>
                <img src={p.image} alt={p.name} className="w-20 h-20 object-contain" />
                <span className="font-mono text-red-500 text-xs uppercase tracking-widest">{p.name}</span>
              </motion.div>
            ));
      case 5: // Explosive Burst
        return products.map((p, i) => (
            <motion.div key={p.id} className={`${commonClasses} w-20`} initial={{ scale: 0 }} animate={{ scale: 3, opacity: 0, x: Math.cos(i) * 800, y: Math.sin(i) * 800 }} transition={{ duration: 5, delay: i * 0.15, repeat: Infinity }} style={{ left: '50%', top: '50%' }}>
              <img src={p.image} alt={p.name} className="w-12 h-12 object-contain" />
            </motion.div>
          ));
      case 6: // Random Data Pulses
        return products.map((p, i) => (
          <motion.div key={p.id} className={`${commonClasses} w-24`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 4, delay: Math.random() * 6, repeat: Infinity }} style={{ left: `${Math.random()*85}%`, top: `${Math.random()*85}%` }}>
            <img src={p.image} alt={p.name} className="w-16 h-16 object-contain" />
          </motion.div>
        ));
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
      {getPattern()}
    </div>
  );
}
