import { useRef } from "react";
import { motion } from "motion/react";

export function LazyHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  return (
    <>
      <video 
        ref={videoRef}
        autoPlay 
        muted 
        loop 
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 grayscale contrast-125 mix-blend-screen"
        poster="https://rawofficial.co/wp-content/uploads/2026/02/combatIMG-scaled.jpg"
      >
        <source src="https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none mix-blend-color z-0" />
      <motion.div 
        animate={{ opacity: [0, 0.05, 0] }}
        transition={{ duration: 0.1, repeat: Infinity, repeatType: "mirror" }}
        className="absolute inset-0 bg-white z-0 pointer-events-none"
      />
    </>
  );
}
