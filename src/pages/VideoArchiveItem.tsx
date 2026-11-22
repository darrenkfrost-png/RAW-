import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Search, ExternalLink, Copy, Check, FileText, Loader2 } from "lucide-react";
import { ARCHIVE } from "../data/videoArchive";
import { useTranscript, useDescription, type Cue } from "../hooks/useTranscript";

/**
 * ONE FILM, WITH WHAT WAS SAID IN IT.
 *
 * ⚠️ THE PLAYER IS A FACADE UNTIL SOMEONE PRESSES PLAY — the same rule the
 * showcase already follows. A YouTube iframe is roughly half a megabyte of
 * third-party player and it phones home whether or not anyone watches, so it
 * is not mounted for a visitor who came to read the transcript.
 *
 * ⚠️ THE TRANSCRIPT DRIVES THE FILM, NOT THE OTHER WAY ROUND. Pressing a line
 * seeks the film to that second. That is the whole point of the page: finding
 * the moment, not scrubbing for it. It needs the IFrame API (the plain embed
 * cannot be seeked or asked the time), so that script is loaded on first play
 * and never before.
 *
 * ⚠️ WHEN THERE IS NO CAPTION TRACK THE PAGE SAYS SO, PLAINLY. TikTok
 * publishes none at all, and some YouTube uploads have none. The one thing
 * this page must never do is fill that silence with a written summary — a
 * plausible invention is the error nobody would ever catch.
 */

const mmss = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
};

/* ---- the IFrame API, loaded once, on demand ---- */
let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve, reject) => {
    const w = window as unknown as { YT?: { Player?: unknown }; onYouTubeIframeAPIReady?: () => void };
    if (w.YT && w.YT.Player) return resolve();
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    s.onerror = () => {
      apiPromise = null;
      reject(new Error("the YouTube player script would not load"));
    };
    document.head.appendChild(s);
  });
  return apiPromise;
}

interface YTPlayer {
  seekTo: (s: number, allow: boolean) => void;
  getCurrentTime: () => number;
  playVideo: () => void;
  destroy: () => void;
}

