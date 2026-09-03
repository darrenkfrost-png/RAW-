import React, { useEffect, useRef } from 'react';
import { useUI } from '../context/UIContext';
import { useSettings } from '../context/SettingsContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function Particles() {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Map textual fidelity to numeric multiplier
  const fidelityMap: Record<string, number> = {
    low: 0,
    balanced: 30,
    high: 80,
    overdrive: 150
  };
  const countMultiplier = fidelityMap[settings.visualFidelity] || 30;

  useEffect(() => {
    if (countMultiplier === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Support high DPI displays
    const dpr = window.devicePixelRatio || 1;

    const initParticles = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      particles = Array.from({ length: countMultiplier }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3 - 0.1, // Slight upward drift
        opacity: Math.random() * 0.5 + 0.1,
        life: 0,
        maxLife: Math.random() * 200 + 100
      }));
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life++;

        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pulse opacity based on life
        const lifeRatio = p.life / p.maxLife;
        const currentOpacity = p.opacity * Math.sin(lifeRatio * Math.PI);
        
        if (p.life >= p.maxLife) {
            p.life = 0;
            p.x = Math.random() * width;
            p.y = Math.random() * height;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 29, 72, ${currentOpacity})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(225, 29, 72, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance
      });

      animationFrameId = requestAnimationFrame(render);
    };

    initParticles();
    render();

    window.addEventListener('resize', initParticles);

    return () => {
      window.removeEventListener('resize', initParticles);
      cancelAnimationFrame(animationFrameId);
    };
  }, [countMultiplier]);

  if (countMultiplier === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] mix-blend-screen opacity-60"
      style={{ display: 'block' }}
    />
  );
}
