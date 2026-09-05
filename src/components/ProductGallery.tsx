import React, { useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon, Box } from "lucide-react";
import LazyImage from "./LazyImage";

export interface GalleryItem {
  type: 'image' | 'video' | '3d';
  url: string;
}

interface ProductGalleryProps {
  galleryItems: GalleryItem[];
  activeItem: number;
  setActiveItem: (index: number) => void;
}

export default function ProductGallery({ galleryItems, activeItem, setActiveItem }: ProductGalleryProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      // Arrow keys inside a field are for the caret, and while a dialog (the
      // image viewer, the cart) is open they belong to that dialog.
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('[role="dialog"], [aria-modal="true"]')) return;
      if (e.key === "ArrowLeft") {
        setActiveItem(activeItem === 0 ? galleryItems.length - 1 : activeItem - 1);
      } else if (e.key === "ArrowRight") {
        setActiveItem(activeItem === galleryItems.length - 1 ? 0 : activeItem + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem, galleryItems.length, setActiveItem]);

  return (
    <div className="relative group/gallery">
      {/* Wraps: four fixed thumbnails in one flex line were 404px on a 375px screen. */}
      <div className="flex flex-wrap items-center gap-4">
        <button 
          onClick={() => setActiveItem(activeItem === 0 ? galleryItems.length - 1 : activeItem - 1)}
          className="p-5 bg-editorial-bg border border-editorial-border rounded-[1.5rem] hover:border-red-500/50 hover:bg-editorial-bg transition-all duration-[500ms] text-editorial-text-muted hover:text-editorial-text shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(220,38,38,0.2)] flex-shrink-0"
          aria-label="Previous item"
        >
          <ChevronLeft className="w-6 h-6 drop-shadow-[0_2px_4px_currentColor]" />
        </button>
        
        <div
          className="flex-1 overflow-x-auto min-w-0 custom-scrollbar pb-4 pt-4 -mt-4 -mb-4 px-2 -mx-2 flex gap-5 snap-x smooth-scroll"
        >
          {galleryItems.map((item, i) => (
             <motion.button 
               key={i} 
               onClick={() => setActiveItem(i)}
               aria-label={`View gallery item ${i + 1}`}
               aria-current={activeItem === i}
               whileHover={{ y: -8, scale: 1.08 }}
               whileTap={{ scale: 0.95 }}
               className={`w-[110px] xl:w-[130px] flex-shrink-0 snap-start aspect-[4/5] bg-editorial-bg border rounded-[1rem] overflow-hidden transition-all duration-[600ms] ease-out relative group transform-gpu shadow-[0_10px_30px_rgba(0,0,0,0.4)] ${activeItem === i ? 'border-red-500/80 shadow-[0_10px_40px_rgba(220,38,38,0.4)] ring-1 ring-red-500/40' : 'border-editorial-border hover:border-red-600/40 hover:shadow-[0_10px_40px_rgba(220,38,38,0.2)]'}`}
             >
                <div className={`absolute inset-0 transition-opacity duration-[600ms] z-10 ${activeItem === i ? 'bg-red-500/10' : 'bg-transparent group-hover:bg-red-600/5'}`} />
                {item.type === 'image' ? (
                  <>
                    <LazyImage src={item.url} alt={`Product gallery view ${i + 1}`} className={`w-full h-full object-cover transition-all duration-[1000ms] ease-out ${activeItem === i ? 'filter-none scale-100' : 'filter grayscale-[30%] opacity-70 group-hover:grayscale-0 group-hover:opacity-100 scale-105 group-hover:scale-100'}`} containerClassName="w-full h-full absolute inset-0 pointer-events-none" />
                    <motion.div 
                      initial={false}
                      animate={{ opacity: activeItem === i ? 1 : 0 }}
                      className="absolute inset-0 border-2 border-red-500 rounded-[1rem] z-20 pointer-events-none shadow-[inset_0_0_20px_rgba(220,38,38,0.5)]"
                    />
                  </>
                ) : item.type === 'video' ? (
                  <div className="w-full h-full bg-editorial-surface flex items-center justify-center relative shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
                    <Play className="absolute top-3 left-3 w-4 h-4 text-red-500 z-20 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                    <div className="absolute inset-0 bg-editorial-bg/60" />
                    <motion.div 
                      whileHover={{ scale: 1.15 }}
                      className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center group-hover:border-red-500 transition-colors bg-black/40 backdrop-blur-md shadow-depth-2"
                    >
                        <Play className="w-5 h-5 text-editorial-text ml-1 fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    </motion.div>
                    <motion.div 
                      initial={false}
                      animate={{ opacity: activeItem === i ? 1 : 0 }}
                      className="absolute inset-0 border-2 border-red-500 rounded-[1rem] z-20 pointer-events-none shadow-[inset_0_0_20px_rgba(220,38,38,0.5)]"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-editorial-surface flex items-center justify-center relative shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
                    <Box className="absolute top-3 left-3 w-4 h-4 text-red-500 z-20 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                    <div className="absolute inset-0 bg-editorial-bg/60" />
                    <motion.div 
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center group-hover:border-red-500 transition-colors bg-black/40 backdrop-blur-md shadow-depth-2"
                    >
                        <Box className="w-6 h-6 text-editorial-text drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    </motion.div>
                    <motion.div 
                      initial={false}
                      animate={{ opacity: activeItem === i ? 1 : 0 }}
                      className="absolute inset-0 border-2 border-red-500 rounded-[1rem] z-20 pointer-events-none shadow-[inset_0_0_20px_rgba(220,38,38,0.5)]"
                    />
                  </div>
                )}
                {/* Cinematic Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
             </motion.button>
          ))}
        </div>
        
        <button 
          onClick={() => setActiveItem(activeItem === galleryItems.length - 1 ? 0 : activeItem + 1)}
          className="p-5 bg-editorial-bg border border-editorial-border rounded-[1.5rem] hover:border-red-500/50 hover:bg-editorial-bg transition-all duration-[500ms] text-editorial-text-muted hover:text-editorial-text shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(220,38,38,0.2)] flex-shrink-0"
          aria-label="Next item"
        >
          <ChevronRight className="w-6 h-6 drop-shadow-[0_2px_4px_currentColor]" />
        </button>
      </div>
    </div>
  );
}
