import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Play } from "lucide-react";

export function EngagementVideo() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "200px" });

  /* ⚠️ THIS IS THE SAME 133MB REEL THE HERO USES, LOADED A SECOND TIME ON THE
     SAME PAGE. It already waited to come into view, which is good — but on a
     phone or a metered connection a 133MB decorative loop is indefensible
     however patiently it waits. Those visitors get the still instead, which
     at brightness-50 behind a hover effect loses nothing worth having. */
  const heavyOk =
    typeof navigator !== "undefined" &&
    !(navigator as any).connection?.saveData &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.innerWidth >= 900;

  return (
    <div ref={containerRef} className="lg:col-span-8 relative aspect-video group overflow-hidden border border-editorial-border-light bg-editorial-card rounded-[2.5rem] shadow-depth-2 m-12 lg:m-24 z-10">
      {/* High-Tech Overlay Grid */}
      <div className="absolute inset-0 z-10 pointer-events-none neural-grid-overlay"></div>
      
      {isInView && heavyOk ? (
        <video 
          {...({
            autoPlay: true,
            muted: true,
            loop: true,
            playsInline: true,
            className: "w-full h-full object-cover transition-all duration-[2s] ease-[0.16,1,0.3,1] brightness-50 group-hover:brightness-100 scale-110 group-hover:scale-100",
            referrerPolicy: "no-referrer"
          } as any)}
        >
          <source src="https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className="w-full h-full bg-editorial-bg bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: "url('https://rawofficial.co/wp-content/uploads/2026/02/combatIMG-scaled.jpg')" }}
        >
           <Play className="w-12 h-12 text-white/40" />
        </div>
      )}

      {/* Dynamic Data Overlays */}
      <div className="absolute inset-x-12 top-12 z-20 flex justify-between pointer-events-none">
        <div className="space-y-4 crystal-glass-panel p-5 layered-shadows-premium border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-editorial-accent animate-ping shadow-[0_0_10px_currentColor]" />
            <span className="font-mono text-[10px] cinematic-gradient-text font-black uppercase tracking-[0.4em]">LIVE_CORE_FEED</span>
          </div>
          <p className="font-mono text-[9px] text-zinc-400 font-black tracking-widest flex items-center gap-3">
             <span className="w-1 h-3 bg-red-500 rounded-sm" /> 3840x2160 // 60FPS
          </p>
        </div>
        <div className="text-right crystal-glass-panel p-5 layered-shadows-premium border-red-500/20 space-y-3">
          <span className="font-mono text-[10px] text-zinc-400 font-black block tracking-[0.5em] uppercase">04:TRN // OPTIMIZED</span>
          <span className="font-mono text-[9px] text-zinc-600 font-black block tracking-widest flex items-center gap-3 justify-end">
             ENCODE_STATUS: <span className="text-white">VERIFIED</span>
          </span>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-[1000ms] ease-[0.16,1,0.3,1] scale-90 group-hover:scale-100 pointer-events-none z-30">
        <div className="w-32 h-32 rounded-full border border-editorial-border-light flex items-center justify-center bg-editorial-bg/60 backdrop-blur-3xl shadow-[0_0_50px_rgba(255,255,255,0.15)] relative">
          <div className="absolute inset-0 rounded-full border-t border-white shadow-[0_0_15px_rgba(0,0,0,0.15)] animate-[spin_3s_linear_infinite]" />
          <Play className="w-12 h-12 fill-white text-editorial-text translate-x-1.5 drop-shadow-[0_0_10px_rgba(0,0,0,0.08)]" />
        </div>
      </div>

      {/* Progress bar simulation */}
      <div className="absolute bottom-0 left-0 h-2 bg-editorial-bg w-full z-20 overflow-hidden">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/3 bg-gradient-to-r from-editorial-accent to-red-400 shadow-[0_0_20px_rgba(244,63,94,0.5)] rounded-full"
        />
      </div>
    </div>
  );
}
