import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import { allProducts } from "../data/products";
import LazyImage from "../components/LazyImage";
import MagneticWrapper from "../components/MagneticWrapper";
import { CascadingBackground } from "../components/home/CascadingBackground";
import ProductCard from "../components/common/ProductCard";
import { TiltCard } from "../components/common/TiltCard";
import { LazyHeroVideo } from "../components/home/LazyHeroVideo";
import { Atmosphere } from "../components/common/Atmosphere";
import { EngagementVideo } from "../components/home/EngagementVideo";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  Heart,
  ChevronRight,
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
        className="relative min-h-[100svh] lg:min-h-[max(100svh,900px)] py-24 lg:py-0 flex items-center justify-start overflow-hidden px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] bg-editorial-bg"
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
        </motion.div>
        
          {/* ⚠️ min-w-0 IS LOAD-BEARING. This container is a flex ITEM (the section is
              flex, for vertical centring), and a flex item may not shrink below its
              content's minimum width by default — here 383px, from the tagline's
              unwrapped length. Measured on a 375px phone: 431px wide, centred, and
              the headline clipped. Tested live: min-width:0 alone brings it to 327. */}
        <div className="section-container relative z-10 min-w-0 w-full">
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

            <motion.div
              initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", filter: "blur(40px)", opacity: 0 }}
              animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              /* ⚠️ x IS OWNED BY THE PARALLAX VALUE, SO THE ENTRANCE MUST NOT ANIMATE IT.
                 With style.x bound to a MotionValue, an initial x of -100 was applied and
                 the animate to 0 was ignored — so on any device without a mouse the heading
                 sat 100px off the left edge forever, its first two letters cut off. Measured
                 on a phone: glyphs from -52px. The entrance keeps its clip, blur and fade. */
              style={{ x: headingX, y: headingY }}
              className="text-[clamp(1.625rem,7vw,8rem)] leading-[0.7] font-black uppercase tracking-[-0.08em] mb-12 drop-shadow-2xl relative mix-blend-plus-lighter text-premium"
            >
              <div className="relative inline-block">
                <h1 className="block text-premium text-[clamp(1.625rem,7vw,8rem)] leading-[0.7] font-black uppercase tracking-[-0.08em] drop-shadow-2xl">
                <span className="text-zinc-500 transition-colors duration-1000 block font-light tracking-[-0.05em] mt-8">RECOVER_<wbr />INTENT</span>
                <motion.span 
                  animate={{ 
                    opacity: [0.85, 1, 0.85],
                    filter: ["drop-shadow(0 0 40px rgba(52,211,153,0.4))", "drop-shadow(0 0 80px rgba(52,211,153,0.8))", "drop-shadow(0 0 40px rgba(52,211,153,0.4))"],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-500 transition-colors duration-1000 block mt-8 relative z-10 italic"
                >
                  {/* One unbreakable word at 7vw, so the line broke as "INTEGRATE_PURPOS / E"
                      with a lone letter under it. Offer the break at the underscore. */}
                  INTEGRATE_<wbr />PURPOSE
                </motion.span>
                </h1>
                <p className="text-white text-lg xl:text-2xl uppercase tracking-[0.3em] mt-10 mb-0 font-mono font-black leading-none max-w-none">
                  Train with purpose. Recover with intent.
                </p>
              </div>
              
              <div className="absolute top-1/2 left-1/4 w-[80%] h-[500px] bg-red-600/10 blur-[200px] -z-10 mix-blend-screen pointer-events-none" />
              
              {/* HUD Frame Accents */}
              <div className="absolute -top-16 -left-16 w-32 h-32 border-t-2 border-l-2 border-red-600/40 rounded-tl-[4rem] pointer-events-none shadow-[0_0_30px_rgba(220,38,38,0.2)]" />
              <div className="absolute -bottom-16 -right-16 w-32 h-32 border-b-2 border-r-2 border-red-600/40 rounded-br-[4rem] pointer-events-none shadow-[0_0_30px_rgba(220,38,38,0.2)]" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ x: secondaryX, y: secondaryY }}
              className="font-mono text-sm xl:text-[1rem] text-meta-premium tracking-[0.2em] font-black max-w-2xl leading-[2] mb-16 p-10 rounded-[2.5rem] border border-editorial-border bg-editorial-text/[0.01] backdrop-blur-3xl shadow-premium relative overflow-hidden group"
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
                <Link to="/knowledge-core" className="button-secondary" aria-label="Open the Knowledge Core">Knowledge_Core</Link>
                <Link to="/protocol-builder" className="button-secondary" aria-label="Launch Protocol Builder">Build_Protocol</Link>
                <Link to="/recovery" className="button-secondary" aria-label="View Recovery category">View_Recovery</Link>
            </motion.div>

            
            <div className="flex flex-col sm:flex-row items-center gap-10 xl:gap-16">
               <MagneticWrapper>
                 <Link 
                   to="/shop" 
                   className="group/btn relative px-8 sm:px-14 py-7 bg-red-600 text-white rounded-[2rem] font-black text-[0.75rem] tracking-[0.25em] sm:tracking-[0.4em] overflow-hidden hover:shadow-[0_20px_50px_rgba(220,38,38,0.6)] transition-all duration-500 block w-full sm:w-auto text-center border-b-[4px] border-red-800 active:border-b-0 active:translate-y-[4px]"
                 >
                    <span className="relative z-10 flex items-center justify-center gap-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
                      INITIALIZE_LOGISTICS <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-3 transition-transform duration-300 drop-shadow-[0_0_5px_currentColor]" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-editorial-text/40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                 </Link>
               </MagneticWrapper>
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
              <span className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-red-500 block mb-4">
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
              <span className="inline-flex items-center gap-3 px-8 py-4 border border-red-500/40 group-hover:border-red-500 group-hover:bg-red-500/10 rounded-full font-mono text-[0.6875rem] font-bold uppercase tracking-[0.3em] text-red-400 group-hover:text-red-300 transition-all duration-500">
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
           <span className="font-sans font-black text-[clamp(3rem,18vw,30rem)] leading-[0.8] uppercase select-none">PROTOCOLS</span>
        </div>
        <div className="section-container relative z-10">
          <div className="mb-32 xl:mb-48 font-sans text-center lg:text-left pt-10">
            <h2 className="leading-[0.85] font-black tracking-[-0.03em] mb-12 drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-premium text-display-lg">PERFORMANCE DOESN'T <br className="hidden xl:block" /> EXIST IN ISOLATION.</h2>
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
          
          {/* THE CARD IS A COLUMN, NOT A STACK OF LAYERS. Logo box on top, title under it, description + button pinned to the bottom, height from content (the grid keeps the three equal). The old version drew the logo full-card and centred behind a bottom-anchored text block whose hidden hover elements still took up room — once the fluid root grew that block, the title's second line landed on the logo (seen live 2026-09-05). A fixed 3:4 box cannot hold four elements at phone or laptop widths without clipping. */}
          <div className="grid md:grid-cols-3 gap-12 xl:gap-20">
            <Link to="/nutrients" className="card-premium group/card hover-raise flex flex-col min-h-[26rem]" aria-label="Explore Nutrients Protocols">
              <div className="holographic-glow group-hover/card:opacity-60 transition-opacity duration-1000" />
              <div className="scanner-line top-1/4 group-hover/card:animate-[scan_3s_infinite]" />
              
              {/* The wordmark lives in the TOP of the card, the title block at the BOTTOM — they can never meet. Drawn full-card and centred, the logo sat exactly where the title's second line landed once the fluid root grew the bottom block (2026-09-05, seen live). */}
              <div className="relative h-40 md:h-44 shrink-0 pointer-events-none">
              <LazyImage 
                src="https://rawofficial.co/wp-content/uploads/2026/02/nutrients-1024x173.png" 
                alt="Nutrients" 
                className="w-full h-full object-contain p-8 opacity-40 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-[2s] ease-fluid" 
                containerClassName="w-full h-full !bg-transparent"
              />
              </div>

              <div className="relative z-30 flex flex-col flex-1 px-10 pb-10 pt-2 md:px-12 md:pb-12">
                <div className="mb-5 w-24 h-[1px] bg-editorial-text/20 overflow-hidden relative">
                   <motion.div initial={{ x: "-100%" }} whileInView={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-1/2 bg-red-500 shadow-[0_0_15px_#dc2626]" />
                </div>
                <h3 className="font-sans font-black uppercase mb-5 leading-none text-editorial-text transition-transform duration-700 group-hover/card:-translate-y-2 text-[clamp(2.25rem,1.25rem+2.2vw,4rem)]">Fuel <br /> <span className="text-red-500">Intent</span></h3>
                <div className="mt-auto pt-4">
                <p className="text-editorial-text-muted font-mono text-[0.6875rem] tracking-widest uppercase mb-8 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover/card:opacity-100 md:group-hover/card:translate-y-0 transition-all duration-700 delay-100 leading-relaxed">
                  // Precision nutrition and supplementation systems engineered for maximum bio-availability.
                </p>
                <div className="button-secondary w-fit pointer-events-auto opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-all duration-700 delay-200">Deploy Nutrients</div>
                </div>
              </div>
            </Link>
            
            <Link to="/combat" className="card-premium group/card hover-raise flex flex-col min-h-[26rem]" aria-label="Explore Combat Protocols">
              <div className="holographic-glow group-hover/card:opacity-60 transition-opacity duration-1000" />
              <div className="scanner-line top-1/2 group-hover/card:animate-[scan_4s_infinite]" />
              
              {/* The wordmark lives in the TOP of the card, the title block at the BOTTOM — they can never meet. Drawn full-card and centred, the logo sat exactly where the title's second line landed once the fluid root grew the bottom block (2026-09-05, seen live). */}
              <div className="relative h-40 md:h-44 shrink-0 pointer-events-none">
              <LazyImage 
                src="https://rawofficial.co/wp-content/uploads/2026/02/combat-1024x201.png" 
                alt="Combat" 
                className="w-full h-full object-contain p-8 opacity-40 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-[2s] ease-fluid" 
                containerClassName="w-full h-full !bg-transparent"
              />
              </div>

              <div className="relative z-30 flex flex-col flex-1 px-10 pb-10 pt-2 md:px-12 md:pb-12">
                <div className="mb-5 w-24 h-[1px] bg-editorial-text/20 overflow-hidden relative">
                   <motion.div initial={{ x: "-100%" }} whileInView={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-1/2 bg-red-500 shadow-[0_0_15px_#dc2626]" />
                </div>
                <h3 className="font-sans font-black uppercase mb-5 leading-none text-editorial-text transition-transform duration-700 group-hover/card:-translate-y-2 text-[clamp(2.25rem,1.25rem+2.2vw,4rem)]">The <br /> <span className="text-red-500">Arena</span></h3>
                <div className="mt-auto pt-4">
                <p className="text-editorial-text-muted font-mono text-[0.6875rem] tracking-widest uppercase mb-8 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover/card:opacity-100 md:group-hover/card:translate-y-0 transition-all duration-700 delay-100 leading-relaxed">
                  // Combat architecture and tactical fightwear designed for high-intensity environments.
                </p>
                <div className="button-secondary w-fit pointer-events-auto opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-all duration-700 delay-200">Enter Arena</div>
                </div>
              </div>
            </Link>
            
            <Link to="/recovery" className="card-premium group/card hover-raise flex flex-col min-h-[26rem]" aria-label="Explore Recovery Protocols">
              <div className="holographic-glow group-hover/card:opacity-60 transition-opacity duration-1000" />
              <div className="scanner-line top-3/4 group-hover/card:animate-[scan_2.5s_infinite]" />
              
              {/* The wordmark lives in the TOP of the card, the title block at the BOTTOM — they can never meet. Drawn full-card and centred, the logo sat exactly where the title's second line landed once the fluid root grew the bottom block (2026-09-05, seen live). */}
              <div className="relative h-40 md:h-44 shrink-0 pointer-events-none">
              <LazyImage 
                src="https://rawofficial.co/wp-content/uploads/2026/02/recovery-1024x179.png" 
                alt="Recovery" 
                className="w-full h-full object-contain p-8 opacity-40 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-[2s] ease-fluid" 
                containerClassName="w-full h-full !bg-transparent"
              />
              </div>

              <div className="relative z-30 flex flex-col flex-1 px-10 pb-10 pt-2 md:px-12 md:pb-12">
                <div className="mb-5 w-24 h-[1px] bg-editorial-text/20 overflow-hidden relative">
                   <motion.div initial={{ x: "-100%" }} whileInView={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-1/2 bg-red-500 shadow-[0_0_15px_#dc2626]" />
                </div>
                <h3 className="font-sans font-black uppercase mb-5 leading-none text-editorial-text transition-transform duration-700 group-hover/card:-translate-y-2 text-[clamp(2.25rem,1.25rem+2.2vw,4rem)]">Total <br /> <span className="text-red-500">Reset</span></h3>
                <div className="mt-auto pt-4">
                <p className="text-editorial-text-muted font-mono text-[0.6875rem] tracking-widest uppercase mb-8 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover/card:opacity-100 md:group-hover/card:translate-y-0 transition-all duration-700 delay-100 leading-relaxed">
                  // Rest optimisation and regulation tools built to help the body return stronger.
                </p>
                <div className="button-secondary w-fit pointer-events-auto opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-all duration-700 delay-200">Deploy Recovery</div>
                </div>
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
             <div className="flex w-max animate-[marquee_40s_linear_infinite] font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] text-red-500">
               {[0, 1].map((copy) => (
                 <span key={copy} className="flex" aria-hidden={copy === 1 ? true : undefined}>
                   {["RECOVER_INTENT", "INTEGRATE_PURPOSE", "RAW_OFFICIAL", "COMBAT", "NUTRIENTS", "RECOVERY"].map((word) => (
                     <span key={word} className="pr-20">{word}</span>
                   ))}
                 </span>
               ))}
             </div>
          </div>
          <div className="absolute top-12 left-12 flex items-center gap-4 pt-12">
             <span className="w-16 h-[3px] bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] rounded-full"></span>
             <span className="text-meta-premium">PROJECT_ALPHA // 001</span>
          </div>
          
          <div className="space-y-12 pt-12">
            <h2 className="font-display font-black uppercase leading-[0.8] tracking-[-0.03em] text-premium drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-display-xl">
              RAW <br /> IN <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">MOTION</span>
            </h2>
            
            <p className="text-editorial-text-muted font-light leading-relaxed text-xl xl:text-3xl max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              Witness the discipline. Every drop of sweat, every breath, every rep is a step towards total output optimization.
            </p>
            
            <div className="pt-8">
            <Link to="/performance-system" className="button-premium" aria-label="View the Performance System">
               View_The_System <ChevronRight className="w-5 h-5 ml-4 inline-block" aria-hidden="true" />
            </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Immersive Media Pane */}
        <div className="relative aspect-square lg:aspect-auto overflow-hidden group">
          <EngagementVideo />
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
            <h2 className="font-sans font-black uppercase tracking-[-0.03em] leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-premium text-display-lg">Featured <br className="hidden xl:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">Gear</span></h2>
          </div>
          <MagneticWrapper>
            <Link to="/shop" className="group flex items-center gap-5 px-10 py-6 bg-editorial-bg/80 backdrop-blur-2xl border border-editorial-border-light rounded-[2rem] hover:border-red-500/50 hover:bg-editorial-bg transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.08)]" aria-label="View All Logistics Selection">
              <span className="font-bold uppercase tracking-[0.4em] text-[0.75rem] text-editorial-text">View All Logistics</span>
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
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-sans font-black text-[clamp(3rem,35vw,30rem)] leading-none uppercase">CORE_X</div>
        </div>
        
        <div className="section-container relative z-10 text-center">
          <div className="mb-40 space-y-12">
             <div className="flex items-center justify-center gap-8">
                <div className="w-24 h-[1px] bg-red-600 shadow-[0_0_20px_#dc2626]" />
                <span className="text-meta-premium tracking-[0.3em] sm:tracking-[0.8em] [overflow-wrap:anywhere]">BIO_KINETIC_INTELLIGENCE // PROTOCOL_V4</span>
                <div className="w-24 h-[1px] bg-red-600 shadow-[0_0_20px_#dc2626]" />
             </div>
             <h2 className="font-sans font-black uppercase tracking-[-0.05em] leading-[0.75] drop-shadow-[0_15px_40px_rgba(0,0,0,0.15)] text-premium text-display-xl">THE ARCHITECTURE <br /> OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_40px_rgba(220,38,38,0.4)]">OUTPUT</span></h2>
          </div>

          <div className="flex justify-center max-w-4xl mx-auto">
             {[
               {
                 label: "PURITY_VALVE",
                 value: 99.8,
                 detail: "ISO_9951_SECURED",
                 color: "#dc2626"
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
                       <span className="font-sans font-black tracking-[-0.05em] text-premium drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] text-display-md">{gauge.value}</span>
                       <span className="text-meta-premium mt-4 tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black">{gauge.label}</span>
                       <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-red-600/40 rounded-full blur-[1px]" />
                    </div>
                 </div>
                 
                 <div className="text-center space-y-8 w-full max-w-xs">
                    <div className="h-[4px] w-24 bg-zinc-800 mx-auto group-hover:w-full group-hover:bg-red-600 transition-all duration-[1500ms] ease-[0.16,1,0.3,1] shadow-[0_0_20px_rgba(220,38,38,0)] group-hover:shadow-[0_0_20px_#dc2626] rounded-full" />
                    <p className="font-mono text-[0.6875rem] font-black text-zinc-500 tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 transition-opacity duration-1000">{gauge.detail}</p>
                 </div>
               </motion.div>
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
                 <h2 className="font-sans font-black uppercase tracking-[-0.05em] leading-[0.8] text-premium text-display-lg">Mission <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 italic">Updates</span></h2>
              </div>
              <Link to="/academy" className="button-secondary group">
                 View_Archives <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
           </div>

           <div className="grid lg:grid-cols-3 gap-12">
              {[
                { 
                  tag: "PROTOCOL_V4.2", 
                  title: "Recovery Protocol V4.2 Released", 
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
                  summary: "Supply chain re-routed for cross-region fulfilment. Faster transit on every order.",
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
                   <img src={intel.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover grayscale group-hover/intel:grayscale-0 group-hover/intel:scale-110 transition-all duration-[2s] ease-fluid opacity-40 group-hover/intel:opacity-60" referrerPolicy="no-referrer" />
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-20" />
                   
                   <div className="absolute inset-x-0 bottom-0 p-12 z-30 space-y-6">
                      <div className="flex items-center gap-4">
                         <span className="font-mono text-[0.6875rem] text-red-500 font-black uppercase tracking-[0.4em] bg-red-600/10 px-4 py-2 rounded-full border border-red-500/30 backdrop-blur-md">{intel.tag}</span>
                         <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest font-black">{intel.date}</span>
                      </div>
                      <h3 className="font-sans font-black text-3xl uppercase tracking-tight text-white group-hover/intel:text-red-500 transition-colors duration-500 leading-tight">
                        {intel.title}
                      </h3>
                      <p className="text-sm font-light text-editorial-text-muted leading-relaxed opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover/intel:opacity-100 md:group-hover/intel:translate-y-0 transition-all duration-700">
                        {intel.summary}
                      </p>
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
          <h2 className="font-sans font-black uppercase tracking-[-0.03em] mb-16 leading-[0.8] text-premium drop-shadow-[0_15px_40px_rgba(0,0,0,0.15)] group-hover/cares:drop-shadow-[0_0_60px_rgba(220,38,38,0.3)] transition-all duration-[1500ms] text-display-xl">RAW <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-900 drop-shadow-[0_0_40px_rgba(220,38,38,0.5)] z-10 relative">CARES</span></h2>
          <p className="text-2xl md:text-3xl xl:text-5xl font-light tracking-wide mb-24 max-w-6xl mx-auto text-premium leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-b border-red-900/40 pb-16">
            We do our best to give back. Whether its helping out in disaster relief efforts, or running training academies across Thailand, we endeavour to uplift our community.
          </p>
          <MagneticWrapper>
            <Link to="/raw-cares" className="group inline-flex items-center gap-6 bg-red-600 text-white px-16 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[0.875rem] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-[800ms] shadow-[0_30px_80px_rgba(220,38,38,0.6)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-b-[4px] border-red-800 hover:border-white active:border-b-0 active:translate-y-[4px] transform-gpu hover:-translate-y-2" aria-label="View Complete Protocol Cares Details">
              <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] flex items-center gap-5 relative z-10">
                 View Complete Protocol <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-[800ms] drop-shadow-[0_0_8px_currentColor]" />
              </span>
            </Link>
          </MagneticWrapper>
        </div>
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-red-900/10 blur-[250px] pointer-events-none rounded-full -mr-80 -mt-80 group-hover/cares:bg-red-900/30 transition-colors duration-[2000ms] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[1200px] h-[1200px] bg-red-900/10 blur-[250px] pointer-events-none rounded-full -ml-80 -mb-80 group-hover/cares:bg-red-900/30 transition-colors duration-[2000ms] mix-blend-screen" />
      </section>
      
    </>
  );
}
