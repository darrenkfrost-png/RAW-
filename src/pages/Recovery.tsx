import { Atmosphere } from '../components/common/Atmosphere';
import Breadcrumb from '../components/Breadcrumb';
import { motion } from "motion/react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { allProducts } from "../data/products";
import { ChevronRight, Wind, Snowflake, RefreshCcw } from "lucide-react";
import LazyImage from "../components/LazyImage";
import ProductCard from "../components/common/ProductCard";
import { useAIContext } from "../context/AIContext";
import BreathingSimulator from "../components/BreathingSimulator";

export default function Recovery() {
  const { updateAIContext, clearAIContext } = useAIContext();
  const products = allProducts.filter(p => p.category === "Recovery");

  useEffect(() => {
    updateAIContext({ sourcePage: 'Recovery' });
    return () => clearAIContext();
  }, []);
  
  const gallery = [
    "https://rawofficial.co/wp-content/uploads/2026/02/Ice-baths-arent-about-staying-in-as-long-as-possible.Theyre-about-staying-in-long-enough-to-be-1.jpg",
    "https://rawofficial.co/wp-content/uploads/2026/02/Ice-baths-arent-about-staying-in-as-long-as-possible.Theyre-about-staying-in-long-enough-to-be-2.jpg",
    "https://rawofficial.co/wp-content/uploads/2026/02/Ice-baths-arent-about-staying-in-as-long-as-possible.Theyre-about-staying-in-long-enough-to-be-3.jpg",
    "https://rawofficial.co/wp-content/uploads/2026/02/Ice-baths-arent-about-staying-in-as-long-as-possible.Theyre-about-staying-in-long-enough-to-be-4.jpg",
  ];

  const videos = [
    "https://videos.files.wordpress.com/lUvR2d1e/this-isnt-comfort.its-commitment.cold-exposure-doesnt-care-who-you-are-it-only-reveals-how-.mp4",
    "https://videos.files.wordpress.com/0y4AyC1D/theres-a-point-where-the-noise-fades.breath-slows.mind-clears.thats-the-moment-you-feel-it-t.mp4",
    "https://videos.files.wordpress.com/k6iVr7JB/that-moment-where-your-mind-says-no-and-your-discipline-says-do-it-anyway.breathe.commit.drop-in.mp4"
  ];

  return (
    <div className="bg-editorial-bg min-h-screen">
      {/* Video Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <video 
          {...({
            autoPlay: true,
            muted: true,
            loop: true,
            playsInline: true,
            className: "absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-luminosity scale-110",
            referrerPolicy: "no-referrer",
            poster: "https://rawofficial.co/wp-content/uploads/2026/02/Ice-baths-arent-about-staying-in-as-long-as-possible.Theyre-about-staying-in-long-enough-to-be-3.jpg"
          } as any)}
        >
          <source src="https://videos.files.wordpress.com/K2dk0F8f/raw-recovery-reel-2160x2160-1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-editorial-bg/60 to-[#050505] mix-blend-multiply"></div>
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        
        <div className="relative z-50 max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] mb-10 w-full flex justify-start">
            <Breadcrumb items={[{ label: 'Protocols', path: '/performance-system' }, { label: 'Recovery', active: true }]} />
        </div>

        <div className="relative z-10 text-center space-y-8 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center w-full"
          >
            {/* Added Logo and Tagline */}
            <img 
               src="/brand/raw-logo-red.png" 
               alt="RAW Official" 
               className="h-16 lg:h-20 object-contain mb-8 opacity-80"
               referrerPolicy="no-referrer"
            />
            <h2 className="text-white font-mono text-xl uppercase tracking-[0.3em] mb-12">Train with purpose. Recover with intent.</h2>
            
            <span className="text-emerald-500 font-black uppercase tracking-[0.6em] text-[13px] mb-14 block flex items-center justify-center gap-5 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] border border-editorial-border bg-editorial-bg/60 backdrop-blur-md px-8 py-4 rounded-full w-fit shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" /> Protocol_03
            </span>
            <h1 className="font-sans font-black text-8xl md:text-[120px] xl:text-[180px] uppercase tracking-tighter leading-[0.8] mb-16 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              MASTER <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] pb-8 mt-4 inline-block">RECOVERY</span>
            </h1>
            <p className="text-editorial-text-muted font-mono text-[12px] md:text-[14px] xl:text-[15px] uppercase tracking-[0.4em] font-bold max-w-4xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-center gap-4 xl:gap-8 bg-editorial-bg/80 px-10 py-5 rounded-2xl border border-editorial-border backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <span className="text-emerald-500 hidden md:inline-block shadow-[0_0_10px_#10b981]">{"//"}</span> Strategic restoration for consistent output. <span className="text-emerald-500 hidden md:inline-block shadow-[0_0_10px_#10b981]">{"//"}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 xl:py-64 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] border-t border-editorial-border bg-editorial-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-screen" />
        <div className="max-w-[var(--content-max-width)] mx-auto flex flex-col lg:flex-row gap-24 xl:gap-32 items-center relative z-10">
          <div className="flex-1 space-y-12 xl:space-y-16">
            <span className="text-[13px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-8 block flex items-center gap-5 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" /> Protocol_03 // Philosophy
            </span>
            <h2 className="font-sans font-black text-6xl md:text-8xl xl:text-[100px] uppercase tracking-tighter leading-[0.85] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              Recovery is not downtime, <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-800 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] mt-4 inline-block pb-4">it's part of the game.</span>
            </h2>
            <p className="text-2xl xl:text-3xl text-editorial-text-muted font-light leading-relaxed max-w-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-l-4 border-emerald-600 pl-8 md:pl-12 bg-gradient-to-r from-emerald-600/10 via-emerald-600/5 to-transparent py-4 rounded-r-[2rem]">
              Performance is earned in effort. Progress is built in restoration. RAW Recover is designed to reset the system, reinforce resilience and sustain long-term output. Train. Recover. Repeat.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16 border-t border-editorial-border">
               <div className="space-y-8 group">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-editorial-bg border border-editorial-border flex items-center justify-center backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-editorial-text-muted drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] group-hover:bg-emerald-600 group-hover:text-editorial-text group-hover:-translate-y-3 group-hover:border-emerald-500/50 transition-all duration-[800ms] transform-gpu group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                    <Snowflake className="w-10 h-10 group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,0.15)] transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-editorial-text uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] group-hover:text-emerald-500 transition-colors duration-500 mb-2">Cold Exposure</h4>
                    <p className="text-[11px] text-editorial-text-muted uppercase font-black tracking-widest group-hover:text-editorial-text-muted transition-colors duration-500">Inflammation Control</p>
                  </div>
               </div>
               <div className="space-y-8 group">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-editorial-bg border border-editorial-border flex items-center justify-center backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-editorial-text-muted drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] group-hover:bg-emerald-600 group-hover:text-editorial-text group-hover:-translate-y-3 group-hover:border-emerald-500/50 transition-all duration-[800ms] transform-gpu group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                    <Wind className="w-10 h-10 group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,0.15)] transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-editorial-text uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] group-hover:text-emerald-500 transition-colors duration-500 mb-2">Respiratory Flow</h4>
                    <p className="text-[11px] text-editorial-text-muted uppercase font-black tracking-widest group-hover:text-editorial-text-muted transition-colors duration-500">CNS Regulation</p>
                  </div>
               </div>
               <div className="space-y-8 group">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-editorial-bg border border-editorial-border flex items-center justify-center backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-editorial-text-muted drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] group-hover:bg-emerald-600 group-hover:text-editorial-text group-hover:-translate-y-3 group-hover:border-emerald-500/50 transition-all duration-[800ms] transform-gpu group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                    <RefreshCcw className="w-10 h-10 group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,0.15)] transition-all duration-500" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-editorial-text uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] group-hover:text-emerald-500 transition-colors duration-500 mb-2">Rapid Reset</h4>
                    <p className="text-[11px] text-editorial-text-muted uppercase font-black tracking-widest group-hover:text-editorial-text-muted transition-colors duration-500">Metabolic Clearance</p>
                  </div>
               </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-8 relative py-12 w-full">
             <div className="absolute inset-0 bg-emerald-500/10 blur-[200px] rounded-full pointer-events-none mix-blend-screen" />
             {gallery.map((img, i) => (
               <div key={i} className={`aspect-[4/5] overflow-hidden border border-editorial-border bg-editorial-bg rounded-[3rem] group relative shadow-[0_40px_100px_rgba(0,0,0,0.1)] ${i % 2 === 1 ? 'translate-y-16 xl:translate-y-24' : ''} hover:z-10 hover:border-emerald-500/30 transition-all duration-[1000ms] ease-[0.16,1,0.3,1] hover:-translate-y-4`}>
                  <LazyImage 
                    src={img} 
                    alt={`Recovery Session ${i}`}
                    className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-[20%] group-hover:opacity-100 group-hover:scale-110 transition-all duration-[2000ms] ease-[0.16,1,0.3,1] mix-blend-luminosity group-hover:mix-blend-normal" 
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-editorial-bg/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none mix-blend-multiply" />
                  <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none mix-blend-screen" />
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Biometric Autonomic Reset Breathing Segment */}
      <section className="py-24 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto relative z-10">
        <BreathingSimulator />
      </section>

      {/* Immersive Video Showcase */}
      <section className="py-40 xl:py-64 bg-editorial-bg border-y border-editorial-border overflow-hidden px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none mix-blend-screen opacity-50" />
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        
        <div className="max-w-[var(--content-max-width)] mx-auto z-10 relative">
          <div className="mb-40 flex flex-col items-center gap-10 text-center">
             <div className="space-y-6">
                <span className="text-[13px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-6 block flex justify-center items-center gap-5 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" /> Field Manual
                </span>
                <h2 className="font-sans font-black text-7xl md:text-9xl xl:text-[140px] uppercase tracking-tighter leading-none text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">MODALITY WORK</h2>
             </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 xl:gap-16">
             {videos.map((vid, i) => (
               <div key={i} className="aspect-[9/16] relative overflow-hidden group border border-editorial-border bg-editorial-bg rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:shadow-[0_50px_120px_rgba(16,185,129,0.15)] transition-all duration-[1000ms] hover:-translate-y-4">
                  <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none mix-blend-screen z-10" />
                  <video 
                    {...({
                      autoPlay: true,
                      muted: true,
                      loop: true,
                      playsInline: true,
                      className: "w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-[20%] group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2000ms] ease-[0.16,1,0.3,1]",
                      referrerPolicy: "no-referrer"
                    } as any)}
                  >
                    <source src={vid} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-editorial-bg/40 to-transparent pointer-events-none z-10 opacity-80 mix-blend-multiply"></div>
                  <div className="absolute bottom-16 left-12 right-12 z-20 transform-gpu transition-all duration-[1000ms] ease-[0.16,1,0.3,1] group-hover:-translate-y-4">
                     <div className="h-[3px] w-full bg-editorial-text/10 mb-10 overflow-hidden rounded-full shadow-[inset_0_0_5px_rgba(0,0,0,0.08)]">
                        <motion.div 
                          initial={{ x: "-100%" }}
                          whileInView={{ x: "100%" }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="h-full w-1/3 bg-emerald-500 shadow-[0_0_15px_#10b981]"
                        />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-500 block mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-100">Technique 0{i+1}</span>
                     <h3 className="font-sans font-black text-4xl xl:text-5xl uppercase tracking-tighter text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,1)] leading-[0.9]">RECOVERY <br/> PROTOCOL</h3>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Technique Spotlight */}
      <section className="py-40 xl:py-64 bg-editorial-bg px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-screen" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none mix-blend-screen hidden lg:block">
           <Snowflake className="w-[1000px] h-[1000px] text-editorial-text" />
        </div>
        <div className="max-w-[var(--content-max-width)] mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-24 xl:gap-32 items-center relative z-10">
           <div className="space-y-12 xl:space-y-16">
              <span className="text-[13px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-8 block flex items-center gap-5 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" /> The Method // 01
              </span>
              <h2 className="font-sans font-black text-7xl md:text-9xl xl:text-[110px] uppercase tracking-tighter leading-[0.8] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">THE SCIENCE OF <br /> <span className="text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] block mt-4 pb-4">THE RESET.</span></h2>
              <p className="text-2xl xl:text-3xl text-editorial-text-muted font-light leading-relaxed max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                Cold exposure isn't about staying in as long as possible. It's about staying in long enough to be present. We focus on the intersection of physiological stress and mental clarity.
              </p>
              <div className="space-y-6 pt-12 border-t border-editorial-border">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 text-[11px] xl:text-[12px] font-black uppercase tracking-[0.4em] text-editorial-text bg-editorial-bg/60 p-8 rounded-2xl border border-editorial-border backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                    <span className="flex items-center gap-4"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_currentColor]" /> Focus: CNS Regulation</span>
                    <span className="flex items-center gap-4"><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_currentColor]" /> Modality: Cold</span>
                 </div>
              </div>
           </div>
           <div className="relative aspect-video border border-editorial-border bg-editorial-bg group overflow-hidden rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] transform-gpu hover:-translate-y-4 transition-all duration-[1000ms] ease-[0.16,1,0.3,1]">
              <div className="absolute inset-0 bg-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none mix-blend-screen z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent/80 via-transparent to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-multiply" />
              <video 
                {...({
                  autoPlay: true,
                  muted: true,
                  loop: true,
                  playsInline: true,
                  className: "w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-[20%] group-hover:scale-105 group-hover:opacity-100 transition-all duration-[2000ms] ease-[0.16,1,0.3,1]",
                  referrerPolicy: "no-referrer"
                } as any)}
              >
                <source src="https://videos.files.wordpress.com/lUvR2d1e/this-isnt-comfort.its-commitment.cold-exposure-doesnt-care-who-you-are-it-only-reveals-how-.mp4" type="video/mp4" />
              </video>
              <div className="absolute bottom-10 left-10 z-20 opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-100 translate-y-8 group-hover:translate-y-0">
                 <div className="bg-emerald-600 text-editorial-text px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_15px_30px_rgba(16,185,129,0.4)] border border-emerald-500/50 backdrop-blur-md">Play Feed // Active</div>
              </div>
           </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="py-40 xl:py-64 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto bg-editorial-bg text-editorial-text border-t border-editorial-border">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-40 gap-16">
           <div className="space-y-8 text-center lg:text-left w-full lg:w-auto">
              <span className="text-[13px] font-black uppercase tracking-[0.5em] text-emerald-500 block flex items-center justify-center lg:justify-start gap-5 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" /> Restorative Hardware
              </span>
              <h2 className="font-sans font-black text-7xl md:text-9xl xl:text-[140px] uppercase tracking-tighter leading-none text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">THE TOOLS</h2>
           </div>
           <p className="max-w-xl text-lg xl:text-xl uppercase tracking-[0.2em] text-editorial-text-muted font-bold leading-relaxed text-center lg:text-right w-full lg:w-auto mx-auto lg:mx-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              Our hardware is engineered for durability in high-traffic training environments. From Muai Thai facilities to private performance labs.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 xl:gap-20">
          {products.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1, duration: 1, ease: [0.16,1,0.3,1] }}
            >
              <ProductCard product={product} idx={idx} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
