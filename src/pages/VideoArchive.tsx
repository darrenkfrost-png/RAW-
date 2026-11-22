import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Play, Youtube, Music2, FileText, Loader2, X } from "lucide-react";
import { ARCHIVE, SERIES, ARCHIVE_STATS, type ArchiveItem } from "../data/videoArchive";
import { loadTranscriptSearch } from "../hooks/useTranscript";

/**
 * THE ARCHIVE — every film RAW has published, searchable by what was SAID in it.
 *
 * ⚠️ WHY THIS EXISTS ALONGSIDE /showcase AND /films. Those two are walls: a
 * grid of posters to look at. Neither can answer "where does he talk about
 * cold exposure" — and across 60-odd films that is the only question most
 * people actually have. This page can, because every caption track published
 * with these videos has been pulled down and indexed.
 *
 * ⚠️ THE SPOKEN SEARCH IS LAZY AND SAYS SO. The index of every transcript is
 * one file of real size; loading it on arrival would make the page slow for
 * the majority who scroll rather than search. It is fetched on the first
 * keystroke, and until it lands the page says it is still reading the spoken
 * word rather than quietly returning title-only results as if they were all.
 *
 * ⚠️ NO COUNT ON THIS PAGE IS TYPED BY HAND. Every number comes from
 * ARCHIVE_STATS, which the generator computes from the real list. A hand-typed
 * "60+ videos" is a claim that rots the moment one is added.
 */

const mmss = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.round(s % 60);
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
};

const hours = (s: number) => Math.round(s / 360) / 10;

type Platform = "all" | "youtube" | "tiktok";

interface Hit {
  item: ArchiveItem;
  /** the matching line of speech, when the match came from the transcript */
  quote: string | null;
}

/** Where in a transcript the phrase appears, with a little either side. */
function excerpt(text: string, needle: string): string | null {
  const at = text.toLowerCase().indexOf(needle.toLowerCase());
  if (at < 0) return null;
  const from = Math.max(0, at - 70);
  const to = Math.min(text.length, at + needle.length + 70);
  return (from ? "…" : "") + text.slice(from, to).trim() + (to < text.length ? "…" : "");
}

