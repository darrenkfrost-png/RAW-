/**
 * THE VIDEO LIBRARY — every film the site owns, in one place.
 *
 * These were scattered across page components as inline URLs, so nothing
 * could offer them as a set. The wallpaper and the screensaver both read
 * this list, which means adding a film here puts it in both at once.
 *
 * ⚠️ THE MASTERS WERE NEVER THE ONLY COPY. Every remote reel was linked at its
 * camera master — 133MB for the home film, 97MB for combat — and the whole site
 * was rationing them: the wallpaper could only rotate the four local campaign
 * clips, and the heavy reels were marked `light: false` and kept out.
 *
 * WordPress had already made smaller ones. Asking its API for each film
 * (public-api.wordpress.com/rest/v1.1/videos/<guid>) returns a set of
 * renditions that have been sitting on the same host all along:
 *
 *     film        master   _mp4_hd (720p)   _mp4_std (~400px)
 *     wide        133.3       27.2              4.7
 *     combat       97.9       14.2              2.8
 *     nutrients    61.0        5.6              1.3
 *     recovery    103.5       11.3              2.3
 *
 * So each asset now carries two sources, and the caller takes the one that
 * suits the job:
 *
 *   src           the sharp copy, for a screensaver or a hero band
 *   wallpaperSrc  the small copy, for the blurred wash behind every page
 *
 * The three vertical clips are the exception in the other direction: their
 * masters are already 2-4MB and WordPress's "hd" rendition is LARGER, so their
 * master is the sharp copy. Bigger is not automatically better.
 *
 * The consequence is the one that matters: every film is now light enough to
 * play behind the site, so `light` is true for all of them and the wallpaper
 * rotates the whole library instead of the same four campaign clips — the
 * clips that carry burned-in headlines.
 */

const vp = (guid: string, file: string) => ({
  master: `https://videos.files.wordpress.com/${guid}/${file}.mp4`,
  hd: `https://videos.files.wordpress.com/${guid}/${file}_mp4_hd.mp4`,
  std: `https://videos.files.wordpress.com/${guid}/${file}_mp4_std.mp4`,
  dvd: `https://videos.files.wordpress.com/${guid}/${file}_mp4_dvd.mp4`,
  /** Twice the weight of `hd`, measured: 52/27/12/23MB. For on-demand viewing only. */
  hd1080: `https://videos.files.wordpress.com/${guid}/${file}_mp4_hd_1080p.mp4`,
});

const WIDE = vp("zsH6jAkj", "raw-official-wide-3840-final");
const COMBAT = vp("h8D4zswX", "raw-combat-reel-2160x2160-1");
const NUTRIENTS = vp("jqb5XX8H", "raw-nutrients-reel-2160x2160-1");
const RECOVERY = vp("K2dk0F8f", "raw-recovery-reel-2160x2160-1");
const COLD = vp("lUvR2d1e", "this-isnt-comfort.its-commitment.cold-exposure-doesnt-care-who-you-are-it-only-reveals-how-");
const DISCIPLINE = vp("k6iVr7JB", "that-moment-where-your-mind-says-no-and-your-discipline-says-do-it-anyway.breathe.commit.drop-in");
const STILLNESS = vp("0y4AyC1D", "theres-a-point-where-the-noise-fades.breath-slows.mind-clears.thats-the-moment-you-feel-it-t");

export interface VideoAsset {
  id: string;
  label: string;
  /** The sharp copy: a screensaver, or the hero's centre band. */
  src: string;
  /** The small copy, for the heavily blurred wash behind every page. */
  wallpaperSrc: string;
  /** A still to show while the video is still arriving — never a blank box. */
  poster?: string;
  /** Cheap enough to start on its own. True for every film now that each has a small copy. */
  light: boolean;
  /** Weight of `src`, measured with a HEAD request, not estimated. Shown in the picker. */
  megabytes?: number;
  /** Weight of `wallpaperSrc`. */
  wallpaperMegabytes?: number;
  /**
   * ⚠️ THE FILM CARRIES ITS OWN ADVERT. The four Stay Safe clips have
   * "100,000 FREE CONDOMS. NO CATCH." burned into the footage. Behind a
   * supplements site that reads as this site's own copy, and full-screen on
   * the screensaver it simply is a condom advert. They stay in the picker
   * as a deliberate choice; they are kept out of anything that chooses on
   * the visitor's behalf.
   */
  hasBurnedInText?: boolean;

