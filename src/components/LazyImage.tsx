import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
}

export default function LazyImage({ src, alt, className = "", containerClassName = "", priority = false, sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-editorial-surface/50 ${containerClassName}`}>
      {/* Loading Skeleton */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-editorial-surface"
          >
            <div className="w-full h-full relative overflow-hidden">
               <motion.div 
                 animate={{ x: ["-100%", "100%"] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/10 to-transparent"
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[8px] text-zinc-700 tracking-[0.5em] uppercase">Syncing_Visual_Buffer...</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Fallback */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-editorial-bg border border-red-900/50">
           <span className="font-mono text-[9px] text-red-600 font-black mb-2 uppercase">[ DATA_CORRUPTION_DETECTED ]</span>
           <span className="font-mono text-[7px] text-zinc-600 uppercase">FAILED_TO_FETCH_REMOTE_ASSET</span>
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{ willChange: "transform, filter, opacity" }}
          initial={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            scale: isLoaded ? 1 : 1.05,
            filter: isLoaded ? "blur(0px)" : "blur(4px)"
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* ⚠️ A permanent `animate-scan` line used to live here, running on EVERY
          image for as long as it was mounted. On the 47-product shelf that is
          47 infinite animations behind the merchandise, at opacity-10 where
          it read as flicker rather than as an effect. Removed: an animation
          nobody can identify is not decoration, it is noise. */}
    </div>
  );
}
