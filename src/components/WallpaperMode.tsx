import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUI } from "../context/UIContext";
import WallpaperGallery from "./WallpaperGallery";
import { allProducts } from "../data/products";

const PRODUCT_IMAGES = allProducts.map(p => p.image);

export default function WallpaperMode() {
  const { isWallpaperMode, setIsWallpaperMode } = useUI();
  const [selectedWallpaper, setSelectedWallpaper] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleDismiss = () => {
    if (showGallery) setShowGallery(false);
    else setShowGallery(true);
  };

  return (
    <AnimatePresence>
      {isWallpaperMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-editorial-bg select-none">
          {showGallery && <WallpaperGallery onSelect={(id) => { setSelectedWallpaper(id); setShowGallery(false); }} />}
          
{/* Close Button / Back Out */}
          <button 
            onClick={() => setIsWallpaperMode(false)} 
            className="absolute top-10 right-10 text-editorial-text/50 hover:text-editorial-text font-mono text-xs z-[10001] border border-editorial-border-light px-4 py-2 hover:bg-editorial-text/10 transition-all"
          >
            [ EXIT_WALLPAPER_MODE ]
          </button>

          {/* Dynamic Backgrounds */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Logo */}
            <motion.img src="/brand/raw-logo-red.png" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 z-20 opacity-20" referrerPolicy="no-referrer" />
            
            {/* Mouse Visuals */}
            <motion.div className="absolute w-20 h-20 bg-red-600/10 rounded-full blur-3xl" animate={{ x: mouse.x - 40, y: mouse.y - 40 }} transition={{ type: 'tween', ease: 'linear', duration: 0.05 }} />
          </div>

          <button onClick={handleDismiss} className="absolute bottom-10 left-10 text-editorial-text font-mono z-50 pointer-events-auto border border-editorial-border-light px-6 py-3 hover:bg-editorial-text/10">MANAGE_WALLPAPER</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
