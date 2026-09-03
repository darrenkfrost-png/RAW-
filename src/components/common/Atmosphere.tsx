import React from 'react';
import { motion } from 'motion/react';

interface AtmosphereProps {
  glowOpacity?: number;
  gridOpacity?: number;
  glowColor?: string;
  gridMode?: 'dots' | 'lines';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function Atmosphere({
  glowOpacity = 0.03,
  gridOpacity = 0.05,
  glowColor = 'rgba(229, 29, 56, 1)', // editorial accent
  gridMode = 'lines',
  intensity = 'medium',
  className = ''
}: AtmosphereProps) {
  const intensityMap = {
    low: 0.5,
    medium: 1,
    high: 1.5
  };
  
  const mult = intensityMap[intensity];
  
  // Mouse interaction for parallax
  const mouseX = React.useRef(0);
  const mouseY = React.useRef(0);
  const atmosphereRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if(!atmosphereRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.current = (clientX / innerWidth) - 0.5;
      mouseY.current = (clientY / innerHeight) - 0.5;

      // Apply transformation to atmosphere container directly for efficiency
      atmosphereRef.current.style.transform = `translate(${mouseX.current * 20}px, ${mouseY.current * 20}px)`;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={atmosphereRef} className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-transform duration-700 ease-out ${className}`}>
      {/* Primary Atmospheric Glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: glowOpacity * mult,
          scale: [0.8, 1.1, 0.9, 1],
          x: [0, 50, -50, 0],
          y: [0, -30, 40, 0]
        }}
        transition={{ 
          opacity: { duration: 3, ease: 'easeOut' },
          scale: { repeat: Infinity, duration: 25, ease: 'easeInOut' },
          x: { repeat: Infinity, duration: 30, ease: 'easeInOut' },
          y: { repeat: Infinity, duration: 35, ease: 'easeInOut' }
        }}
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-[100%] blur-[120px] mix-blend-screen"
        style={{ background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`, willChange: "transform, opacity" }}
      />
      
      {/* Secondary Depth Glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 1 }}
        animate={{ 
          opacity: (glowOpacity / 2) * mult,
          scale: [1, 1.2, 0.85, 1.05, 1],
          x: [0, -60, 40, -20, 0],
          y: [0, 50, -40, 30, 0]
        }}
        transition={{ 
          opacity: { duration: 4, ease: 'easeOut', delay: 0.5 },
          scale: { repeat: Infinity, duration: 32, ease: 'easeInOut' },
          x: { repeat: Infinity, duration: 28, ease: 'easeInOut' },
          y: { repeat: Infinity, duration: 37, ease: 'easeInOut' }
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-[100%] blur-[100px] mix-blend-screen"
        style={{ background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 60%)`, willChange: "transform, opacity" }}
      />

      {/* Grid Layer */}
      {gridMode === 'lines' && (
        <div 
          className="absolute inset-0 mix-blend-overlay"
          style={{
             backgroundImage: `
               linear-gradient(to right, rgba(128,128,128,${gridOpacity}) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(128,128,128,${gridOpacity}) 1px, transparent 1px)
             `,
             backgroundSize: '48px 48px',
             backgroundPosition: 'center center'
          }}
        />
      )}
      
      {gridMode === 'dots' && (
        <div 
          className="absolute inset-0 mix-blend-overlay"
          style={{
             backgroundImage: `radial-gradient(rgba(128,128,128,${gridOpacity * 3}) 1px, transparent 1px)`,
             backgroundSize: '24px 24px',
             backgroundPosition: 'center center'
          }}
        />
      )}

      {/* Vignette Depth Layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-editorial-bg via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-editorial-bg via-transparent to-transparent opacity-40 top-0 h-[20rem]" />
    </div>
  );
}
