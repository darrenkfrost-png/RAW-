import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X, ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

/**
 * THE IMAGE VIEWER — full screen, zoomable, pannable.
 *
 * ⚠️ WHY THIS PORTALS TO document.body, AND WHY THAT IS THE WHOLE BUG FIX.
 *
 * The old zoom was `fixed inset-0` and still opened halfway down the page,
 * forcing you to scroll to find the picture you had just clicked. `fixed` was
 * not the problem — an ANCESTOR was. The page-transition wrapper animates
 * `filter: blur()` and `transform`, and any ancestor carrying a transform,
 * filter, perspective, backdrop-filter or `will-change: transform` becomes
 * the containing block for `position: fixed` inside it. Measured on
 * /product/1: the overlay reported 14,702px tall — the height of the whole
 * document — instead of the 1,274px viewport, and started 115px down. It was
 * centring the image inside the entire page rather than inside the screen.
 *
 * No amount of z-index or positioning fixes that from the inside. The only
 * cure is to render outside the transformed subtree entirely, which is what
 * the portal does. Any future full-screen layer in this app must do the same.
 *
 * WHAT IT DOES BESIDES OPENING IN THE RIGHT PLACE
 *  - Zoom by wheel (towards the pointer, not the centre — zooming should go
 *    where you are looking), by the buttons, by double-click, or with + / -.
 *  - Pan by dragging once zoomed in, with the grab cursor to say so.
 *  - Move between images with the arrows, the arrow keys, or the thumbnails.
 *  - Escape or the backdrop closes it; the page behind never scrolls under it.
 *  - Zoom and pan reset whenever the image changes, so a new picture never
 *    arrives already halfway off-screen.
 */

export interface ImageViewerProps {
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  title?: string;
}

const MIN = 1;
const MAX = 5;

