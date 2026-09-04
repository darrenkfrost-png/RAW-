import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import { allProducts } from "../data/products";
import LazyImage from "../components/LazyImage";
import { useUI } from "../context/UIContext";
import SystemVisualizer from "../components/SystemVisualizer";
import MagneticWrapper from "../components/MagneticWrapper";
import { CascadingBackground } from "../components/home/CascadingBackground";
import ProductCard from "../components/common/ProductCard";
import { TiltCard } from "../components/common/TiltCard";
import { LazyHeroVideo } from "../components/home/LazyHeroVideo";
import { Atmosphere } from "../components/common/Atmosphere";
import { EngagementVideo } from "../components/home/EngagementVideo";
import { LiveTelemetryBar } from "../components/home/LiveTelemetryBar";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  Heart,
  ChevronRight,
  Play,
  Eye,
  ArrowRight,
} from "lucide-react";



export default function Home() {
  const featuredProducts: Product[] = allProducts.slice(0, 6) as Product[];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const headingX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const headingY = useTransform(springY, [-0.5, 0.5], [-30, 30]);
  const secondaryX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const secondaryY = useTransform(springY, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) - 0.5;
    const y = (clientY / innerHeight) - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative h-[100svh] min-h-[900px] flex items-center justify-start overflow-hidden px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] bg-editorial-bg"
        onMouseMove={handleMouseMove}
      >
        <LazyHeroVideo />
        <CascadingBackground text="RAW_..." />
        <Atmosphere glowOpacity={0.06} gridMode="dots" intensity="medium" />
        
        {/* Animated Accent Plate */}
        <motion.div 
          initial={{ opacity: 0, rotateX: 60, rotateY: -15, scale: 0.85, filter: "blur(20px)" }}
          animate={{ opacity: 1, rotateX: 0, rotateY: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/2 -translate-y-1/2 right-0 xl:right-24 2xl:right-40 w-[40%] xl:w-[35%] aspect-[3/4.5] border border-editorial-border opacity-50 hidden lg:block overflow-hidden mix-blend-screen rounded-[3rem] shadow-[0_0_100px_rgba(244,44,75,0.05),inset_0_0_80px_rgba(255,255,255,0.02)] backdrop-blur-3xl z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 via-red-600/5 to-transparent mix-blend-overlay" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-transparent to-transparent" />
          <motion.div 
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="h-32 w-full bg-gradient-to-b from-red-500/20 to-transparent shadow-[0_0_60px_rgba(244,44,75,0.25)]"
          />
          <div className="absolute top-8 left-8 right-8 flex justify-between items-start opacity-40">
            <div className="flex gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(220,38,38,1)]" />
              <span className="font-mono text-[8px] uppercase tracking-[0.4em] font-bold text-red-500">LIVE</span>
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.4em] font-bold">V.4.0.0</span>
          </div>
          <div className="absolute bottom-10 left-10 font-mono text-[9px] text-red-500/80 font-bold tracking-[0.4em] uppercase bg-editorial-bg/40 px-5 py-3.5 rounded-2xl border border-editorial-border backdrop-blur-xl shadow-lg drop-shadow-[0_0_15px_rgba(244,44,75,0.3)] hover:bg-editorial-bg/60 hover:text-red-400 transition-all cursor-crosshair">TACTICAL_OVERLAY // ACTIVE</div>
        </motion.div>
        
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Cinematic Multi-Color Logo Introduction */}
            <div className="relative inline-block mb-12 group holographic-accent">
              <Link to="/">
                <motion.div
                  initial={{ filter: "brightness(0)", scale: 0.9 }}
                  animate={{ filter: "brightness(1)", scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <img 
                    src="/brand/raw-logo-red.png" 
                    alt="RAW Official" 
                    className="h-28 lg:h-36 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(225,29,72,0.4)]"
                    referrerPolicy="no-referrer"
                  />
                  {/* High-Tech Scanline Effect on Logo */}
                  <motion.div 
                    animate={{ y: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-full h-[1px] bg-editorial-text z-20 opacity-20 shadow-[0_0_10px_white]"
                  />
                  {/* Dynamic Color Cycling Layer */}
                  <motion.div 
                    animate={{ 
                      backgroundColor: ["#dc2626", "#eab308", "#ffffff", "#dc2626"],
                      opacity: [0, 0.1, 0.2, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 mix-blend-color z-20 pointer-events-none rounded-2xl"
                  />
                </motion.div>
              </Link>
              <div className="h-[2px] w-full bg-gradient-to-r from-red-600 via-red-900 to-transparent mt-6 opacity-60 shadow-[0_0_10px_rgba(244,63,94,0.5)] rounded-full"></div>
            </div>

            <motion.h1 
              initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", filter: "blur(40px)", opacity: 0, x: -100 }}
              animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", filter: "blur(0px)", opacity: 1, x: 0 }}
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              style={{ x: headingX, y: headingY }}
              className="text-[12vw] xl:text-[220px] leading-[0.7] font-black uppercase tracking-[-0.08em] mb-12 drop-shadow-2xl relative mix-blend-plus-lighter text-premium"
            >
              <span className="relative inline-block">
                <span className="text-zinc-600/30 transition-colors duration-1000 block font-light tracking-[-0.05em] mt-8">NEURAL_PATHWAYS</span>
                <motion.span 
                  animate={{ 
                    opacity: [0.85, 1, 0.85],
                    filter: ["drop-shadow(0 0 40px rgba(52,211,153,0.4))", "drop-shadow(0 0 80px rgba(52,211,153,0.8))", "drop-shadow(0 0 40px rgba(52,211,153,0.4))"],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-500 transition-colors duration-1000 block mt-8 relative z-10 italic"
                >
                  INTEGRATE_PURPOSE
                </motion.span>
                <div className="text-white text-lg xl:text-2xl uppercase tracking-[0.3em] mt-10 font-mono">
                  Train with purpose. Recover with intent.
                </div>
              </span>
              
              <div className="absolute top-1/2 left-1/4 w-[80%] h-[500px] bg-red-600/10 blur-[200px] -z-10 mix-blend-screen pointer-events-none" />
              
              {/* HUD Frame Accents */}
              <div className="absolute -top-16 -left-16 w-32 h-32 border-t-2 border-l-2 border-red-600/40 rounded-tl-[4rem] pointer-events-none shadow-[0_0_30px_rgba(220,38,38,0.2)]" />
              <div className="absolute -bottom-16 -right-16 w-32 h-32 border-b-2 border-r-2 border-red-600/40 rounded-br-[4rem] pointer-events-none shadow-[0_0_30px_rgba(220,38,38,0.2)]" />
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ x: secondaryX, y: secondaryY }}
              className="font-mono text-sm xl:text-[16px] text-meta-premium tracking-[0.2em] font-black max-w-2xl leading-[2] mb-16 p-10 rounded-[2.5rem] border border-editorial-border bg-editorial-text/[0.01] backdrop-blur-3xl shadow-premium relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <p><span className="text-red-600 mr-4">//</span> RAW_PROTOCOL_OS exists for operatives who refuse to live halfway. Every system is built around performance, resilience, and real-world kinetic output.</p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
               className="flex flex-wrap gap-4 mb-20 relative z-20"
            >
                <Link to="/shop" className="button-premium" aria-label="Explore Archive Collection">Explore_Archive</Link>
                <Link to="/knowledge-core" className="button-secondary" aria-label="Open AI Product Scanner">AI_Product_Scan</Link>
                <Link to="/protocol-builder" className="button-secondary" aria-label="Launch Protocol Builder">Build_Protocol</Link>
                <Link to="/recovery" className="button-secondary" aria-label="View Recovery category">View_Recovery</Link>
            </motion.div>

            {/* Bio-Metrics Ticker (State of the Art Interaction) */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
               animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
               transition={{ delay: 1.2, duration: 2, ease: [0.16, 1, 0.3, 1] }}
               className="flex flex-wrap gap-12 xl:gap-24 mb-20 border-l-[6px] border-red-600 pl-12 xl:pl-20 bg-gradient-to-r from-red-600/5 via-red-900/5 to-transparent py-14 rounded-r-[6rem] shadow-[inset_40px_0_80px_rgba(220,38,38,0.1)] relative overflow-hidden backdrop-blur-md"
            >
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent pointer-events-none mix-blend-screen" />
               {[
                 { label: "BLOOD_FLOW", value: "98.4%", drift: "+0.2", tooltip: "Indicators for circulatory efficiency and oxygen delivery rate.", suffix: "%" },
                 { label: "NEURAL_STABILITY", value: "100.0", drift: "NOMINAL", tooltip: "System simulation of nervous system readiness and focus state.", suffix: "%" },
                 { label: "OX_SATURATION", value: "99.2", drift: "-0.1", tooltip: "Simulation of oxygen saturation levels during peak output.", suffix: "%" },
                 { label: "SYSTEM_CORE", value: "ACTIVE", drift: "READY", tooltip: "Central management system status for all metabolic protocols.", suffix: "" }
               ].map((metric, i) => (
                 <div key={i} className="flex flex-col gap-5 group cursor-help relative z-10 transition-transform duration-[1000ms] hover:scale-110 transform-gpu min-w-[220px]" 
                     role="img" 
                     aria-label={`Metric: ${metric.label}, Value: ${metric.value}${metric.suffix}, Status: ${metric.drift}`}>
                    <span className="font-mono text-[11px] font-black items-center flex gap-4 text-editorial-text-muted/60 tracking-[0.5em] uppercase group-hover:text-red-500 transition-colors duration-[800ms]">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600/30 group-hover:bg-red-600 group-hover:animate-ping shadow-[0_0_15px_currentColor] transition-colors duration-[1000ms]" />
                      {metric.label}
                    </span>
                    <div className="flex items-baseline gap-5">
                       <span className="font-sans font-black text-4xl xl:text-5xl tracking-[-0.05em] text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-[1000ms] group-hover:text-red-500">{metric.value}{metric.suffix}</span>
                       <span className="font-mono text-[10px] text-red-500 font-black bg-red-600/10 px-4 py-1.5 rounded-xl border border-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.1)]">{metric.drift}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: metric.value === 'ACTIVE' ? "100%" : metric.value }}
                          transition={{ duration: 2, delay: 1.5 + (i * 0.2), ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-gradient-to-r from-red-600 to-red-400"
                        />
                    </div>
                    <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-10 w-56 leading-tight font-medium font-mono">
                        [TELEMETRY_LOG] // {metric.tooltip}
                    </span>
                 </div>
               ))}
            </motion.div>
            
            <div className="flex flex-col sm:flex-row items-center gap-10 xl:gap-16">
               <MagneticWrapper>
                 <Link 
                   to="/shop" 
                   className="group/btn relative px-14 py-7 bg-red-600 text-white rounded-[2rem] font-black text-[12px] tracking-[0.4em] overflow-hidden hover:shadow-[0_20px_50px_rgba(220,38,38,0.6)] transition-all duration-500 block w-full sm:w-auto text-center border-b-[4px] border-red-800 active:border-b-0 active:translate-y-[4px]"
                 >
                    <span className="relative z-10 flex items-center justify-center gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
                      INITIALIZE_LOGISTICS <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-3 transition-transform duration-300 drop-shadow-[0_0_5px_currentColor]" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-editorial-text/40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                 </Link>
               </MagneticWrapper>
               <div className="flex items-center gap-5 bg-editorial-bg/80 px-10 py-5 rounded-full border border-editorial-border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shadow-[0_0_10px_#22c55e]" />
                  <span className="text-[11px] font-bold text-editorial-text-muted tracking-[0.5em] uppercase">OPERATIONAL_STATUS: <span className="text-green-500 drop-shadow-[0_0_8px_currentColor]">OPTIMAL</span></span>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STAY SAFE WITH RAW — the live campaign promotion */}
      <section className="relative z-10 border-y border-editorial-border bg-editorial-bg overflow-hidden">
        <Link to="/stay-safe" className="group block relative">
          {/* The campaign's own key art carries the section */}
          <img
            src="/promo/assets/hero-banner.jpg"
            alt=""
            loading="lazy"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-right opacity-40 group-hover:opacity-55 saturate-[1.1] transition-opacity duration-700 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent pointer-events-none" />
          <div className="section-container relative py-14 md:py-20 flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
            <div className="flex-1 min-w-0">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-red-500 block mb-4">
                LIVE_CAMPAIGN // #STAYSAFEWITHRAW
              </span>
              <h2 className="font-sans font-black text-4xl md:text-6xl uppercase leading-[0.9] tracking-tight mb-4">
                100,000 free<br className="hidden md:block" /> condoms. No catch.
              </h2>
              <p className="text-editorial-text-muted text-sm md:text-base max-w-xl leading-relaxed">
                Not samples. Not free with purchase. Free means free — sign up, we post
                you a pack in plain packaging, and all we ask is what you honestly thought.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-3 px-8 py-4 border border-red-500/40 group-hover:border-red-500 group-hover:bg-red-500/10 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-red-400 group-hover:text-red-300 transition-all duration-500">
                Claim your pack
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Categories Sections - Styled for Editorial */}
      <section className="py-32 xl:py-64 border-y border-editorial-border bg-editorial-bg relative overflow-hidden">
        <Atmosphere glowOpacity={0.02} glowColor="rgba(244, 44, 75, 1)" gridMode="lines" />
        <div className="absolute top-0 right-0 py-20 px-10 opacity-[0.02] pointer-events-none mix-blend-screen">
           <span className="font-sans font-black text-[18vw] leading-[0.8] uppercase select-none">PROTOCOLS</span>
        </div>
        <div className="section-container relative z-10">
          <div className="mb-32 xl:mb-48 font-sans text-center lg:text-left pt-10">
            <h2 className="text-6xl md:text-8xl xl:text-[130px] leading-[0.85] font-black tracking-[-0.03em] mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-premium">PERFORMANCE DOESN'T <br className="hidden xl:block" /> EXIST IN ISOLATION.</h2>
            <div className="grid md:grid-cols-3 gap-12 pt-10">
                {[
                  {
                    title: "Competitive Sport & Athletic Culture",
                    description: "Built for athletes, fighters, lifters, and high-output individuals who demand consistency under pressure."
                  },
                  {
                    title: "Recovery Science",
                    description: "Structured support for rest, restoration, nervous system regulation, cold exposure, mobility, and return-to-performance routines."
                  },
                  {
                    title: "Advanced Nutrition",
                    description: "Targeted supplements, hydration, protein, minerals, adaptogens, and performance support formulas designed to complement disciplined training."
                  }
                ].map((pillar, i) => (
                  <div key={i} className="bg-editorial-bg p-10 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                    <div className="w-12 h-12 bg-red-600/10 flex items-center justify-center rounded-2xl mb-8">
                       <div className="w-6 h-6 bg-red-600 rounded" />
                    </div>
                    <h3 className="text-premium font-black text-xl mb-6 uppercase tracking-wider">{pillar.title}</h3>
                    <p className="text-editorial-text-muted leading-relaxed text-sm">{pillar.description}</p>
                  </div>
                ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 xl:gap-20">
            <Link to="/nutrients" className="card-premium group/card aspect-[3/4] hover-raise" aria-label="Explore Nutrients Protocols">
              <div className="holographic-glow group-hover/card:opacity-60 transition-opacity duration-1000" />
              <div className="scanner-line top-1/4 group-hover/card:animate-[scan_3s_infinite]" />
              
              <LazyImage 
                src="https://rawofficial.co/wp-content/uploads/2026/02/nutrients-1024x173.png" 
                alt="Nutrients" 
                className="w-full h-full object-contain p-16 opacity-40 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-[2s] ease-fluid" 
                containerClassName="w-full h-full"
              />

              <div className="absolute inset-0 flex flex-col justify-end p-12 z-30">
                <div className="mb-6 w-24 h-[1px] bg-editorial-text/20 overflow-hidden relative">
                   <motion.div initial={{ x: "-100%" }} whileInView={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-1/2 bg-red-500 shadow-[0_0_15px_#dc2626]" />
                </div>
                <h3 className="font-sans font-black text-6xl xl:text-7xl uppercase mb-6 leading-none text-editorial-text transition-transform duration-700 group-hover/card:-translate-y-2">Fuel <br /> <span className="text-red-500">Intent</span></h3>
                <p className="text-editorial-text-muted font-mono text-[10px] tracking-widest uppercase mb-10 opacity-0 group-hover/card:opacity-100 transition-all duration-700 delay-100 translate-y-4 group-hover/card:translate-y-0 leading-relaxed">
                  // Precision nutrition and supplementation systems engineered for maximum bio-availability.
                </p>
                <div className="button-secondary w-fit pointer-events-auto opacity-0 group-hover/card:opacity-100 transition-all duration-700 delay-200">Deploy Nutrients</div>
              </div>
            </Link>
            
            <Link to="/combat" className="card-premium group/card aspect-[3/4] hover-raise" aria-label="Explore Combat Protocols">
              <div className="holographic-glow group-hover/card:opacity-60 transition-opacity duration-1000" />
              <div className="scanner-line top-1/2 group-hover/card:animate-[scan_4s_infinite]" />
              
              <LazyImage 
                src="https://rawofficial.co/wp-content/uploads/2026/02/combat-1024x201.png" 
                alt="Combat" 
                className="w-full h-full object-contain p-16 opacity-40 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-[2s] ease-fluid" 
                containerClassName="w-full h-full"
              />

              <div className="absolute inset-0 flex flex-col justify-end p-12 z-30">
                <div className="mb-6 w-24 h-[1px] bg-editorial-text/20 overflow-hidden relative">
                   <motion.div initial={{ x: "-100%" }} whileInView={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-1/2 bg-red-500 shadow-[0_0_15px_#dc2626]" />
                </div>
                <h3 className="font-sans font-black text-6xl xl:text-7xl uppercase mb-6 leading-none text-editorial-text transition-transform duration-700 group-hover/card:-translate-y-2">The <br /> <span className="text-red-500">Arena</span></h3>
                <p className="text-editorial-text-muted font-mono text-[10px] tracking-widest uppercase mb-10 opacity-0 group-hover/card:opacity-100 transition-all duration-700 delay-100 translate-y-4 group-hover/card:translate-y-0 leading-relaxed">
                  // Combat architecture and tactical fightwear designed for high-intensity environments.
                </p>
                <div className="button-secondary w-fit pointer-events-auto opacity-0 group-hover/card:opacity-100 transition-all duration-700 delay-200">Enter Arena</div>
              </div>
            </Link>
            
            <Link to="/recovery" className="card-premium group/card aspect-[3/4] hover-raise" aria-label="Explore Recovery Protocols">
              <div className="holographic-glow group-hover/card:opacity-60 transition-opacity duration-1000" />
              <div className="scanner-line top-3/4 group-hover/card:animate-[scan_2.5s_infinite]" />
              
              <LazyImage 
                src="https://rawofficial.co/wp-content/uploads/2026/02/recovery-1024x179.png" 
                alt="Recovery" 
                className="w-full h-full object-contain p-16 opacity-40 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-[2s] ease-fluid" 
                containerClassName="w-full h-full"
              />

              <div className="absolute inset-0 flex flex-col justify-end p-12 z-30">
                <div className="mb-6 w-24 h-[1px] bg-editorial-text/20 overflow-hidden relative">
                   <motion.div initial={{ x: "-100%" }} whileInView={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-1/2 bg-red-500 shadow-[0_0_15px_#dc2626]" />
                </div>
                <h3 className="font-sans font-black text-6xl xl:text-7xl uppercase mb-6 leading-none text-editorial-text transition-transform duration-700 group-hover/card:-translate-y-2">Total <br /> <span className="text-red-500">Reset</span></h3>
                <p className="text-editorial-text-muted font-mono text-[10px] tracking-widest uppercase mb-10 opacity-0 group-hover/card:opacity-100 transition-all duration-700 delay-100 translate-y-4 group-hover/card:translate-y-0 leading-relaxed">
                  // Rest optimisation and regulation tools built to help the body return stronger.
                </p>
                <div className="button-secondary w-fit pointer-events-auto opacity-0 group-hover/card:opacity-100 transition-all duration-700 delay-200">Deploy Recovery</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

        {/* Brand Essence Video Section */}
      <section className="min-h-svh bg-editorial-bg flex flex-col lg:grid lg:grid-cols-2 relative z-10 w-full overflow-hidden border-y border-editorial-border group/motion">
        {/* Left Side: Editorial Context */}
        <div className="relative p-12 lg:p-24 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-editorial-border z-10 bg-black/40 backdrop-blur-3xl shadow-inner shadow-red-500/5">
          <div className="absolute top-0 left-0 w-full overflow-hidden whitespace-nowrap p-4 border-b border-white/5 pointer-events-none opacity-20">
             <div className="flex gap-20 animate-[marquee_40s_linear_infinite] font-mono text-[9px] font-black uppercase tracking-[0.6em] text-red-500">
               <span>Neural_Interface_Connected</span>
               <span>Signal_Pulse: Stable</span>
               <span>Operational_Capacity: 110%</span>
               <span>Sector_Alpha_Active</span>
               <span>Supply_Chain_Awaiting_Order</span>
               <span>Neural_Interface_Connected</span>
               <span>Signal_Pulse: Stable</span>
             </div>
          </div>
          <div className="absolute top-12 left-12 flex items-center gap-4 pt-12">
             <span className="w-16 h-[3px] bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] rounded-full"></span>
             <span className="text-meta-premium">PROJECT_ALPHA // 001</span>
          </div>
          
          <div className="space-y-12 pt-12">
            <h2 className="font-display font-black text-6xl md:text-[120px] xl:text-[160px] uppercase leading-[0.8] tracking-[-0.03em] text-premium drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              RAW <br /> IN <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">MOTION</span>
            </h2>
            
            <p className="text-editorial-text-muted font-light leading-relaxed text-xl xl:text-3xl max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              Witness the discipline. Every drop of sweat, every breath, every rep is a step towards total output optimization.
            </p>
            
            {/* Live Feed Overlay UI */}
             <div className="flex gap-8 items-center bg-editorial-bg/60 backdrop-blur-xl border border-editorial-border p-6 rounded-3xl w-fit shadow-md group/feed hover:border-red-500 transition-colors">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-editorial-text-muted tracking-[0.3em] uppercase mb-2">FPS_SIGNAL</span>
                      <span className="font-mono text-lg text-editorial-text font-black group-hover:text-red-500">60.00</span>
                   </div>
                   <div className="w-[1px] h-10 bg-editorial-text/10" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-editorial-text-muted tracking-[0.3em] uppercase mb-2">BITRATE</span>
                      <span className="font-mono text-lg text-emerald-500 font-black">10.5MB/s</span>
                   </div>
                </div>

            <div className="pt-8">
            <Link to="/performance-system" className="button-premium" aria-label="Watch Protocol Process Video">
               Watch Protocol <Play className="w-5 h-5 fill-current ml-4 inline-block" aria-hidden="true" />
            </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Immersive Media Pane */}
        <div className="relative aspect-square lg:aspect-auto overflow-hidden group">
          <EngagementVideo />
          
          {/* Signal/Live Indicators */}
           <div className="absolute top-10 left-10 z-20 bg-red-600 text-white text-[10px] font-black tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-editorial-text animate-pulse" /> LIVE_FEED
           </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 xl:py-48 relative z-10 border-b border-editorial-border">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div>
            <span className="text-meta-premium mb-8 block flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shadow-[0_0_10px_currentColor]" /> Archive Collection
            </span>
            <h2 className="font-sans font-black text-7xl md:text-8xl xl:text-[150px] uppercase tracking-[-0.03em] leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-premium">Featured <br className="hidden xl:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">Gear</span></h2>
          </div>
          <MagneticWrapper>
            <Link to="/shop" className="group flex items-center gap-5 px-10 py-6 bg-editorial-bg/80 backdrop-blur-2xl border border-editorial-border-light rounded-[2rem] hover:border-red-500/50 hover:bg-editorial-bg transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.08)]" aria-label="View All Logistics Selection">
              <span className="font-bold uppercase tracking-[0.4em] text-[12px] text-editorial-text">View All Logistics</span>
              <ChevronRight className="w-5 h-5 text-red-500 group-hover:translate-x-2 transition-transform duration-300 drop-shadow-[0_0_5px_currentColor]" />
            </Link>
          </MagneticWrapper>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 xl:gap-20">
          {featuredProducts.map((product, idx) => (
            <TiltCard key={product.id} idx={idx}>
              <ProductCard product={product} idx={idx} />
            </TiltCard>
          ))}
        </div>
      </div>
    </section>

      {/* Mission Control - Technical Vitals */}
      <section className="py-48 bg-editorial-bg border-y border-editorial-border relative overflow-hidden">
        <Atmosphere glowOpacity={0.03} gridMode="dots" intensity="medium" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none mix-blend-screen">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-sans font-black text-[35vw] leading-none uppercase">CORE_X</div>
        </div>
        
        <div className="section-container relative z-10 text-center">
          <div className="mb-40 space-y-12">
             <div className="flex items-center justify-center gap-8">
                <div className="w-24 h-[1px] bg-red-600 shadow-[0_0_20px_#dc2626]" />
                <span className="text-meta-premium tracking-[0.8em]">BIO_KINETIC_INTELLIGENCE // PROTOCOL_V4</span>
                <div className="w-24 h-[1px] bg-red-600 shadow-[0_0_20px_#dc2626]" />
             </div>
             <h2 className="font-sans font-black text-8xl md:text-9xl xl:text-[180px] uppercase tracking-[-0.05em] leading-[0.75] drop-shadow-[0_15px_40px_rgba(0,0,0,0.15)] text-premium">THE ARCHITECTURE <br /> OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_40px_rgba(220,38,38,0.4)]">OUTPUT</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-24 xl:gap-40">
             {[
               { 
                 label: "PURITY_VALVE", 
                 value: 99.8, 
                 detail: "ISO_9951_SECURED", 
                 color: "#dc2626",
                 subMetrics: ["MOLECULAR_STABILITY: 1.0", "FILTRATION: MAX"]
               },
               { 
                 label: "QUANTUM_OUTPUT", 
                 value: 42.4, 
                 detail: "EXAFLOP_COMPUTE", 
                 color: "#ffffff",
                 subMetrics: ["SIGNAL_RECEPTION: OPTIMAL", "LATENCY: 0.1MS"]
               },
               { 
                 label: "SYNC_RATE", 
                 value: 94.1, 
                 detail: "GLOBAL_NODE_MESH", 
                 color: "#dc2626",
                 subMetrics: ["PEER_CONNECTION: STATIC", "UPTIME: 99.99%"]
               }
             ].map((gauge, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, scale: 0.9, y: 50 }}
                 whileInView={{ opacity: 1, scale: 1, y: 0 }}
                 transition={{ duration: 1.5, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                 viewport={{ once: true }}
                 className="flex flex-col items-center gap-16 group relative"
               >
                 <div className="relative w-80 h-80 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                       <circle cx="160" cy="160" r="150" className="stroke-white/5 fill-none" strokeWidth="2" />
                       <motion.circle 
                          cx="160" cy="160" r="150" 
                          stroke={gauge.color}
                          strokeWidth="6"
                          strokeDasharray="942.48"
                          initial={{ strokeDashoffset: 942.48 }}
                          whileInView={{ strokeDashoffset: 942.48 - (942.48 * gauge.value / 100) }}
                          transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay: 0.5 + (i * 0.2) }}
                          className="fill-none drop-shadow-[0_0_15px_currentColor]"
                          strokeLinecap="round"
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-editorial-bg/60 backdrop-blur-3xl rounded-full m-12 border border-white/5 shadow-[inset_0_0_60px_rgba(0,0,0,0.2)] group-hover:bg-editorial-bg/40 transition-all duration-[1000ms] group-hover:scale-110">
                       <span className="font-sans font-black text-8xl tracking-[-0.05em] text-premium drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]">{gauge.value}</span>
                       <span className="text-meta-premium mt-4 tracking-[0.5em] font-black">{gauge.label}</span>
                       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-red-600/40 rounded-full blur-[1px]" />
                    </div>
                 </div>
                 
                 <div className="text-center space-y-8 w-full max-w-xs">
                    <div className="font-mono text-[11px] font-black tracking-[0.5em] uppercase flex items-center justify-center gap-4 text-editorial-text drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]" /> PROTOCOL_STATUS: <span className="text-green-500 italic">VERIFIED</span>
                    </div>
                    
                    <div className="space-y-4 p-8 bg-editorial-bg/40 border border-white/5 rounded-3xl backdrop-blur-xl group-hover:border-red-600/20 transition-all duration-700">
                        {gauge.subMetrics.map((sm, j) => (
                          <div key={j} className="flex justify-between items-center gap-6">
                             <div className="h-[1px] flex-1 bg-white/5" />
                             <span className="font-mono text-[9px] text-zinc-500 font-bold tracking-widest uppercase truncate">{sm}</span>
                             <div className="h-[1px] flex-1 bg-white/5" />
                          </div>
                        ))}
                    </div>

                    <div className="h-[4px] w-24 bg-zinc-800 mx-auto group-hover:w-full group-hover:bg-red-600 transition-all duration-[1500ms] ease-[0.16,1,0.3,1] shadow-[0_0_20px_rgba(220,38,38,0)] group-hover:shadow-[0_0_20px_#dc2626] rounded-full" />
                    <p className="font-mono text-[11px] font-black text-zinc-500 tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 transition-opacity duration-1000">{gauge.detail}</p>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Global Synchronization Matrix - High Tech Vision */}
      <section className="py-48 bg-editorial-bg relative overflow-hidden border-b border-editorial-border group/matrix">
        <Atmosphere glowOpacity={0.03} gridMode="lines" intensity="medium" />
        <div className="section-container relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="w-12 h-[2px] bg-red-600 shadow-[0_0_15px_#dc2626]" />
                    <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-[0.4em] font-black">Global_Network_Status</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white leading-[0.8]">
                  Operational <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900 italic">Omnipresence</span>
                </h2>
            </div>
            <div className="flex flex-col items-end gap-4 p-8 bg-editorial-surface/40 border border-editorial-border rounded-[2rem] backdrop-blur-3xl shadow-depth-2">
                <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest font-black">ACTIVE_NODES</span>
                <span className="text-4xl font-black text-white italic">14,204</span>
                <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="h-full w-24 bg-red-500 shadow-[0_0_15px_#dc2626]"
                    />
                </div>
            </div>
          </div>

          <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-24 gap-3">
             {Array.from({ length: 96 }).map((_, i) => {
               const isActive = Math.random() > 0.4;
               const isCritical = Math.random() > 0.95;
               return (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, scale: 0.5 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.005, duration: 0.8 }}
                   className={`aspect-square rounded-sm border ${
                     isActive 
                        ? isCritical 
                           ? 'bg-red-600 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse' 
                           : 'bg-editorial-text/20 border-white/10 hover:bg-red-600/40 hover:border-red-500/50 transition-all duration-500'
                        : 'bg-white/[0.02] border-white/5'
                   } relative group/node overflow-hidden cursor-crosshair`}
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/node:opacity-100 transition-opacity" />
                 </motion.div>
               );
             })}
          </div>

          <div className="mt-20 grid md:grid-cols-4 gap-8">
             {[
               { region: "Sector_Omega", status: "Optimal", ping: "14ms", load: "24%" },
               { region: "Sector_Alpha", status: "Active", ping: "82ms", load: "68%" },
               { region: "Sector_Delta", status: "Nominal", ping: "45ms", load: "12%" },
               { region: "Sector_Sigma", status: "Peak", ping: "124ms", load: "94%" },
             ].map((node, i) => (
               <div key={i} className="p-8 border border-editorial-border bg-editorial-surface/20 rounded-3xl group/info hover:border-red-500/30 transition-all">
                  <div className="flex justify-between items-center mb-6">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-black">{node.region}</span>
                      <div className={`w-2 h-2 rounded-full ${node.load === '94%' ? 'bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]' : 'bg-emerald-500 opacity-60'}`} />
                  </div>
                  <div className="flex items-baseline gap-4 mb-4">
                      <span className="text-2xl font-black text-white italic">{node.ping}</span>
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">SIGNAL_DELAY</span>
                  </div>
                  <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: node.load }}
                        transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                        className={`h-full ${node.load === '94%' ? 'bg-red-600' : 'bg-editorial-text-muted/40'}`}
                      />
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Recent Field Intelligence - Premium Feed Expansion */}
      <section className="py-48 bg-editorial-bg relative overflow-hidden">
        <div className="section-container">
           <div className="mb-24 flex flex-col md:flex-row justify-between items-end gap-12">
              <div>
                 <span className="text-meta-premium mb-8 block flex items-center gap-4">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" /> FIELD_INTEL_STREAM
                 </span>
                 <h2 className="font-sans font-black text-7xl md:text-8xl xl:text-[140px] uppercase tracking-[-0.05em] leading-[0.8] text-premium">Mission <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 italic">Updates</span></h2>
              </div>
              <Link to="/academy" className="button-secondary group">
                 View_Archives <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
           </div>

           <div className="grid lg:grid-cols-3 gap-12">
              {[
                { 
                  tag: "PROTOCOL_V4.2", 
                  title: "Neural Synergy Enhancement Deployed", 
                  date: "24.05.2026",
                  summary: "Technical architectural shift in bio-kinetic feedback loops now active for all active operatives.",
                  image: "/promo/assets/covered-wide.jpg"
                },
                { 
                  tag: "SECTOR_EXPANSION", 
                  title: "Bangkok Training Hub Initialization", 
                  date: "18.05.2026",
                  summary: "Primary kinetic facility in Sector Delta reaches total operational capacity. Academy intakes open.",
                  image: "/promo/assets/boxes-real.jpg"
                },
                { 
                  tag: "BIO_LOGISTICS", 
                  title: "Omega_Protocol Supply Chain Resilience", 
                  date: "12.05.2026",
                  summary: "Neural routing algorithms optimized for cross-sector fulfillment. Transit efficiency elevated by 14.2%.",
                  image: "https://rawofficial.co/wp-content/uploads/2026/02/combat-1024x201.png"
                }
              ].map((intel, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group/intel relative aspect-[3/4.5] rounded-[3rem] overflow-hidden border border-editorial-border shadow-depth-3"
                >
                   <div className="absolute inset-0 bg-editorial-surface/40 backdrop-blur-sm z-10 opacity-0 group-hover/intel:opacity-100 transition-all duration-700" />
                   <img src={intel.image} className="absolute inset-0 w-full h-full object-cover grayscale group-hover/intel:grayscale-0 group-hover/intel:scale-110 transition-all duration-[2s] ease-fluid opacity-40 group-hover/intel:opacity-60" referrerPolicy="no-referrer" />
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-20" />
                   
                   <div className="absolute inset-x-0 bottom-0 p-12 z-30 space-y-6">
                      <div className="flex items-center gap-4">
                         <span className="font-mono text-[9px] text-red-500 font-black uppercase tracking-[0.4em] bg-red-600/10 px-4 py-2 rounded-full border border-red-500/30 backdrop-blur-md">{intel.tag}</span>
                         <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-black">{intel.date}</span>
                      </div>
                      <h3 className="font-sans font-black text-3xl uppercase tracking-tight text-white group-hover/intel:text-red-500 transition-colors duration-500 leading-tight">
                        {intel.title}
                      </h3>
                      <p className="text-sm font-light text-editorial-text-muted leading-relaxed opacity-0 group-hover/intel:opacity-100 transition-all duration-700 translate-y-4 group-hover/intel:translate-y-0">
                        {intel.summary}
                      </p>
                      <div className="pt-4 opacity-0 group-hover/intel:opacity-100 transition-all duration-700 delay-100">
                         <button className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                           AUTHENTICATE_INTEL <ArrowRight className="w-4 h-4 text-red-500" />
                         </button>
                      </div>
                   </div>

                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600/40 to-transparent opacity-0 group-hover/intel:opacity-100 transition-opacity" />
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* System Customization Section */}

      {/* RAW CARES */}
      <section className="py-32 xl:py-64 relative overflow-hidden text-center bg-editorial-bg border-y border-red-900/40 z-10 group/cares">
        <Atmosphere glowOpacity={0.05} gridMode="lines" intensity="high" />
        <div className="absolute inset-0 bg-[#dc2626]/5 pointer-events-none group-hover/cares:bg-[#dc2626]/10 transition-colors duration-[2500ms]" />
        <div className="absolute inset-0 bg-[url('/promo/assets/covered-wide.jpg')] bg-cover bg-center opacity-0 group-hover/cares:opacity-30 transition-opacity duration-[2000ms] mix-blend-screen pointer-events-none grayscale group-hover/cares:grayscale-[50%] transform-gpu group-hover/cares:scale-105" />
        
        <div className="section-container relative z-10 flex flex-col items-center">
          <div className="w-40 h-40 bg-editorial-bg/80 backdrop-blur-3xl border border-red-500/40 rounded-[3.5rem] flex items-center justify-center mx-auto mb-20 shadow-[0_40px_100px_rgba(220,38,38,0.3),inset_0_0_40px_rgba(220,38,38,0.1)] transform group-hover/cares:rotate-[15deg] transition-transform duration-[1500ms] ease-[0.16,1,0.3,1] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-transparent mix-blend-screen" />
            <Heart className="w-20 h-20 text-red-500 fill-red-500/30 drop-shadow-[0_0_20px_rgba(220,38,38,0.9)] transform-gpu group-hover/cares:scale-110 transition-transform duration-[1500ms] ease-[0.16,1,0.3,1]" />
          </div>
          <span className="text-meta-premium mb-12 block flex items-center justify-center gap-5">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping shadow-[0_0_15px_#dc2626]" /> Community_Initiative_001
          </span>
          <h2 className="font-sans font-black text-8xl md:text-9xl xl:text-[180px] uppercase tracking-[-0.03em] mb-16 leading-[0.8] text-premium drop-shadow-[0_15px_40px_rgba(0,0,0,0.15)] group-hover/cares:drop-shadow-[0_0_60px_rgba(220,38,38,0.3)] transition-all duration-[1500ms]">RAW <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-900 drop-shadow-[0_0_40px_rgba(220,38,38,0.5)] z-10 relative">CARES</span></h2>
          <p className="text-2xl md:text-3xl xl:text-5xl font-light tracking-wide mb-24 max-w-6xl mx-auto text-premium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-b border-red-900/40 pb-16">
            We do our best to give back. Whether its helping out in disaster relief efforts, or running training academies across Thailand, we endeavour to uplift our community.
          </p>
          <MagneticWrapper>
            <Link to="/raw-cares" className="group inline-flex items-center gap-6 bg-red-600 text-white px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[14px] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-[800ms] shadow-[0_30px_80px_rgba(220,38,38,0.6)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-b-[4px] border-red-800 hover:border-white active:border-b-0 active:translate-y-[4px] transform-gpu hover:-translate-y-2" aria-label="View Complete Protocol Cares Details">
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] flex items-center gap-5 relative z-10">
                 View Complete Protocol <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-[800ms] drop-shadow-[0_0_8px_currentColor]" />
              </span>
            </Link>
          </MagneticWrapper>
        </div>
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-red-900/10 blur-[250px] pointer-events-none rounded-full -mr-80 -mt-80 group-hover/cares:bg-red-900/30 transition-colors duration-[2000ms] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[1200px] h-[1200px] bg-red-900/10 blur-[250px] pointer-events-none rounded-full -ml-80 -mb-80 group-hover/cares:bg-red-900/30 transition-colors duration-[2000ms] mix-blend-screen" />
      </section>
      
      <LiveTelemetryBar />
    </>
  );
}
