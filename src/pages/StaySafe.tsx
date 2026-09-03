import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ShieldCheck, ArrowLeft, MessageSquare } from "lucide-react";

/**
 * STAY SAFE WITH RAW — the 100,000 free condoms campaign.
 *
 * The landing page and the feedback form arrived as two finished, fully
 * self-contained HTML documents (all imagery embedded, forms in demo mode
 * until FORM_ENDPOINT is set inside each file). They are served verbatim
 * from /public/promo/ and framed here, so the campaign pages can be
 * reworked or replaced without touching the app build. The campaign kit
 * (emails, social copy, venue outreach, pre-launch checklist) lives at
 * docs/raw-campaign-kit.md.
 */

const PAGES = {
  landing: { src: "/promo/stay-safe.html", title: "Stay Safe With RAW — 100,000 free condoms" },
  feedback: { src: "/promo/feedback.html", title: "Tell us what you thought — RAW" },
} as const;

export default function StaySafe() {
  const location = useLocation();
  const variant = location.pathname.endsWith("/feedback") ? "feedback" : "landing";
  const page = PAGES[variant];
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(false); }, [variant]);

  return (
    <div className="min-h-[100svh] bg-editorial-bg flex flex-col">
      {/* Slim campaign header — the framed page carries its own full branding */}
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

      <div className="relative flex-1">
        {!ready && (
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
          onLoad={() => setReady(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full min-h-[calc(100svh-57px)] border-0 block"
        />
      </div>
    </div>
  );
}
