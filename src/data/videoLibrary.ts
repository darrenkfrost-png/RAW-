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
}

export const VIDEO_LIBRARY: VideoAsset[] = [
  // ── Campaign films (local, in this repository) ─────────────────────────
  {
    id: "giveaway",
    label: "Stay Safe — The Giveaway",
    src: "/promo/assets/campaign-giveaway.mp4",
    poster: "/promo/assets/hero-banner.jpg",
    light: true,
  },
  {
    id: "promotion",
    label: "Stay Safe — The Promotion",
    src: "/promo/assets/campaign-promotion.mp4",
    poster: "/promo/assets/covered-wide.jpg",
    light: true,
  },
  {
    id: "distribution",
    label: "Stay Safe — Distribution",
    src: "/promo/assets/campaign-distribution.mp4",
    poster: "/promo/assets/free-means-free.jpg",
    light: true,
  },
  {
    id: "distribution-2",
    label: "Stay Safe — Distribution II",
    src: "/promo/assets/campaign-distribution-2.mp4",
    poster: "/promo/assets/hero-banner.jpg",
    light: true,
  },

  // ── Brand reels (remote masters on the RAW media host) ─────────────────
  {
    id: "wide",
    label: "RAW Official — Wide",
    src: "https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4",
    light: false,
  },
  {
    id: "combat",
    label: "Combat Reel",
    src: "https://videos.files.wordpress.com/h8D4zswX/raw-combat-reel-2160x2160-1.mp4",
    light: false,
  },
  {
    id: "nutrients",
    label: "Nutrients Reel",
    src: "https://videos.files.wordpress.com/jqb5XX8H/raw-nutrients-reel-2160x2160-1.mp4",
    light: false,
  },
  {
    id: "recovery",
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
