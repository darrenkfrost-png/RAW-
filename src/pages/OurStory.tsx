import { Atmosphere } from '../components/common/Atmosphere';
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import LazyImage from "../components/LazyImage";
import NeuralTimeline from "../components/NeuralTimeline";
import MouseBlob from "../components/MouseBlob";

export default function OurStory() {
  const videoContainerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: videoContainerRef,
    offset: ["start end", "end start"]
  });

  const videoY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div className="pt-32 xl:pt-48 pb-32 overflow-hidden bg-editorial-bg text-editorial-text">
      <MouseBlob />
      <section className="px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto mb-40 relative">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-red-900/10 blur-[250px] pointer-events-none rounded-full mix-blend-screen" />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1200px] relative z-10"
        >
          <div className="absolute -left-8 md:-left-16 top-0 h-full w-1.5 bg-gradient-to-b from-red-600 via-red-900/50 to-transparent hidden lg:block shadow-[0_0_20px_#dc2626]" />
          <span className="text-[0.8125rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] text-red-500 mb-12 block flex items-center gap-4 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
             <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" /> PROJECT_ORIGINS // SEC_001
          </span>
          <h1 className="font-sans font-black uppercase tracking-tighter leading-[0.85] mb-24 drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-editorial-text relative text-display-xl">
            THE LEGACY <br /> OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] relative inline-block mt-4 pb-4">RAW</span>
          </h1>
          <div className="grid md:grid-cols-2 gap-16 xl:gap-24 text-editorial-text-muted font-light leading-relaxed text-2xl lg:text-3xl max-w-5xl">
            <p className="relative pl-8 md:pl-12 border-l border-editorial-border py-2">
               <span className="absolute -left-8 -top-3 text-red-500 font-mono text-[0.8125rem] font-black drop-shadow-[0_0_5px_currentColor] md:hidden">01</span>
              RAW was born from a simple observation: performance has become filtered. Soft. Compromised. We saw an industry obsessed with convenience and "hacks" while ignoring the fundamental truth of the grind.
            </p>
            <p className="relative pl-8 md:pl-12 border-l border-editorial-border py-2">
              <span className="absolute -left-8 -top-3 text-red-500 font-mono text-[0.8125rem] font-black drop-shadow-[0_0_5px_currentColor] md:hidden">02</span>
              Our mission began in a small garage with a single goal: to create the purest, most effective tools for recovery and performance. No fluff. No compromises. Just RAW results.
            </p>
          </div>
        </motion.div>
      </section>

      <section 
        ref={videoContainerRef}
        /* ⚠️ THIS WAS `h-screen min-h-[900px]`. On a 812px phone the 900px
           floor won, so the hero was taller than the screen and a visitor had
           to swipe past a full screen of film before reaching a word of the
           story. The floor now only applies from tablet up, where there is
           room for it; on a phone the hero is exactly one visible screen. */
        className="relative mb-40 min-h-svh w-full overflow-hidden border-y border-editorial-border-light bg-editorial-bg group sm:min-h-[900px]"
      >
        <motion.div 
          style={{ y: videoY }}
          className="absolute inset-0 w-full h-[150%] -top-[25%]"
        >
          <video 
            aria-hidden="true"
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover grayscale brightness-50 mix-blend-luminosity scale-105"
          >
            <source src="https://videos.files.wordpress.com/lUvR2d1e/this-isnt-comfort.its-commitment.cold-exposure-doesnt-care-who-you-are-it-only-reveals-how-.mp4" type="video/mp4" />
          </video>
        </motion.div>
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-editorial-bg/40 to-[#050505] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-red-900/10 pointer-events-none mix-blend-screen" />
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-overlay z-10">
           <h2 className="font-sans font-black text-[clamp(2.5rem,17vw,30rem)] uppercase tracking-tighter text-editorial-text opacity-30 blur-[1px] scale-105 group-hover:scale-100 transition-transform duration-[4000ms] drop-shadow-[0_10px_30px_rgba(0,0,0,1)] mix-blend-screen">NO COMPROMISE</h2>
        </div>
      </section>

      <section className="px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto overflow-hidden">
        <NeuralTimeline />
      </section>

      <section className="bg-editorial-bg text-editorial-text py-48 xl:py-64 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] border-y border-editorial-border my-40 relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-1000 pointer-events-none mix-blend-screen">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_#ff0000_0%,_transparent_50%)]" />
        </div>
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        
        <div className="max-w-[var(--content-max-width)] mx-auto grid lg:grid-cols-2 gap-24 xl:gap-32 items-center relative z-10">
          <div className="space-y-16">
            <div className="flex items-center gap-5">
               <div className="w-2.5 h-2.5 bg-red-500 animate-pulse shadow-[0_0_15px_#dc2626] rounded-full" />
               <span className="text-[0.8125rem] font-black tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] uppercase">DIRECTIVE_ALPHA</span>
            </div>
            <h2 className="font-sans font-black uppercase tracking-tighter mb-20 leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-display-xl">UNFILTERED <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)] block mt-4 pb-4">AMBITION</span></h2>
            <div className="pl-12 border-l-4 w-full max-w-3xl border-red-600 shadow-[-5px_0_30px_rgba(220,38,38,0.3)] bg-gradient-to-r from-red-900/10 via-red-900/5 to-transparent py-8 rounded-r-[2rem]">
              <p className="text-3xl md:text-5xl leading-tight mb-12 font-light italic text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] pr-8">
                "We don't build gear for the casual. We build gear for the obsessed. For the ones who wake up while the world is still dreaming and push past the point where others quit."
              </p>
              <div className="text-[0.75rem] uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black text-editorial-text flex items-center gap-5 bg-editorial-bg/80 backdrop-blur-md py-5 px-10 rounded-xl w-fit border border-editorial-border shadow-[0_15px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_40px_rgba(220,38,38,0.2)] hover:border-red-500/30 transition-all duration-500">
                 <span className="w-12 h-[3px] bg-red-600 shadow-[0_0_10px_#dc2626]"></span> RAW_PERFORMANCE // 001
              </div>
            </div>
          </div>
          
          <div className="relative p-2 rounded-[3rem] bg-gradient-to-b from-red-900/20 to-transparent">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-screen" />
            <div className="aspect-[3/4] bg-editorial-bg overflow-hidden relative group/img border border-editorial-border rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.1)]">
              <LazyImage 
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" 
                alt="Raw Heritage Athlete" 
                className="w-full h-full object-cover grayscale opacity-60 group-hover/img:opacity-100 group-hover/img:grayscale-[10%] group-hover/img:scale-110 transition-all duration-[2000ms] ease-[0.16,1,0.3,1] mix-blend-luminosity filter drop-shadow-[0_0_30px_rgba(0,0,0,0.08)]"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-editorial-bg/40 to-editorial-bg/80 pointer-events-none mix-blend-multiply" />
              <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000 z-10 pointer-events-none mix-blend-screen" />
              
              <div className="absolute top-10 right-10 bg-editorial-bg/90 backdrop-blur-2xl border border-editorial-border-light p-8 flex flex-col gap-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-20 group-hover/img:border-red-500/30 group-hover/img:shadow-[0_20px_50px_rgba(220,38,38,0.2)] transition-all duration-500">
                <span className="text-[0.6875rem] uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black text-red-500 drop-shadow-[0_0_5px_currentColor]">ARCHIVE_FILE // 001</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-48 xl:py-64 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto text-center border border-editorial-border relative overflow-hidden bg-editorial-bg/50 backdrop-blur-3xl rounded-[4rem] mb-40 shadow-[0_40px_120px_rgba(0,0,0,0.1)] shadow-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none opacity-80 mix-blend-screen" />
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-50" />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-40 space-y-12 relative z-10"
        >
          <span className="text-[0.8125rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] text-red-500 block drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] flex items-center justify-center gap-5">
             <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" />
             System Benchmarks
          </span>
          <h3 className="font-sans font-black uppercase tracking-tighter text-editorial-text leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-display-xl">OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] pb-4 inline-block mt-4">STANDARDS</span></h3>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-editorial-border bg-editorial-bg/60 gap-px rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] relative z-10 backdrop-blur-2xl">
          {[
            { label: "Purity", value: "100%", detail: "ISO_9001_PROTOCOLS", color: "text-red-500", accent: "#ef4444", glow: "group-hover:text-red-500 group-hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]" },
            { label: "Performance", value: "Elite", detail: "FIELD_TESTED_V8", color: "text-emerald-500", accent: "#10b981", glow: "group-hover:text-emerald-500 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]" },
            { label: "Recovery", value: "Bio-Active", detail: "CELL_REGEN_TECH", color: "text-blue-500", accent: "#3b82f6", glow: "group-hover:text-blue-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]" },
            { label: "Standards", value: "Gold", detail: "GLOBAL_CERT_504", color: "text-amber-500", accent: "#f59e0b", glow: "group-hover:text-amber-500 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]" }
          ].map((stat, i) => (
            <div key={i} className="py-24 px-10 bg-editorial-bg group hover:bg-editorial-surface/80 transition-all duration-[800ms] relative overflow-hidden flex flex-col items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <motion.div 
                 animate={{ opacity: [0.03, 0.08, 0.03] }}
                 transition={{ duration: 5, repeat: Infinity, delay: i * 0.7 }}
                 className="absolute -right-10 -bottom-10 font-sans font-black text-editorial-text pointer-events-none uppercase leading-none mix-blend-overlay blur-[2px] text-display-xl"
              >
                 {stat.label.substring(0, 3)}
              </motion.div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                 <div className={`font-sans font-black text-6xl md:text-7xl xl:text-8xl mb-8 italic tracking-tighter text-editorial-text group-hover:scale-110 transition-all duration-[800ms] ease-[0.16,1,0.3,1] drop-shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${stat.glow}`}>{stat.value}</div>
                 <div className={`text-[0.8125rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] mb-12 drop-shadow-[0_0_10px_currentColor] ${stat.color}`}>{stat.label}</div>
                 <div className="h-[3px] w-16 bg-zinc-800 mx-auto group-hover:w-full group-hover:bg-current transition-all duration-[800ms] ease-[0.16,1,0.3,1] mb-12 shadow-[0_0_15px_currentColor] rounded-full" style={{ color: stat.accent }} />
                 <div className="bg-editorial-bg/50 border border-editorial-border px-6 py-3 rounded-xl backdrop-blur-md font-mono text-[0.6875rem] font-black text-editorial-text-muted tracking-[0.3em] uppercase group-hover:text-editorial-text group-hover:border-editorial-border-light transition-all duration-500">{stat.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
