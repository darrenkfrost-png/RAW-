import { useEffect, useRef, useState } from "react";
import LazyVideo from "../common/LazyVideo";

/**
 * THE HERO FILM — a crisp band down the middle, with the rest of the screen lit
 * by the film's own light.
 *
 * ⚠️ IT WAS SENDING 133 MEGABYTES TO EVERY VISITOR ON THE FRONT PAGE.
 *
 * The component was already called "LazyHeroVideo", but nothing about it was
 * lazy: a <source> pointing at raw-official-wide-3840-final.mp4 with autoPlay,
 * so the browser began fetching it on first paint. Measured with a HEAD
 * request: 133MB. The lazy behaviour now lives in <LazyVideo> — poster first,
 * attached only while on screen, never fetched on a phone, on Data Saver, or
 * under prefers-reduced-motion.
 *
 * THE FRAMING (Darren's design, 2026-09-05)
 * The film no longer stretches across the whole viewport. It plays sharp in a
 * band down the centre — a third of the width on a wide screen — and the space
 * either side is filled by the same footage, mirrored outward and blurred into
 * an ambient wash. It reads as a cinema screen throwing its light onto the
 * wall around it.
 *
 * ⚠️ THE WASH COSTS NOTHING EXTRA, AND THAT IS THE WHOLE POINT. The obvious
 * way to build this is a second <video> with the same src, scaled and blurred.
 * That risks fetching the film twice — on this page a second 133MB. Instead a
 * 96x54 canvas samples the frames the one <video> is already showing, about
 * eleven times a second, draws them mirrored into three bands, and CSS blurs
 * the result to a haze. Cross-origin frames taint that canvas, which is fine:
 * the pixels are only ever displayed, never read back.
 *
 * Under it sits the poster, blurred and scaled, so the composition is complete
 * before a single frame of film arrives — and stays complete for the visitors
 * who never receive one.
 *
 * A SMALLER FILM WOULD NOW LOOK IDENTICAL. Sharpness only has to hold across a
 * third of the width; the rest is deliberately out of focus. A 1080p web encode
 * at a few megabytes would be indistinguishable here, and is the one thing that
 * actually removes the 133MB.
 */

const SRC = "https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4";
/* ⚠️ THE BAND FILLS A PHONE, SO ITS STRENGTH CANNOT BE FIXED. At 80% opacity a
   full-width still is bright enough to swallow the headline — measured at 375px,
   RECOVER_INTENT was unreadable over it. 80% is right only once the band is a
   third of a wide screen with darkness either side; a phone keeps the 40% the
   full-bleed film always had.

   (This note lived inside the JSX for one build. A bare block comment there is
   not a comment — it is text, and it rendered on the front page.) */
const POSTER = "https://rawofficial.co/wp-content/uploads/2026/02/combatIMG-scaled.jpg";

export function LazyHeroVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Tiny on purpose. It is blurred to a haze on the way to the screen, so
       resolution here is wasted work on every frame. */
    canvas.width = 96;
    canvas.height = 54;

    let frame = 0;
    let last = 0;
    let alive = true;

    const paint = (t: number) => {
      if (!alive) return;
      frame = requestAnimationFrame(paint);
      if (t - last < 90) return; // ~11fps; nobody can see a blur update faster
      last = t;
      if (video.readyState < 2 || video.paused) return;
      const w = canvas.width;
      const h = canvas.height;
      const band = w / 3;
      try {
        // the middle band, as the film runs
        ctx.drawImage(video, band, 0, band, h);
        // its reflection to the left
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -band, 0, band, h);
        ctx.restore();
        // and to the right
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, band, h);
        ctx.restore();
      } catch {
        /* A browser that refuses to sample this film keeps the blurred poster
           underneath, which is the same composition without the movement. */
        alive = false;
        cancelAnimationFrame(frame);
      }
    };

    frame = requestAnimationFrame(paint);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [video]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* The wall behind the screen: the poster, thrown out of focus. Present
          from the first paint, and the whole effect on a phone. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-125 bg-cover bg-center opacity-0 md:opacity-20 lg:opacity-30 blur-3xl"
        style={{ backgroundImage: `url("${POSTER}")` }}
      />

      {/* The film's own light, mirrored outward. Empty until frames exist. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-150 object-cover opacity-70 blur-2xl mix-blend-screen"
      />

      {/* The screen itself: a third of the width, full height, sharp. */}
      <div className="absolute inset-y-0 left-1/2 w-full -translate-x-1/2 md:w-[45%] lg:w-[33%]">
        {/* 133MB reel: attached only while on screen, never on a phone. */}
        <LazyVideo
          src={SRC}
          poster={POSTER}
          share={setVideo}
          className="h-full w-full object-cover opacity-40 md:opacity-70 lg:opacity-80 grayscale contrast-125 mix-blend-screen"
        />
        {/* The band fades at top and bottom so it reads as light thrown on a
            wall, not a rectangle pasted on the page. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent" />
        {/* Edges that fade into the wash, so the band is a light source rather
            than a rectangle stuck on the page. */}
        <div className="pointer-events-none absolute inset-y-0 -left-32 w-32 bg-gradient-to-l from-white/[0.06] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 -right-32 w-32 bg-gradient-to-r from-white/[0.06] to-transparent" />
      </div>

      <div className="absolute inset-0 mix-blend-color bg-red-900/10" />
      {/* ⚠️ A WHITE STROBE USED TO SIT HERE, flashing the full viewport every
          0.1s on an infinite repeat — a 10Hz flicker, which is inside the band
          associated with photosensitive seizures. Its opacity only reached
          0.05, so the risk was small, but it was also a permanent full-screen
          repaint on the front page for an effect nobody could consciously see.
          Removed on both counts. */}
    </div>
  );
}
