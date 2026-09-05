import { useRef } from "react";
import { useInView } from "motion/react";
import LazyVideo from "../common/LazyVideo";
import { FILM } from "../../data/videoLibrary";

export function EngagementVideo() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "200px" });

  /* ⚠️ THIS IS THE SAME 133MB REEL THE HERO USES, LOADED A SECOND TIME ON THE
     SAME PAGE. It already waited to come into view, which is good — but on a
     phone or a metered connection a 133MB decorative loop is indefensible
     however patiently it waits. Those visitors get the still instead, which
     at brightness-50 behind a hover effect loses nothing worth having. */
  const heavyOk =
    typeof navigator !== "undefined" &&
    !(navigator as any).connection?.saveData &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.innerWidth >= 900;

  return (
    <div ref={containerRef} className="relative aspect-video group overflow-hidden border border-editorial-border-light bg-editorial-card rounded-[2.5rem] shadow-depth-2 m-12 lg:m-24 z-10">
      {/* High-Tech Overlay Grid */}
      <div className="absolute inset-0 z-10 pointer-events-none neural-grid-overlay"></div>
      
      {isInView && heavyOk ? (
        /* 133MB reel — the second copy on this page: attached only while on screen, never on a phone. */
        <LazyVideo
          src={FILM.wide.hd}
          poster="https://rawofficial.co/wp-content/uploads/2026/02/combatIMG-scaled.jpg"
          className="w-full h-full object-cover transition-all duration-[2s] ease-[0.16,1,0.3,1] brightness-50 group-hover:brightness-100 scale-110 group-hover:scale-100"
        />
      ) : (
        <div
          role="img"
          aria-label="RAW Official video still"
          className="w-full h-full bg-editorial-bg bg-cover bg-center"
          style={{ backgroundImage: "url('https://rawofficial.co/wp-content/uploads/2026/02/combatIMG-scaled.jpg')" }}
        />
      )}
    </div>
  );
}
