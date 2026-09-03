/**
 * THE VIDEO LIBRARY — every film the site owns, in one place.
 *
 * These were scattered across page components as inline URLs, so nothing
 * could offer them as a set. The wallpaper and the screensaver both read
 * this list, which means adding a film here puts it in both at once.
 *
 * ⚠️ WEIGHT IS DECLARED, NOT DISCOVERED. The campaign films are local and
 * about 3.5MB each; the brand reels are remote 2160×2160 masters and much
 * heavier. A wallpaper that streams a 4K master behind every page on a phone
 * is a bad neighbour, so `light: true` marks the ones cheap enough to be the
 * default, and the picker shows the rest for anyone who wants them.
 */

export interface VideoAsset {
  id: string;
  label: string;
  src: string;
  /** A still to show while the video is still arriving — never a blank box. */
  poster?: string;
  /** Local and modestly sized: safe to start automatically. */
  light: boolean;
  /** Measured with a HEAD request, not estimated. Shown in the picker so
   *  choosing a 133MB master on a phone is an informed decision. */
  megabytes?: number;
}

export const VIDEO_LIBRARY: VideoAsset[] = [
  // ── Campaign films (local, in this repository) ─────────────────────────
  {
    id: "giveaway", megabytes: 4,
    label: "Stay Safe — The Giveaway",
    src: "/promo/assets/campaign-giveaway.mp4",
    poster: "/promo/assets/hero-banner.jpg",
    light: true,
  },
  {
    id: "promotion", megabytes: 4,
    label: "Stay Safe — The Promotion",
    src: "/promo/assets/campaign-promotion.mp4",
    poster: "/promo/assets/covered-wide.jpg",
    light: true,
  },
  {
    id: "distribution", megabytes: 4,
    label: "Stay Safe — Distribution",
    src: "/promo/assets/campaign-distribution.mp4",
    poster: "/promo/assets/free-means-free.jpg",
    light: true,
  },
  {
    id: "distribution-2", megabytes: 4,
    label: "Stay Safe — Distribution II",
    src: "/promo/assets/campaign-distribution-2.mp4",
    poster: "/promo/assets/hero-banner.jpg",
    light: true,
  },

  // ── Brand reels (remote masters on the RAW media host) ─────────────────
  {
    id: "wide", megabytes: 133,
    label: "RAW Official — Wide",
    src: "https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4",
    light: false,
  },
  {
    id: "combat", megabytes: 97,
    label: "Combat Reel",
    src: "https://videos.files.wordpress.com/h8D4zswX/raw-combat-reel-2160x2160-1.mp4",
    light: false,
  },
  {
    id: "nutrients", megabytes: 61,
    label: "Nutrients Reel",
    src: "https://videos.files.wordpress.com/jqb5XX8H/raw-nutrients-reel-2160x2160-1.mp4",
    light: false,
  },
  {
    id: "recovery", megabytes: 103,
    label: "Recovery Reel",
    src: "https://videos.files.wordpress.com/K2dk0F8f/raw-recovery-reel-2160x2160-1.mp4",
    light: false,
  },
  {
    id: "cold",
    label: "Cold Exposure",
    src: "https://videos.files.wordpress.com/lUvR2d1e/this-isnt-comfort.its-commitment.cold-exposure-doesnt-care-who-you-are-it-only-reveals-how-.mp4",
    light: false,
  },
  {
    id: "discipline",
    label: "Discipline",
    src: "https://videos.files.wordpress.com/k6iVr7JB/that-moment-where-your-mind-says-no-and-your-discipline-says-do-it-anyway.breathe.commit.drop-in.mp4",
    light: false,
  },
  {
    id: "stillness",
    label: "The Noise Fades",
    src: "https://videos.files.wordpress.com/0y4AyC1D/theres-a-point-where-the-noise-fades.breath-slows.mind-clears.thats-the-moment-you-feel-it-t.mp4",
    light: false,
  },
];

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

/** The light, local films — safe to rotate behind every page. */
export const lightVideos = () => VIDEO_LIBRARY.filter((v) => v.light);
