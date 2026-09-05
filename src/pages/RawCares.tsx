import { Atmosphere } from '../components/common/Atmosphere';
import Breadcrumb from '../components/Breadcrumb';
import { motion } from "motion/react";
import { Globe, Users, Crosshair } from "lucide-react";
import LazyImage from "../components/LazyImage";
import MagneticWrapper from "../components/MagneticWrapper";

export default function RawCares() {
  return (
    <div className="pt-32 xl:pt-48 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative min-h-svh bg-editorial-bg">
      <div className="absolute top-0 left-1/2 -ml-[500px] w-[1200px] h-[1200px] bg-red-900/10 blur-[300px] pointer-events-none rounded-full mix-blend-screen" />
      <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
      
      <div className="max-w-[var(--content-max-width)] mx-auto relative z-10 px-[calc(var(--shell-padding-mobile)/2)] md:px-0">
        <Breadcrumb items={[{ label: 'Company', path: '/manifesto' }, { label: 'Raw Cares', active: true }]} />
      </div>

      <section className="max-w-[var(--content-max-width)] mx-auto text-center mb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[0.8125rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] text-red-500 mb-14 block flex items-center justify-center gap-5 border border-editorial-border bg-editorial-bg/60 w-fit mx-auto px-8 py-4 rounded-full backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" /> Global_Initiative // 001
          </span>
          <h1 className="font-sans font-black uppercase tracking-tighter leading-[0.8] mb-12 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative text-display-2xl">
            RAW <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)] pb-8 mt-4 inline-block">CARES</span>
          </h1>
          <p className="font-mono text-[0.8125rem] text-editorial-text-muted uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-bold mt-12 bg-editorial-bg/80 border border-editorial-border py-6 px-12 rounded-2xl inline-block backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]">Community Deployment. Strength Protocols. Legacy Maintenance.</p>
        </motion.div>
      </section>

      <div className="grid md:grid-cols-2 gap-10 xl:gap-20 max-w-[var(--content-max-width)] mx-auto md:h-[800px] xl:h-[900px] mb-48 relative z-10">
        <div className="relative group overflow-hidden min-h-[32rem] md:min-h-0 border border-editorial-border rounded-[3rem] bg-editorial-bg shadow-[0_40px_100px_rgba(0,0,0,0.1)] transform-gpu hover:-translate-y-4 transition-all duration-[1000ms] ease-[0.16,1,0.3,1]">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-[1500ms] z-30" />
          <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-10 mix-blend-screen" />
          <LazyImage 
            src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop" 
            alt="Youth Performance"
            className="w-full h-full object-cover transform-gpu group-hover:scale-110 transition-transform duration-[3s] ease-[0.16,1,0.3,1] grayscale opacity-50 group-hover:grayscale-[20%] group-hover:opacity-90"
            containerClassName="w-full h-full bg-editorial-bg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-editorial-bg/40 to-transparent p-8 md:p-12 xl:p-20 flex flex-col justify-end z-20 mix-blend-multiply opacity-80" />
          <div className="absolute inset-0 p-8 md:p-12 xl:p-20 flex flex-col justify-end z-30">
            <div className="mb-10 transform translate-y-0 opacity-100 md:translate-y-8 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-1000 ease-[0.16,1,0.3,1] delay-100">
               <div className="flex items-center gap-4 border border-editorial-border-light bg-editorial-bg/80 backdrop-blur-md px-6 py-4 rounded-xl w-fit shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                 <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#dc2626]" /> 
                 <span className="text-[0.6875rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-red-500">Operation: Youth</span>
               </div>
            </div>
            <h3 className="font-sans font-black uppercase mb-8 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,1)] transform transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:-translate-y-4 leading-[0.85] text-display-md">Youth <br/> Performance</h3>
            <p className="text-editorial-text max-w-xl font-light leading-relaxed text-xl xl:text-2xl transform opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-1000 delay-200">Empowering the next generation of operatives with proper biomechanical guidance and elite hardware.</p>
          </div>
        </div>
        <div className="relative group overflow-hidden min-h-[32rem] md:min-h-0 border border-editorial-border rounded-[3rem] bg-editorial-bg shadow-[0_40px_100px_rgba(0,0,0,0.1)] transform-gpu hover:-translate-y-4 transition-all duration-[1000ms] ease-[0.16,1,0.3,1]">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-[1500ms] z-30" />
          <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-10 mix-blend-screen" />
          <LazyImage 
             src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop" 
            alt="Global Reach"
            className="w-full h-full object-cover transform-gpu group-hover:scale-110 transition-transform duration-[3s] ease-[0.16,1,0.3,1] grayscale opacity-50 group-hover:grayscale-[20%] group-hover:opacity-90"
            containerClassName="w-full h-full bg-editorial-bg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-editorial-bg/40 to-transparent p-8 md:p-12 xl:p-20 flex flex-col justify-end z-20 mix-blend-multiply opacity-80" />
          <div className="absolute inset-0 p-8 md:p-12 xl:p-20 flex flex-col justify-end z-30">
            <div className="mb-10 transform translate-y-0 opacity-100 md:translate-y-8 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-1000 ease-[0.16,1,0.3,1] delay-100">
               <div className="flex items-center gap-4 border border-editorial-border-light bg-editorial-bg/80 backdrop-blur-md px-6 py-4 rounded-xl w-fit shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                  <span className="text-[0.6875rem] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-emerald-500">Operation: Reach</span>
               </div>
            </div>
            <h3 className="font-sans font-black uppercase mb-8 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,1)] transform transition-transform duration-1000 ease-[0.16,1,0.3,1] group-hover:-translate-y-4 leading-[0.85] text-display-md">Global <br/> Reach</h3>
            <p className="text-editorial-text max-w-xl font-light leading-relaxed text-xl xl:text-2xl transform opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-1000 delay-200">Deploying recovery nodes and combat training facilities in critical scarcity sectors globally.</p>
          </div>
        </div>
      </div>

      <section className="py-40 max-w-[var(--content-max-width)] mx-auto text-editorial-text">
        <div className="grid md:grid-cols-3 gap-12 xl:gap-20 relative z-10">
          <div className="bg-editorial-bg p-12 xl:p-16 rounded-[3rem] border border-editorial-border hover:border-red-500/30 transition-all duration-[800ms] shadow-[0_20px_50px_rgba(0,0,0,0.1)] group transform-gpu hover:-translate-y-3 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_linear_infinite] pointer-events-none mix-blend-screen transition-opacity duration-1000" />
            <div className="w-20 h-20 xl:w-24 xl:h-24 bg-editorial-bg border border-editorial-border rounded-[1.5rem] flex items-center justify-center mb-12 group-hover:border-red-500/50 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              <Globe className="w-8 h-8 xl:w-10 xl:h-10 text-editorial-text-muted group-hover:text-red-500 transition-colors duration-500" />
            </div>
            <h4 className="font-sans font-black text-3xl xl:text-4xl uppercase mb-6 text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] relative z-10 leading-none">Environmental <br/> Intent</h4>
            <p className="text-editorial-text-muted leading-relaxed font-light text-xl relative z-10 flex-grow">We work to reduce the environmental impact of our packaging and supply chain.</p>
             <div className="mt-12 w-full h-[2px] bg-editorial-text/5 group-hover:bg-red-500/30 transition-colors duration-700 relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-red-500 w-0 group-hover:w-full transition-all duration-[1000ms] ease-[0.16,1,0.3,1]" />
             </div>
          </div>
          
          <div className="bg-editorial-bg p-12 xl:p-16 rounded-[3rem] border border-editorial-border hover:border-red-500/30 transition-all duration-[800ms] shadow-[0_20px_50px_rgba(0,0,0,0.1)] group transform-gpu hover:-translate-y-3 relative overflow-hidden flex flex-col">
             <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_linear_infinite] pointer-events-none mix-blend-screen transition-opacity duration-1000" />
             <div className="w-20 h-20 xl:w-24 xl:h-24 bg-editorial-bg border border-editorial-border rounded-[1.5rem] flex items-center justify-center mb-12 group-hover:border-red-500/50 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              <Users className="w-8 h-8 xl:w-10 xl:h-10 text-editorial-text-muted group-hover:text-red-500 transition-colors duration-500" />
            </div>
            <h4 className="font-sans font-black text-3xl xl:text-4xl uppercase mb-6 text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] relative z-10 leading-none">Operative <br/> Support</h4>
            <p className="text-editorial-text-muted leading-relaxed font-light text-xl relative z-10 flex-grow">Sponsorship protocols run on grit and raw output, completely bypassing algorithmic social metric requirements.</p>
             <div className="mt-12 w-full h-[2px] bg-editorial-text/5 group-hover:bg-red-500/30 transition-colors duration-700 relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-red-500 w-0 group-hover:w-full transition-all duration-[1000ms] ease-[0.16,1,0.3,1]" />
             </div>
          </div>
          
          <div className="bg-editorial-bg p-12 xl:p-16 rounded-[3rem] border border-editorial-border hover:border-red-500/30 transition-all duration-[800ms] shadow-[0_20px_50px_rgba(0,0,0,0.1)] group transform-gpu hover:-translate-y-3 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_linear_infinite] pointer-events-none mix-blend-screen transition-opacity duration-1000" />
            <div className="w-20 h-20 xl:w-24 xl:h-24 bg-editorial-bg border border-editorial-border rounded-[1.5rem] flex items-center justify-center mb-12 group-hover:border-red-500/50 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_40px_rgba(220,38,38,0.3)]">
              <Crosshair className="w-8 h-8 xl:w-10 xl:h-10 text-editorial-text-muted group-hover:text-red-500 transition-colors duration-500" />
            </div>
            <h4 className="font-sans font-black text-3xl xl:text-4xl uppercase mb-6 text-editorial-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] relative z-10 leading-none">Action <br/> First</h4>
            <p className="text-editorial-text-muted leading-relaxed font-light text-xl relative z-10 flex-grow">A portion of all network revenue is diverted to advanced physical therapy operations for injured tactical personnel.</p>
             <div className="mt-12 w-full h-[2px] bg-editorial-text/5 group-hover:bg-red-500/30 transition-colors duration-700 relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-red-500 w-0 group-hover:w-full transition-all duration-[1000ms] ease-[0.16,1,0.3,1]" />
             </div>
          </div>
        </div>
      </section>

      <section className="mt-40 xl:mt-48 bg-editorial-bg border-y border-editorial-border px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative overflow-hidden group py-48 xl:py-64">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none opacity-50 transition-opacity duration-1000 group-hover:opacity-100 mix-blend-screen" />
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        
        <div className="max-w-[var(--content-max-width)] mx-auto text-center relative z-10 flex flex-col items-center">
          <h2 className="font-sans uppercase tracking-tighter mb-12 font-black text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] leading-[0.85] text-display-lg">INITIALIZE <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-900 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)] inline-block mt-4 pb-4">INVOLVEMENT</span></h2>
          <p className="mb-20 text-editorial-text-muted max-w-2xl xl:max-w-4xl font-light text-2xl xl:text-3xl leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">Engage with our mission architecture. Your equipment requisition directly fuels global structural deployments.</p>
          <MagneticWrapper>
            <button disabled aria-disabled="true" title="COMING_SOON" className="cursor-not-allowed opacity-50 bg-red-600 text-white px-20 py-10 rounded-2xl font-black uppercase tracking-[0.4em] text-[0.9375rem] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-500 shadow-[0_20px_50px_rgba(220,38,38,0.4)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transform-gpu hover:-translate-y-2 border-b-[4px] border-red-800 active:border-b-0 active:translate-y-[2px]">
              Deploy Resources
            </button>
            <span className="block mt-6 font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] text-zinc-500">COMING_SOON</span>
          </MagneticWrapper>
        </div>
      </section>
    </div>
  );
}