  /* ─── What the source actually says about the film ─────────────────────
     Measured, not estimated: the four local clips with ffprobe, the seven
     remote ones from the host that stores them
     (public-api.wordpress.com/rest/v1.1/videos/<guid>). Before this, the
     site knew a label and a URL and nothing else, so it could not sort,
     group or describe its own films — and it was framing square reels in
     16:9 boxes without anything noticing. */

  /** Which shelf this belongs on. */
  category: VideoCategory;
  /** Runtime in milliseconds. */
  durationMs: number;
  /** The frame's real pixels. The shape matters more than the size: three of
      these reels are SQUARE and two are taller than they are wide. */
  width: number;
  height: number;
  /** When the master was published to the media host (ISO date). */
  published?: string;
  /** A 1080p rendition, where the host made one. Twice the weight of `src`,
      so it is used only when a visitor has asked to watch. */
  src1080?: string;
  /** The film's own words, as they were written when it was posted. */
  caption?: string;
  /**
   * ⚠️ IN THE LIBRARY, BUT NOT IN THE ROTATION. The opening film is a
   * deliberate sequence with beats timed to it; behind a page as wallpaper, or
   * full-screen on the screensaver, it is just a box being opened with no
   * reason given. It belongs on the shelf so a visitor can watch it again —
   * and nowhere the site chooses on a visitor's behalf.
   */
  libraryOnly?: boolean;
  /** ⚠️ The caption above survives only as the file's slug, and the host cuts
      a slug short. Where that happened the ending is GONE — it is shown with
      an ellipsis rather than completed, because inventing the rest of the
      founder's sentence would be putting words in his mouth. */
  captionTruncated?: boolean;
}

export type VideoCategory = "opening" | "brand" | "protocol" | "discipline" | "campaign";

/** The shelves, in the order a visitor should meet them. */
export const VIDEO_CATEGORIES: { id: VideoCategory; title: string; blurb: string }[] = [
  { id: "opening",    title: "The Opening",        blurb: "The film that plays when you first arrive. Here so you can watch it again." },
  { id: "brand",      title: "The Brand Film",     blurb: "The wide one. What RAW is, in a minute and twelve." },
  { id: "protocol",   title: "The Protocols",      blurb: "One reel for each arm of the system — combat, nutrients, recovery." },
  { id: "discipline", title: "The Discipline Series", blurb: "Shot upright, written in the moment. Three short pieces on doing the thing anyway." },
  { id: "campaign",   title: "Stay Safe",          blurb: "The giveaway campaign. These four carry their headline inside the picture." },
];

/**
 * ⚠️ EVERY FILM NEEDS A STILL, OR THE LIBRARY IS A WALL OF BLACK BOXES.
 * Only the four campaign clips had one. The other seven are frames pulled from
 * the films themselves (ffmpeg, three seconds in — the opening frame of most of
 * these is black), scaled to 1280 and stored in public/media/posters. They are
 * 14-60KB each, so a shelf of eleven costs less than a quarter of one film.
 */
