import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    // Smooth transition: load at least 1.2s to ensure the polish is seen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); 

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Enhanced Atmospheric Depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(220,38,38,0.1),transparent_70%)] opacity-80" />
          
          {/* High-Fi Neural Grid */}
          <div className="absolute inset-0 opacity-[0.2] pointer-events-none">
             <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100%_4px]" />
          </div>

          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"
          />
          
          {/* Refined Scanning Lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen">
             <motion.div 
               animate={{ y: ["0vh", "100vh"] }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="h-[1px] w-full bg-red-500 shadow-[0_0_15px_#ef4444]"
             />
          </div>
          
          <div className="flex flex-col items-center gap-16 relative z-10 px-6">
             <div className="flex items-center gap-8">
                <motion.div 
                  initial={{ width: 0, opacity: 0 }} animate={{ width: 80, opacity: 1 }} transition={{ duration: 0.8 }}
                  className="h-[1px] bg-red-900/50" 
                />
                <DecryptionTitle text="SYSTEM_ROUTING" />
                <motion.div 
                  initial={{ width: 0, opacity: 0 }} animate={{ width: 80, opacity: 1 }} transition={{ duration: 0.8 }}
                  className="h-[1px] bg-red-900/50" 
                />
             </div>
             
             <div className="flex flex-col items-center relative gap-20">
                <motion.div
                  animate={{ scale: [0.98, 1.02, 0.98], filter: ["blur(1px)", "blur(0px)", "blur(1px)"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative group block"
                >
                  <div className="absolute inset-0 bg-red-600/20 blur-[30px] rounded-full group-hover:bg-red-600/40 transition-colors" />
                  <img 
                    src="/brand/raw-logo-red.png" 
                    alt="RAW Official" 
                    className="relative z-10 h-16 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] filter brightness-125"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle glitch effect */}
                  <motion.div 
                     animate={{ x: [-2, 2, -1, 0] }}
                     transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                     className="absolute inset-0 z-20 pointer-events-none mix-blend-color-dodge opacity-50 bg-[url('/brand/raw-logo-red.png')] bg-contain bg-center bg-no-repeat filter brightness-200 blur-[1px]"
                  />
                </motion.div>
                
                <div className="w-64 h-[1px] bg-white/10 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                     className="h-full bg-gradient-to-r from-red-800 via-red-500 to-red-400 shadow-[0_0_20px_#dc2626]"
                   />
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DecryptionTitle({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((_, index) => {
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 40);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <h2 className="font-mono font-bold text-xs uppercase tracking-[0.4em] text-red-500 flex items-center h-8 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
      {displayText}
    </h2>
  );
}
