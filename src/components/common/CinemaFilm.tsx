import { useEffect, useRef, useState } from "react";
import LazyVideo from "./LazyVideo";

/**
 * A FILM SHOWN AT ITS OWN SHAPE, LIT BY ITS OWN LIGHT.
 *
 * Darren's framing, first built for the home hero and now shared. The film is
 * not stretched across the viewport. It plays in the middle at its own
 * proportions, and the space around it is filled by the same footage mirrored
 * outward and blurred into an ambient wash that moves with it — a cinema
 * screen throwing its light onto the wall.
 *
 * ⚠️ THE WASH COSTS NO EXTRA DOWNLOAD, WHICH IS THE WHOLE POINT. The obvious
 * build is a second <video> with the same src, scaled and blurred; that risks
 * fetching the film twice. Instead a 96x54 canvas samples the frames the one
 * <video> is already showing, about eleven times a second, draws them mirrored
 * into three bands, and CSS blurs the result. Cross-origin frames taint that
 * canvas, which is fine: they are only ever displayed, never read back. Under
 * it sits the blurred poster, so the composition is complete before any frame
 * arrives and stays complete for anyone who never receives one.
 *
 * TWO SHAPES, FOR TWO JOBS
 *
 *   fit="band"     a third of the width on a wide screen, filled (object-cover).
 *                  For a hero, where the film is texture behind a headline.
 *
 *   fit="contain"  the whole film, uncropped, as large as it will go. For a
 *                  screensaver, where the film IS the content — a 2160x2160
 *                  square reel on a 16:9 monitor previously had a third of
 *                  itself cropped away, and on a phone lost its sides instead.
 *                  Contained, it fits every screen without losing anything,
 *                  and the wash fills whatever shape is left over.
 */
export default function CinemaFilm({
  src,
  poster,
  fit = "band",
  bandClassName = "h-full w-full object-cover opacity-40 md:opacity-70 lg:opacity-80 grayscale contrast-125 mix-blend-screen",
  washClassName = "absolute inset-0 h-full w-full scale-150 object-cover opacity-70 blur-2xl mix-blend-screen",
  posterWallClassName = "absolute inset-0 scale-125 bg-cover bg-center opacity-0 md:opacity-20 lg:opacity-30 blur-3xl",
  narrow = "poster",
  loop = true,
  onEnded,
  className = "absolute inset-0 z-0 overflow-hidden pointer-events-none",
  stageChildren,
  children,
}: {
  src: string;
  poster?: string;
  fit?: "band" | "contain";
  bandClassName?: string;
  washClassName?: string;
  posterWallClassName?: string;
  narrow?: "poster" | "play";
  /** Off when the caller wants to move on to the next film instead of repeating. */
  loop?: boolean;
  onEnded?: () => void;
  className?: string;
  /** Painted inside the film's own frame — edge fades that belong to the band. */
  stageChildren?: React.ReactNode;
  children?: React.ReactNode;
}) {
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

  const stage =
    fit === "band"
      ? "absolute inset-y-0 left-1/2 w-full -translate-x-1/2 md:w-[45%] lg:w-[33%]"
      : "absolute inset-0";

  return (
    <div className={className}>
      {/* The wall behind the screen: the poster, thrown out of focus. */}
      {poster && (
        <div
          aria-hidden="true"
          className={posterWallClassName}
          style={{ backgroundImage: `url("${poster}")` }}
        />
      )}

      {/* The film's own light, mirrored outward. Empty until frames exist. */}
      <canvas ref={canvasRef} aria-hidden="true" className={washClassName} />

      {/* The screen itself. */}
      <div className={stage}>
        <LazyVideo src={src} poster={poster} share={setVideo} narrow={narrow} loop={loop} onEnded={onEnded} className={bandClassName} />
        {stageChildren}
      </div>

      {children}
    </div>
  );
}
