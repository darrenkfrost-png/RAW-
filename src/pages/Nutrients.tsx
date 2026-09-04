import { motion } from "motion/react";
import Breadcrumb from '../components/Breadcrumb';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { allProducts } from "../data/products";
import { ChevronRight, Zap, Target, BarChart3, Database } from "lucide-react";
import LazyImage from "../components/LazyImage";
import TechnicalNutrientScanner from "../components/TechnicalNutrientScanner";
import ProductCard from "../components/common/ProductCard";
import { useAIContext } from "../context/AIContext";
import BiometricLoadCalculator from "../components/BiometricLoadCalculator";

export default function Nutrients() {
  const { updateAIContext, clearAIContext } = useAIContext();
  const allNutrients = allProducts.filter(p => p.category === "Nutrients");

  useEffect(() => {
    updateAIContext({ sourcePage: 'Nutrients' });
    return () => clearAIContext();
  }, []);
  
  // Extract subcategories based on name keywords
  const subcategories = ["All", "Gummies", "Powders", "Capsules/Tablets"];
  const [selectedSub, setSelectedSub] = useState("All");

  const filteredProducts = allNutrients.filter(p => {
    if (selectedSub === "All") return true;
    if (selectedSub === "Gummies") return p.name.includes("Gummie");
    if (selectedSub === "Powders") return p.name.includes("Powder") || p.name.includes("Mix") || p.name.includes("Resin");
    if (selectedSub === "Capsules/Tablets") return p.name.includes("Capsule") || p.name.includes("Tab") || p.name.includes("Bottl");
    return true;
  });

  return (
    <div className="bg-editorial-bg min-h-svh text-editorial-text">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden border-b border-editorial-border">
        <video 
          {...({
            autoPlay: true,
            muted: true,
            loop: true,
            playsInline: true,
            className: "absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-luminosity scale-110",
            referrerPolicy: "no-referrer",
            poster: "https://rawofficial.co/wp-content/uploads/2026/02/nutrientsIMG-scaled.jpg"
          } as any)}
        >
          <source src="https://videos.files.wordpress.com/jqb5XX8H/raw-nutrients-reel-2160x2160-1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-editorial-bg/60 to-editorial-bg"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-transparent to-editorial-bg pointer-events-none" />
        
        <div className="relative z-50 max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] mb-10 w-full flex justify-start">
            <Breadcrumb items={[{ label: 'Protocols', path: '/performance-system' }, { label: 'Nutrients', active: true }]} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl w-full flex flex-col items-center">
          <motion.img 
            initial={{ opacity: 0, scale: 0.95, filter: "brightness(0) blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "brightness(1) blur(0px)", y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            src="https://rawofficial.co/wp-content/uploads/2026/02/nutrients-1024x173.png" 
            alt="Nutrients" 
            className="w-full max-w-5xl mb-16 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] mix-blend-screen"
            referrerPolicy="no-referrer"
          />
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-3xl font-mono font-black uppercase tracking-[0.8em] text-editorial-text drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] flex items-center justify-center gap-8"
          >
            <div className="w-24 h-[2px] bg-gradient-to-r from-transparent to-blue-600 shadow-[0_0_15px_#2563eb]" /> 
             Fuel with Intent
            <div className="w-24 h-[2px] bg-gradient-to-l from-transparent to-blue-600 shadow-[0_0_15px_#2563eb]" />
          </motion.h2>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 xl:py-56 px-10 border-b border-editorial-border bg-editorial-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-screen" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none hidden lg:block">
           <Database className="w-[1000px] h-[1000px] text-editorial-text" />
        </div>
        <div className="max-w-[var(--content-max-width)] mx-auto grid lg:grid-cols-2 gap-24 xl:gap-32 items-center relative z-10">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500 mb-10 block flex items-center gap-4 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
               <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping shadow-[0_0_10px_currentColor]" /> Protocol_01 // Nutrients
            </span>
            <h2 className="font-sans font-black text-6xl md:text-8xl xl:text-[130px] uppercase tracking-[-0.03em] leading-[0.8] mb-12 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
               Performance <br /> begins <br /> <span className="relative inline-block"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)] relative z-10">internally.</span><div className="absolute top-1/2 left-0 w-full h-1/2 bg-blue-600/20 blur-[60px] pointer-events-none mix-blend-screen" /></span>
            </h2>
            <p className="text-xl xl:text-3xl text-editorial-text-muted font-light leading-relaxed max-w-3xl mb-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
               RAW Nutrients are built to sustain clarity, resilience and long-term performance — whether you train competitively or simply refuse to live at half capacity. No filler. Just function.
            </p>
            <div className="grid grid-cols-2 gap-16 pt-16 border-t border-editorial-border">
               <div className="space-y-8 group">
                  <div className="flex items-center gap-6 text-editorial-text bg-editorial-bg/50 w-fit pl-4 pr-8 py-3 rounded-full border border-editorial-border shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-blue-500/30 transition-colors duration-[800ms]">
                    <div className="w-14 h-14 rounded-full bg-editorial-text/5 border border-editorial-border-light flex items-center justify-center backdrop-blur-md shadow-[0_10px_20px_rgba(0,0,0,0.08)] group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-[800ms] transform-gpu">
                       <Zap className="w-6 h-6 text-editorial-text-muted group-hover:text-editorial-text drop-shadow-[0_0_5px_rgba(59,130,246,0.5)] group-hover:drop-shadow-[0_0_10px_rgba(0,0,0,0.15)] transition-all duration-[800ms] transform-gpu" />
                    </div>
                    <span className="text-[13px] font-black uppercase tracking-[0.4em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] group-hover:text-blue-400 transition-colors duration-[800ms]">Purity</span>
                  </div>
                  <p className="text-base xl:text-lg text-editorial-text-muted font-light max-w-[240px] leading-relaxed group-hover:text-editorial-text-muted transition-colors duration-[800ms]">Lab-tested for maximum bioavailability.</p>
               </div>
               <div className="space-y-8 group">
                  <div className="flex items-center gap-6 text-editorial-text bg-editorial-bg/50 w-fit pl-4 pr-8 py-3 rounded-full border border-editorial-border shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-blue-500/30 transition-colors duration-[800ms]">
                    <div className="w-14 h-14 rounded-full bg-editorial-text/5 border border-editorial-border-light flex items-center justify-center backdrop-blur-md shadow-[0_10px_20px_rgba(0,0,0,0.08)] group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-[800ms] transform-gpu">
                       <Target className="w-6 h-6 text-editorial-text-muted group-hover:text-editorial-text drop-shadow-[0_0_5px_rgba(59,130,246,0.5)] group-hover:drop-shadow-[0_0_10px_rgba(0,0,0,0.15)] transition-all duration-[800ms] transform-gpu" />
                    </div>
                    <span className="text-[13px] font-black uppercase tracking-[0.4em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] group-hover:text-blue-400 transition-colors duration-[800ms]">Focus</span>
                  </div>
                  <p className="text-base xl:text-lg text-editorial-text-muted font-light max-w-[240px] leading-relaxed group-hover:text-editorial-text-muted transition-colors duration-[800ms]">Designed for executive and athletic output.</p>
               </div>
            </div>
          </div>
          <div className="w-full relative">
            <div className="absolute inset-0 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="bg-editorial-bg/80 backdrop-blur-3xl border border-editorial-border rounded-[3rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-[1500ms] ease-[0.16,1,0.3,1] hover:shadow-[0_50px_100px_rgba(59,130,246,0.15)] hover:-translate-y-2 transform-gpu">
               <div className="mb-12 flex items-center justify-between border-b border-editorial-border pb-8 relative z-10">
                 <span className="text-[12px] font-black uppercase tracking-[0.5em] text-editorial-text flex items-center gap-5">
                    <BarChart3 className="w-6 h-6 text-blue-500 drop-shadow-[0_0_8px_currentColor]" /> Biofeedback_Analysis
                 </span>
                 <div className="flex gap-4 items-center bg-editorial-bg/40 px-4 py-2 rounded-xl border border-editorial-border">
                   <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                   <span className="text-[10px] font-mono font-bold text-editorial-text-muted tracking-widest uppercase">REALTIME_DATA</span>
                 </div>
               </div>
               <TechnicalNutrientScanner />
            </div>
          </div>
        </div>
      </section>

      {/* Biometric Exertion Calculator Segment */}
      <section className="py-24 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto">
        <BiometricLoadCalculator />
      </section>

      {/* Products Grid */}
      <section className="py-40 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto bg-editorial-bg border-y border-editorial-border relative">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none opacity-50 mix-blend-screen" />
        <div className="flex flex-col xl:flex-row justify-between items-end mb-24 gap-12 relative z-10">
          <div className="space-y-8">
             <span className="text-[12px] font-black uppercase tracking-[0.6em] text-blue-500 block drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] flex items-center gap-4">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping shadow-[0_0_10px_currentColor]" />
                Active Compounds
             </span>
             <h2 className="font-sans font-black text-6xl md:text-8xl xl:text-[140px] uppercase tracking-[-0.03em] leading-[0.85] text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)]">The <span className="text-transparent bg-clip-text bg-gradient-to-t from-blue-700 to-blue-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)] relative z-10">Inventory</span></h2>
          </div>
          
          {/* Subcategory Filter Bar */}
          <div className="flex flex-wrap gap-5 bg-editorial-bg/80 backdrop-blur-2xl p-6 border border-editorial-border rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)]">
            {subcategories.map(sub => (
              <button 
                key={sub}
                onClick={() => setSelectedSub(sub)}
                className={`text-[12px] font-black uppercase tracking-[0.4em] transition-all duration-[800ms] px-10 py-5 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] transform-gpu active:scale-95 ease-[0.16,1,0.3,1] ${selectedSub === sub ? 'bg-blue-600 text-editorial-text shadow-[0_15px_40px_rgba(59,130,246,0.4)] scale-100' : 'bg-editorial-bg text-editorial-text-muted hover:text-editorial-text hover:border-editorial-border-light border border-transparent hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)]'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 xl:gap-16 relative z-10">
          {filteredProducts.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.7, ease: [0.16,1,0.3,1] }}
              viewport={{ once: true }}
              className="group"
            >
              <ProductCard product={product} idx={idx} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="py-40 bg-editorial-bg border-y border-editorial-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent pointer-events-none mix-blend-screen" />
        <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative z-10 flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/2">
            <span className="text-[11px] font-black uppercase tracking-[0.6em] text-blue-500 mb-8 block drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              RAW_EDUCATION // 001
            </span>
            <h2 className="font-sans font-black text-6xl md:text-7xl xl:text-8xl uppercase tracking-tighter mb-12 text-editorial-text">WHAT IS <span className="text-blue-500">CREATINE?</span></h2>
            <div className="space-y-8 text-xl text-editorial-text-muted font-light leading-relaxed">
              <p>More than just a body-building aid, creatine has been scientifically proven to enhance mental cognition and stamina too...</p>
              <p>It is one of the most researched supplements in the world, facilitating ATP production for immediate cellular energy during high-intensity output.</p>
            </div>
            <div className="mt-16">
              <button className="bg-editorial-text text-editorial-bg px-12 py-6 rounded-2xl font-black uppercase tracking-[0.4em] text-xs hover:bg-blue-600 hover:text-editorial-text transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                Access Research Data »
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
             <div className="aspect-video overflow-hidden rounded-[3rem] border border-editorial-border shadow-[0_30px_80px_rgba(0,0,0,0.1)]">
                <LazyImage src="https://rawofficial.co/wp-content/uploads/2026/04/raw-supplements-scaled.jpg" alt="RAW Education" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
             </div>
          </div>
        </div>
      </section>

      {/* Athlete Section */}
      <section className="py-40 bg-editorial-bg">
        <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)]">
          <div className="text-center mb-32">
            <span className="text-[11px] font-black uppercase tracking-[0.6em] text-blue-500 mb-8 block drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
               THE_OPERATIVE_NETWORK
            </span>
            <h2 className="font-sans font-black text-6xl md:text-8xl uppercase tracking-tight text-editorial-text mb-12">Meet our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">athletes</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {[
               "https://rawofficial.co/wp-content/uploads/2026/04/DSC06351-768x1152.jpg",
               "https://rawofficial.co/wp-content/uploads/2026/04/DSC07806-768x1152.jpg",
               "https://rawofficial.co/wp-content/uploads/2026/04/DSC07082-768x1152.jpg",
               "https://rawofficial.co/wp-content/uploads/2026/04/DSC07714-768x1152.jpg"
             ].map((img, i) => (
               <div key={i} className="aspect-[3/4] overflow-hidden rounded-[2rem] border border-editorial-border grayscale hover:grayscale-0 transition-all duration-1000 shadow-[0_20px_50px_rgba(0,0,0,0.08)] group/ath">
                 <img src={img} alt={`Athlete ${i}`} className="w-full h-full object-cover group-hover/ath:scale-110 transition-transform duration-[1.5s] ease-[0.16,1,0.3,1]" />
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA / Marquee */}
      <div className="py-32 border-t border-editorial-border overflow-hidden whitespace-nowrap bg-editorial-bg text-editorial-text relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-transparent via-editorial-bg/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-transparent via-editorial-bg/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex animate-marquee gap-24 items-center">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-7xl md:text-9xl font-sans font-black uppercase tracking-tighter px-12 text-editorial-text/5 hover:text-editorial-text/20 transition-all duration-700 cursor-default hover:drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              Fuel your output <span className="text-blue-500/20 mx-12">{'//'}</span> Purity First <span className="text-blue-500/20 mx-12">{'//'}</span> RAW Official <span className="text-blue-500/20 mx-12">{'//'}</span> Premium Performance
            </span>
          ))}
        </div>
      </div>

      {/* ⚠️ THE SUPPLEMENT DISCLAIMER WAS MISSING FROM THIS PAGE.
          Every product page and the protocol builder carry it, but the three
          category pages — the ones that talk about what supplements DO, and
          which a campaign link can land on directly — carried none. The same
          wording as elsewhere, so it reads as one policy rather than three. */}
      <div className="section-container pb-24">
        <p className="mx-auto max-w-3xl border-t border-editorial-border pt-10 text-center text-[12px] leading-relaxed text-editorial-text-muted">
          RAW Official products are designed to support active lifestyles and
          performance routines. Supplements should be used as directed on the
          label and are not intended to diagnose, treat, cure, or prevent
          disease. Always consult a qualified professional if you are pregnant,
          taking medication, under 18, or managing a health condition.
        </p>
      </div>
    </div>
  );
}