export const VIDEO_LIBRARY: VideoAsset[] = [
  // ── The opening sequence (local) ───────────────────────────────────────
  {
    id: "opening", megabytes: 3, wallpaperMegabytes: 1,
    label: "The RAW Box",
    src: "/media/intro/raw-box.mp4",
    wallpaperSrc: "/media/intro/raw-box-sm.mp4",
    poster: "/media/intro/raw-box-poster.jpg",
    light: true,
    libraryOnly: true,
    category: "opening", durationMs: 29967, width: 576, height: 1024,
  },

  // ── Campaign films (local, in this repository) ─────────────────────────
  // ⚠️ These four carry their own headline burned into the footage, which is
  //    why the wallpaper blurs as hard as it does. The brand reels below do not.
  {
    id: "giveaway", hasBurnedInText: true, megabytes: 4, wallpaperMegabytes: 4,
    label: "Stay Safe — The Giveaway",
    src: "/promo/assets/campaign-giveaway.mp4",
    wallpaperSrc: "/promo/assets/campaign-giveaway.mp4",
    poster: "/promo/assets/hero-banner-web.jpg",
    light: true,
    category: "campaign", durationMs: 8000, width: 1920, height: 1080,
  },
  {
    id: "promotion", hasBurnedInText: true, megabytes: 4, wallpaperMegabytes: 4,
    label: "Stay Safe — The Promotion",
    src: "/promo/assets/campaign-promotion.mp4",
    wallpaperSrc: "/promo/assets/campaign-promotion.mp4",
    poster: "/promo/assets/covered-wide-web.jpg",
    light: true,
    category: "campaign", durationMs: 8000, width: 1920, height: 1080,
  },
  {
    id: "distribution", hasBurnedInText: true, megabytes: 4, wallpaperMegabytes: 4,
    label: "Stay Safe — Distribution",
    src: "/promo/assets/campaign-distribution.mp4",
    wallpaperSrc: "/promo/assets/campaign-distribution.mp4",
    poster: "/promo/assets/free-means-free-web.jpg",
    light: true,
    category: "campaign", durationMs: 8000, width: 1920, height: 1080,
  },
  {
    id: "distribution-2", hasBurnedInText: true, megabytes: 4, wallpaperMegabytes: 4,
    label: "Stay Safe — Distribution II",
    src: "/promo/assets/campaign-distribution-2.mp4",
    wallpaperSrc: "/promo/assets/campaign-distribution-2.mp4",
    poster: "/promo/assets/hero-banner-web.jpg",
    light: true,
    category: "campaign", durationMs: 8000, width: 1920, height: 1080,
  },

  // ── Brand and protocol reels (on the RAW media host, at web sizes) ─────
  // ⚠️ THREE OF THESE ARE SQUARE (2160x2160) AND TWO ARE UPRIGHT. That is
  //    recorded here because the site kept framing them in 16:9 boxes, which
  //    threw away 46% of each protocol reel. Read `width`/`height` before
  //    choosing a box; scripts/videofit.mjs fails the build if you do not.
  {
    id: "wide", megabytes: 27, wallpaperMegabytes: 5,
    label: "RAW Official — Wide",
    poster: "/media/posters/wide.jpg",
    src: WIDE.hd,
    wallpaperSrc: WIDE.std,
    src1080: WIDE.hd1080,
    light: true,
    category: "brand", durationMs: 72366, width: 3840, height: 2160,
    published: "2026-02-26",
  },
  {
    id: "combat", megabytes: 14, wallpaperMegabytes: 3,
    label: "Combat Reel",
    poster: "/media/posters/combat.jpg",
    src: COMBAT.hd,
    wallpaperSrc: COMBAT.std,
    src1080: COMBAT.hd1080,
    light: true,
    category: "protocol", durationMs: 53733, width: 2160, height: 2160,
    published: "2026-02-26",
  },
  {
    id: "nutrients", megabytes: 6, wallpaperMegabytes: 1,
    label: "Nutrients Reel",
    poster: "/media/posters/nutrients.jpg",
    src: NUTRIENTS.hd,
    wallpaperSrc: NUTRIENTS.std,
    src1080: NUTRIENTS.hd1080,
    light: true,
    category: "protocol", durationMs: 33533, width: 2160, height: 2160,
    published: "2026-02-26",
  },
  {
    id: "recovery", megabytes: 11, wallpaperMegabytes: 2,
    label: "Recovery Reel",
    poster: "/media/posters/recovery.jpg",
    src: RECOVERY.hd,
    wallpaperSrc: RECOVERY.std,
    src1080: RECOVERY.hd1080,
    light: true,
    category: "protocol", durationMs: 56800, width: 2160, height: 2160,
    published: "2026-02-26",
  },
  {
    id: "cold", megabytes: 3, wallpaperMegabytes: 1,
    label: "Cold Exposure",
    poster: "/media/posters/cold.jpg",
    src: COLD.master,
    wallpaperSrc: COLD.std,
    light: true,
    category: "discipline", durationMs: 18816, width: 720, height: 1280,
    published: "2026-02-26",
    caption: "This isn't comfort. It's commitment. Cold exposure doesn't care who you are — it only reveals how",
    captionTruncated: true,
  },
  {
    id: "discipline", megabytes: 4, wallpaperMegabytes: 2,
    label: "Discipline",
    poster: "/media/posters/discipline.jpg",
    src: DISCIPLINE.master,
    wallpaperSrc: DISCIPLINE.std,
    light: true,
    category: "discipline", durationMs: 21487, width: 480, height: 848,
    published: "2026-02-26",
    caption: "That moment where your mind says no and your discipline says do it anyway. Breathe. Commit. Drop in.",
  },
  {
    id: "stillness", megabytes: 2, wallpaperMegabytes: 1,
    label: "The Noise Fades",
    poster: "/media/posters/stillness.jpg",
    src: STILLNESS.master,
    wallpaperSrc: STILLNESS.std,
    light: true,
    category: "discipline", durationMs: 18770, width: 480, height: 848,
    published: "2026-02-26",
    caption: "There's a point where the noise fades. Breath slows. Mind clears. That's the moment you feel it",
    captionTruncated: true,
  },
];

