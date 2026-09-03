import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight, Play, Camera, Film, LayoutGrid, Youtube, Music2 } from "lucide-react";
import { SHOWCASE, ShowcaseItem } from "../data/showcase";
import { SOCIAL } from "../data/social";
import SocialEmbed from "../components/SocialEmbed";
import { ImageViewerPortal } from "../components/ImageViewer";
import { VideoViewerPortal } from "../components/VideoViewer";
import { Atmosphere } from "../components/common/Atmosphere";

/**
 * THE SHOWCASE — the brand's own wall, kept apart from the product archive.
 *
 * The product gallery exists to sell a specific thing; this exists to show
 * the brand living in the world: campaign films, shoots, and media made by
 * people who tagged RAW. So it is deliberately not a product grid — no
 * prices, no add-to-cart, no specifications. Media, and who made it.
 *
 * DECISIONS WORTH KNOWING
 *  - Videos preview on hover (muted, from the top) and stop when the pointer
 *    leaves, so a wall of films is legible without nine soundtracks at once.
 *    On touch, where hover does not exist, the poster stands until it is
 *    opened — which is why a poster is strongly recommended for every video.
 *  - Only the open lightbox plays with sound. One voice at a time.
 *  - Credit is rendered from the data, never typed into the markup, so a
 *    creator's name cannot drift away from their work.
 *  - Posts are not linked. The brand's Instagram is linked once, from the
 *    footer, exactly as asked — this page is the media itself.
 */

type Filter = "all" | "image" | "video" | "youtube" | "tiktok";

const FILTERS: { id: Filter; label: string; icon: typeof LayoutGrid }[] = [
  { id: "all", label: "Everything", icon: LayoutGrid },
  { id: "image", label: "Photography", icon: Camera },
  { id: "video", label: "Film", icon: Film },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "tiktok", label: "TikTok", icon: Music2 },
];

