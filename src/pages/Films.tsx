import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Clock, Maximize2, AlertTriangle } from "lucide-react";
import LazyVideo from "../components/common/LazyVideo";
import {
  VIDEO_CATEGORIES,
  videosInCategory,
  runtime,
  aspectOf,
  orientationOf,
  type VideoAsset,
} from "../data/videoLibrary";

/**
 * THE FILM LIBRARY — every film RAW owns, on the shelf it belongs to.
 *
 * ⚠️ THE FILMS WERE NEVER COLLECTED ANYWHERE. They were inline URLs scattered
 * through the hero, three product pages, the screensaver and the wallpaper
 * picker. A visitor who wanted to watch the brand film could not: there was no
 * page that offered it, only pages that used it as decoration behind text.
 *
 * ⚠️ AND THEY WERE BEING CROPPED, BADLY. Measured with scripts/videofit.mjs:
 * the combat and nutrients reels are 2160x2160 — SQUARE — and were framed in
 * aspect-video boxes, which keeps 54% of the picture and throws the rest away.
 * Nothing in the markup looked wrong, because a box's shape and a film's shape
 * are written in different files.
 *
 * So no box here is chosen by hand. Every frame takes its aspect-ratio from
 * the film's own measured width and height (`aspectOf`), which means a film
 * cannot be cropped by this page even if someone swaps it for a different cut.
 *
 * Playback is on request. The posters cost nothing; a film is only fetched
 * when a visitor presses it, and only then at the 1080p copy where the host
 * made one — twice the weight of the 720p, which is worth it for someone who
 * has asked to watch and is not worth it for someone who has not.
 */

/**
 * How many across, by the shape of the films and how many there are.
 *
 * ⚠️ A SHELF OF ONE IS NOT A GRID. The brand film is the only landscape film
 * in the library, and a two-column rule put the most important film on the
 * site in a 547x307 box with an empty column beside it. One film gets the
 * whole width; the shape of its frame then decides how tall that is.
 */
const shelfLayout = (shape: string, count: number) => {
  if (count === 1) return "grid gap-10";
  if (shape === "portrait") return "grid gap-8 sm:grid-cols-2 lg:grid-cols-3";
  // Square reels are heavy in the eye; two across until there is real room.
  if (shape === "square") return "grid gap-10 md:grid-cols-2 2xl:grid-cols-3";
  return "grid gap-10 md:grid-cols-2";
};

function FilmCard({
  film,
  playing,
  onPlay,
}: {
  film: VideoAsset;
  playing: boolean;
  onPlay: () => void;
}) {
  const shape = orientationOf(film);

  /**
   * ⚠️ PRESSING PLAY DESTROYED THE THING THAT WAS FOCUSED.
   *
   * The poster is a <button>; starting a film unmounts it and mounts a
   * <video> in its place. For anyone driving the page from the keyboard that
   * meant focus fell back to the top of the document mid-action: the film was
   * running, and the controls for it — pause, seek, volume — were now a full
   * tab-cycle away, with no indication anything had happened.
   *
   * The player it replaced the button with is focusable (it has controls), so
   * focus is handed to it. The next Tab continues from the film, and space
   * pauses the thing that just started.
   */
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!playing) return;
    const video = frame.current?.querySelector("video");
    if (video) video.focus({ preventScroll: true });
  }, [playing]);

  return (
    <motion.figure
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="group min-w-0"
    >
      <div
        ref={frame}
        /* ⚠️ The shape comes from the film, never from a utility class. */
        style={{ aspectRatio: aspectOf(film) }}
        className="relative w-full overflow-hidden rounded-[2rem] border border-editorial-border bg-editorial-bg shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-700 group-hover:border-red-500/30"
      >
        {playing ? (
          <LazyVideo
            src={film.src1080 || film.src}
            poster={film.poster}
            controls
            /* ⚠️ SOUND ON, BECAUSE THE VISITOR PRESSED PLAY. Everywhere else on
               this site a film is texture behind a headline and must be silent.
               Here it is the thing itself — and the press is a user gesture, so
               the browser allows audio. Shipping a library of silent films with
               a volume slider on them is worse than shipping no library. */
            muted={false}
            narrow="play"
            /* object-contain, not cover: the box is already the film's own
               shape, so there is nothing to crop — but if a film is ever
               swapped for a different cut, this letterboxes it rather than
               silently slicing it. */
            className="h-full w-full object-contain bg-black"
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`Play ${film.label} — ${runtime(film.durationMs)}`}
            className="absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            {film.poster ? (
              <img
                src={film.poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-90"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-editorial-surface to-editorial-bg" />
            )}
            <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-black/50 backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:border-red-500 group-hover:bg-red-600/90">
              <Play className="h-7 w-7 translate-x-0.5 text-white" fill="currentColor" />
            </span>
          </button>
        )}
      </div>

      <figcaption className="fits-its-column mt-6 space-y-3">
        <h3 className="font-sans text-xl font-black uppercase leading-tight tracking-tight text-editorial-text xl:text-2xl">
          {film.label}
        </h3>

        {film.caption && (
          <p className="text-base font-light leading-relaxed text-editorial-text-muted">
            &ldquo;{film.caption}
            {/* The ending is genuinely missing — see videoLibrary.ts. It is
                marked, not completed. */}
            {film.captionTruncated ? "…" : ""}&rdquo;
          </p>
        )}

        <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-editorial-text-muted">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Runtime</dt>
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <dd>{runtime(film.durationMs)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Frame size</dt>
            <Maximize2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <dd>
              {film.width}&times;{film.height}
              {shape === "square" ? " · square" : shape === "portrait" ? " · upright" : ""}
            </dd>
          </div>
        </dl>
      </figcaption>
    </motion.figure>
  );
}

