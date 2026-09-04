import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, Play, Pause } from "lucide-react";

interface SlideshowProps {
  images: string[];
}

export default function Slideshow({ images }: SlideshowProps) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(next, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, images.length]);

  return (
    <div className="relative group aspect-[4/5] overflow-hidden bg-editorial-bg border border-editorial-border shadow-xl rounded-sm">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          initial={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover absolute inset-0"
          style={{ willChange: "transform, opacity, filter" }}
        />
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-editorial-surface z-20">
        <motion.div 
          key={`progress-${index}`}
          initial={{ width: "0%" }}
          animate={{ width: isPlaying ? "100%" : "0%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]"
        />
      </div>

      <div className="absolute bottom-6 left-6 flex gap-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={prev} className="p-3 bg-editorial-bg/60 hover:bg-red-600 hover:text-white backdrop-blur-md border border-editorial-border text-editorial-text-muted rounded-full transition-all duration-300 transform active:scale-95">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-editorial-bg/60 hover:bg-red-600 hover:text-white backdrop-blur-md border border-editorial-border text-editorial-text-muted rounded-full transition-all duration-300 transform active:scale-95">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button onClick={next} className="p-3 bg-editorial-bg/60 hover:bg-red-600 hover:text-white backdrop-blur-md border border-editorial-border text-editorial-text-muted rounded-full transition-all duration-300 transform active:scale-95">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-6 right-6 overflow-hidden z-20">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-editorial-bg/60 backdrop-blur-md px-3 py-1 font-mono text-[0.6875rem] text-editorial-text border border-editorial-border rounded-full"
        >
          <span className="text-editorial-text font-bold">{index + 1}</span> / {images.length}
        </motion.div>
      </div>
    </div>
  );
}
