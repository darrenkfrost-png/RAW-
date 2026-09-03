
export default function TermsOfUse() {
  return (
    <div className="pt-32 pb-24 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[1000px] mx-auto text-editorial-text relative min-h-screen">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-900/10 blur-[150px] pointer-events-none rounded-full" />
      <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-500 mb-6 block flex items-center gap-3 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] relative z-10">
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Legal_Protocol // SEC_003
      </span>
            <h1 className="font-sans font-black text-6xl md:text-8xl uppercase tracking-[-0.03em] leading-[0.85] mb-16 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative z-10">Operational <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-900 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">Parameters</span></h1>
            
            <div className="space-y-16 relative z-10">
              <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
                <h2 className="font-mono font-black text-[13px] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">01</span> System Access</h2>
                <p className="font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted group-hover:text-editorial-text transition-colors duration-[800ms]">By accessing or extracting payload resources from our terminals, you acknowledge alignment with RAW Official operational directives.</p>
              </section>
      
              <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
                <h2 className="font-mono font-black text-[13px] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">02</span> Inventory & Archival States</h2>
                <p className="font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted group-hover:text-editorial-text transition-colors duration-[800ms] mb-4">All protocols and hardware are subject to availability. The system reserves the right to rotate archive states without notification.</p>
              </section>
      
              <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
                <h2 className="font-mono font-black text-[13px] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">03</span> Value Exchange</h2>
                <ul className="space-y-6 font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted list-none max-w-3xl group-hover:text-editorial-text transition-colors duration-[800ms]">
                  <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />All credit requirements are listed dynamically and include applicable network fees unless stated otherwise.</li>
                  <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />We utilize decentralized payment processing through restricted zero-knowledge gateways.</li>
                  <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />Credit values are subject to algorithmic shifts without preemptive alerts.</li>
                </ul>
              </section>
      
              <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
                <h2 className="font-mono font-black text-[13px] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">04</span> Fulfillment & Deployment</h2>
                <ul className="space-y-6 font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted list-none max-w-3xl group-hover:text-editorial-text transition-colors duration-[800ms]">
                  <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />Once a logistics manifest is verified, you will receive real-time transmission logs.</li>
                  <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />Deployment speeds are dependent on sector proximity to core hubs.</li>
                  <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />RAW is not liable for structural delays encountered by third-party transport operators.</li>
                  <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />Live GPS node tracking will be accessible post-authorization.</li>
                </ul>
              </section>
            </div>
    </div>
  );
}
