import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X, Maximize2, Minimize2, PictureInPicture2, Square } from "lucide-react";

/**
 * THE VIDEO VIEWER — the same full-screen fix as the image viewer, plus sizes.
 *
 * ⚠️ IT PORTALS TO document.body FOR THE SAME REASON THE IMAGE VIEWER DOES.
 * The overlays it replaces were `fixed inset-0` inside the page-transition
 * wrapper, which animates filter and transform — and any such ancestor becomes
 * the containing block for fixed positioning inside it. So "full screen"
 * resolved against the whole document and the video opened far down the page.
 * Rendering outside that subtree is the only cure.
 *
 * FOUR SIZES, BECAUSE WATCHING IS NOT ALWAYS THE ONLY THING HAPPENING
 *   FULL     — the whole screen, for actually watching.
 *   ¾        — large, but the page still frames it.
 *   ⅓        — a window you can read around.
 *   PIP      — a corner pane you can DRAG, with no backdrop at all, so the
 *              site stays fully usable while the film keeps playing.
 *
 * The choice is remembered: someone who prefers a third of the screen means it
 * for the next video too.
 *
 * PiP deliberately drops the backdrop and the click-outside-to-close. In every
 * other size the dimmed backdrop means "this is the thing you are doing"; in
 * PiP the opposite is true — the page is the thing, and a backdrop that closed
 * the player on the first click elsewhere would make the mode pointless.
 */

export type ViewerSize = "full" | "three" | "third" | "pip";

const SIZES: { id: ViewerSize; label: string; icon: typeof Maximize2 }[] = [
  { id: "full", label: "Full screen", icon: Maximize2 },
  { id: "three", label: "Three quarters", icon: Square },
  { id: "third", label: "One third", icon: Minimize2 },
  { id: "pip", label: "Picture in picture", icon: PictureInPicture2 },
];

const STORE_KEY = "raw_video_viewer_size";

const readSize = (): ViewerSize => {
  try {
    const v = localStorage.getItem(STORE_KEY) as ViewerSize | null;
    return v && SIZES.some((s) => s.id === v) ? v : "full";
  } catch { return "full"; }
};

export interface VideoViewerProps {
  /** A file this site can play itself. */
  src?: string;
  /** A third-party player (YouTube). Cannot be a <video>, so it is framed —
   *  but it gets exactly the same sizes, because "watch this small in the
   *  corner" should not depend on where the film happens to be hosted. */
  embedSrc?: string;
  poster?: string;
  title?: string;
  onClose: () => void;
}

function VideoViewer({ src, embedSrc, poster, title, onClose }: VideoViewerProps) {
  const [size, setSize] = useState<ViewerSize>(readSize);
  const [pip, setPip] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const choose = useCallback((s: ViewerSize) => {
    setSize(s);
    try { localStorage.setItem(STORE_KEY, s); } catch { /* private mode */ }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Scroll is only locked when the viewer is claiming the screen. In PiP the
     whole point is that the page still works, so it must still scroll. */
  useEffect(() => {
    if (size === "pip") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [size]);

  const isPip = size === "pip";

  const frameClass =
    size === "full" ? "w-full h-full"
    : size === "three" ? "w-[75vw] h-[75vh]"
    : size === "third" ? "w-[38vw] min-w-[320px] h-[38vh] min-h-[220px]"
    : "w-[340px] h-[192px]";

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isPip) return;
    drag.current = { x: e.clientX - pip.x, y: e.clientY - pip.y };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPip({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };
  const onPointerUp = () => { drag.current = null; };

  const controls = (
    <div className={`flex items-center gap-1.5 ${isPip ? "" : "mt-3"}`}>
      {SIZES.map((s) => (
        <button
          key={s.id}
          onClick={(e) => { e.stopPropagation(); choose(s.id); }}
          aria-label={s.label}
          aria-pressed={size === s.id}
          title={s.label}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            size === s.id
              ? "border-red-500 bg-red-600/20 text-red-300"
              : "border-white/12 text-white/60 hover:border-white/35 hover:text-white"
          }`}
        >
          <s.icon size={13} />
        </button>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close video"
        className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:border-red-500 hover:bg-red-600"
      >
        <X size={14} />
      </button>
    </div>
  );

  const player = (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => e.stopPropagation()}
      className={`pointer-events-auto flex flex-col ${isPip ? "items-end" : "items-center"}`}
    >
      {isPip && (
        /* The grab strip: dragging the video itself would fight its controls. */
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="flex w-full cursor-grab items-center justify-between gap-2 rounded-t-xl border border-b-0 border-white/12 bg-black/90 px-2 py-1.5 backdrop-blur-xl active:cursor-grabbing"
        >
          <span className="truncate px-1 font-mono text-[8px] uppercase tracking-[0.25em] text-white/45">
            {title || "Now playing"}
          </span>
          {controls}
        </div>
      )}

      {embedSrc ? (
        <iframe
          key={embedSrc}
          src={embedSrc}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className={`${frameClass} border-0 bg-black ${isPip ? "rounded-b-xl" : "rounded-xl"}`}
        />
      ) : (
        <video
          key={src}
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          className={`${frameClass} bg-black object-contain ${isPip ? "rounded-b-xl border border-t-0 border-white/12" : "rounded-xl"}`}
        />
      )}

      {!isPip && (
        <div className="flex flex-col items-center">
          {title && (
            <p className="mt-4 max-w-2xl px-4 text-center font-sans text-sm font-black uppercase tracking-tight text-white">
              {title}
            </p>
          )}
          {controls}
        </div>
      )}
    </motion.div>
  );

  if (isPip) {
    /* ⚠️ THE DRAG OFFSET LIVES HERE, NOT ON THE motion.div INSIDE.
       That element animates `scale`, and motion writes the whole `transform`
       property itself — so an inline translate on it was silently overwritten
       and the pane would not move at all. A plain wrapper owns the position. */
    return (
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-[9600]"
        style={{ transform: `translate(${pip.x}px, ${pip.y}px)` }}
      >
        {player}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      className="fixed inset-0 z-[9600] flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-xl md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} — video` : "Video"}
    >
      {player}
    </motion.div>
  );
}

/**
 * ⚠️ NO AnimatePresence, for the reason recorded in ImageViewer: wrapping the
 * portal in one left the node in the DOM at opacity 0 after closing, so the
 * close button looked dead and body{overflow:hidden} was never released,
 * leaving the page unscrollable. Unmounting outright is the correct trade.
 */
export function VideoViewerPortal(props: VideoViewerProps & { open: boolean }) {
  const { open, ...rest } = props;
  if (typeof document === "undefined" || !open) return null;
  return createPortal(<VideoViewer {...rest} />, document.body);
}

export default VideoViewer;