/** The sharp sources, for the pages that frame a film rather than wash with it. */
export const FILM = {
  wide: WIDE,
  combat: COMBAT,
  nutrients: NUTRIENTS,
  recovery: RECOVERY,
  cold: COLD,
  discipline: DISCIPLINE,
  stillness: STILLNESS,
};

export const videoById = (id: string): VideoAsset =>
  VIDEO_LIBRARY.find((v) => v.id === id) || VIDEO_LIBRARY[0];

/**
 * ⚠️ "RANDOM" MUST NOT MEAN "SOMETIMES THE SAME ONE AGAIN".
 *
 * A plain random pick repeats roughly one time in eleven, and a repeat is the
 * one outcome that makes a rotation look broken — the visitor sees the same
 * film twice and concludes it never changes. So the last one shown is always
 * excluded, and the choice is drawn from what remains.
 *
 * The exclusion is remembered across page loads, so a second visit does not
 * open on the same film the first one ended with.
 */
const LAST_KEY = "raw_last_video";

export const nextVideo = (pool: VideoAsset[] = VIDEO_LIBRARY): VideoAsset => {
  let last: string | null = null;
  try { last = localStorage.getItem(LAST_KEY); } catch { /* private mode */ }

  const choices = pool.length > 1 ? pool.filter((v) => v.id !== last) : pool;
  const pick = choices[Math.floor(Math.random() * choices.length)] || pool[0];

  try { localStorage.setItem(LAST_KEY, pick.id); } catch { /* private mode */ }
  return pick;
};

/** Every film, now that each one has a copy small enough to sit behind a page. */
export const lightVideos = () => VIDEO_LIBRARY.filter((v) => v.light);

/**
 * What the site may choose on its own: light, and with no advert burned into
 * the picture. This is what the wallpaper and the screensaver rotate. Anyone
 * who wants a campaign film can still pick one in the panel.
 */
export const ambientVideos = () =>
  VIDEO_LIBRARY.filter((v) => v.light && !v.hasBurnedInText && !v.libraryOnly);


/** The films on one shelf, in the order they are listed. */
export const videosInCategory = (c: VideoCategory) => VIDEO_LIBRARY.filter((v) => v.category === c);

/** "1:12" — minutes and seconds, from the measured runtime. */
export const runtime = (ms: number) => {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/**
 * The film's true shape, as a CSS aspect-ratio.
 *
 * ⚠️ USE THIS INSTEAD OF PICKING A BOX BY EYE. Every crop this library has
 * suffered came from a box chosen in the markup — aspect-video around a square
 * reel, aspect-video around an upright clip — where nothing in the code looked
 * wrong. Asking the film what shape it is cannot go out of step with it.
 */
export const aspectOf = (v: VideoAsset) => `${v.width} / ${v.height}`;

/** Upright films want a different layout from square or wide ones. */
export const orientationOf = (v: VideoAsset): "portrait" | "square" | "landscape" =>
  v.width === v.height ? "square" : v.height > v.width ? "portrait" : "landscape";
