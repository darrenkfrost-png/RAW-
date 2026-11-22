# Harvesting RAW's social channels

How the 116 films in **The Vault** (`/watch`) got here, and how to add more.

The harvest is a **separate, deliberate step** from the build. Nothing in the
site ever contacts YouTube or TikTok at build time, so a build can never fail
because a platform is down or has changed its page markup.

```
  a platform  ──(yt-dlp)──>  C:/RAW-HARVEST  ──(build-archive.mjs)──>  the site
```

---

## What was taken, and what each platform actually gives

| Channel | Posts found | Metadata | Captions / transcript |
|---|---|---|---|
| [YouTube @RawOfficialCo](https://www.youtube.com/@RawOfficialCo) | **68** (47 videos, 20 shorts, 1 stream) | full | **60 of 68** had a published caption track |
| [TikTok @raw_official_co](https://www.tiktok.com/@raw_official_co) | **48 of 51** | full | **none** — TikTok publishes no caption track at all |
| [Instagram @rawofficial_co](https://www.instagram.com/rawofficial_co) | **0** | — | — |

Three TikTok posts could not be read (`No video formats found`): they are
photo-carousel posts, which TikTok serves as images rather than video.

**Instagram cannot be read without signing in.** This is not a tooling gap to
work around — a request for the profile returns a login wall, and even with a
token Instagram's CDN links are signed and expire within days, so a gallery
built on them is a wall of broken frames a fortnight later. Two honest routes:

1. **Instagram's own export** — *Settings → Accounts Centre → Your information
   and permissions → Download your information*. That zip contains every photo,
   video and caption. Point the ingest at it and the media lands in
   `public/showcase/` where it is ours and can never rot.
2. **Save the posts by hand** into `public/showcase/` and add an entry to
   `src/data/showcase.ts` — which is exactly what the 12 existing items are.

---

## Running a harvest

Needs Python and `yt-dlp`. TikTok additionally needs `curl_cffi`, without which
every TikTok request fails with *"Unexpected response from webpage request"* —
TikTok refuses clients that do not look like a browser.

```bash
pip install --upgrade yt-dlp curl_cffi
```

**YouTube** — list every tab, then fetch metadata and captions:

```bash
cd C:/RAW-HARVEST
for tab in videos shorts streams; do
  python -m yt_dlp --flat-playlist --dump-single-json \
    "https://www.youtube.com/@RawOfficialCo/$tab" > "yt-$tab.json"
done
# build yt-ids.txt from those, then:
python -m yt_dlp -a yt-ids.txt --skip-download --write-info-json \
  --write-auto-subs --write-subs --sub-langs "en.*" --sub-format vtt \
  -o "yt/%(id)s.%(ext)s" --sleep-requests 1 --ignore-errors
```

**TikTok** — same shape, from the profile:

```bash
python -m yt_dlp --flat-playlist --dump-single-json \
  "https://www.tiktok.com/@raw_official_co" > tt.json
python -m yt_dlp -a tt-ids.txt --skip-download --write-info-json \
  -o "tt/%(id)s.%(ext)s" --sleep-requests 1 --ignore-errors
```

Then turn the harvest into the site's data:

```bash
npm run archive        # reads C:/RAW-HARVEST, writes the archive + transcripts
npm run build          # sitemaps are regenerated as part of this
npm run watchcheck     # walks all 116 film pages
```

---

## What the build step produces

| Written | What it is |
|---|---|
| `src/data/videoArchive.ts` | metadata only — small enough to bundle |
| `public/transcripts/<id>.json` | one timed transcript per film, lazy-loaded |
| `public/transcripts/search.json` | every description + transcript, for searching |
| `public/transcripts/descriptions.json` | the descriptions, kept out of the bundle |
| `public/transcripts/manifest.json` | the list `watchcheck` walks |
| `public/sitemap-videos.xml` | the 116 film pages, for search engines |

### Three rules the generator keeps

**Nothing is written copy.** Every title, caption, date, duration and line of
transcript is the platform's own. A film with no caption track is marked
`transcript: false` and the page *says* it has none — it is never given an
invented summary, because a plausible fake is the error nobody catches.

**Transcripts and descriptions are not bundled.** Measured: the descriptions
alone were 50.1 KB of 100.9 KB of archive data — half the weight, carried by
every visitor to the site, for text shown on one page at a time. They are
static files now, fetched by the page that needs them.

**TikTok thumbnails are downloaded, never hotlinked.** Their CDN URLs are
signed and expire. YouTube's `i.ytimg.com` thumbnails are stable and intended
to be linked, so those stay remote and cost this repository nothing.

### The caption trap, written down so it is not repeated

YouTube's auto-captions are a **rolling teleprompter, not a transcript**. Each
cue repeats the tail of the one before it and carries per-word timing tags, so
a naive parse produces text that says everything two or three times.

De-rolling is done **by whole words, not by characters** — a character-overlap
test needs a minimum length to be safe, and that floor is exactly where the
real repeats live ("pain" then "pain and suffering" left *pain* in twice).

And `>>`, YouTube's mark for a change of speaker, is stripped **before** the
overlap comparison, not after. Stripping it after broke the de-roll outright:
the comparison saw text the kept line no longer contained, and a 428-line
transcript became 529 lines of *"Hi Titch. Hi Titch. Hi Titch."*
