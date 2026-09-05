import { useEffect, useRef, useState } from "react";

/**
 * A BACKGROUND FILM THAT COSTS WHAT IT IS WORTH.
 *
 * ⚠️ MEASURED ON THE LIVE SITE, 2026-09-05, first twelve seconds of a visit:
 *
 *      /combat      995 MB      /recovery    589 MB
 *      /nutrients   319 MB      /            151 MB
 *
 * Those are decorative reels behind headlines. The Combat page held the same
 * 102MB film in two <video> tags, both `autoPlay loop`, both streaming from
 * the moment the page opened whether or not either was on screen — and on a
 * phone as readily as on a monitor. A visitor on a mobile plan paid for all
 * of it before reading a word.
 *
 * WHAT THIS DOES INSTEAD
 *  - The poster paints at once, so the block is never empty.
 *  - The film is attached only while it is actually on screen, and is dropped
 *    again when it is not: scroll past and you never pay for it. Two films on
 *    one page can no longer stream at each other.
 *  - It pauses when the tab is hidden — a loop playing to nobody is battery
 *    and data for nothing.
 *  - On a phone, on Data Saver, and under prefers-reduced-motion, the film is
 *    never fetched at all. The poster reads exactly as well at 30% opacity
 *    behind a headline, which is all these are.
 *
 * `narrow="play"` opts a specific video back in on small screens — for the
 * few that are the content rather than the decoration.
 *
 * THE REAL FIX IS STILL A WEB ENCODE. A 1080p version of these reels would be
 * a few megabytes and identical behind a headline. Until the founder supplies
 * one, this stops the bleeding without touching his media or his design.
 */
export default function LazyVideo({
  src,
  poster,
  className = "",
  loop = true,
  narrow = "poster",
  decorative = true,
  controls = false,
  share,
}: {
  src: string;
  poster?: string;
  className?: string;
  loop?: boolean;
  /** "poster" (default) never fetches the film on a phone; "play" allows it. */
  narrow?: "poster" | "play";
  /** Decoration is hidden from screen readers; content is not. */
  decorative?: boolean;
  /** Player controls, for a film the visitor chose to watch. Off by default. */
  controls?: boolean;
  /**
   * Hands the mounted <video> to the parent. For effects that need the frames
   * that are already being downloaded — the hero's mirrored blur paints itself
   * from this element rather than fetching the film a second time.
   */
  share?: (el: HTMLVideoElement | null) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [attach, setAttach] = useState(false);
  const [everAttached, setEverAttached] = useState(false);
  const autoplayed = useRef(false);

  /* ⚠️ CONTENT IS NOT DECORATION, AND THE SAVINGS DO NOT APPLY TO IT.
     A film the visitor deliberately opened — one with controls, or one this
     page calls its content — must play when they press play, on a phone, on
     Data Saver, and under reduced motion alike. Withholding it there would
     leave a player with nothing in it, which is worse than the data it saves.
     Only the background films are rationed. */
  const isContent = narrow === "play" || !decorative || controls;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!isContent) {
      const saveData = Boolean((navigator as any).connection?.saveData);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const narrowScreen = window.innerWidth < 900;
      if (saveData || reduced || narrowScreen) return; // poster only, and that is correct
    }

    const io = new IntersectionObserver(
      ([entry]) => setAttach(entry.isIntersecting && !document.hidden),
      { rootMargin: "300px" },
    );
    io.observe(el);

    const onVisibility = () => {
      if (document.hidden) el.pause();
      else if (el.src) el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [narrow]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (attach) {
      setEverAttached(true);
      /* A background loop resumes every time it comes back on screen. A film
         someone is watching is started once and then left alone — scrolling
         past it must not restart it, and must not override a pause they chose. */
      if (!isContent || !autoplayed.current) {
        autoplayed.current = true;
        el.play().catch(() => { /* a browser that refuses autoplay keeps the poster */ });
      }
    } else {
      el.pause();
    }
  }, [attach, isContent]);

  return (
    <video
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
        share?.(el);
      }}
      /* `src` exists only while the film is on screen; before that the element
         holds nothing for the browser to download. Content keeps its src once
         attached, because dropping it would throw away where they were up to. */
      src={(isContent ? everAttached : attach) ? src : undefined}
      poster={poster}
      muted
      loop={loop}
      playsInline
      preload="none"
      controls={controls || undefined}
      aria-hidden={decorative || undefined}
      /* ⚠️ SPREAD, NOT AN ATTRIBUTE. React's VideoHTMLAttributes has no
         referrerPolicy, so writing it plainly fails the typecheck — which is
         why every inline tag this component replaced carried an `as any` cast
         of its whole props object. The cast now lives here, around this one
         attribute, instead of around all of them. */
      {...({ referrerPolicy: "no-referrer" } as any)}
      className={className}
    />
  );
}
