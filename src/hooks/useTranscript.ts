import { useEffect, useState } from "react";

/**
 * A video's transcript, fetched only when someone opens that video.
 *
 * ⚠️ TRANSCRIPTS ARE STATIC FILES, NOT PART OF THE BUNDLE. The archive holds
 * tens of thousands of transcribed words. Bundled, every visitor would pay for
 * all of them to read none of them; as files under /transcripts/ the cost falls
 * only on the person who opens that one video, and the browser caches it.
 *
 * ⚠️ A FAILED FETCH IS REPORTED, NOT SWALLOWED. An empty transcript panel with
 * no explanation reads as "this video has no transcript", which is a different
 * and untrue statement. `error` is set so the page can say which it is.
 */
export interface Cue {
  /** start, in seconds */
  t: number;
  /** duration, in seconds */
  d: number;
  /** the spoken line */
  s: string;
}

export function useTranscript(id: string | null, has: boolean) {
  const [cues, setCues] = useState<Cue[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !has) {
      setCues(null);
      setError(null);
      return;
    }
    let live = true;
    setLoading(true);
    setError(null);
    fetch(`/transcripts/${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`the transcript file answered ${r.status}`);
        return r.json();
      })
      .then((data: Cue[]) => {
        if (!live) return;
        setCues(Array.isArray(data) ? data : []);
      })
      .catch((e: Error) => {
        if (!live) return;
        setCues(null);
        setError(e.message);
      })
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id, has]);

  return { cues, loading, error };
}

/**
 * The flat text of every transcript, for searching the spoken word across the
 * whole archive. One file, fetched the first time someone actually searches —
 * never on page load, because most visitors browse rather than search.
 */
let searchCache: Record<string, string> | null = null;
let searchPromise: Promise<Record<string, string>> | null = null;

export function loadTranscriptSearch(): Promise<Record<string, string>> {
  if (searchCache) return Promise.resolve(searchCache);
  if (!searchPromise) {
    searchPromise = fetch("/transcripts/search.json")
      .then((r) => {
        if (!r.ok) throw new Error(`search index answered ${r.status}`);
        return r.json();
      })
      .then((d: Record<string, string>) => {
        searchCache = d;
        return d;
      })
      .catch((e) => {
        /* let the next attempt try again rather than caching the failure */
        searchPromise = null;
        throw e;
      });
  }
  return searchPromise;
}

/**
 * A film's description, from the platform's own post.
 *
 * ⚠️ NOT IN THE BUNDLE, AND HERE IS THE MEASUREMENT. The archive's 116
 * descriptions came to 50.1 KB of the 100.9 KB of archive data — half the
 * weight, downloaded by every visitor to the site, for text that is shown on
 * one film page at a time. They live in one file now, fetched by the film page.
 */
let descCache: Record<string, string> | null = null;
let descPromise: Promise<Record<string, string>> | null = null;

export function useDescription(id: string | null): string | null {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setText(null);
      return;
    }
    let live = true;
    if (descCache) {
      setText(descCache[id] ?? null);
      return;
    }
    if (!descPromise) {
      descPromise = fetch("/transcripts/descriptions.json")
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
        .then((d: Record<string, string>) => {
          descCache = d;
          return d;
        })
        .catch((e) => {
          descPromise = null;
          throw e;
        });
    }
    descPromise
      .then((d) => live && setText(d[id] ?? null))
      /* a missing description is simply no paragraph; it is not an error
         worth putting in front of someone who came to watch a film */
      .catch(() => live && setText(null));
    return () => {
      live = false;
    };
  }, [id]);

  return text;
}