export default function ImageViewer({ images, index, onIndexChange, onClose, title }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => { setScale(1); setPos({ x: 0, y: 0 }); }, []);

  // A new picture must never arrive pre-zoomed or pushed off-screen.
  useEffect(() => { reset(); }, [index, reset]);

  const go = useCallback(
    (by: number) => onIndexChange((index + by + images.length) % images.length),
    [index, images.length, onIndexChange],
  );

  const zoomBy = useCallback((delta: number, origin?: { x: number; y: number }) => {
    setScale((s) => {
      const next = Math.min(MAX, Math.max(MIN, s + delta));
      if (next === MIN) setPos({ x: 0, y: 0 }); // snapping home avoids a stranded pan
      else if (origin && frame.current) {
        /* Keep the point under the cursor under the cursor: without this the
           image slides away from whatever you were trying to look at. */
        const r = frame.current.getBoundingClientRect();
        const dx = origin.x - (r.left + r.width / 2);
        const dy = origin.y - (r.top + r.height / 2);
        const ratio = next / s - 1;
        setPos((p) => ({ x: p.x - dx * ratio, y: p.y - dy * ratio }));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "+" || e.key === "=") zoomBy(0.5);
      else if (e.key === "-") zoomBy(-0.5);
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, go, zoomBy, reset]);

  // Wheel must be non-passive to be preventable, so it is bound by hand.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(e.deltaY > 0 ? -0.25 : 0.25, { x: e.clientX, y: e.clientY });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  /* ⚠️ PANNING IS DELIBERATELY THIS SIMPLE — AND PINCH-TO-ZOOM IS NOT HERE.
     I built a two-pointer pinch on top of these handlers and it regressed
     panning: with the pinch bookkeeping in place, a real mouse drag moved the
     image by zero pixels, repeatably. A lost pointerup leaves a ghost in the
     pointer map, two ghosts read as a pinch, and dragging silently stops
     working for the rest of the session. I could not make it reliable inside
     this environment (the preview pane cannot deliver a genuine two-finger
     gesture, so the feature cannot be exercised the way a phone would), and
     shipping a mobile nicety that breaks panning for everyone is the wrong
     trade.
     Reverted to the version that is verified working. Pinch belongs in a
     branch developed against a real device — the hint text says "scroll or
     double-click" so nothing promises a gesture that is not there. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= MIN) return;
    dragging.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    try { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* not capturable */ }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - dragging.current.x, y: e.clientY - dragging.current.y });
  };
  const onPointerUp = () => { dragging.current = null; };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      /* ⚠️ A REACT PORTAL STILL BUBBLES THROUGH THE REACT TREE.
         The DOM node lives on <body>, but React replays events up the
         COMPONENT tree — so a click on this viewer's close button also reached
         the product image's own onClick, which re-opened the viewer. Closing
         it looked like a dead button; it was actually closing and reopening in
         the same tick. Every pointer event stops here. */
      onClick={(e) => e.stopPropagation()}
      onPointerDownCapture={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[9500] flex flex-col bg-black/97 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} — image viewer` : "Image viewer"}
    >
      {/* Bar */}
      <div className="relative z-20 flex items-center justify-between gap-4 border-b border-white/10 px-5 py-3.5">
        <div className="min-w-0">
          {title && (
            <p className="truncate font-sans text-sm font-black uppercase tracking-tight text-white">{title}</p>
          )}
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-white/40">
            {index + 1} / {images.length} · {Math.round(scale * 100)}%
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button onClick={() => zoomBy(-0.5)} aria-label="Zoom out" disabled={scale <= MIN}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 transition-colors hover:border-red-500/60 hover:text-white disabled:opacity-25">
            <ZoomOut size={15} />
          </button>
          <button onClick={() => zoomBy(0.5)} aria-label="Zoom in" disabled={scale >= MAX}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 transition-colors hover:border-red-500/60 hover:text-white disabled:opacity-25">
            <ZoomIn size={15} />
          </button>
          <button onClick={reset} aria-label="Reset zoom"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 transition-colors hover:border-red-500/60 hover:text-white">
            <RotateCw size={14} />
          </button>
          <button onClick={() => frame.current?.requestFullscreen?.()} aria-label="Full screen"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 transition-colors hover:border-red-500/60 hover:text-white sm:flex">
            <Maximize size={14} />
          </button>
          <button onClick={onClose} aria-label="Close viewer"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:border-red-500 hover:bg-red-600">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div
        ref={frame}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => (scale > MIN ? reset() : zoomBy(1.5, { x: e.clientX, y: e.clientY }))}
        /* Clicking the empty space around the picture closes — but only when
           it is the backdrop itself, never a click that ends a drag. */
        onClick={(e) => { if (e.target === frame.current && scale <= MIN) onClose(); }}
        className={`relative flex flex-1 items-center justify-center overflow-hidden touch-none ${
          scale > MIN ? (dragging.current ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
        }`}
      >
        <img
          key={images[index]}
          src={images[index]}
          alt={title ? `${title}, image ${index + 1}` : `Image ${index + 1}`}
          draggable={false}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full select-none object-contain"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: dragging.current ? "none" : "transform .18s ease-out",
            willChange: "transform",
          }}
        />

        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition-colors hover:border-red-500 md:left-6">
              <ChevronLeft size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition-colors hover:border-red-500 md:right-6">
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {scale <= MIN && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-white/25">
            Scroll or double-click to zoom
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => onIndexChange(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                i === index ? "border-red-500 opacity-100" : "border-white/10 opacity-45 hover:opacity-80"
              }`}
            >
              <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Wraps the viewer in its portal.
 *
 * ⚠️ NO AnimatePresence HERE, AND THAT IS A BUG FIX, NOT A SIMPLIFICATION.
 *
 * With one, closing left the viewer's node in the DOM permanently at opacity
 * 0 — the exit animation ran but removal never completed. Two consequences,
 * and the second is the serious one: the close button LOOKED dead (a
 * transparent full-screen layer was still lying over the page), and because
 * the component never unmounted, its cleanup never ran — so `body { overflow:
 * hidden }` stayed set and THE PAGE COULD NO LONGER SCROLL after viewing an
 * image.
 *
 * Unmounting outright costs a 350ms fade on the way out and guarantees the
 * layer is gone and the page is given back. That is the right trade.
 */
export function ImageViewerPortal(props: ImageViewerProps & { open: boolean }) {
  const { open, ...rest } = props;
  if (typeof document === "undefined" || !open) return null;
  return createPortal(<ImageViewer {...rest} />, document.body);
}
