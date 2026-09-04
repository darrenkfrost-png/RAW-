import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, RefreshCw, ChevronLeft, Shield, Globe, Terminal, MessageSquare, Bot } from "lucide-react";
import { useUI } from "../context/UIContext";
import { useState, useRef, useEffect } from "react";
import MagneticWrapper from "./MagneticWrapper";

export default function ShopIframePanel() {
  const { isShopIframeOpen, setIsShopIframeOpen } = useUI();
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = "https://rawofficial.co";
    }
  };

  return (
    <AnimatePresence>
      {isShopIframeOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShopIframeOpen(false)}
            className="fixed inset-0 bg-editorial-bg/80 backdrop-blur-sm z-[80]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 250 }}
            className="fixed left-0 top-0 h-full w-full bg-editorial-bg border-r border-editorial-border-light z-[81] flex flex-col shadow-[50px_0_150px_rgba(0,0,0,0.15)] overflow-hidden"
            data-lenis-prevent
          >
            {/* Header / System Bar */}
            <div className="h-20 border-b border-editorial-border flex items-center justify-between px-8 bg-editorial-bg relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-600 via-transparent to-transparent shadow-[0_0_10px_#dc2626]" />
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-red-950/20 px-4 py-2 rounded-xl border border-red-900/30">
                  <Globe size={14} className="text-red-500 animate-pulse" />
                  <span className="font-mono text-[10px] text-editorial-text font-black tracking-[0.3em] uppercase">EXT_NODE_UPLINK</span>
                </div>
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-editorial-text/5 rounded-xl border border-editorial-border-light">
                  <Terminal size={12} className="text-editorial-text-muted" />
                  <span className="font-mono text-[9px] text-editorial-text-muted font-bold tracking-widest truncate max-w-[200px]">HTTPS://RAWOFFICIAL.CO</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <MagneticWrapper>
                  <button 
                    onClick={handleRefresh}
                    className="p-3 bg-editorial-surface/50 hover:bg-zinc-800 rounded-xl text-editorial-text-muted hover:text-editorial-text transition-all border border-editorial-border"
                    title="Refresh Uplink"
                  >
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                  </button>
                </MagneticWrapper>
                <MagneticWrapper>
                  <a 
                    href="https://rawofficial.co" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-editorial-surface/50 hover:bg-zinc-800 rounded-xl text-editorial-text-muted hover:text-editorial-text transition-all border border-editorial-border"
                    title="Open in Browser"
                  >
                    <ExternalLink size={18} />
                  </a>
                </MagneticWrapper>
                <div className="w-[1px] h-8 bg-editorial-text/5 mx-2" />
                <MagneticWrapper>
                  <button 
                    onClick={() => setIsShopIframeOpen(false)}
                    className="p-3 bg-red-600/10 hover:bg-red-600 rounded-xl text-red-500 hover:text-white transition-all border border-red-500/20 hover:border-red-500"
                  >
                    <X size={18} />
                  </button>
                </MagneticWrapper>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Iframe Container */}
              <div className="flex-1 relative bg-editorial-bg border-r border-editorial-border">
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-editorial-bg">
                    <div className="relative mb-8">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border border-dashed border-red-600/30 rounded-full"
                      />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Globe size={40} className="text-red-600 blur-[2px]" />
                      </motion.div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-mono text-[11px] text-red-500 font-black tracking-[0.5em] uppercase">ESTABLISHING_ENCRYPTED_UPLINK</span>
                      <div className="h-1 w-48 bg-editorial-surface rounded-full overflow-hidden mt-4">
                         <motion.div 
                           initial={{ x: "-100%" }}
                           animate={{ x: "200%" }}
                           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                           className="h-full w-1/2 bg-red-600"
                         />
                      </div>
                    </div>
                  </div>
                )}
                <iframe 
                  ref={iframeRef}
                  src="https://rawofficial.co" 
                  className="w-full h-full border-none"
                  onLoad={() => setIsLoading(false)}
                  title="RAW Official Shop"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>

            {/* Footer / Status */}
            <div className="h-12 border-t border-editorial-border bg-editorial-bg px-8 flex items-center justify-between relative z-20">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Shield size={10} className="text-emerald-500" />
                  <span className="font-mono text-[8px] text-editorial-text-muted uppercase tracking-widest">TLS_ENCRYPTION: ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_5px_#dc2626]" />
                  <span className="font-mono text-[8px] text-editorial-text-muted uppercase tracking-widest">ORACLE_LISTENING</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[8px] text-zinc-700 tracking-[0.2em]">© RAW_OFFICIAL // PROCUREMENT_NODE_01</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
