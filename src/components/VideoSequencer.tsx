import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Film, Download, Layers, Users, Trash2, Camera,
  Sliders, AlertTriangle, Eye
} from "lucide-react";
import { useToast } from "./common/Toast";
import { VIDEO_LIBRARY } from "../data/videoLibrary";

// Simple storage types
interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
}

interface Shot {
  id: string;
  sceneNo: number;
  prompt: string;
  lensType: string;
  motionPreset: string;
}

interface ReviewClip {
  name: string;
  url: string;
}

// The brand reels the Review Room can show. These are the founder's own
// masters; their weight is read from the video library (measured, not typed).
const REVIEW_CLIPS: ReviewClip[] = [
  { name: "V1_TACTICAL_WAYPOINT.MP4", url: "https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final_mp4_hd.mp4" },
  { name: "V2_NUTRITIONAL_SHAKE.MP4", url: "https://videos.files.wordpress.com/jqb5XX8H/raw-nutrients-reel-2160x2160-1_mp4_hd.mp4" },
  { name: "V3_COMBAT_SPARRING.MP4", url: "https://videos.files.wordpress.com/h8D4zswX/raw-combat-reel-2160x2160-1_mp4_hd.mp4" }
];

const clipMegabytes = (url: string): number | undefined =>
  VIDEO_LIBRARY.find(v => v.src === url)?.megabytes;

const ACTIVE_PROJECT = "RAW_OPERATIVE_TRAINING_CORPS_V1";

