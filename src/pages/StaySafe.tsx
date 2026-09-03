import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck, ArrowLeft, ArrowDown, MessageSquare, Play, X,
  Droplets, HeartHandshake, BadgeCheck, Package,
} from "lucide-react";

/**
 * STAY SAFE WITH RAW — the 100,000 free condoms campaign.
 *
 * The signup landing page and the feedback form are two finished,
 * self-contained HTML documents served verbatim from /public/promo/ and
 * framed below (forms in demo mode until FORM_ENDPOINT is set inside each
 * file). This page wraps them in the campaign's own cinema: the real
 * product films and key art from /public/promo/assets/, all lazy — nothing
 * heavy loads until this route is opened. The campaign kit (emails, social
 * copy, venue outreach, pre-launch checklist) is docs/raw-campaign-kit.md.
 */

const ASSET = (f: string) => `/promo/assets/${f}`;

const FILMS = [
  { src: "campaign-giveaway.mp4", label: "THE_GIVEAWAY" },
  { src: "campaign-promotion.mp4", label: "THE_PROMOTION" },
  { src: "campaign-distribution.mp4", label: "DISTRIBUTION_01" },
  { src: "campaign-distribution-2.mp4", label: "DISTRIBUTION_02" },
];

const STILLS = [
  { src: "covered-wide.jpg", label: "RAW HAS YOU COVERED", wide: true },
  { src: "free-means-free.jpg", label: "FREE MEANS FREE", wide: true },
  { src: "boxes-real.jpg", label: "THE REAL BOXES — IN HAND", wide: false },
  { src: "protect-what-matters.jpg", label: "PROTECT WHAT MATTERS", wide: false },
];

const PAGES = {
  landing: { src: "/promo/stay-safe.html", title: "Stay Safe With RAW — 100,000 free condoms" },
  feedback: { src: "/promo/feedback.html", title: "Tell us what you thought — RAW" },
} as const;

const PILLARS = [
  { icon: ShieldCheck, label: "High quality protection" },
  { icon: Droplets, label: "Natural & comfortable" },
  { icon: BadgeCheck, label: "Safe for you & others" },
  { icon: HeartHandshake, label: "Responsible choice" },
];

