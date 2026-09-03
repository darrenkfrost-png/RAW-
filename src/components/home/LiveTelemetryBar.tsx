import { motion } from "motion/react";
import { useEffect, useState } from "react";

const metrics = [
  { label: "NEURAL_LINK", value: "STABLE", color: "text-emerald-500" },
  { label: "RECOVERY_RATE", value: "0.85 MS/S", color: "text-red-500" },
  { label: "METABOLIC_FLUX", value: "NOMINAL", color: "text-blue-500" },
  { label: "PROTOCOL_OS", value: "V4.0.0", color: "text-white" },
  { label: "LATENCY", value: "2MS", color: "text-emerald-500" },
];

export function LiveTelemetryBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-black/80 backdrop-blur-3xl border-t border-white/10 z-[100] hidden lg:flex items-center px-[var(--shell-padding)] overflow-hidden">
      <div className="flex items-center gap-8 whitespace-nowrap animate-marquee group">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-10">
            {metrics.map((metric, j) => (
              <div key={j} className="flex items-center gap-3">
                <span className="font-mono text-[9px] font-black tracking-[0.2em] text-white/30 uppercase">
                  {metric.label}:
                </span>
                <span className={`font-mono text-[9px] font-black tracking-[0.1em] uppercase ${metric.color}`}>
                  {metric.value}
                </span>
                <div className="w-1 h-1 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="ml-auto bg-black border-l border-white/10 h-full flex items-center px-6 gap-6 relative z-20">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]" />
            <span className="font-mono text-[9px] font-black text-white/60 tracking-[0.2em] uppercase">SYSTEM_UPTIME</span>
         </div>
         <span className="font-mono text-[10px] font-black text-white tracking-[0.1em]">
           {time.toLocaleTimeString([], { hour12: false })}
         </span>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
