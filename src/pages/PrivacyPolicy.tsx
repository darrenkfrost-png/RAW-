
export default function PrivacyPolicy() {
  return (
    <div className="pt-32 pb-24 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[1000px] mx-auto text-editorial-text relative min-h-screen">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 blur-[150px] pointer-events-none rounded-full" />
      <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-500 mb-6 block flex items-center gap-3 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] relative z-10">
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Data_Protocol // SEC_002
      </span>
      <h1 className="font-sans font-black text-6xl md:text-8xl uppercase tracking-[-0.03em] leading-[0.85] mb-16 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative z-10">Data <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-900 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">Security</span> <br /> Policy</h1>
      
      <div className="space-y-16 relative z-10">
        <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
          <h2 className="font-mono font-black text-[13px] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">01</span> Introduction</h2>
          <p className="font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted group-hover:text-editorial-text transition-colors duration-[800ms]">Welcome to RAW Logistics network. This Data Security Policy explains how we collect, use, encrypt, and structure your operational information when you access our system.</p>
        </section>

        <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
          <h2 className="font-mono font-black text-[13px] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">02</span> Information We Collect</h2>
          <ul className="space-y-6 font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted list-none max-w-3xl group-hover:text-editorial-text transition-colors duration-[800ms]">
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" /><strong>Identity Data:</strong> Call-sign, comms link, coordinates, and priority deployment metrics.</li>
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" /><strong>Manifest Details:</strong> Items procured, archival access history, and return/exchange requests.</li>
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" /><strong>Credit Information:</strong> Encryption is active. All processing handled via zero-knowledge relay nodes.</li>
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" /><strong>Telemetry Data:</strong> IP logs, terminal parameters, and interaction models.</li>
          </ul>
        </section>

        <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
          <h2 className="font-mono font-black text-[13px] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">03</span> Data Utilization</h2>
          <ul className="space-y-6 font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted list-none max-w-3xl group-hover:text-editorial-text transition-colors duration-[800ms]">
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />To coordinate drops and verify identity quickly and securely.</li>
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />To broadcast vital system updates and operational adjustments.</li>
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />To refine engagement loops across our global systems.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
