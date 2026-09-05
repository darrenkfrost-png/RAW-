
export default function PrivacyPolicy() {
  return (
    <div className="pt-32 pb-24 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[1000px] mx-auto text-editorial-text relative min-h-svh">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 blur-[150px] pointer-events-none rounded-full" />
      <span className="text-[0.6875rem] font-bold uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-red-500 mb-6 block flex items-center gap-3 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] relative z-10">
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Data_Protocol // SEC_002
      </span>
      <h1 className="font-sans font-black uppercase tracking-[-0.03em] leading-[0.85] mb-16 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative z-10 text-display-md">Privacy <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-900 drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">Policy</span></h1>
      
      <div className="space-y-16 relative z-10">
        <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
          <h2 className="font-mono font-black text-[0.8125rem] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">01</span> Introduction</h2>
          <p className="font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted group-hover:text-editorial-text transition-colors duration-[800ms]">This policy explains what RAW Official collects when you use this site, and what happens to it.</p>

          {/* ⚠️ TWO INVENTED SECURITY CLAIMS WERE REMOVED FROM THIS PAGE.
              It stated "Credit Information: Encryption is active. All
              processing handled via zero-knowledge relay nodes" — describing a
              payment security architecture that does not exist, for payments
              the site does not take. A privacy policy is the one document on a
              site that must not contain anything aspirational.

              The rest of this page is still placeholder prose in the brand's
              voice, and it is NOT a complete UK GDPR notice: it names no data
              controller, no legal basis, no retention period, no data-subject
              rights, no ICO complaint route and no contact for data requests.
              That is a gap the founder's own campaign kit already flags, and
              it matters most because the Stay Safe signup collects names,
              emails and postal addresses in a sexual-health context. Writing
              convincing legalese here would repeat exactly the mistake this
              audit has been removing everywhere else, so the gap is stated
              rather than papered over. */}
          <p className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] px-6 py-4 text-sm leading-relaxed text-editorial-text-muted">
            <span className="mb-1 block font-mono text-[0.6875rem] font-black uppercase tracking-[0.3em] text-amber-400">
              In progress
            </span>
            This notice is not yet complete. Before RAW collects personal details
            through this site, it will be replaced with a full privacy notice
            naming the data controller, the legal basis for processing, how long
            information is kept and how to exercise your rights over it.
          </p>
        </section>

        <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
          <h2 className="font-mono font-black text-[0.8125rem] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">02</span> Information We Collect</h2>
          <ul className="space-y-6 font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted list-none max-w-3xl group-hover:text-editorial-text transition-colors duration-[800ms]">
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" /><strong>Identity Data:</strong> Call-sign, comms link, coordinates, and priority deployment metrics.</li>
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" /><strong>Payment information:</strong> none is collected. The site is not connected to a payment provider, so no card details are taken or stored anywhere.</li>
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" /><strong>Telemetry Data:</strong> IP logs, terminal parameters, and interaction models.</li>
          </ul>
        </section>

        <section className="bg-editorial-bg/80 p-10 xl:p-14 rounded-[2rem] border border-editorial-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl hover:border-red-500/30 transition-colors duration-[800ms] group">
          <h2 className="font-mono font-black text-[0.8125rem] uppercase tracking-[0.4em] mb-8 text-red-500 flex items-center gap-4"><span className="text-zinc-600 font-bold">03</span> Data Utilization</h2>
          <ul className="space-y-6 font-light leading-relaxed text-lg xl:text-xl text-editorial-text-muted list-none max-w-3xl group-hover:text-editorial-text transition-colors duration-[800ms]">
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />To coordinate drops.</li>
            <li className="flex gap-5 items-start"><div className="w-2 h-2 bg-red-600 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_#dc2626]" />To broadcast vital system updates and operational adjustments.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
