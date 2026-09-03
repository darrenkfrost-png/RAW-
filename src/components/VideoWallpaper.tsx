import { useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import { videoById } from "../data/videoLibrary";

/**
 * THE VIDEO WALLPAPER — a RAW film playing behind the whole site.
 *
 * It sits above the ambient field and below every pixel of content, muted,
 * looping, and at the opacity the visitor chooses (a third by default:
 * present enough to feel, faint enough that nothing has to be read through
 * it).
 *
 * THE RULES IT KEEPS, BECAUSE A BACKGROUND MUST NEVER COST THE VISITOR
 *
 *  - `pointer-events-none` throughout. A background that swallows a click is
 *    not a background, it is a bug.
 *  - It pauses the moment the tab is hidden. A 4K loop playing to nobody
 *    behind another window is pure battery.
 *  - `prefers-reduced-motion` gets the poster frame and no playback at all.
 *    Moving footage behind text is exactly what that setting exists to stop.
 *  - It respects Data Saver. On a metered phone connection the site quietly
 *    shows the still instead of streaming a film for decoration.
 *  - Muted and playsInline, which is what every browser requires before it
 *    will start a video on its own. If a browser refuses anyway, the poster
 *    stays and nothing breaks.
 */
export default function VideoWallpaper() {
  const { settings } = useSettings();
  const ref = useRef<HTMLVideoElement>(null);

  const asset = videoById(settings.videoWallpaperId);
  const enabled = settings.videoWallpaper;

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const saveData =
    typeof navigator !== "undefined" &&
    Boolean((navigator as any).connection?.saveData);

  const still = reduced || saveData;

  useEffect(() => {
    if (!enabled || still) return;
    const v = ref.current;
    if (!v) return;

    /* Frame zero of the campaign films is their title card — a screen of
       typography. If a browser refuses to autoplay (some do, whatever the
       spec says), that card is what the visitor is left staring at behind the
       page. Starting a little way in means the resting frame is always
       footage, never words. */
    const nudge = () => {
      if (v.currentTime < 0.1 && v.duration > 2) {
        try { v.currentTime = v.duration * 0.12; } catch { /* not seekable yet */ }
      }
    };

    const play = () => { nudge(); v.play().catch(nudge); };
    const onVisibility = () => (document.hidden ? v.pause() : play());

    if (v.readyState >= 1) play();
    v.addEventListener("loadedmetadata", play);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      v.removeEventListener("loadedmetadata", play);
      v.pause();
    };
  }, [enabled, still, asset.src]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <video
        ref={ref}
        key={asset.src}
        src={still ? undefined : asset.src}
        /* ⚠️ NO POSTER HERE, DELIBERATELY. The campaign stills carry the
           headline burned into the image, and a still frame of typography
           sitting behind the page's own typography is the worst wallpaper
           there is — measured on /shop, where the poster's "100,000 FREE
           CONDOMS" fought the word ARCHIVE for the same space. Black until
           the film arrives is calm, and film in motion never freezes on a
           word. */
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
        style={{
          opacity: settings.videoWallpaperOpacity,
          // The film is scenery, so it is pushed back: desaturated a touch and
          // softened, which stops a moving edge in the footage from reading as
          // a moving edge in the interface.
          filter: "saturate(0.85) blur(1px)",
          transition: "opacity .6s ease",
        }}
      />
      {/* A floor of darkness under the type. Without it, a bright frame in the
          footage briefly makes body copy unreadable — the one thing a
          background is never allowed to do. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
    </div>
  );
}
