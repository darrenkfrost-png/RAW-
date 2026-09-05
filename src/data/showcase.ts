/**
 * THE SHOWCASE — brand media, separate from the product archive.
 *
 * ⚠️ WHY EVERY FILE HERE IS LOCAL, AND WHY THAT IS NOT A LIMITATION.
 *
 * Instagram cannot be read by this site automatically. Fetching a post URL
 * returns a login wall: no media, no og:image, nothing but a redirect to
 * sign in (checked against a real request, not assumed). And even with an
 * authenticated API, Instagram's CDN links are signed and expire within
 * days — a gallery built on them looks perfect the afternoon it ships and
 * is a wall of broken frames by the following week.
 *
 * So the media lives here, in this repository, served from /showcase/. It
 * loads fast, it works offline, it survives an Instagram outage or an
 * account change, and it can never rot. Adding a post means saving the
 * photo or video, dropping it in public/showcase/, and adding one entry
 * below.
 *
 * ⚠️ CREDIT IS A REQUIRED FIELD ON PURPOSE.
 *
 * Some of this media is made by other people who tagged the brand. Their
 * work stays theirs: `credit` names whoever shot it, and the gallery always
 * shows it. Anything by someone other than RAW should only appear here once
 * that person has agreed to it — a tag is not a licence.
 */

export type ShowcaseKind = "image" | "video";

export interface ShowcaseItem {
  id: string;
  kind: ShowcaseKind;
  /** Path under /public. */
  src: string;
  /**
   * ⚠️ THE TILE IS 400px AND THE ARTWORK IS 2752px. Serving the print file to
   * a grid of thumbnails cost 5.5MB on this page alone. `thumb` is the
   * 1600px web copy for the grid; `src` stays the full artwork, because the
   * lightbox lets someone zoom into it and this page exists to show the work.
   */
  thumb?: string;
  /** Still frame for a video — without one, a video tile is a black box until it decodes. */
  poster?: string;
  /** Shown on the tile and in the lightbox. "RAW Official" for in-house work. */
  credit: string;
  caption?: string;
  /** Portrait media earns a taller cell so the grid does not crop it to a letterbox. */
  tall?: boolean;
}

export const SHOWCASE: ShowcaseItem[] = [
  /* ── RAW's own campaign media. Already in the repository, already cleared:
        this is the brand's own work, so the showcase opens with something
        real rather than an empty grid waiting on uploads. ──────────────── */
  {
    id: "campaign-giveaway",
    kind: "video",
    src: "/promo/assets/campaign-giveaway.mp4",
    poster: "/promo/assets/hero-banner-web.jpg",
    credit: "RAW Official",
    caption: "100,000 free condoms. No catch.",
  },
  {
    id: "campaign-promotion",
    kind: "video",
    src: "/promo/assets/campaign-promotion.mp4",
    poster: "/promo/assets/covered-wide-web.jpg",
    credit: "RAW Official",
    caption: "Stay Safe With RAW",
  },
  {
    id: "campaign-distribution",
    kind: "video",
    src: "/promo/assets/campaign-distribution.mp4",
    poster: "/promo/assets/free-means-free-web.jpg",
    credit: "RAW Official",
    caption: "Free means free",
  },
  {
    id: "campaign-distribution-2",
    kind: "video",
    src: "/promo/assets/campaign-distribution-2.mp4",
    poster: "/promo/assets/hero-banner-web.jpg",
    credit: "RAW Official",
    caption: "Protection, where it is needed",
  },
  {
    id: "still-covered",
    kind: "image",
    src: "/promo/assets/covered-wide.jpg",
    thumb: "/promo/assets/covered-wide-web.jpg",
    credit: "RAW Official",
    caption: "RAW has you covered",
  },
  {
    id: "still-free",
    kind: "image",
    src: "/promo/assets/free-means-free.jpg",
    thumb: "/promo/assets/free-means-free-web.jpg",
    credit: "RAW Official",
    caption: "Not samples. Not free with purchase.",
  },
  {
    id: "still-banner",
    kind: "image",
    src: "/promo/assets/hero-banner.jpg",
    thumb: "/promo/assets/hero-banner-web.jpg",
    credit: "RAW Official",
    caption: "Sex is part of life. Protection should be too.",
  },
  {
    id: "still-protect",
    kind: "image",
    src: "/promo/assets/protect-what-matters.jpg",
    credit: "RAW Official",
    caption: "Protect what matters",
    tall: true,
  },
  {
    id: "still-boxes",
    kind: "image",
    src: "/promo/assets/boxes-real.jpg",
    credit: "RAW Official",
    caption: "The packs, in hand",
    tall: true,
  },

  /* ── SOCIAL MEDIA GOES HERE ────────────────────────────────────────────
     Save the photo or video from the post, drop the file into
     public/showcase/, and copy one of these shapes:

       {
         id: "ig-01",
         kind: "image",
         src: "/showcase/ig-01.jpg",
         credit: "@lleelly__8",
         caption: "Optional line",
         tall: true,               // portrait phone photo
       },
       {
         id: "ig-02",
         kind: "video",
         src: "/showcase/ig-02.mp4",
         poster: "/showcase/ig-02.jpg", // strongly recommended for reels
         credit: "@lleelly__8",
         tall: true,
       },

     Nothing else needs changing — the page, the filters, the lightbox and
     the counts all read this array.
     ─────────────────────────────────────────────────────────────────── */
];