/** A tile that knows how to be either medium without the grid caring. */
function Tile({ item, onOpen, index }: { item: ShowcaseItem; onOpen: () => void; index: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  const preview = (on: boolean) => {
    const v = video.current;
    if (!v || reduced) return;
    if (on) {
      v.currentTime = 0;
      // A refused autoplay promise is normal (a browser may simply decline);
      // it must never surface as an unhandled rejection.
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => preview(true)}
      onMouseLeave={() => preview(false)}
      onFocus={() => preview(true)}
      onBlur={() => preview(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: Math.min(index, 8) * 0.045, ease: [0.16, 1, 0.3, 1] }}
      aria-label={`${item.kind === "video" ? "Play" : "Open"} ${item.caption || item.credit}`}
      className={`group relative block w-full overflow-hidden rounded-2xl border border-editorial-border bg-black text-left
        focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500
        ${item.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
    >
      {item.kind === "video" ? (
        <video
          ref={video}
          src={item.src}
          poster={item.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover opacity-75 transition-all duration-700 group-hover:opacity-100 group-hover:scale-[1.03]"
        />
      ) : (
        <img
          src={item.src}
          alt={item.caption || `RAW showcase — ${item.credit}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-85 transition-all duration-700 group-hover:opacity-100 group-hover:scale-[1.03]"
        />
      )}

      {/* Legibility floor for the caption, and a lift on hover. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-75" />

      {item.kind === "video" && (
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm transition-colors group-hover:border-red-500">
          <Play size={13} className="ml-0.5 text-white" />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4">
        {item.caption && (
          <p className="mb-1 line-clamp-2 font-sans text-sm font-bold uppercase leading-tight tracking-tight text-white">
            {item.caption}
          </p>
        )}
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45">{item.credit}</p>
      </div>
    </motion.button>
  );
}

export default function Showcase() {
  const [filter, setFilter] = useState<Filter>("all");
  const [openAt, setOpenAt] = useState<number | null>(null);

  const items = useMemo(() => {
    if (filter === "all") return SHOWCASE;
    if (filter === "image" || filter === "video") return SHOWCASE.filter((i) => i.kind === filter);
    return [];
  }, [filter]);

  const socialFor = (p: "youtube" | "tiktok") => SOCIAL.filter((s) => s.platform === p);

  const counts = useMemo(
    () => ({
      all: SHOWCASE.length + SOCIAL.length,
      image: SHOWCASE.filter((i) => i.kind === "image").length,
      video: SHOWCASE.filter((i) => i.kind === "video").length,
      youtube: socialFor("youtube").length,
      tiktok: socialFor("tiktok").length,
    }),
    [],
  );

  /* The lightbox holds an index into `items`, and social posts are not
     lightbox material (they open their own player), so the two lists stay
     separate: `items` is what the viewer can page through, `social` is the
     wall below it. Filtering a platform simply empties one and fills the
     other. */
  const social = useMemo(() => {
    if (filter === "youtube") return socialFor("youtube");
    if (filter === "tiktok") return socialFor("tiktok");
    if (filter === "all") return SOCIAL;
    return [];
  }, [filter]);

  // Changing the filter must close the lightbox: the index it holds points
  // into the OLD list, so leaving it open would show an unrelated item.
  const changeFilter = (f: Filter) => { setOpenAt(null); setFilter(f); };

  const step = useCallback(
    (by: number) => setOpenAt((at) => (at === null ? at : (at + by + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (openAt === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAt(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    // The page behind a full-screen viewer must not scroll under it.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openAt, step]);

  const open = openAt === null ? null : items[openAt];

  return (
    <div className="relative min-h-screen">
      <Atmosphere glowOpacity={0.05} gridMode="dots" intensity="low" />

      <section className="section-container relative z-10 pb-32">
        <div className="max-w-3xl">
          <span className="mb-5 block font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-red-500">
            MEDIA_ARCHIVE // SHOWCASE
          </span>
          <h1 className="mb-6 font-sans text-5xl font-black uppercase leading-[0.9] tracking-tight md:text-7xl">
            The showcase
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-editorial-text-muted md:text-base">
            Campaign films, photography, and the brand in the wild. Not a product
            catalogue — the work itself, credited to whoever made it.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-12 flex flex-wrap items-center gap-3 border-b border-editorial-border pb-8">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => changeFilter(f.id)}
                aria-pressed={active}
                className={`flex items-center gap-2.5 rounded-full border px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] transition-all
                  ${active
                    ? "border-red-500 bg-red-500/10 text-red-300"
                    : "border-editorial-border text-editorial-text-muted hover:border-white/25 hover:text-white"}`}
              >
                <f.icon size={12} />
                {f.label}
                <span className={active ? "text-red-400/70" : "opacity-40"}>{counts[f.id]}</span>
              </button>
            );
          })}
        </div>

        {/* The wall */}
        {items.length === 0 && social.length === 0 ? (
          <p className="py-24 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-editorial-text-muted">
            Nothing here yet
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Tile key={item.id} item={item} index={i} onOpen={() => setOpenAt(i)} />
            ))}
          </div>
        )}

        {/* ── THE CHANNELS ─────────────────────────────────────────────────
            Every post here is a poster until it is clicked; the real player
            is built on demand. See SocialEmbed for why that matters at this
            many items. */}
        {social.length > 0 && (
          <div className="mt-20">
            {filter === "all" && (
              <div className="mb-8 flex items-baseline gap-4 border-t border-editorial-border pt-12">
                <h2 className="font-sans text-2xl font-black uppercase tracking-tight md:text-3xl">
                  The channels
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-editorial-text-muted">
                  {counts.youtube} YouTube · {counts.tiktok} TikTok
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {social.map((item) => (
                <SocialEmbed key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ⚠️ THIS LIGHTBOX WAS `fixed inset-0` RENDERED HERE, inside the
          page-transition wrapper's transform — the same fault that put product
          images halfway down the document. Both viewers now portal to
          document.body, and the video one carries the size choices. */}
      <ImageViewerPortal
        open={open !== null && open.kind === "image"}
        images={items.filter(i => i.kind === "image").map(i => i.src)}
        index={Math.max(0, items.filter(i => i.kind === "image").findIndex(i => i.id === open?.id))}
        onIndexChange={(i) => {
          const imgs = items.filter(x => x.kind === "image");
          const at = items.findIndex(x => x.id === imgs[i]?.id);
          if (at >= 0) setOpenAt(at);
        }}
        onClose={() => setOpenAt(null)}
        title={open?.caption || open?.credit}
      />

      <VideoViewerPortal
        open={open !== null && open.kind === "video"}
        src={open?.kind === "video" ? open.src : ""}
        poster={open?.poster}
        title={open?.caption ? `${open.caption} — ${open.credit}` : open?.credit}
        onClose={() => setOpenAt(null)}
      />
    </div>
  );
}
