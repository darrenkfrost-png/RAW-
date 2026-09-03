import { Atmosphere } from '../components/common/Atmosphere';
import Breadcrumb from '../components/Breadcrumb';
import { motion } from "motion/react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { allProducts } from "../data/products";
import { ChevronRight, Calendar, MapPin, Award, Crosshair, ArrowRight } from "lucide-react";
import LazyImage from "../components/LazyImage";
import CombatTargetZone from "../components/CombatTargetZone";
import ProductCard from "../components/common/ProductCard";
import { useAIContext } from "../context/AIContext";

export default function Combat() {
  const { updateAIContext, clearAIContext } = useAIContext();
  const products = allProducts.filter(p => p.category === "Combat" || p.category === "Apparel");

  useEffect(() => {
    updateAIContext({ sourcePage: 'Combat' });
    return () => clearAIContext();
  }, []);

  return (
    <div className="bg-editorial-bg min-h-screen text-editorial-text">
      {/* Cinematic Hero */}
      <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <video 
          {...({
            autoPlay: true,
            muted: true,
            loop: true,
            playsInline: true,
            className: "absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-luminosity scale-110",
            referrerPolicy: "no-referrer",
            poster: "https://rawofficial.co/wp-content/uploads/2026/02/combatIMG-scaled.jpg"
          } as any)}
        >
          <source src="https://videos.files.wordpress.com/h8D4zswX/raw-combat-reel-2160x2160-1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#050505]/60 to-[#050505] mix-blend-multiply"></div>
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        
        <div className="relative z-50 max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] mb-10 w-full flex justify-start">
            <Breadcrumb items={[{ label: 'Protocols', path: '/performance-system' }, { label: 'Combat', active: true }]} />
        </div>

        <div className="relative z-10 space-y-8 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center w-full"
          >
            <span className="text-red-500 font-black uppercase tracking-[0.6em] text-[13px] mb-14 block flex items-center justify-center gap-5 border border-editorial-border bg-editorial-bg/60 backdrop-blur-md px-8 py-4 rounded-full w-fit shadow-[0_10px_30px_rgba(0,0,0,0.08)] drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
               <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" /> Protocol_02 // Alpha
            </span>
            <h1 className="font-sans font-black text-8xl md:text-[120px] xl:text-[180px] uppercase tracking-tighter leading-[0.8] mb-16 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
               ENTER  <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)] pb-8 mt-4 inline-block">THE ARENA</span>
            </h1>
            <p className="text-editorial-text-muted font-mono text-[12px] md:text-[14px] xl:text-[15px] uppercase tracking-[0.4em] font-bold max-w-4xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-center gap-4 xl:gap-8 bg-editorial-bg/80 px-10 py-5 rounded-[2rem] border border-editorial-border backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <span className="text-red-500 hidden md:inline-block shadow-[0_0_10px_#dc2626]">{"//"}</span> Discipline meets spectacle. High-impact gear. <span className="text-red-500 hidden md:inline-block shadow-[0_0_10px_#dc2626]">{"//"}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Fight Culture Description */}
      <section className="py-40 xl:py-64 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] border-t border-editorial-border bg-editorial-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-screen" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none mix-blend-screen">
          <Crosshair className="w-[1000px] h-[1000px]" />
        </div>
        <div className="max-w-[var(--content-max-width)] mx-auto grid lg:grid-cols-2 gap-24 xl:gap-32 items-center relative z-10">
          <div className="space-y-12 xl:space-y-16">
            <h2 className="font-sans font-black text-7xl md:text-8xl xl:text-[100px] uppercase tracking-tighter leading-[0.85] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
               Competitive <br /> Performance, <br /> <span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)] block mt-4 pb-4">Without Compromise.</span>
            </h2>
            <div className="prose prose-invert prose-xl xl:prose-2xl text-editorial-text-muted font-light leading-relaxed max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              <p>
                RAW Combat supports athletes, fighters and high-output individuals who train beyond average. From athlete development to high-performance events, we create environments that demand focus, preparation and execution.
              </p>
              <p className="text-editorial-text font-black uppercase tracking-[0.3em] text-[13px] mt-12 border-l-4 border-red-600 pl-8 md:pl-12 py-5 bg-gradient-to-r from-red-600/10 via-red-600/5 to-transparent rounded-r-[2rem] shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]">
                This is not participation. It’s commitment.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-16 pt-16 border-t border-editorial-border">
               <div className="group flex items-center gap-8">
                  <div className="w-24 h-24 rounded-[1.5rem] bg-editorial-bg border border-editorial-border flex items-center justify-center backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:bg-red-600 group-hover:-translate-y-3 group-hover:border-red-500/50 transition-all duration-[800ms] transform-gpu group-hover:shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
                    <Award className="w-10 h-10 text-editorial-text-muted group-hover:text-editorial-text group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,0.15)] transition-all duration-500" />
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-[0.4em] text-editorial-text-muted block group-hover:text-editorial-text transition-colors duration-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Elite <br/> Grade</span>
               </div>
               <div className="group flex items-center gap-8">
                  <div className="w-24 h-24 rounded-[1.5rem] bg-editorial-bg border border-editorial-border flex items-center justify-center backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:bg-red-600 group-hover:-translate-y-3 group-hover:border-red-500/50 transition-all duration-[800ms] transform-gpu group-hover:shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
                    <Crosshair className="w-10 h-10 text-editorial-text-muted group-hover:text-editorial-text group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,0.15)] transition-all duration-500" />
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-[0.4em] text-editorial-text-muted block group-hover:text-editorial-text transition-colors duration-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Pro <br/> Support</span>
               </div>
            </div>
          </div>
          <div className="relative w-full">
             <div className="absolute inset-0 bg-red-500/10 blur-[200px] rounded-full pointer-events-none mix-blend-screen z-0" />
             <div className="aspect-[4/5] bg-editorial-bg border border-editorial-border overflow-hidden rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] group relative z-10 hover:-translate-y-4 transition-all duration-[1000ms] ease-[0.16,1,0.3,1] hover:border-red-500/30">
                <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10 pointer-events-none mix-blend-screen" />
                <LazyImage 
                  src="https://rawofficial.co/wp-content/uploads/2026/02/combatIMG-scaled.jpg" 
                  alt="Raw Combat Philosophy"
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-[20%] group-hover:opacity-100 transition-all duration-[2000ms] ease-[0.16,1,0.3,1] scale-105 group-hover:scale-100 mix-blend-luminosity group-hover:mix-blend-normal" 
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-editorial-bg/20 to-transparent pointer-events-none mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             </div>
             {/* Brutalist floating element */}
             <div className="absolute -bottom-16 -right-16 bg-editorial-bg/80 backdrop-blur-3xl border border-editorial-border p-16 hidden lg:block max-w-[450px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] rounded-[3rem] group hover:border-red-500/30 transition-all duration-[800ms] ease-[0.16,1,0.3,1] z-20 hover:-translate-y-4 hover:shadow-[0_50px_120px_rgba(220,38,38,0.15)]">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 group-hover:scale-110 transition-all duration-1000 mix-blend-screen">
                  <Crosshair className="w-24 h-24 text-editorial-text" />
                </div>
                <p className="font-mono font-black uppercase tracking-[0.5em] text-[11px] mb-10 text-red-500 flex items-center gap-5 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                   <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#dc2626]"></span>
                   Field Report
                </p>
                <p className="font-sans font-medium text-2xl xl:text-3xl leading-relaxed italic text-editorial-text-muted relative z-10 group-hover:text-editorial-text transition-colors duration-[800ms] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                  "The legacy of a fighter is written in the silence of the training room."
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Events Module */}
      <section className="py-40 xl:py-64 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] bg-editorial-bg relative border-y border-editorial-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-editorial-bg/40 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-screen" />
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        <div className="max-w-[var(--content-max-width)] mx-auto relative z-10">
          <div className="text-center mb-32 xl:mb-48">
             <span className="text-[13px] font-black uppercase tracking-[0.6em] text-red-500 mb-8 block drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">Upcoming Ops</span>
             <h2 className="font-sans font-black text-8xl md:text-[140px] uppercase tracking-tighter leading-[0.8] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">LIVE <br /> EVENTS</h2>
          </div>

          <div className="group relative overflow-hidden rounded-[4rem] border border-editorial-border bg-editorial-bg/80 backdrop-blur-3xl p-12 md:p-20 xl:p-24 hover:border-red-500/30 transition-all duration-[1000ms] ease-[0.16,1,0.3,1] shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:shadow-[0_60px_150px_rgba(220,38,38,0.15)] hover:-translate-y-4 transform-gpu">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-red-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
             <div className="grid lg:grid-cols-[1fr_1.2fr] gap-20 xl:gap-32 items-center">
                <div className="relative aspect-[3/4] overflow-hidden border border-editorial-border rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.1)] group-hover:shadow-[0_40px_100px_rgba(220,38,38,0.3)] transition-all duration-[1000ms] ease-[0.16,1,0.3,1] transform-gpu group-hover:-translate-y-4">
                   <LazyImage 
                     src="https://rawofficial.co/wp-content/uploads/2026/02/SB-Beach-Promo-FOR-PRINT-A3-CMYK.jpg" 
                     alt="Stand and Bang Featured Event"
                     className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-[10%] group-hover:brightness-100 transition-all duration-[2000ms] scale-105 group-hover:scale-100 ease-[0.16,1,0.3,1] mix-blend-luminosity group-hover:mix-blend-normal" 
                     containerClassName="w-full h-full"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-transparent/80 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-multiply" />
                   <div className="absolute inset-0 bg-red-900/10 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                </div>
                <div className="space-y-12 xl:space-y-16">
                   <div className="inline-flex items-center gap-5 px-6 py-3 bg-red-600/10 border border-red-500/50 text-red-500 font-black text-[11px] uppercase tracking-[0.4em] rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.1)_inset] backdrop-blur-md">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#dc2626]"></div>
                      Featured Event
                   </div>
                   <h3 className="font-sans font-black text-6xl md:text-8xl xl:text-[100px] uppercase tracking-tighter leading-[0.8] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">STAND AND <span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)] block mt-4 pb-4">BANG</span></h3>
                   <p className="text-editorial-text-muted font-light text-2xl xl:text-3xl leading-relaxed max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                      Fighters are WAR READY. 60 second rounds. No time to think. No time to hide. $10,000 on the line. Who really wants it?
                   </p>
                   <div className="flex flex-col sm:flex-row gap-12 xl:gap-20 border-t border-editorial-border pt-16">
                      <div className="flex items-center gap-8 group/item">
                         <div className="w-20 h-20 rounded-[1.5rem] border border-editorial-border bg-editorial-bg flex items-center justify-center backdrop-blur-md group-hover/item:bg-editorial-text group-hover/item:border-white transition-all duration-[800ms] transform-gpu group-hover/item:scale-110 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                            <Calendar className="w-8 h-8 text-editorial-text-muted group-hover/item:text-editorial-bg transition-colors duration-500" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[12px] font-black uppercase tracking-[0.4em] text-editorial-text-muted mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Date / Time</span>
                            <span className="text-lg xl:text-xl uppercase font-black tracking-widest text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">FEB 28, 2026 @ 1700</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-8 group/item">
                         <div className="w-20 h-20 rounded-[1.5rem] border border-editorial-border bg-editorial-bg flex items-center justify-center backdrop-blur-md group-hover/item:bg-editorial-text group-hover/item:border-white transition-all duration-[800ms] transform-gpu group-hover/item:scale-110 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                            <MapPin className="w-8 h-8 text-editorial-text-muted group-hover/item:text-editorial-bg transition-colors duration-500" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[12px] font-black uppercase tracking-[0.4em] text-editorial-text-muted mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Location</span>
                            <span className="text-lg xl:text-xl uppercase font-black tracking-widest text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">Pattaya, Thailand</span>
                         </div>
                      </div>
                   </div>
                   <div className="pt-12">
                      <Link to="/contact?subject=Tickets" className="inline-flex items-center gap-6 bg-editorial-text text-editorial-bg px-16 py-8 rounded-2xl font-black uppercase tracking-[0.5em] text-[13px] hover:bg-red-600 hover:text-white transition-all duration-[800ms] ease-[0.16,1,0.3,1] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_rgba(220,38,38,0.4)] transform-gpu hover:-translate-y-2 overflow-hidden relative group/btn border-b-[4px] border-zinc-400 hover:border-red-800 active:translate-y-[2px] active:border-b-0">
                        <span className="relative z-10 flex items-center gap-5">Secure Tickets <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-3 transition-transform duration-[800ms] ease-[0.16,1,0.3,1]" /></span>
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Intensity Feed - Embedded Video */}
      <section className="py-40 xl:py-64 bg-editorial-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none mix-blend-screen">
           <span className="font-sans font-black text-[25vw] leading-none uppercase select-none drop-shadow-[0_0_100px_rgba(255,255,255,1)]">INTENSITY</span>
        </div>
        <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 xl:gap-32 items-center">
             <div className="relative aspect-video bg-editorial-bg rounded-[3rem] overflow-hidden border border-editorial-border group shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:border-red-500/30 transition-all duration-[1000ms] hover:-translate-y-4">
                 <video 
                  {...({
                    autoPlay: true,
                    muted: true,
                    loop: true,
                    playsInline: true,
                    className: "w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-[2000ms] ease-[0.16,1,0.3,1] scale-105 group-hover:scale-100 mix-blend-luminosity group-hover:mix-blend-normal",
                    referrerPolicy: "no-referrer",
                    poster: "https://rawofficial.co/wp-content/uploads/2026/02/SB-Beach-Promo-FOR-PRINT-A3-CMYK.jpg"
                  } as any)}
                >
                  <source src="https://videos.files.wordpress.com/h8D4zswX/raw-combat-reel-2160x2160-1.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none mix-blend-screen z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent/80 via-transparent to-transparent pointer-events-none mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10" />
                <div className="absolute top-10 left-10 text-[11px] font-black uppercase tracking-[0.4em] bg-red-600/90 text-white px-5 py-3 border border-red-500/50 rounded-xl shadow-[0_15px_30px_rgba(220,38,38,0.4)] backdrop-blur-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] z-20 group-hover:bg-red-600 transition-colors duration-500">Arena Feed // Alpha 1.0</div>
             </div>
             <div className="space-y-12 xl:space-y-16">
                <h2 className="font-sans font-black text-6xl md:text-8xl xl:text-[110px] uppercase tracking-tighter leading-[0.8] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">THE GRIND IS <br /> <span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)] block mt-4 pb-4">UNIVERSAL.</span></h2>
                <p className="text-2xl xl:text-3xl text-editorial-text-muted font-light leading-relaxed max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                  Every training camp is a test of will. RAW Combat provides the infrastructure and the motivation to push past the threshold of performance.
                </p>
                <div className="flex gap-8 items-center pt-12">
                   <div className="w-20 h-[3px] bg-red-600 shadow-[0_0_15px_#dc2626]"></div>
                   <span className="text-[13px] font-black uppercase tracking-[0.4em] text-editorial-text-muted italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)]">Established in performance</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Interactive Diagnostics */}
      <section className="py-32 px-10 border-b border-editorial-border bg-editorial-bg overflow-hidden relative">
        <CombatTargetZone />
      </section>

      {/* Fight Gear Grid */}
      <section className="py-40 xl:py-64 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto bg-editorial-bg relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-editorial-bg/30 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-screen" />
        <div className="mb-32 xl:mb-48 relative z-10 text-center xl:text-left pt-10 border-t border-editorial-border">
          <h2 className="font-sans font-black text-7xl md:text-9xl xl:text-[140px] uppercase tracking-tighter leading-[0.8] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">THE KIT</h2>
          <p className="text-editorial-text-muted font-mono font-bold uppercase tracking-[0.4em] text-[13px] md:text-[14px] mt-8 flex items-center justify-center xl:justify-start gap-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
             <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#dc2626]"></span>
             Professional Grade Equipment for Professional Athletes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 xl:gap-16 relative z-10">
          {products.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: idx * 0.1, ease: [0.16,1,0.3,1] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <ProductCard product={product} idx={idx} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
