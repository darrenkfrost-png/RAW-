import CinemaFilm from "../common/CinemaFilm";
import { FILM } from "../../data/videoLibrary";

/**
 * THE HERO FILM — a crisp band down the middle, lit by its own light.
 *
 * ⚠️ IT WAS SENDING 133 MEGABYTES TO EVERY VISITOR ON THE FRONT PAGE.
 *
 * Three things fixed that, and only one of them was clever.
 *
 *  1. <LazyVideo> holds the lazy behaviour: poster first, attached only while
 *     on screen, never fetched on a phone, on Data Saver, or under
 *     prefers-reduced-motion.
 *  2. <CinemaFilm> holds Darren's framing: the film plays in a band a third of
 *     the width, and the rest of the screen is its own footage mirrored and
 *     blurred — so the part that has to be sharp is small.
 *  3. The unclever one, which mattered most: WordPress had a 27MB 720p copy of
 *     this reel on the same host all along, and the site was linking the 133MB
 *     camera master. See src/data/videoLibrary.ts.
 *
 * Worth being clear about which did what: showing a film at a third of the
 * width does not make it download less. Using the copy meant for the web does.
 *
 * ⚠️ THE BAND FILLS A PHONE, SO ITS STRENGTH CANNOT BE FIXED. At 80% opacity a
 * full-width still is bright enough to swallow the headline — measured at
 * 375px, RECOVER_INTENT was unreadable over it. 80% is right only once the band
 * is a third of a wide screen with darkness either side; a phone keeps the 40%
 * the full-bleed film always had. That responsive default lives in CinemaFilm.
 *
 * (One note here once sat inside the JSX as a bare block comment. That is not a
 * comment, it is a text node, and it rendered on the front page for one build.)
 */

const POSTER = "https://rawofficial.co/wp-content/uploads/2026/02/combatIMG-1536x1086.jpg";

export function LazyHeroVideo() {
  return (
    <CinemaFilm
      src={FILM.wide.hd}
      poster={POSTER}
      stageChildren={
        <>
          {/* Edges that fade into the wash, so the band is a light source
              rather than a rectangle stuck on the page. */}
          <div className="pointer-events-none absolute inset-y-0 -left-32 w-32 bg-gradient-to-l from-white/[0.06] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 -right-32 w-32 bg-gradient-to-r from-white/[0.06] to-transparent" />
        </>
      }
    >
      {/* The band fades at the bottom so it reads as light thrown on a wall,
          not a rectangle pasted on the page. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent" />
      <div className="absolute inset-0 mix-blend-color bg-red-900/10" />
      {/* ⚠️ A WHITE STROBE USED TO SIT HERE, flashing the full viewport every
          0.1s on an infinite repeat — a 10Hz flicker, which is inside the band
          associated with photosensitive seizures. Its opacity only reached
          0.05, so the risk was small, but it was also a permanent full-screen
          repaint on the front page for an effect nobody could consciously see.
          Removed on both counts. */}
    </CinemaFilm>
  );
}