export default function VideoArchiveItem() {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const item = useMemo(() => ARCHIVE.find((v) => v.id === id) ?? null, [id]);

  const { cues, loading, error } = useTranscript(item?.id ?? null, !!item?.transcript);
  /* the platform's own description — kept out of the bundle, see the hook */
  const description = useDescription(item?.id ?? null);
  const [find, setFind] = useState("");
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState(0);
  const [copied, setCopied] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  /** ?t=90 — a shared link lands on the moment it was shared at. */
  const startAt = Number(params.get("t") || 0) || 0;

  const start = useCallback(
    (seconds: number) => {
      if (!item || item.platform !== "youtube") return;
      if (player.current) {
        player.current.seekTo(seconds, true);
        player.current.playVideo();
        return;
      }
      setPlaying(true);
      loadYouTubeApi()
        .then(() => {
          if (!host.current) return;
          const YT = (window as unknown as { YT: { Player: new (el: HTMLElement, o: unknown) => YTPlayer } }).YT;
          player.current = new YT.Player(host.current, {
            videoId: item.videoId,
            playerVars: {
              autoplay: 1,
              start: Math.floor(seconds),
              rel: 0,
              modestbranding: 1,
              /* the privacy-preserving host, same as every other embed here */
              host: "https://www.youtube-nocookie.com",
            },
          });
        })
        .catch((e: Error) => {
          setPlaying(false);
          setPlayerError(e.message);
        });
    },
    [item],
  );

  /* poll the player for the current second — the API has no time event */
  useEffect(() => {
    if (!playing) return;
    const h = window.setInterval(() => {
      try {
        const t = player.current?.getCurrentTime?.();
        if (typeof t === "number") setNow(t);
      } catch {
        /* the player is gone or not ready: nothing to update */
      }
    }, 500);
    return () => window.clearInterval(h);
  }, [playing]);

  useEffect(() => () => player.current?.destroy?.(), []);

  const activeIndex = useMemo(() => {
    if (!cues || !playing) return -1;
    for (let i = cues.length - 1; i >= 0; i--) if (cues[i].t <= now + 0.25) return i;
    return -1;
  }, [cues, now, playing]);

  /* follow the film down the transcript, unless the visitor asked not to move */
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }, [activeIndex]);

  const shown = useMemo(() => {
    if (!cues) return [];
    const q = find.trim().toLowerCase();
    if (!q) return cues.map((c, i) => ({ c, i }));
    return cues.map((c, i) => ({ c, i })).filter(({ c }) => c.s.toLowerCase().includes(q));
  }, [cues, find]);

  const copyAll = () => {
    if (!cues) return;
    navigator.clipboard
      .writeText(cues.map((c: Cue) => c.s).join(" "))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => setCopied(false));
  };

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="mb-4 font-sans text-3xl font-black uppercase text-white">Not in the vault</h1>
        <p className="mb-8 text-label-dim">There is no film here with that address.</p>
        <Link to="/watch" className="font-mono text-xs uppercase tracking-[0.3em] text-red-500">
          ← Back to the vault
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[110rem] px-5 py-12 sm:px-8 lg:px-12">
      <Link
        to="/watch"
        className="mb-8 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-label-dim hover:text-white"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        The vault
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* ---------------- the film ---------------- */}
        <div>
          <div className={`relative overflow-hidden rounded-2xl border border-editorial-border bg-black ${item.vertical ? "aspect-[9/16] max-h-[80vh]" : "aspect-video"}`}>
            {item.platform === "tiktok" ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group absolute inset-0 block"
                aria-label={`Open on TikTok: ${item.title}`}
              >
                {item.thumb && <img src={item.thumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="flex items-center gap-2 rounded-full border border-white/25 bg-black/70 px-5 py-3 font-mono text-xs uppercase tracking-[0.25em] text-white">
                    <ExternalLink size={14} aria-hidden="true" />
                    Watch on TikTok
                  </span>
                </span>
              </a>
            ) : playing ? (
              <div ref={host} className="absolute inset-0 h-full w-full" />
            ) : (
              <button
                type="button"
                onClick={() => start(startAt)}
                aria-label={`Play: ${item.title}`}
                className="group absolute inset-0 block w-full"
              >
                {item.thumb && (
                  <img src={item.thumb} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75 transition-opacity group-hover:opacity-100" />
                )}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/60 transition-colors group-hover:border-red-500">
                    <Play size={22} className="ml-1 text-white" aria-hidden="true" />
                  </span>
                </span>
              </button>
            )}
          </div>

          {playerError && (
            <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-red-400">
              {playerError} — <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline">watch it on {item.platform === "youtube" ? "YouTube" : "TikTok"}</a>
            </p>
          )}

          <h1 className="mt-6 font-sans text-2xl font-black uppercase leading-tight tracking-tight text-white sm:text-3xl">
            {item.title}
          </h1>

          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-label-dim">
            <span>{item.platform === "youtube" ? "YouTube" : "TikTok"}</span>
            {item.published && <span>{item.published}</span>}
            {item.duration > 0 && <span>{mmss(item.duration)}</span>}
            {item.views != null && <span>{item.views.toLocaleString()} views</span>}
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-red-500 hover:text-red-400">
              Original <ExternalLink size={11} aria-hidden="true" />
            </a>
          </p>

          {description && (
            <p className="mt-6 max-w-[65ch] whitespace-pre-line text-base text-label-dim">{description}</p>
          )}
        </div>

        {/* ---------------- what was said ---------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-white">
              <FileText size={13} aria-hidden="true" />
              Transcript
            </h2>
            {cues && cues.length > 0 && (
              <button
                type="button"
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-editorial-border px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-label-dim hover:border-white/30 hover:text-white"
              >
                {copied ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {/* ⚠️ Four different states, each said plainly — never one blank panel. */}
          {!item.transcript ? (
            <p className="rounded-2xl border border-editorial-border bg-black/30 p-5 text-sm text-label-dim">
              {item.platform === "tiktok"
                ? "TikTok does not publish a caption track, so there is no transcript for this clip. Nothing has been written in its place."
                : "No caption track was published with this video, so there is no transcript. Nothing has been written in its place."}
            </p>
          ) : loading ? (
            <p className="flex items-center gap-2 rounded-2xl border border-editorial-border bg-black/30 p-5 text-sm text-label-dim">
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Loading the transcript…
            </p>
          ) : error ? (
            <p className="rounded-2xl border border-red-500/30 bg-black/30 p-5 text-sm text-red-400">
              The transcript did not load ({error}). This video does have one — it is the file that failed, not the film.
            </p>
          ) : (
            <>
              <label htmlFor="in-transcript" className="sr-only">
                Search within this transcript
              </label>
              <div className="relative mb-3">
                <Search size={14} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-label-dim" />
                <input
                  id="in-transcript"
                  type="search"
                  value={find}
                  onChange={(e) => setFind(e.target.value)}
                  placeholder="Find a word in this film"
                  className="w-full rounded-full border border-editorial-border bg-black/50 py-2.5 pl-10 pr-4 font-sans text-sm text-white placeholder:text-label-dim"
                />
              </div>

              <p className="mb-2 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-label-dim" aria-live="polite">
                {find ? `${shown.length} of ${cues?.length ?? 0} lines` : `${cues?.length ?? 0} lines · press one to jump there`}
              </p>

              <ol
                ref={listRef}
                className="max-h-[32rem] space-y-0.5 overflow-y-auto rounded-2xl border border-editorial-border bg-black/30 p-2"
              >
                {shown.map(({ c, i }) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => {
                        start(c.t);
                        /* keep the address honest: this is the moment you are at */
                        const next = new URLSearchParams(params);
                        next.set("t", String(Math.floor(c.t)));
                        setParams(next, { replace: true });
                      }}
                      disabled={item.platform !== "youtube"}
                      className={`flex w-full gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        i === activeIndex ? "bg-red-500/15 text-white" : "text-label-dim hover:bg-white/5 hover:text-white"
                      } disabled:cursor-default`}
                    >
                      {/* ⚠️ MEASURED 3.68:1. These were red-500 at 80% on near-black at 10px —
                          below the 4.5:1 the standard asks of text that small, on 72 lines
                          of a single transcript. The accent was decoration here and the
                          timestamp is something people actually read, so it takes the
                          same grey as every other piece of fine print on the site
                          (5.96:1). The active line is still marked, by its background. */}
                      <span className="shrink-0 pt-0.5 font-mono text-[0.6875rem] tabular-nums text-label-dim">{mmss(c.t)}</span>
                      <span className="text-sm leading-snug">{c.s}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