function Card({ hit, index }: { hit: Hit; index: number }) {
  const { item, quote } = hit;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/watch/${item.id}`}
        className="group block overflow-hidden rounded-2xl border border-editorial-border bg-black/40 transition-colors hover:border-red-500/50"
      >
        <div className={`relative overflow-hidden bg-black ${item.vertical ? "aspect-[9/16]" : "aspect-video"}`}>
          {item.thumb ? (
            <img
              src={item.thumb}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-label-dim">
              <Play size={20} aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-white/15 bg-black/70 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-white/70">
            {item.platform === "youtube" ? <Youtube size={11} aria-hidden="true" /> : <Music2 size={11} aria-hidden="true" />}
            {item.duration ? mmss(item.duration) : null}
          </span>

          {item.transcript && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-red-500/40 bg-black/70 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-red-400">
              <FileText size={11} aria-hidden="true" />
              Transcript
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="line-clamp-2 font-sans text-sm font-bold uppercase leading-tight tracking-tight text-white">
              {item.title}
            </p>
            {item.published && (
              <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.3em] text-white/45">{item.published}</p>
            )}
          </div>
        </div>

        {quote && (
          <p className="border-t border-editorial-border px-3 py-2 font-serif text-sm italic leading-snug text-label-dim">
            “{quote}”
          </p>
        )}
      </Link>
    </motion.div>
  );
}

export default function VideoArchive() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<Platform>("all");
  const [series, setSeries] = useState<string | null>(null);

  /* the spoken-word index: not fetched until someone types */
  const [spoken, setSpoken] = useState<Record<string, string> | null>(null);
  const [spokenState, setSpokenState] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const asked = useRef(false);

  useEffect(() => {
    if (!query.trim() || asked.current) return;
    asked.current = true;
    setSpokenState("loading");
    loadTranscriptSearch()
      .then((d) => {
        setSpoken(d);
        setSpokenState("ready");
      })
      .catch(() => {
        /* say so rather than silently returning title-only results */
        setSpokenState("failed");
        asked.current = false;
      });
  }, [query]);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    let list = ARCHIVE;
    if (platform !== "all") list = list.filter((i) => i.platform === platform);
    if (series) list = list.filter((i) => i.series === series);
    if (!q) return list.map((item) => ({ item, quote: null }));

    return list
      .map((item) => {
        const inTitle = item.title.toLowerCase().includes(q);
        const said = spoken?.[item.id];
        const quote = said ? excerpt(said, q) : null;
        if (!inTitle && !quote) return null;
        /* a title match speaks for itself; the quote is what justifies a hit
           the visitor would otherwise not understand */
        return { item, quote: inTitle ? null : quote };
      })
      .filter((h): h is Hit => h !== null);
  }, [query, platform, series, spoken]);

  const seriesWithCounts = useMemo(
    () =>
      SERIES.map((s) => ({ ...s, n: ARCHIVE.filter((i) => i.series === s.id).length })).filter((s) => s.n > 0),
    [],
  );

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.2em] transition-colors ${
      on
        ? "border-red-500 bg-red-500/10 text-white"
        : "border-editorial-border text-label-dim hover:border-white/30 hover:text-white"
    }`;

  return (
    <div className="mx-auto max-w-[110rem] px-5 py-16 sm:px-8 lg:px-12">
      <header className="mb-10">
        <p className="mb-3 font-mono text-[0.6875rem] uppercase tracking-[0.4em] text-red-500">RAW://VAULT</p>
        <h1 className="mb-4 font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-6xl">
          Every film,
          <br />
          searchable by what was said
        </h1>
        {/* ⚠️ These numbers are computed by the generator from the real list. */}
        <p className="max-w-[60ch] text-base text-label-dim">
          {ARCHIVE_STATS.total} films and clips from RAW's own channels — {ARCHIVE_STATS.youtube} on YouTube,{" "}
          {ARCHIVE_STATS.tiktok} on TikTok, {hours(ARCHIVE_STATS.runtimeSeconds)} hours in all.{" "}
          {ARCHIVE_STATS.withTranscript} of them published a caption track, and those{" "}
          {ARCHIVE_STATS.transcribedWords.toLocaleString()} spoken words are searchable below.
        </p>
      </header>

      {/* ---- search ---- */}
      <div className="mb-6">
        <label htmlFor="archive-search" className="sr-only">
          Search the archive by title or by what is said in the film
        </label>
        <div className="relative">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-label-dim"
          />
          <input
            id="archive-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, descriptions and spoken words — try “recovery”, “Thailand”, “ice bath”"
            className="w-full rounded-full border border-editorial-border bg-black/50 py-3.5 pl-11 pr-11 font-sans text-base text-white placeholder:text-label-dim"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear the search"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-label-dim hover:text-white"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ⚠️ Never show title-only results as if they were the whole search. */}
        <div aria-live="polite" className="mt-2 min-h-[1.25rem] font-mono text-[0.6875rem] uppercase tracking-[0.2em]">
          {query && spokenState === "loading" && (
            <span className="flex items-center gap-2 text-label-dim">
              <Loader2 size={12} className="animate-spin" aria-hidden="true" />
              Reading {ARCHIVE_STATS.transcribedWords.toLocaleString()} spoken words and every description…
            </span>
          )}
          {query && spokenState === "failed" && (
            <span className="text-red-400">
              The spoken-word index would not load — these results are from titles only.
            </span>
          )}
          {query && spokenState === "ready" && (
            <span className="text-label-dim">
              {hits.length} {hits.length === 1 ? "film" : "films"} · titles, descriptions and spoken words
            </span>
          )}
          {!query && (
            <span className="text-label-dim">
              {hits.length} {hits.length === 1 ? "film" : "films"}
            </span>
          )}
        </div>
      </div>

      {/* ---- filters ---- */}
      <div className="mb-10 flex flex-wrap gap-2">
        <button type="button" onClick={() => setPlatform("all")} className={chip(platform === "all")} aria-pressed={platform === "all"}>
          Everything
        </button>
        <button type="button" onClick={() => setPlatform("youtube")} className={chip(platform === "youtube")} aria-pressed={platform === "youtube"}>
          YouTube ({ARCHIVE_STATS.youtube})
        </button>
        <button type="button" onClick={() => setPlatform("tiktok")} className={chip(platform === "tiktok")} aria-pressed={platform === "tiktok"}>
          TikTok ({ARCHIVE_STATS.tiktok})
        </button>
        <span className="mx-1 w-px self-stretch bg-editorial-border" aria-hidden="true" />
        {seriesWithCounts.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSeries(series === s.id ? null : s.id)}
            className={chip(series === s.id)}
            aria-pressed={series === s.id}
          >
            {s.label} ({s.n})
          </button>
        ))}
      </div>

      {/* ---- results ---- */}
      {hits.length === 0 ? (
        <p className="py-20 text-center text-label-dim">
          Nothing in the vault matches “{query}”.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {hits.map((hit, i) => (
            <Card key={hit.item.id} hit={hit} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
