import React from "react";
import { motion } from "motion/react";

const events = [
  { year: "2018", title: "THE_GARAGE_PROTOCOL", detail: "Initial unit production begins in localized testing facility.", color: "bg-zinc-800" },
  { year: "2020", title: "ARENA_EXPANSION", detail: "Full migration to integrated performance logistics network.", color: "bg-red-900" },
  { year: "2022", title: "BIO_SYNC_INTEGRATION", detail: "Molecular stability reaches 99.8% across core inventory.", color: "bg-red-700" },
  { year: "2024", title: "GLOBAL_DOMINANCE", detail: "Distributed node network activated across 48 continents.", color: "bg-red-600" },
  { year: "2026", title: "V.04_SYNCHRONIZATION", detail: "Intent-based recovery protocols established. Native optimization.", color: "bg-editorial-text" }
];

export default function NeuralTimeline() {
  return (
    <div className="py-24 relative">
      {/* Central Rail */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-editorial-text/5 -translate-x-1/2 hidden lg:block" />
      
      <div className="space-y-32">
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 relative z-10`}
          >
            {/* Year Node */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative group">
                <div className={`w-32 h-16 border border-editorial-border-light flex items-center justify-center font-sans font-black text-4xl italic transition-all duration-700 group-hover:bg-red-600 group-hover:border-red-600 bg-editorial-bg`}>
                  {event.year}
                </div>
                <div className="absolute -inset-2 border border-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Connector for large screens */}
                <div className={`absolute top-1/2 w-32 h-px bg-editorial-text/10 hidden lg:block ${i % 2 === 0 ? 'left-full' : 'right-full'}`} />
              </div>
            </div>

            {/* Event Detail */}
            <div className="lg:w-1/2 px-10 lg:px-20 text-center lg:text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start gap-4">
                   <div className={`w-2 h-2 ${event.color} rounded-full`} />
                   <span className="font-mono text-[0.6875rem] tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-red-600">{event.title}</span>
                </div>
                <p className="font-serif italic text-2xl md:text-3xl text-editorial-text-muted font-light max-w-xl mx-auto lg:mx-0">
                  {event.detail}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-2 opacity-20">
                   {[1, 2, 3, 4, 5].map(dot => <div key={dot} className="w-1 h-1 bg-editorial-text rounded-full" />)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative Symbols */}
      <div className="absolute top-0 right-10 opacity-[0.05] pointer-events-none font-black italic select-none text-display-lg">H.RITAGE</div>
      <div className="absolute bottom-0 left-10 opacity-[0.05] pointer-events-none font-black italic select-none text-display-lg">M.SSION</div>
    </div>
  );
}
