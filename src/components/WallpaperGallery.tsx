import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Design generator helper
const generateDesign = (type: number, mouse: { x: number, y: number }) => {
  switch(type) {
    case 0: // Geometric Grid Focus
      return <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 to-editorial-bg grid grid-cols-12 gap-2 opacity-50">
        {[...Array(48)].map((_, i) => <motion.div key={i} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, delay: i * 0.05, repeat: Infinity }} className="border border-red-600/20" />)}
      </div>;
    case 1: // Particle Field
      return <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => <motion.div key={i} className="absolute w-1 h-1 bg-editorial-text rounded-full" animate={{ x: mouse.x * (i/20), y: mouse.y * (i/20) }} transition={{ type: 'spring', damping: 10 }} />)}
      </div>;
    case 2: // Radar
      return <div className="absolute inset-0 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-full h-full border-r border-red-600/50" />
      </div>;
    // ... add more cases 3-7 ...
    default:
      return <div className="absolute inset-0 bg-editorial-bg" />;
  }
};

interface FallingTextProps { text: string; x: number; }
const FallingText = ({ text, x }: FallingTextProps) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }} 
    animate={{ y: '100vh', opacity: [0, 1, 0] }} 
    transition={{ duration: 5, ease: "linear", repeat: Infinity }}
    className="absolute font-mono text-red-600/50 text-[0.6875rem]"
    style={{ left: `${x}%`}}
  >
    {text}
  </motion.div>
);

export default function WallpaperSelector({ onSelect }: { onSelect: (id: number) => void }) {
  return (
    <div className="fixed inset-0 z-[10000] bg-editorial-bg/95 p-10 xl:p-20 overflow-y-auto">
      <h2 className="text-editorial-text text-2xl font-mono mb-10 text-center">[_SELECT_WALLPAPER_AESTHETIC_]</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 justify-center">
        {[...Array(8)].map((_, i) => (
          <button 
            key={i} 
            onClick={() => onSelect(i)} 
            className="w-full aspect-square border border-zinc-700 hover:border-red-600 flex flex-col items-center justify-center text-editorial-text-muted hover:text-editorial-text font-mono transition-all group p-5"
          >
            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">✦</span>
            <span>AESTHETIC_{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
