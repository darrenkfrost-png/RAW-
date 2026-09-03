import { useState } from "react";
import { VideoViewerPortal } from "./VideoViewer";
import { Play } from "lucide-react";
import type { SocialItem } from "../data/social";

/**
 * SOCIAL EMBED — a poster that becomes a player only when someone asks.
 *
 * ⚠️ WHY THIS IS A FACADE AND NOT AN IFRAME.
 *
 * There are 111 posts on the showcase. A YouTube iframe costs roughly half a
 * megabyte of player once it mounts, and it phones home whether or not the
 * visitor ever presses play — so mounting them all would mean tens of
 * megabytes of third-party JavaScript and 111 trackers set on someone who
 * came to look at a photograph.
 *
 * So each tile is a still image and a play button: cheap, instant, and
 * silent. The real player is created on the first click, and only that one.
 * This is the standard "facade" pattern and it is the difference between a
 * page that opens now and a page that hangs.
 *
 * PRIVACY: YouTube is embedded through youtube-nocookie.com, which does not
 * set tracking cookies until playback begins.
 *
 * TIKTOK cannot be embedded frame-by-frame the way YouTube can — their embed
 * ships a script that rewrites a blockquote. Rather than run a third-party
 * script on every visit, a TikTok tile opens the post in a new tab on click.
 * The poster and the real caption still live here, so the wall reads as one
 * gallery whichever platform a clip came from.
 */

export function SocialEmbed({ item }: { item: SocialItem }) {
  const [playing, setPlaying] = useState(false);

  const poster =
    item.thumb ||
    (item.platform === "youtube" ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : null);

  const openTikTok = () =>
    window.open(
      `https://www.tiktok.com/@${item.author.toLowerCase()}/video/${item.videoId}`,
      "_blank",
      "noopener,noreferrer",
    );

  /* Playing used to swap the tile for an inline frame, so a YouTube clip was
     stuck in a grid cell while an owned film could be watched full screen. It
     now opens the same viewer, with the same sizes. */
  return (
    <>
      <VideoViewerPortal
        open={playing && item.platform === "youtube"}
        embedSrc={`https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={item.title}
        onClose={() => setPlaying(false)}
      />

    <button
      type="button"
      onClick={() => (item.platform === "youtube" ? setPlaying(true) : openTikTok())}
      aria-label={
        item.platform === "youtube"
          ? `Play: ${item.title}`
          : `Open on TikTok: ${item.title}`
      }
      className={`group/embed relative block w-full overflow-hidden rounded-2xl border border-editorial-border bg-black text-left transition-colors hover:border-red-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
        item.vertical ? "aspect-[9/16]" : "aspect-video"
      }`}
    >
      {poster ? (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          /* YouTube's hqdefault is 4:3 with black bars baked in; cover crops
             them away rather than showing letterboxing inside our own frame. */
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700 group-hover/embed:scale-[1.04] group-hover/embed:opacity-100"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30" />

      {/* Play affordance */}
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/60 backdrop-blur-sm transition-all duration-500 group-hover/embed:scale-110 group-hover/embed:border-red-500 group-hover/embed:bg-red-600">
        <Play size={18} className="ml-1 text-white" />
      </span>

      {/* Which platform this came from — stated, not guessed at by the viewer. */}
      <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-[0.25em] text-white/75 backdrop-blur-md">
        {item.platform === "youtube" ? "YouTube" : "TikTok"}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="line-clamp-2 font-sans text-[13px] font-bold leading-tight text-white">
          {item.title}
        </p>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.3em] text-white/40">
          {item.author}
        </p>
      </div>
    </button>
    </>
  );
}

export default SocialEmbed;
