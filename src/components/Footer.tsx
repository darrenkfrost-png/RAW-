import { 
  Instagram,
  Youtube,
  Facebook,
  Twitter
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import MagneticWrapper from "./MagneticWrapper";

export default function Footer() {
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/rawofficial_co" },
    { icon: Youtube, href: "https://youtube.com" },
    { icon: Facebook, href: "https://facebook.com" },
    { icon: Twitter, href: "https://twitter.com" },
  ];

  return (
    <footer className="border-t border-white/[0.05] bg-editorial-bg shadow-sm relative z-30 pt-48 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-editorial-bg/10 to-transparent pointer-events-none mix-blend-screen" />
      <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] py-24 grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12 relative z-10">
        <div className="absolute top-0 right-10 w-[800px] h-[800px] bg-red-600/[0.03] blur-[250px] pointer-events-none rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-10 w-[1000px] h-[1000px] bg-editorial-surface/[0.05] blur-[250px] pointer-events-none rounded-full" />

        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-start relative z-10">
          <Link to="/" aria-label="RAW Official Home" className="mb-12 block transform-gpu hover:scale-105 transition-all duration-700">
            <img src="/brand/raw-logo-red.png" alt="RAW Official Logo" className="h-8 xl:h-10 object-contain drop-shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all duration-700" referrerPolicy="no-referrer" />
          </Link>
          <p className="text-editorial-text-muted font-light text-base xl:text-lg mb-12 leading-relaxed max-w-[360px] tracking-wide italic">
            Performance doesn’t exist in isolation. You train. You break down. You rebuild. You level up.
          </p>
          <div className="flex flex-col gap-4 mb-12 bg-editorial-text/[0.02] backdrop-blur-3xl border border-white/[0.05] hover:border-red-500/20 transition-colors p-6 rounded-[2rem] shadow-depth-1">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_12px_#10b981]" />
                <span className="text-meta-premium opacity-100">CORE_STATUS: <span className="text-emerald-400">NOMINAL</span></span>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_12px_#dc2626]" />
                <span className="text-meta-premium opacity-100">PROTOCOL: ALIGN_SRV_{"2026"}</span>
             </div>
          </div>
          <div className="flex items-center gap-4 mb-16">
            {socialLinks.map(({ icon: Icon, href }, index) => (
              <MagneticWrapper key={index}>
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={`Connect on social media - registry node ${index + 1}`}
                  className="w-12 h-12 flex items-center justify-center border border-white/[0.05] rounded-full hover:border-red-500 hover:bg-red-950/20 transition-all duration-500 text-editorial-text-muted hover:text-editorial-text shadow-sm bg-editorial-text/5 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              </MagneticWrapper>
            ))}
          </div>
        </div>
        
        <div className="col-span-1 lg:col-start-3 relative z-10 pt-4 px-2">
           <h4 className="text-meta-premium mb-8 pb-4 border-b border-white/[0.05] opacity-60">Company</h4>
           <nav aria-label="Company links" className="flex flex-col gap-6">
              <Link to="/manifesto" className="link-premium w-fit font-mono text-[10px] uppercase tracking-[0.25em] px-1 font-bold text-editorial-text-muted hover:text-editorial-text transition-all duration-300">Manifesto</Link>
              <Link to="/raw-cares" className="link-premium w-fit font-mono text-[10px] uppercase tracking-[0.25em] px-1 font-bold text-editorial-text-muted hover:text-editorial-text transition-all duration-300">Raw Cares</Link>
              <Link to="/terms-of-use" className="link-premium w-fit font-mono text-[10px] uppercase tracking-[0.25em] px-1 font-bold text-editorial-text-muted hover:text-editorial-text transition-all duration-300">Terms Of Use</Link>
              <Link to="/privacy-policy" className="link-premium w-fit font-mono text-[10px] uppercase tracking-[0.25em] px-1 font-bold text-editorial-text-muted hover:text-editorial-text transition-all duration-300">Privacy Policy</Link>
              <Link to="/contact" className="link-premium w-fit font-mono text-[10px] uppercase tracking-[0.25em] px-1 font-bold text-editorial-text-muted hover:text-editorial-text transition-all duration-300">Contact</Link>
           </nav>
        </div>

        <div className="col-span-1 relative z-10 pt-4 px-2">
           <h4 className="text-meta-premium mb-8 pb-4 border-b border-white/[0.05] opacity-60">Protocol</h4>
           <nav aria-label="Protocol category links" className="flex flex-col gap-6">
              <Link to="/nutrients" className="link-premium w-fit font-mono text-[10px] uppercase tracking-[0.25em] px-1 font-bold text-editorial-text-muted hover:text-editorial-text transition-all duration-300">Nutrients</Link>
              <Link to="/recovery" className="link-premium w-fit font-mono text-[10px] uppercase tracking-[0.25em] px-1 font-bold text-editorial-text-muted hover:text-editorial-text transition-all duration-300">Recovery</Link>
              <Link to="/combat" className="link-premium w-fit font-mono text-[10px] uppercase tracking-[0.25em] px-1 font-bold text-editorial-text-muted hover:text-editorial-text transition-all duration-300">Combat</Link>
           </nav>
        </div>
      </div>
      <div className="border-t border-white/[0.05] bg-editorial-bg/50 backdrop-blur-3xl py-12 px-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="text-meta-premium opacity-40">
            © {new Date().getFullYear()} RAW OFFICIAL. ALL RIGHTS RESERVED.
          </div>
          <MagneticWrapper>
            <a 
              href="https://rawofficial.co" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Visit original rawofficial.co site"
              className="text-meta-premium !text-editorial-text-muted hover:!text-red-500 transition-colors duration-500 group relative py-2 block focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1"
            >
              <span className="relative z-10">RAWOFFICIAL.CO</span>
              <motion.span 
                className="absolute inset-0 bg-red-600/30 blur-xl rounded-full group-hover:bg-red-600/50 transition-colors duration-500"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            </a>
          </MagneticWrapper>
        </div>
        
        <div className="flex items-center gap-8">
          <span className="text-meta-premium opacity-40 hidden sm:block">Gateway_Access:</span>
          <a 
            href="https://rawofficial.co" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative transition-all duration-500 hover:scale-105 active:scale-95 block focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
            title="VISIT_OFFICIAL_SITE"
          >
            <img 
              src="https://rawofficial.co/wp-content/uploads/2025/03/payment.webp" 
              alt="Visit Official Registry" 
              className="h-5 xl:h-6 object-contain opacity-40 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0 relative z-10" 
              referrerPolicy="no-referrer"
            />
            {/* Glow effect on hover */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute -inset-6 bg-red-600/20 blur-3xl rounded-full -z-0 pointer-events-none"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