export default function Films() {
  /**
   * ⚠️ ONE FILM AT A TIME, AND THIS IS WHY IT HAS TO LIVE UP HERE.
   *
   * While every film was silent it did not matter that pressing four posters
   * started four films. With sound it matters immediately: four soundtracks
   * at once, and no way to tell which control belongs to which. Holding the
   * playing id on the page rather than a flag inside each card means starting
   * one film is the same act as stopping the others.
   */
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div className="mx-auto min-h-svh max-w-[var(--content-max-width)] px-[var(--shell-padding-mobile)] pb-32 pt-32 md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)]">
      <header className="fits-its-column mb-24 max-w-4xl">
        <p className="mb-6 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.4em] text-red-600">
          The Film Library
        </p>
        <h1
          className="display-fit mb-8 font-sans font-black uppercase leading-[0.85] tracking-tighter text-editorial-text"
          style={{ "--fit": 14 } as React.CSSProperties}
        >
          Every film,
          <br />
          in its own shape.
        </h1>
        <p className="max-w-2xl text-xl font-light leading-relaxed text-editorial-text-muted xl:text-2xl">
          Eleven films, grouped by what they are for. Nothing plays until you
          press it — then it plays at the largest copy that exists.
        </p>
      </header>

      <div className="space-y-32">
        {VIDEO_CATEGORIES.map((cat) => {
          const films = videosInCategory(cat.id);
          if (!films.length) return null;
          const shape = orientationOf(films[0]);

          return (
            <section key={cat.id} aria-labelledby={`shelf-${cat.id}`}>
              <div className="fits-its-column mb-12 border-t border-editorial-border pt-10">
                <h2
                  id={`shelf-${cat.id}`}
                  className="mb-4 font-sans text-3xl font-black uppercase leading-none tracking-tighter text-editorial-text xl:text-5xl"
                >
                  {cat.title}
                </h2>
                <p className="max-w-2xl text-lg font-light leading-relaxed text-editorial-text-muted">
                  {cat.blurb}
                </p>

                {/* ⚠️ The four Stay Safe films have "100,000 FREE CONDOMS. NO
                    CATCH." burned into the footage. Said plainly here, because
                    on a shelf of brand films a visitor would otherwise press
                    one expecting a product reel. */}
                {cat.id === "campaign" && (
                  <p className="mt-6 flex max-w-2xl items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 font-mono text-[0.75rem] uppercase leading-relaxed tracking-[0.12em] text-editorial-text-muted">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                    <span>
                      These four carry the campaign headline inside the picture —
                      they are adverts, not product films.
                    </span>
                  </p>
                )}
              </div>

              <div className={shelfLayout(shape, films.length)}>
                {films.map((f) => (
                  <FilmCard
                    key={f.id}
                    film={f}
                    playing={playingId === f.id}
                    onPlay={() => setPlayingId(f.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