const VideoSequencer = React.memo(function VideoSequencer() {
  const { addToast } = useToast();

  // Character Bible
  const [characters, setCharacters] = useState<Character[]>([
    { id: "char-1", name: "OPERATIVE JAX", role: "Tactical Lead", description: "Hardened physical conditioning coordinator. Wears thick carbon protective jacket." },
    { id: "char-2", name: "COACH MARA", role: "Head Coach", description: "Corner-side coach. Calls the rounds, reads the fight, never raises her voice." }
  ]);
  const [newCharName, setNewCharName] = useState("");
  const [newCharRole, setNewCharRole] = useState("");

  // Shot Forge Storyboard List (example scenes — nothing here has been rendered)
  const [shots, setShots] = useState<Shot[]>([
    { id: "shot-1", sceneNo: 1, prompt: "Operative Jax executing heavy rucking up steep volcanic mountain slope, cinematic lens, moody dramatic clouds, sunset high contrast", lensType: "Anamorphic 35mm", motionPreset: "Low Speed Pan" },
    { id: "shot-2", sceneNo: 2, prompt: "Extreme close up of hand pouring mineralized saline into black thermal shaker, carbon fiber pattern, water splash macro details", lensType: "Macro 100mm", motionPreset: "Slow Dolly In" },
    { id: "shot-3", sceneNo: 3, prompt: "A room styled like the DeFrost cybernetic tactical laboratory, pulsing red ambient glowing lights, diagnostics telemetry overlay", lensType: "Wide-Angle 18mm", motionPreset: "Camera Roll Zoom" }
  ]);

  // Shot Forge Editor states (Popup builder)
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [forgePrompt, setForgePrompt] = useState("");
  const [forgeLens, setForgeLens] = useState("Anamorphic 35mm");
  const [forgeMotion, setForgeMotion] = useState("Slow Dolly In");

  // Style notes that apply to every scene in the exported script
  const [negativePrompt, setNegativePrompt] = useState("blurry, low fidelity, CGI cartoon styling, low-con, over-exposed");

  // Clip Review Room: which reel is selected, and whether the visitor has
  // asked for it to load (the masters are heavy, so nothing streams unasked)
  const [reviewClip, setReviewClip] = useState<ReviewClip>(REVIEW_CLIPS[0]);
  const [reviewArmed, setReviewArmed] = useState(false);

  // Escape closes the Shot Forge popup. Capture phase + stopImmediatePropagation
  // so no other Escape handler (window, document or element) also closes the studio window.
  useEffect(() => {
    if (!editingShot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      setEditingShot(null);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [editingShot]);

  // Storyboard additions
  const handleAddNewShot = useCallback(() => {
    const nextNo = shots.length > 0 ? Math.max(...shots.map(s => s.sceneNo)) + 1 : 1;
    const newShot: Shot = {
      id: `shot-${Date.now()}-${nextNo}`,
      sceneNo: nextNo,
      prompt: "",
      lensType: "Wide-Angle 18mm",
      motionPreset: "None"
    };
    setShots([...shots, newShot]);
    addToast(`Scene #${nextNo} added successfully to storyboard.`, "success");
  }, [shots, addToast]);

  const handleDeleteShot = useCallback((id: string) => {
    setShots(prev => prev.filter(s => s.id !== id));
    addToast("Scene slot deleted.", "info");
  }, [addToast]);

  // Open Shot Forge Detail Popup
  const handleOpenForge = useCallback((shot: Shot) => {
    setEditingShot(shot);
    setForgePrompt(shot.prompt);
    setForgeLens(shot.lensType);
    setForgeMotion(shot.motionPreset);
  }, []);

  const handleSaveForge = useCallback(() => {
    if (!editingShot) return;
    setShots(prev => prev.map(s => {
      if (s.id === editingShot.id) {
        return { ...s, prompt: forgePrompt, lensType: forgeLens, motionPreset: forgeMotion };
      }
      return s;
    }));
    setEditingShot(null);
    addToast("Shot Forge parameters updated and locked.", "success");
  }, [editingShot, forgePrompt, forgeLens, forgeMotion, addToast]);

  // Character add
  const handleAddChar = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;
    const entry: Character = {
      id: `char-${Date.now()}`,
      name: newCharName.toUpperCase(),
      role: newCharRole || "Supporting Agent",
      description: "No dossier notes yet."
    };
    setCharacters(prev => [...prev, entry]);
    setNewCharName("");
    setNewCharRole("");
    addToast("Character registered inside Codex Bible.", "success");
  }, [newCharName, newCharRole, addToast]);

  const handleDeleteChar = useCallback((id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    addToast("Character profile removed from archive.", "info");
  }, [addToast]);

  // Load a reel into the Review Room
  const handleLoadReviewClip = useCallback((clip: ReviewClip, note: string) => {
    setReviewClip(clip);
    addToast(note, "info");
  }, [addToast]);

  // Compile the storyboard as a plain-text script download
  const triggerBatchPromptExport = useCallback(() => {
    addToast("Compiling storyboard script...", "info");
    let batch = `# RAW STUDIO STORYBOARD EXPORT PACK\n`;
    batch += `# PROJECT_ID: ${ACTIVE_PROJECT}\n\n`;

    shots.forEach(s => {
      batch += `[SCENE_NO_${s.sceneNo}] [LENS: ${s.lensType.toUpperCase()}] [MOTION: ${s.motionPreset.toUpperCase()}]\n`;
      batch += `SCENE: ${s.prompt.trim() || "(no description yet)"}\n`;
      batch += `AVOID: ${negativePrompt}\n`;
      batch += `---------------------------------------------------------\n\n`;
    });

    const fileStr = "data:text/plain;charset=utf-8," + encodeURIComponent(batch);
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute("href", fileStr);
    downloadLink.setAttribute("download", `${ACTIVE_PROJECT.toLowerCase()}_storyboard.txt`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    addToast("Storyboard script downloaded successfully.", "success");
  }, [shots, negativePrompt, addToast]);

  const reviewClipSize = clipMegabytes(reviewClip.url);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050508]/90 font-sans">

      {/* Studio Header block */}
      <header className="px-6 py-4 border-b border-editorial-border/30 bg-[#0e0e12] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-[0.4em] font-bold">
              STORYBOARD_STUDIO // {ACTIVE_PROJECT}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" /> Video Sequencer & Storyboard
          </h2>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={triggerBatchPromptExport}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-editorial-border hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-all text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> BATCH_EXPORT
          </button>
        </div>
      </header>

      {/* Tri-panel Dashboard Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden relative">

        {/* Left Panel: Character Bible & Codex */}
        <aside className="w-full lg:w-80 border-r border-editorial-border/30 bg-zinc-950/80 p-5 lg:overflow-y-auto custom-scrollbar flex flex-col gap-6 lg:shrink-0">

          {/* Character Bible */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Users className="w-4 h-4 text-red-500" />
              <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                CHARACTER CODEX BIBLE
              </h4>
            </div>

            <form onSubmit={handleAddChar} className="space-y-2">
              <input
                type="text"
                placeholder="NAME (E.G. JAX)..."
                aria-label="Character name"
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                className="w-full bg-[#07070a] border border-editorial-border rounded-lg px-3 py-1.5 font-mono text-[0.6875rem] text-white focus:outline-none focus:border-red-500 uppercase placeholder:text-zinc-700 font-bold"
              />
              <input
                type="text"
                placeholder="ROLE (E.G. COMMANDER)..."
                aria-label="Character role"
                value={newCharRole}
                onChange={(e) => setNewCharRole(e.target.value)}
                className="w-full bg-[#07070a] border border-editorial-border rounded-lg px-3 py-1.5 font-mono text-[0.6875rem] text-white focus:outline-none focus:border-red-500 uppercase placeholder:text-zinc-700"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-red-700/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 rounded-lg font-mono text-[0.6875rem] font-black uppercase tracking-widest transition-all"
              >
                + ADD_PROTAGONIST
              </button>
            </form>

            <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
              {characters.map(c => (
                <div key={c.id} className="p-3 bg-black/40 border border-editorial-border rounded-xl flex justify-between items-start group">
                  <div className="space-y-1 min-w-0">
                    <span className="block font-mono text-[0.6875rem] text-white font-bold tracking-tight">
                      {c.name}
                    </span>
                    <span className="block font-sans text-[0.6875rem] text-red-500/80 font-medium tracking-tight">
                      {c.role}
                    </span>
                    <span className="block font-sans text-[0.6875rem] text-zinc-400 font-light leading-snug">
                      {c.description}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteChar(c.id)}
                    className="shrink-0 min-h-11 min-w-11 -m-2 flex items-center justify-center text-zinc-500 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity"
                    title="Remove Character"
                    aria-label={`Remove character ${c.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Style notes applied to every scene in the export */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                STYLE NOTES
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="sequencer-style-notes" className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest mb-1.5">
                  AVOID IN EVERY SCENE
                </label>
                <textarea
                  id="sequencer-style-notes"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="w-full bg-[#07070a] border border-editorial-border/60 rounded-xl p-3 font-mono text-[0.6875rem] text-zinc-400 focus:outline-none focus:border-red-500 h-24 placeholder:text-zinc-700 resize-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* Reel Library */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Layers className="w-4 h-4 text-red-500" />
              <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                REEL LIBRARY
              </h4>
            </div>

            <div className="space-y-2">
              <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                STORED REELS
              </span>

              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {REVIEW_CLIPS.map((media) => (
                  <button
                    key={media.url}
                    onClick={() => handleLoadReviewClip(media, `Loaded ${media.name} into Review Room.`)}
                    aria-pressed={reviewClip.url === media.url}
                    className={`w-full text-left p-2 bg-[#0c0c11] hover:bg-zinc-900 border hover:border-editorial-border rounded-lg flex items-center justify-between gap-2 transition-colors ${
                      reviewClip.url === media.url ? "border-red-500/40" : "border-editorial-border/40"
                    }`}
                  >
                    <span className="font-mono text-[0.6875rem] text-zinc-300 truncate tracking-tight min-w-0">{media.name}</span>
                    <span className="font-mono text-[0.6875rem] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase shrink-0">
                      {clipMegabytes(media.url) ? `${clipMegabytes(media.url)}MB` : "video"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canvas: Storyboard scene track and assembly timeline */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-6 space-y-6 flex flex-col min-h-0 bg-transparent">

          {/* Timeline track assembly area representing the Shot list */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                <h3 className="font-serif text-lg font-bold text-white uppercase tracking-tight">
                  Storyboard Scene Cards
                </h3>
              </div>
              <button
                onClick={handleAddNewShot}
                className="px-3.5 py-1.5 bg-red-700/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-[0.6875rem] font-mono tracking-widest uppercase font-black transition-all"
              >
                + ADD_SCENE_CARD
              </button>
            </div>

            {/* Storyboard cards list rendering horizontal stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {shots.map((sh) => (
                <div
                  key={sh.id}
                  className="bg-zinc-950/90 border border-editorial-border rounded-[2rem] p-5 flex flex-col justify-between gap-5 hover:border-red-500/30 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest font-black">
                        SCENE #{sh.sceneNo.toString().padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[0.6875rem] uppercase tracking-widest px-2 py-0.5 rounded border bg-zinc-900 border-zinc-800 text-zinc-500">
                        {sh.motionPreset}
                      </span>
                    </div>

                    <p className={`text-xs font-light tracking-tight transition-colors capitalize leading-relaxed h-12 overflow-hidden text-ellipsis line-clamp-2 ${
                      sh.prompt.trim() ? "text-zinc-300 group-hover:text-white" : "text-zinc-600 italic"
                    }`}>
                      {sh.prompt.trim() || "No scene description yet. Open FORGE to write one."}
                    </p>

                    <div className="flex items-center gap-3 pt-3 border-t border-white/[0.03]">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[0.6875rem]">
                        <Camera className="w-3.5 h-3.5" /> {sh.lensType}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 pt-4 border-t border-white/[0.02] mt-4">
                    <button
                      onClick={() => handleOpenForge(sh)}
                      className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 hover:text-white border border-editorial-border rounded-xl text-[0.6875rem] font-mono tracking-widest font-bold uppercase transition-all"
                    >
                      FORGE
                    </button>
                    <button
                      onClick={() => handleDeleteShot(sh.id)}
                      className="min-h-11 min-w-11 ml-auto flex items-center justify-center text-zinc-500 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity"
                      title="Delete card"
                      aria-label={`Delete scene ${sh.sceneNo}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scene order track, derived from the storyboard */}
          <div className="p-5 bg-[#0a0a0f] border border-editorial-border rounded-[2.5rem] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-500" />
                <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                  SCENE ORDER TRACK
                </h4>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center bg-black/60 rounded-xl border border-editorial-border p-3 gap-2">
                <div className="w-24 shrink-0 text-[0.6875rem] font-mono text-red-500 font-bold tracking-widest">VIDEO_TRK</div>
                <div className="flex-1 min-w-0 overflow-x-auto custom-scrollbar">
                  <div className="flex gap-2 h-8 min-w-max">
                    {shots.length === 0 ? (
                      <span className="text-[0.6875rem] font-mono text-zinc-600 italic flex items-center">No scenes on the track yet.</span>
                    ) : shots.map(sh => (
                      <div key={sh.id} className="w-28 shrink-0 bg-red-950/20 border border-red-500/25 rounded-md flex items-center justify-center text-[0.6875rem] font-mono text-pink-400 uppercase">
                        SCENE_{sh.sceneNo.toString().padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Export notes */}
        <aside className="w-full lg:w-80 border-l border-editorial-border/30 bg-zinc-950/80 p-5 lg:overflow-y-auto custom-scrollbar flex flex-col gap-6 lg:shrink-0">

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Download className="w-4 h-4 text-red-500" />
              <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                EXPORT
              </h4>
            </div>

            <div className="p-4 bg-red-700/10 border border-red-500/20 rounded-2xl flex flex-col gap-2 relative">
              <div className="flex items-center gap-2 text-red-400 font-mono text-[0.6875rem] font-bold">
                <AlertTriangle className="w-4 h-4" /> DRAFTING ONLY
              </div>
              <p className="text-[0.6875rem] text-zinc-400 leading-normal font-light">
                This studio drafts scene descriptions for export; it does not render video. Use <strong>BATCH_EXPORT</strong> to download the storyboard as a script.
              </p>
            </div>

            <div className="flex justify-between font-mono text-[0.6875rem] text-zinc-400 px-1">
              <span>SCENES IN SCRIPT:</span>
              <span className="text-white">{shots.length}</span>
            </div>
            <div className="flex justify-between font-mono text-[0.6875rem] text-zinc-400 px-1">
              <span>CHARACTERS:</span>
              <span className="text-white">{characters.length}</span>
            </div>
          </div>

        </aside>

      </div>

      {/* Revision comparison room overlay block rendering comparison lists */}
      <footer className="p-6 border-t border-editorial-border/30 bg-[#07070a] flex flex-col md:flex-row items-stretch justify-between gap-6 shrink-0 relative z-20">

        <div className="flex-1 flex flex-col md:flex-row gap-6 min-w-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-pink-500" />
              <span className="font-mono text-[0.6875rem] font-black tracking-widest text-white uppercase">
                Clip Review Room
              </span>
            </div>
            <p className="text-[0.6875rem] text-zinc-400 font-light max-w-sm leading-normal">
              Watch the brand reels alongside the storyboard. The reels are full-size masters, so nothing streams until you ask for it.
            </p>
          </div>

          <div className="flex-1 relative aspect-video w-full max-w-sm border border-editorial-border bg-black rounded-2xl overflow-hidden shadow-lg select-none">
            {reviewArmed ? (
              <video
                key={reviewClip.url}
                src={reviewClip.url}
                autoPlay
                loop
                muted
                playsInline
                controls
                preload="metadata"
                aria-label={`Review clip ${reviewClip.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={() => setReviewArmed(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-300 hover:text-white bg-zinc-950 hover:bg-zinc-900 transition-colors"
              >
                <Eye className="w-5 h-5 text-pink-500" />
                <span className="font-mono text-[0.6875rem] font-black uppercase tracking-widest">LOAD_CLIP</span>
                {reviewClipSize && (
                  <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">{reviewClipSize}MB</span>
                )}
              </button>
            )}
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 border border-editorial-border rounded-md font-mono text-[0.6875rem] text-red-500/80 font-bold uppercase tracking-widest pointer-events-none">
              {reviewClip.name}
            </div>
          </div>
        </div>

        {/* Reel Selector */}
        <div className="w-full md:w-80 flex flex-col justify-between p-4 bg-zinc-950 border border-editorial-border rounded-[1.5rem] md:shrink-0 gap-3">
          <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest font-black">
            REEL SELECTOR
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleLoadReviewClip(REVIEW_CLIPS[0], "V1 reference clip linked.")}
              aria-pressed={reviewClip.url === REVIEW_CLIPS[0].url}
              className="flex-1 py-2 bg-zinc-900 border border-editorial-border hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl font-mono text-[0.6875rem] uppercase tracking-widest font-bold"
            >
              LINK_REF_V1
            </button>
            <button
              onClick={() => handleLoadReviewClip(REVIEW_CLIPS[2], "V3 combat clip linked.")}
              aria-pressed={reviewClip.url === REVIEW_CLIPS[2].url}
              className="flex-1 py-2 bg-zinc-900 border border-editorial-border hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl font-mono text-[0.6875rem] uppercase tracking-widest font-bold"
            >
              LINK_REF_V3
            </button>
          </div>
        </div>

      </footer>

      {/* Storyboard Shot Forge detail popup builder block */}
      <AnimatePresence>
        {editingShot && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingShot(null)}
              aria-hidden="true"
              className="absolute inset-0 bg-[#040406]/95 backdrop-blur-md"
            />

            {/* Popup Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="shot-forge-title"
              className="bg-[#0c0c10] border border-editorial-border rounded-[2.5rem] p-8 max-w-xl w-full z-10 shadow-depth-3 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4">
                <Camera className="w-5 h-5 text-red-500" />
                <div>
                  <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                    SHOT_FORGE // SCENE_{editingShot.sceneNo.toString().padStart(2, '0')}
                  </span>
                  <h3 id="shot-forge-title" className="font-sans font-black text-lg text-white uppercase tracking-wider mt-0.5">
                    Lens & Motion Setup
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="shot-forge-prompt" className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                    SCENE DESCRIPTION
                  </label>
                  <textarea
                    id="shot-forge-prompt"
                    autoFocus
                    value={forgePrompt}
                    onChange={(e) => setForgePrompt(e.target.value)}
                    placeholder="DESCRIBE THE SCENE..."
                    className="w-full bg-black border border-editorial-border rounded-xl p-3 font-mono text-[0.6875rem] text-white focus:outline-none focus:border-red-500 h-24 placeholder:text-zinc-700 resize-none uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="shot-forge-lens" className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                      LENS_PRESET
                    </label>
                    <select
                      id="shot-forge-lens"
                      value={forgeLens}
                      onChange={(e) => setForgeLens(e.target.value)}
                      className="w-full bg-black border border-editorial-border rounded-xl px-3 py-2.5 font-mono text-[0.6875rem] text-white focus:outline-none focus:border-red-500 uppercase"
                    >
                      <option>Wide-Angle 18mm</option>
                      <option>Anamorphic 35mm</option>
                      <option>Cinematic 50mm</option>
                      <option>Macro 100mm</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="shot-forge-motion" className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                      CAMERA_MOTION
                    </label>
                    <select
                      id="shot-forge-motion"
                      value={forgeMotion}
                      onChange={(e) => setForgeMotion(e.target.value)}
                      className="w-full bg-black border border-editorial-border rounded-xl px-3 py-2.5 font-mono text-[0.6875rem] text-white focus:outline-none focus:border-red-500 uppercase"
                    >
                      <option>None</option>
                      <option>Slow Dolly In</option>
                      <option>Low Speed Pan</option>
                      <option>Camera Roll Zoom</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.03]">
                <button
                  type="button"
                  onClick={() => setEditingShot(null)}
                  className="flex-1 py-3 bg-zinc-900 border border-editorial-border rounded-xl font-mono text-[0.6875rem] uppercase tracking-widest font-bold text-zinc-400 hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleSaveForge}
                  className="flex-1 button-premium !py-3 text-[0.6875rem] font-mono uppercase tracking-widest font-black"
                >
                  COMMIT_CHANGES
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
});

export default VideoSequencer;
