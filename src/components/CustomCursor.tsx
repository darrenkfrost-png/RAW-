import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";
import { useUI } from "../context/UIContext";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const trailSpringConfig = { damping: 30, stiffness: 200, mass: 0.8 };
  
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  const trailX = useSpring(cursorX, trailSpringConfig);
  const trailY = useSpring(cursorY, trailSpringConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isSelectable = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.dataset.cursor === 'active';
      
      setIsHovering(!!isSelectable);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleHover);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHover);
    };
  }, [isVisible, cursorX, cursorY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden hidden lg:block mix-blend-difference">
      {/* Secondary Premium Trail */}
      <motion.div
        style={{
          x: trailX,
          y: trailY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
          opacity: isVisible ? (isHovering ? 0.3 : 0.6) : 0,
        }}
        className="absolute w-20 h-20 bg-red-600/10 blur-[8px] rounded-full pointer-events-none transition-transform duration-500"
      />

      {/* Outer Reticle */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
          rotate: 0,
          borderColor: isHovering ? "rgba(0,0,0,0.08)" : "rgba(255, 255, 255, 0.15)"
        }}
        className="absolute w-12 h-12 border rounded-full flex items-center justify-center transition-all duration-300 pointer-events-none shadow-[0_0_15px_rgba(0,0,0,0.03)]"
      >
        {/* Reticle Crosshairs */}
        <div className={`absolute top-[-4px] left-1/2 -ml-[0.5px] w-[1px] h-2 transition-colors duration-300 ${isHovering ? 'bg-editorial-text' : 'bg-editorial-text/40'}`} />
        <div className={`absolute bottom-[-4px] left-1/2 -ml-[0.5px] w-[1px] h-2 transition-colors duration-300 ${isHovering ? 'bg-editorial-text' : 'bg-editorial-text/40'}`} />
        <div className={`absolute left-[-4px] top-1/2 -mt-[0.5px] h-[1px] w-2 transition-colors duration-300 ${isHovering ? 'bg-editorial-text' : 'bg-editorial-text/40'}`} />
        <div className={`absolute right-[-4px] top-1/2 -mt-[0.5px] h-[1px] w-2 transition-colors duration-300 ${isHovering ? 'bg-editorial-text' : 'bg-editorial-text/40'}`} />
      </motion.div>

      {/* Internal Core */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: isVisible ? 1 : 0,
          backgroundColor: "#ffffff"
        }}
        className="absolute w-1.5 h-1.5 rounded-full shadow-[0_0_15px_#ffffff] pointer-events-none"
      />

      {/* Dynamic Telemetry Readout */}
      <motion.div
        style={{
          x: trailX,
          y: trailY,
          translateX: "30px",
          translateY: "10px",
        }}
        animate={{
          opacity: isHovering ? 1 : 0,
          x: isHovering ? 30 : 20,
        }}
        className="absolute pointer-events-none"
      >
        <div className={`bg-editorial-bg/90 backdrop-blur-md border border-editorial-border-light px-4 py-3 font-mono text-[8px] text-editorial-text space-y-1 shadow-2xl rounded-lg`}>
           <div className={`flex justify-between gap-8 uppercase font-black`}>
              <span className="opacity-40">{'Target_Lock'}</span>
              <span className={`text-editorial-text font-bold animate-pulse`}>{'ACTIVE'}</span>
           </div>
           <div className={`flex justify-between gap-8 uppercase`}>
              <span className="opacity-40">Coord_X</span>
              <span>{Math.round(springX.get())}</span>
           </div>
           <div className={`flex justify-between gap-8 uppercase`}>
              <span className="opacity-40">Coord_Y</span>
              <span>{Math.round(springY.get())}</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