export default function StaySafe() {
  const location = useLocation();
  const variant = location.pathname.endsWith("/feedback") ? "feedback" : "landing";
  const page = PAGES[variant];
  const [frameReady, setFrameReady] = useState(false);
  const [film, setFilm] = useState(0);
  const [theatre, setTheatre] = useState<number | null>(null);
  const signupRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setFrameReady(false); }, [variant]);
  // Theatre open = the page's own scroll stays put and Escape closes.
  useEffect(() => {
    if (theatre === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTheatre(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [theatre]);

  const scrollToSignup = () => signupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-[100svh] bg-editorial-bg flex flex-col">
      {/* Slim campaign header */}
      <div className="flex items-center justify-between gap-4 px-6 md:px-10 py-4 border-b border-editorial-border">
        <div className="flex items-center gap-3 min-w-0">
          <ShieldCheck size={16} className="text-red-500 flex-shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-editorial-text-muted truncate">
            {variant === "landing" ? "CAMPAIGN // STAY_SAFE_WITH_RAW" : "CAMPAIGN // FEEDBACK_LOOP"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {variant === "landing" ? (
            <Link
              to="/stay-safe/feedback"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-editorial-border hover:border-red-500/40 text-editorial-text-muted hover:text-red-400 transition-colors font-mono text-[10px] uppercase tracking-[0.2em]"
            >
              <MessageSquare size={12} /> Feedback form
            </Link>
          ) : (
            <Link
              to="/stay-safe"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-editorial-border hover:border-red-500/40 text-editorial-text-muted hover:text-red-400 transition-colors font-mono text-[10px] uppercase tracking-[0.2em]"
            >
              <ArrowLeft size={12} /> Campaign page
            </Link>
          )}
        </div>
      </div>

      {/* CINEMA HERO — the real campaign film, landing variant only */}
      {variant === "landing" && (
        <section className="relative h-[72svh] min-h-[420px] overflow-hidden border-b border-editorial-border bg-black">
          <video
            key={FILMS[film].src}
            src={ASSET(FILMS[film].src)}
            poster={ASSET("hero-banner.jpg")}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none" />

          <div className="relative h-full flex flex-col justify-end px-6 md:px-14 pb-10 md:pb-14">
            <motion.span
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-red-500 mb-4"
            >
              LIVE_CAMPAIGN // #STAYSAFEWITHRAW
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
              className="font-sans font-black text-4xl md:text-7xl uppercase leading-[0.9] tracking-tight max-w-4xl"
            >
              100,000 free condoms.<br />
              <span className="text-red-500">No catch.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25 }}
              className="mt-5 max-w-xl text-editorial-text-muted text-sm md:text-base leading-relaxed"
            >
              Sex is part of life. Protection should be too. Not samples, not free
              with purchase — free means free. RAW has you covered.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <button
                onClick={scrollToSignup}
                className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white transition-colors"
              >
                Claim your free pack <ArrowDown size={14} />
              </button>
              {/* The four films, switchable in place */}
              <div className="flex items-center gap-2">
                {FILMS.map((f, i) => (
                  <button
                    key={f.src}
                    onClick={() => setFilm(i)}
                    title={f.label}
                    aria-label={`Play ${f.label}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === film ? "bg-red-500 scale-125" : "bg-white/25 hover:bg-white/50"}`}
                  />
                ))}
                <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">{FILMS[film].label}</span>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* THE PILLARS — from the pack itself */}
      {variant === "landing" && (
        <section className="border-b border-editorial-border">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {PILLARS.map((p, i) => (
              <div key={p.label} className={`flex items-center gap-3 px-6 py-5 ${i > 0 ? "border-l border-editorial-border" : ""} ${i > 1 ? "border-t md:border-t-0" : ""}`}>
                <p.icon size={16} className="text-red-500 flex-shrink-0" />
                <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-editorial-text-muted">{p.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* THE SIGNUP — the finished landing document, framed */}
      <div ref={signupRef} className="relative flex-1 scroll-mt-4">
        {!frameReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-red-500 animate-pulse">
              LOADING_CAMPAIGN
            </span>
          </div>
        )}
        <motion.iframe
          key={variant}
          src={page.src}
          title={page.title}
          onLoad={() => setFrameReady(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: frameReady ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full min-h-[calc(100svh-57px)] border-0 block"
        />
      </div>

      {/* THE CAMPAIGN REEL — key art + films, landing variant only */}
      {variant === "landing" && (
        <section className="border-t border-editorial-border px-6 md:px-14 py-16 md:py-24">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-red-500 block mb-3">
            CAMPAIGN_ASSETS // THE_REEL
          </span>
          <h2 className="font-sans font-black text-3xl md:text-5xl uppercase tracking-tight mb-10">
            The campaign, on film
          </h2>

          {/* Films */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {FILMS.map((f, i) => (
              <button
                key={f.src}
                onClick={() => setTheatre(i)}
                className="group relative aspect-video overflow-hidden rounded-2xl border border-editorial-border hover:border-red-500/50 transition-colors bg-black"
                aria-label={`Open ${f.label} full screen`}
              >
                <video src={ASSET(f.src)} muted playsInline preload="metadata" className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-12 h-12 rounded-full bg-black/60 border border-white/20 group-hover:border-red-500 flex items-center justify-center transition-colors">
                    <Play size={16} className="text-white ml-0.5" />
                  </span>
                </span>
                <span className="absolute bottom-2 left-3 font-mono text-[8px] uppercase tracking-[0.3em] text-white/60">{f.label}</span>
              </button>
            ))}
          </div>

          {/* Stills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STILLS.map((s) => (
              <figure key={s.src} className="relative overflow-hidden rounded-2xl border border-editorial-border group">
                <img
                  src={ASSET(s.src)}
                  alt={s.label}
                  loading="lazy"
                  className="w-full h-full max-h-[420px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
                <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-5 pt-10 pb-4 font-mono text-[9px] uppercase tracking-[0.3em] text-white/70">
                  {s.label}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-editorial-border pt-8">
            <div className="flex items-center gap-3">
              <Package size={16} className="text-red-500" />
              <p className="text-editorial-text-muted text-sm">
                Ten per box, individually sealed, plain outer packaging. Reduces the risk of
                pregnancy and sexually transmitted infections when used correctly.
              </p>
            </div>
            <button
              onClick={scrollToSignup}
              className="flex-shrink-0 inline-flex items-center gap-3 px-6 py-3 border border-red-500/40 hover:border-red-500 hover:bg-red-500/10 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red-400 transition-all"
            >
              Sign up above ↑
            </button>
          </div>
        </section>
      )}

      {/* THEATRE — one film, full screen, with sound */}
      <AnimatePresence>
        {theatre !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setTheatre(null)}
          >
            <video
              src={ASSET(FILMS[theatre].src)}
              autoPlay controls playsInline
              className="max-w-full max-h-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setTheatre(null)}
              aria-label="Close film"
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/60 border border-white/20 hover:border-red-500 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.4em] text-white/50">
              {FILMS[theatre].label} // #STAYSAFEWITHRAW
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
