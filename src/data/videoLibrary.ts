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
}

export const VIDEO_LIBRARY: VideoAsset[] = [
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
  },
  {
    id: "promotion", hasBurnedInText: true, megabytes: 4, wallpaperMegabytes: 4,
    label: "Stay Safe — The Promotion",
    src: "/promo/assets/campaign-promotion.mp4",
    wallpaperSrc: "/promo/assets/campaign-promotion.mp4",
    poster: "/promo/assets/covered-wide-web.jpg",
    light: true,
  },
  {
    id: "distribution", hasBurnedInText: true, megabytes: 4, wallpaperMegabytes: 4,
    label: "Stay Safe — Distribution",
    src: "/promo/assets/campaign-distribution.mp4",
    wallpaperSrc: "/promo/assets/campaign-distribution.mp4",
    poster: "/promo/assets/free-means-free-web.jpg",
    light: true,
  },
  {
    id: "distribution-2", hasBurnedInText: true, megabytes: 4, wallpaperMegabytes: 4,
    label: "Stay Safe — Distribution II",
    src: "/promo/assets/campaign-distribution-2.mp4",
    wallpaperSrc: "/promo/assets/campaign-distribution-2.mp4",
    poster: "/promo/assets/hero-banner-web.jpg",
    light: true,
  },

  // ── Brand reels (on the RAW media host, now at web sizes) ──────────────
  {
    id: "wide", megabytes: 27, wallpaperMegabytes: 5,
    label: "RAW Official — Wide",
    src: WIDE.hd,
    wallpaperSrc: WIDE.std,
    light: true,
  },
  {
    id: "combat", megabytes: 14, wallpaperMegabytes: 3,
    label: "Combat Reel",
    src: COMBAT.hd,
    wallpaperSrc: COMBAT.std,
    light: true,
  },
  {
    id: "nutrients", megabytes: 6, wallpaperMegabytes: 1,
    label: "Nutrients Reel",
    src: NUTRIENTS.hd,
    wallpaperSrc: NUTRIENTS.std,
    light: true,
  },
  {
    id: "recovery", megabytes: 11, wallpaperMegabytes: 2,
    label: "Recovery Reel",
    src: RECOVERY.hd,
    wallpaperSrc: RECOVERY.std,
    light: true,
  },
  // The vertical clips: master is already smaller than WordPress's "hd".
  {
    id: "cold", megabytes: 3, wallpaperMegabytes: 1,
    label: "Cold Exposure",
    src: COLD.master,
    wallpaperSrc: COLD.std,
    light: true,
  },
  {
    id: "discipline", megabytes: 4, wallpaperMegabytes: 2,
    label: "Discipline",
    src: DISCIPLINE.master,
    wallpaperSrc: DISCIPLINE.std,
    light: true,
  },
  {
    id: "stillness", megabytes: 2, wallpaperMegabytes: 1,
    label: "The Noise Fades",
    src: STILLNESS.master,
    wallpaperSrc: STILLNESS.std,
    light: true,
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
export const ambientVideos = () => VIDEO_LIBRARY.filter((v) => v.light && !v.hasBurnedInText);
