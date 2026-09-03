import React, { useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const WallpaperCanvas: React.FC = () => {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Helper to convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 115, g: 183, b: 64 };
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    if (settings.activeWallpaper === 'none' || settings.activeWallpaper === 'video') {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); 
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;
    const rgb = hexToRgb(settings.wallpaperColor);
    const speedMult = settings.wallpaperSpeed;
    const brightMult = settings.wallpaperBrightness;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // --- UTILITIES ---
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    // --- ENGINES STATE STORAGE (To persist particles etc) ---
    const state: any = {
        particles: [],
        gridOffset: 0,
        matrixDrops: [],
        initialized: false
    };

    const renderNetwork = () => {
        ctx.fillStyle = '#020408';
        ctx.fillRect(0, 0, width, height);
        
        if (!state.initialized || state.activeMode !== 'network') {
            state.particles = Array.from({ length: 60 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            }));
            state.activeMode = 'network';
            state.initialized = true;
        }

        state.particles.forEach((p: any, i: number) => {
            p.x += p.vx * speedMult;
            p.y += p.vy * speedMult;
            if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 * brightMult})`;
            ctx.fill();

            for (let j = i + 1; j < state.particles.length; j++) {
                const p2 = state.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(1 - dist/150) * 0.2 * brightMult})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        });
    };

    const renderWaves = () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        const lines = 20;
        const step = height / lines;
        
        for (let i = 0; i < lines; i++) {
            ctx.beginPath();
            const yBase = i * step + step/2;
            for (let x = 0; x <= width; x += 20) {
                const y = yBase + Math.sin(x * 0.005 + time * 0.02 * speedMult + i) * 50;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.3 * brightMult})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    };

    const renderMatrix = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade effect
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightMult})`;
        ctx.font = '14px monospace';
        
        const cols = Math.floor(width / 20);
        if (!state.matrixDrops || state.matrixDrops.length !== cols) {
            state.matrixDrops = Array(cols).fill(1);
        }

        for (let i = 0; i < state.matrixDrops.length; i++) {
            const char = String.fromCharCode(0x30A0 + Math.random() * 96);
            const x = i * 20;
            const y = state.matrixDrops[i] * 20;
            ctx.fillText(char, x, y);
            
            if (y > height && Math.random() > 0.975) {
                state.matrixDrops[i] = 0;
            }
            state.matrixDrops[i] += 0.5 * speedMult;
        }
    };

    const renderGrid = () => {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);
        
        // Perspective Grid
        const horizon = height * 0.4;
        const gridSpeed = (time * speedMult) % 40;
        
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.4 * brightMult})`;
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = -width; x < width * 2; x += 80) {
            ctx.beginPath();
            ctx.moveTo(x + (width/2 - x) * 0.4, horizon); // Converge towards center
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = horizon; y < height; y += (y - horizon) * 0.1 + 5) {
            const yPos = y + gridSpeed;
            if (yPos > height) continue;
            ctx.beginPath();
            ctx.moveTo(0, yPos);
            ctx.lineTo(width, yPos);
            ctx.stroke();
        }
    };

    interface Engine {
        render: (ctx: CanvasRenderingContext2D, width: number, height: number, time: number, rgb: {r: number, g: number, b: number}, settings: any, state: any) => void;
    }

    // --- NEW ENGINE REGISTRY ---
    const Engines: Record<string, Engine> = {
      polyrhythm: {
        render: (ctx, width, height, time, rgb, settings, state) => {
            const centerX = width / 2;
            const centerY = height / 2;
            const maxRadius = Math.min(width, height) * 0.4;
            const rings = 18; 
            for (let i = 1; i <= rings; i++) {
                const radius = (i / rings) * maxRadius;
                const speed = 0.003 * (rings - i + 1) * settings.wallpaperSpeed;
                const angle = time * speed + (i * 0.5);
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.08 * settings.wallpaperBrightness})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(0.4 + (i / rings) * 0.4) * settings.wallpaperBrightness})`;
                ctx.fill();
            }
        }
      },
      network: { render: renderNetwork },
      waves: { render: renderWaves },
      matrix: { render: renderMatrix },
      grid: { render: renderGrid }
    };

    const renderRain = () => {
        ctx.fillStyle = 'rgba(5, 10, 20, 0.3)'; 
        ctx.fillRect(0, 0, width, height);
        
        if (!state.initialized || state.activeMode !== 'rain') {
            state.particles = Array.from({ length: 200 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                l: Math.random() * 20 + 10,
                v: Math.random() * 5 + 10
            }));
            state.activeMode = 'rain';
            state.initialized = true;
        }

        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.5 * brightMult})`;
        ctx.lineWidth = 1;

        state.particles.forEach((p: any) => {
            p.y += p.v * speedMult;
            if (p.y > height) {
                p.y = -p.l;
                p.x = Math.random() * width;
            }
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, p.y + p.l);
            ctx.stroke();
        });
    };

    const renderDNA = () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        const particles = 60;
        const amplitude = 100;
        const separation = 20;
        const centerX = width / 2;
        const startY = (height - (particles * separation)) / 2;

        for (let i = 0; i < particles; i++) {
            const y = startY + i * separation;
            const phase = i * 0.2 + time * 0.05 * speedMult;
            
            const x1 = centerX + Math.sin(phase) * amplitude;
            const x2 = centerX + Math.sin(phase + Math.PI) * amplitude;
            
            // Draw strands
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.1 * brightMult})`;
            ctx.stroke();

            // Draw nodes
            ctx.beginPath();
            ctx.arc(x1, y, 4, 0, Math.PI*2);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.8 * brightMult})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x2, y, 4, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * brightMult})`;
            ctx.fill();
        }
    };

    const renderCircuit = () => {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);
        
        if (!state.initialized || state.activeMode !== 'circuit') {
            // Create "tracers"
            state.particles = Array.from({ length: 15 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                dir: Math.floor(Math.random() * 4), // 0: up, 1: right, 2: down, 3: left
                history: []
            }));
            state.activeMode = 'circuit';
            state.initialized = true;
        }

        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.8 * brightMult})`;
        ctx.lineWidth = 2;

        state.particles.forEach((p: any) => {
            // Move in grid steps
            if (Math.random() < 0.05) p.dir = Math.floor(Math.random() * 4);
            
            const speed = 4 * speedMult;
            if (p.dir === 0) p.y -= speed;
            else if (p.dir === 1) p.x += speed;
            else if (p.dir === 2) p.y += speed;
            else p.x -= speed;

            // Bounds wrap
            if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;

            p.history.push({x: p.x, y: p.y});
            if (p.history.length > 20) p.history.shift();

            if (p.history.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.history[0].x, p.history[0].y);
                for(let i=1; i<p.history.length; i++) ctx.lineTo(p.history[i].x, p.history[i].y);
                ctx.stroke();
            }
        });
        // Fade effect
        ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
        ctx.fillRect(0, 0, width, height);
    };

    const renderAurora = () => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        // Simple gradient animation
        const grad = ctx.createLinearGradient(0, 0, width, height);
        const t = time * 0.01 * speedMult;
        grad.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
        grad.addColorStop(0.3 + Math.sin(t)*0.1, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.2 * brightMult})`);
        grad.addColorStop(0.5, `rgba(${255-rgb.r},${255-rgb.g},${255-rgb.b},${0.1 * brightMult})`);
        grad.addColorStop(0.7 + Math.cos(t)*0.1, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.2 * brightMult})`);
        grad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    };

    // Fallbacks and Simple Engines
    const renderSimpleParticles = (type: 'swarm' | 'constellation' | 'snow') => {
        ctx.fillStyle = '#020205';
        ctx.fillRect(0, 0, width, height);
        
        if (!state.initialized || state.activeMode !== type) {
            state.particles = Array.from({ length: type === 'swarm' ? 100 : 50 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5),
                vy: (Math.random() - 0.5),
                size: Math.random() * 2
            }));
            state.activeMode = type;
            state.initialized = true;
        }

        state.particles.forEach((p: any, i: number) => {
            // Logic based on type
            if (type === 'swarm') {
                // Move towards center slightly
                p.vx += (width/2 - p.x) * 0.0001;
                p.vy += (height/2 - p.y) * 0.0001;
            }
            
            p.x += p.vx * speedMult;
            p.y += p.vy * speedMult;
            
            // Bounce/Wrap
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.7 * brightMult})`;
            ctx.fill();

            // Connections for constellation
            if (type === 'constellation') {
                for (let j = i + 1; j < state.particles.length; j++) {
                    const p2 = state.particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(255,255,255, ${0.1 * brightMult})`;
                        ctx.stroke();
                    }
                }
            }
        });
    };

    // --- ANIMATION LOOP ---
    const animate = () => {
        time += 1;
        const mode = settings.activeWallpaper;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0,0,width,height);

        const engine = Engines[mode];
        if (engine) {
            engine.render(ctx, width, height, time, hexToRgb(settings.wallpaperColor), settings, state);
        } else {
            // Fallback to old switch for engines not yet in registry
             switch (mode) {
                case 'rain': renderRain(); break;
                case 'dna': renderDNA(); break;
                case 'circuit': renderCircuit(); break;
                case 'aurora': renderAurora(); break;
                case 'constellation': renderSimpleParticles('constellation'); break;
                case 'swarm': renderSimpleParticles('swarm'); break;
                case 'crystal_cascade': 
                   ctx.fillStyle = `rgba(${hexToRgb(settings.wallpaperColor).r}, ${hexToRgb(settings.wallpaperColor).g}, ${hexToRgb(settings.wallpaperColor).b}, 0.05)`;
                   for(let i=0; i<10; i++) {
                       ctx.fillRect((time * settings.wallpaperSpeed * i) % width, (time * settings.wallpaperSpeed * (i%5)) % height, 100, 150);
                   }
                   break;
                case 'performance_focus':
                   ctx.fillStyle = '#050505';
                   ctx.fillRect(0,0,width,height);
                   break;
                case 'living_shell':
                   ctx.fillStyle = `rgba(${hexToRgb(settings.wallpaperColor).r}, ${hexToRgb(settings.wallpaperColor).g}, ${hexToRgb(settings.wallpaperColor).b}, 0.02)`;
                   ctx.fillRect(0,0,width,height);
                   break;
                // ... etc
                default: ctx.clearRect(0, 0, width, height);
            }
        }
        
        animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        window.removeEventListener('resize', resize);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [settings.activeWallpaper, settings.wallpaperColor, settings.wallpaperSpeed, settings.wallpaperBrightness]);

  if (settings.activeWallpaper === 'none' || settings.activeWallpaper === 'video') return null;

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
    />
  );
};

export default WallpaperCanvas;