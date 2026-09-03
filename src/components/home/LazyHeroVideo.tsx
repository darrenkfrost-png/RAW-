import { useEffect, useRef, useState } from "react";

/**
 * THE HERO FILM — now actually lazy, which the old version was not.
 *
 * ⚠️ IT WAS SENDING 133 MEGABYTES TO EVERY VISITOR ON THE FRONT PAGE.
 *
 * The component was already called "LazyHeroVideo", but nothing about it was
 * lazy: a <source> pointing at raw-official-wide-3840-final.mp4 with autoPlay,
 * so the browser began fetching it on first paint. Measured with a HEAD
 * request: 133MB. On a phone that is most of a day's data allowance spent on
 * a background texture nobody asked for, before a single word is read.
 *
 * WHAT THIS DOES INSTEAD
 *  - The poster paints immediately, so the hero never looks empty.
 *  - The film is only attached once the hero is actually on screen, and is
 *    dropped again when it is not — a visitor who scrolls straight past it
 *    never pays for it at all.
 *  - It is skipped entirely on Data Saver, on prefers-reduced-motion, and on
 *    narrow screens, where 133MB is indefensible and the poster reads just as
 *    well. Those visitors get the still, which is what they asked for.
 *
 * The right long-term fix is a compressed web encode of this reel — a 5MB
 * 1080p version would look identical at 40% opacity behind a headline. Until
 * that exists, this stops the bleeding without changing the design.
 */

const SRC = "https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4";
const POSTER = "https://rawofficial.co/wp-content/uploads/2026/02/combatIMG-scaled.jpg";

export function LazyHeroVideo() {
  const hostRef = useRef<HTMLVideoElement>(null);
  const [attach, setAttach] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const saveData = Boolean((navigator as any).connection?.saveData);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.innerWidth < 900;
    if (saveData || reduced || narrow) return; // poster only, and that is correct

    const io = new IntersectionObserver(
      ([entry]) => setAttach(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (attach) el.play().catch(() => {});
    else el.pause();
  }, [attach]);

  return (
    <>
      <video
        ref={hostRef}
        // `src` is set only when the hero is in view; before that the element
        // holds nothing to download.
        src={attach ? SRC : undefined}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 grayscale contrast-125 mix-blend-screen"
      />
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none mix-blend-color z-0" />
      {/* ⚠️ A WHITE STROBE USED TO SIT HERE, flashing the full viewport every
          0.1s on an infinite repeat — a 10Hz flicker, which is inside the band
          associated with photosensitive seizures. Its opacity only reached
          0.05, so the risk was small, but it was also a permanent full-screen
          repaint on the front page for an effect nobody could consciously see.
          Removed on both counts. */}
    </>
  );
}
