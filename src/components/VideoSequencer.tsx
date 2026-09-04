import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, Plus, Settings, Play, CheckCircle, Clock, ShieldAlert,
  Download, Sparkles, BookOpen, Layers, Users, Trash2, Camera,
  Sliders, Activity, RefreshCw, AlertTriangle, ChevronRight, Eye, Share2
} from "lucide-react";
import { useToast } from "./common/Toast";

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
  renderStatus: "idle" | "rendering" | "completed" | "failed";
  attachedClipUrl?: string;
  costEstimate: number;
}

const VideoSequencer = React.memo(function VideoSequencer() {
  const { addToast } = useToast();

  // Autosave State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeProject, setActiveProject] = useState<string>("RAW_OPERATIVE_TRAINING_CORPS_V1");

  // Character Bible
  const [characters, setCharacters] = useState<Character[]>([
    { id: "char-1", name: "OPERATIVE JAX", role: "Tactical Lead", description: "Hardened physical conditioning coordinator. Wears thick carbon protective jacket." },
    { id: "char-2", name: "COACH MARA", role: "Head Coach", description: "Corner-side coach. Calls the rounds, reads the fight, never raises her voice." }
  ]);
  const [newCharName, setNewCharName] = useState("");
  const [newCharRole, setNewCharRole] = useState("");

  // Shot Forge Storyboard List
  const [shots, setShots] = useState<Shot[]>([
    { id: "shot-1", sceneNo: 1, prompt: "Operative Jax executing heavy rucking up steep volcanic mountain slope, cinematic lens, moody dramatic clouds, sunset high contrast", lensType: "Anamorphic 35mm", motionPreset: "Low Speed Pan", renderStatus: "completed", attachedClipUrl: "https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4", costEstimate: 0.8 },
    { id: "shot-2", sceneNo: 2, prompt: "Extreme close up of hand pouring mineralized saline into black thermal shaker, carbon fiber pattern, water splash macro details", lensType: "Macro 100mm", motionPreset: "Slow Dolly In", renderStatus: "completed", attachedClipUrl: "https://videos.files.wordpress.com/jqb5XX8H/raw-nutrients-reel-2160x2160-1.mp4", costEstimate: 0.8 },
    { id: "shot-3", sceneNo: 3, prompt: "A room styled like the DeFrost cybernetic tactical laboratory, pulsing red ambient glowing lights, diagnostics telemetry overlay", lensType: "Wide-Angle 18mm", motionPreset: "Camera Roll Zoom", renderStatus: "idle", costEstimate: 1.2 }
  ]);

  // Shot Forge Editor states (Popup builder)
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [forgePrompt, setForgePrompt] = useState("");
  const [forgeLens, setForgeLens] = useState("Anamorphic 35mm");
  const [forgeMotion, setForgeMotion] = useState("Slow Dolly In");

  // Promp Machine Help
  const [negativePrompt, setNegativePrompt] = useState("blurry, low fidelity, CGI cartoon styling, low-con, over-exposed");

  // Adapter provider selection
  const [selectedProvider, setSelectedProvider] = useState<"runway" | "luma" | "fal">("runway");

  // Render Queue Active Jobs
  const [activeQueueJobs, setActiveQueueJobs] = useState<{ id: string; percentage: number }[]>([]);

  // Clip Review Room comparison
  const [comparisonTargetUrl, setComparisonTargetUrl] = useState<string>("https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4");

  // Autosave effect timer mimicking client background thread
  useEffect(() => {
    const saver = setInterval(() => {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 800);
    }, 15000); // Autosaves every 15s
    return () => clearInterval(saver);
  }, []);

  // Storyboard additions
  const handleAddNewShot = useCallback(() => {
    setShots(prev => {
      const nextNo = prev.length > 0 ? Math.max(...prev.map(s => s.sceneNo)) + 1 : 1;
      const newShot: Shot = {
        id: `shot-${Math.random().toString()}`,
        sceneNo: nextNo,
        prompt: "New tactical scene block prompt input...",
        lensType: "Wide-Angle 18mm",
        motionPreset: "None",
        renderStatus: "idle",
        costEstimate: 0.9
      };
      addToast(`Scene #${nextNo} added successfully to storyboard.`, "success");
      return [...prev, newShot];
    });
  }, [addToast]);

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
      id: Math.random().toString(),
      name: newCharName.toUpperCase(),
      role: newCharRole || "Supporting Agent",
      description: "Operative details saved."
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

  // Production Readiness calculation gauge based on attributes
  const productionReadyMetrics = useMemo(() => {
    let score = 20; // Base score
    if (shots.length > 2) score += 20;
    if (characters.length > 1) score += 20;
    
    const fullyConfigured = shots.filter(s => s.prompt.length > 40).length;
    score += fullyConfigured * 15;
    
    const completionCount = shots.filter(s => s.renderStatus === "completed").length;
    score += completionCount * 10;

    return Math.min(100, score);
  }, [shots, characters]);

  // Pricing / GPU estimators
  const runtimeEstimators = useMemo(() => {
    const count = shots.filter(s => s.renderStatus !== "completed").length;
    return {
      estimatedRuntimeSec: count * 45, // 45 seconds per shot estimation
      estimatedCostUsd: shots.reduce((acc, current) => acc + current.costEstimate, 0)
    };
  }, [shots]);

  // Provider Dispatcher (Render simulation)
  const handleDispatchQueue = useCallback(() => {
    addToast("Dispatching timeline sequence queue to rendering nodes...", "info");
    
    // Pick the first available idle shot
    const idleIndex = shots.findIndex(s => s.renderStatus === "idle");
    if (idleIndex === -1) {
      addToast("No offline scenes require active bake passes.", "info");
      return;
    }

    const shotToRender = shots[idleIndex];
    
    // Setup queue percent
    const jobId = shotToRender.id;
    setActiveQueueJobs(prev => [...prev, { id: jobId, percentage: 5 }]);
    
    setShots(prev => prev.map(s => {
      if (s.id === jobId) return { ...s, renderStatus: "rendering" };
      return s;
    }));

    // Simulating render steps with clear updates
    const interval = setInterval(() => {
      setActiveQueueJobs(prev => {
        const item = prev.find(j => j.id === jobId);
        if (!item) return prev;
        if (item.percentage >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Completed rendering! Attach simulation clip
            setShots(prevShots => prevShots.map(s => {
              if (s.id === jobId) return { 
                ...s, 
                renderStatus: "completed",
                attachedClipUrl: "https://videos.files.wordpress.com/h8D4zswX/raw-combat-reel-2160x2160-1.mp4" 
              };
              return s;
            }));
            addToast(`Scene rendering task completed. Clip mapped.`, "success");
            setActiveQueueJobs(q => q.filter(job => job.id !== jobId));
          }, 400);
          return prev;
        }
        return prev.map(j => j.id === jobId ? { ...j, percentage: j.percentage + 25 } : j);
      });
    }, 1000);
  }, [shots, addToast]);

  // Compile prompt pack as a script export download
  const triggerBatchPromptExport = useCallback(() => {
    addToast("Compiling batch rendering scripts...", "info");
    let batch = `# RAW STUDIO BATCH PROMPT EXPORT PACK\n`;
    batch += `# PROJECT_ID: ${activeProject}\n`;
    batch += `# ENGINE_ADAPTER_CONFIGURATION: ${selectedProvider.toUpperCase()}\n\n`;
    
    shots.forEach(s => {
      batch += `[SCENE_NO_${s.sceneNo}] [LENS: ${s.lensType.toUpperCase()}] [MOTION: ${s.motionPreset.toUpperCase()}]\n`;
      batch += `PROMPT: ${s.prompt}\n`;
      batch += `NEGATIVE_PROMPT: ${negativePrompt}\n`;
      batch += `---------------------------------------------------------\n\n`;
    });

    const fileStr = "data:text/plain;charset=utf-8," + encodeURIComponent(batch);
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute("href", fileStr);
    downloadLink.setAttribute("download", `${activeProject.toLowerCase()}_prompts_pack.txt`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    
    addToast("Batch text instructions downloaded successfully.", "success");
  }, [activeProject, selectedProvider, shots, negativePrompt, addToast]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#050508]/90 font-sans">
      
      {/* Studio Header block */}
      <header className="px-6 py-4 border-b border-editorial-border/30 bg-[#0e0e12] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-ping" />
            <span className="font-mono text-[0.6875rem] text-zinc-555 uppercase tracking-[0.4em] font-bold">
              AI_FILM_STUDIO // WORKSPACE_ONLINE
            </span>
            {isSaving && (
              <span className="font-mono text-[0.6875rem] text-zinc-500 bg-white/5 border border-white/15 px-2 py-0.5 rounded ml-2 uppercase animate-pulse">
                Autosaving...
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" /> Video Sequencer & Film Engine
          </h2>
        </div>

        {/* High-Fidelity calculated gauge */}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <span className="block font-mono text-[0.6875rem] text-zinc-650 uppercase tracking-widest leading-none">
              PROD_READINESS_GAUGE
            </span>
            <span className="font-sans font-black text-lg text-emerald-500 mt-1 block">
              {productionReadyMetrics}% READINESS
            </span>
          </div>
          <div className="h-10 w-px bg-editorial-border/30" />
          <button
            onClick={triggerBatchPromptExport}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-editorial-border hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition-all text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> BATCH_EXPORT
          </button>
        </div>
      </header>

      {/* Tri-panel Dashboard Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        
        {/* Left Panel: Character Bible & Codex */}
        <aside className="w-full lg:w-80 border-r border-editorial-border/30 bg-zinc-950/80 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0">
          
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
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                className="w-full bg-[#07070a] border border-editorial-border rounded-lg px-3 py-1.5 font-mono text-[0.6875rem] text-white focus:outline-none focus:border-red-500 uppercase placeholder:text-zinc-700 font-bold"
              />
              <input
                type="text"
                placeholder="ROLE (E.G. COMMANDER)..."
                value={newCharRole}
                onChange={(e) => setNewCharRole(e.target.value)}
                className="w-full bg-[#07070a] border border-editorial-border rounded-lg px-3 py-1.5 font-mono text-[0.6875rem] text-white focus:outline-none focus:border-red-500 uppercase placeholder:text-zinc-700"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-red-650/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 rounded-lg font-mono text-[0.6875rem] font-black uppercase tracking-widest transition-all"
              >
                + ADD_PROTAGONIST
              </button>
            </form>

            <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
              {characters.map(c => (
                <div key={c.id} className="p-3 bg-black/40 border border-editorial-border rounded-xl flex justify-between items-start group">
                  <div className="space-y-1">
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
                    className="p-1 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Character"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Machine & Negative Preset library */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                PROMPT STYLIZATION ENGINE
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <span className="block font-mono text-[0.6875rem] text-zinc-555 uppercase tracking-widest mb-1.5">
                  GLOBAL NEGATIVE CONSTANTS
                </span>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="w-full bg-[#07070a] border border-editorial-border/60 rounded-xl p-3 font-mono text-[0.6875rem] text-zinc-400 focus:outline-none focus:border-red-500 h-24 placeholder:text-zinc-700 resize-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* Processed Media Library */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Layers className="w-4 h-4 text-red-500" />
              <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                PROCESSED MEDIA LIBRARY
              </h4>
            </div>
            
            <div className="space-y-2">
              <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                STORED REELS & SOUND DRONES
              </span>
              
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {[
                  { name: "V1_TACTICAL_WAYPOINT.MP4", type: "video", url: "https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4" },
                  { name: "V2_NUTRITIONAL_SHAKE.MP4", type: "video", url: "https://videos.files.wordpress.com/jqb5XX8H/raw-nutrients-reel-2160x2160-1.mp4" },
                  { name: "V3_COMBAT_SPARRING.MP4", type: "video", url: "https://videos.files.wordpress.com/h8D4zswX/raw-combat-reel-2160x2160-1.mp4" },
                  { name: "AUDIO_HQ_RESONANCE.WAV", type: "audio", size: "3.4MB" }
                ].map((media, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (media.type === 'video' && media.url) {
                        setComparisonTargetUrl(media.url);
                        addToast(`Loaded ${media.name} into Review Room.`, "info");
                      } else {
                        addToast(`Synthesizing sound drone resonance stream...`, "success");
                      }
                    }}
                    className="w-full text-left p-2 bg-[#0c0c11] hover:bg-zinc-900 border border-editorial-border/40 hover:border-editorial-border rounded-lg flex items-center justify-between transition-colors"
                  >
                    <span className="font-mono text-[0.6875rem] text-zinc-300 truncate tracking-tight">{media.name}</span>
                    <span className="font-mono text-[0.6875rem] text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase">{media.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canvas: Storyboard scene track, animatic player, and assembly timeline */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 flex flex-col min-h-0 bg-transparent">
          
          {/* Timeline track assembly area representing the Shot list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-500" />
                <h3 className="font-serif text-lg font-bold text-white uppercase tracking-tight">
                  Storyboard Scene Cards
                </h3>
              </div>
              <button
                onClick={handleAddNewShot}
                className="px-3.5 py-1.5 bg-red-650/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-[0.6875rem] font-mono tracking-widest uppercase font-black transition-all"
              >
                + ADD_SCENE_CARD
              </button>
            </div>

            {/* Storyboard cards list rendering horizontal stack */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {shots.map((sh, idx) => (
                <div 
                  key={sh.id}
                  className={`bg-zinc-950/90 border rounded-[2rem] p-5 flex flex-col justify-between gap-5 hover:border-red-500/30 transition-all duration-500 group relative overflow-hidden ${
                    sh.renderStatus === "rendering" ? "border-amber-500 bg-amber-500/[0.02]" : "border-editorial-border"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest font-black">
                        SCENE #{sh.sceneNo.toString().padStart(2, '0')}
                      </span>
                      <div className="flex items-center gap-2">
                        {sh.renderStatus === "completed" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {sh.renderStatus === "rendering" && <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />}
                        {sh.renderStatus === "idle" && <Clock className="w-4 h-4 text-zinc-600 animate-pulse" />}
                        
                        <span className={`font-mono text-[0.6875rem] uppercase tracking-widest px-2 py-0.5 rounded border ${
                          sh.renderStatus === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          sh.renderStatus === "rendering" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          "bg-zinc-900 border-zinc-800 text-zinc-500"
                        }`}>
                          {sh.renderStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 font-light tracking-tight group-hover:text-white transition-colors capitalize leading-relaxed h-12 overflow-hidden text-ellipsis line-clamp-2">
                      {sh.prompt}
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
                    {sh.attachedClipUrl ? (
                      <button
                        onClick={() => setComparisonTargetUrl(sh.attachedClipUrl!)}
                        className="py-2 px-3 bg-red-650/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-500 rounded-xl transition-all"
                        title="Review Reel Clip in Review Room"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="py-2 px-3 text-zinc-600 border border-zinc-850 bg-black/40 rounded-xl" title="No clip generated">
                        <Eye className="w-3.5 h-3.5 opacity-30" />
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteShot(sh.id)}
                      className="p-2 ml-auto text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Multi-track timeline assembly */}
          <div className="p-5 bg-[#0a0a0f] border border-editorial-border rounded-[2.5rem] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-500" />
                <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                  FINAL ASSEMBLY TIMELINE TRACKS
                </h4>
              </div>
              <span className="font-mono text-[0.6875rem] text-zinc-600 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
                SYNCHRONOUS MARKERS ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex font-mono text-[0.6875rem] text-zinc-600 tracking-widest px-4 border-b border-white/[0.02] pb-1">
                <div className="w-24">TRACK</div>
                <div className="flex-1 flex justify-between">
                  <span>00:00</span>
                  <span>00:05</span>
                  <span>00:10</span>
                  <span>00:15</span>
                  <span>00:20</span>
                </div>
              </div>

              {/* Video Track block */}
              <div className="flex items-center bg-black/60 rounded-xl border border-editorial-border p-3">
                <div className="w-24 text-[0.6875rem] font-mono text-red-500 font-bold tracking-widest">VIDEO_TRK</div>
                <div className="flex-1 grid grid-cols-3 gap-2 h-8">
                  <div className="bg-red-950/20 border border-red-500/25 rounded-md flex items-center justify-center text-[0.6875rem] font-mono text-pink-400">JAX_SUNSET</div>
                  <div className="bg-red-950/10 border border-red-500/10 rounded-md flex items-center justify-center text-[0.6875rem] font-mono text-pink-400/60">NUTRI_MACRO</div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center text-[0.6875rem] font-mono text-zinc-600">LAB_OVERLAY</div>
                </div>
              </div>

              {/* Audio Track block */}
              <div className="flex items-center bg-black/60 rounded-xl border border-editorial-border p-3">
                <div className="w-24 text-[0.6875rem] font-mono text-pink-500 font-bold tracking-widest">AUDIO_TRK</div>
                <div className="flex-1 h-8 bg-pink-950/10 border border-pink-500/15 rounded-md flex items-center justify-center text-[0.6875rem] font-mono text-pink-400">
                  AMBIENT_SYNTH_DRONE_STEREO.WAV
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Render Orchestrator, Provider Adapter & Queue */}
        <aside className="w-full lg:w-80 border-l border-editorial-border/30 bg-zinc-950/80 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0">
          
          {/* Provider Adapter Selector */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
              <Activity className="w-4 h-4 text-red-500" />
              <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                ENDPOINT CHANNELS
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(["runway", "luma", "fal"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedProvider(p)}
                  className={`py-2 px-1 rounded-xl border font-mono text-[0.6875rem] font-black uppercase tracking-wider transition-all ${
                    selectedProvider === p 
                      ? "bg-red-650/10 border-red-500 text-white" 
                      : "bg-[#0b0b10] border-editorial-border text-zinc-500 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Warning Banner block correctly configured */}
            <div className="p-4 bg-red-650/10 border border-red-500/20 rounded-2xl flex flex-col gap-2 relative">
              <div className="flex items-center gap-2 text-red-400 font-mono text-[0.6875rem] font-bold">
                <AlertTriangle className="w-4 h-4 animate-bounce" /> RENDERING DISCONNECTED
              </div>
              <p className="text-[0.6875rem] text-zinc-400 leading-normal font-light">
                No active rendering machine connected at port 3000. Displaying local cache. Use option <strong>BATCH_EXPORT</strong> to download scripts.
              </p>
            </div>
          </div>

          {/* Render Queue active list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
                RENDER QUEUE ACTIVE
              </span>
              <button
                onClick={handleDispatchQueue}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[0.6875rem] font-mono uppercase tracking-widest"
              >
                BAKE
              </button>
            </div>

            <div className="space-y-3">
              {activeQueueJobs.length === 0 ? (
                <span className="block text-[0.6875rem] font-mono text-zinc-500 italic text-center py-4 bg-black/40 rounded-xl border border-dashed border-editorial-border-light">
                  NO ACTIVE BAKE TASKS IN BUFFER
                </span>
              ) : (
                activeQueueJobs.map(job => (
                  <div key={job.id} className="p-3 bg-black/40 border border-amber-500/25 rounded-xl space-y-2">
                    <div className="flex justify-between items-center font-mono text-[0.6875rem] text-amber-500">
                      <span>BAKING_SHOT_#{shots.find(s => s.id === job.id)?.sceneNo}</span>
                      <span>{job.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#0d0d12] h-1.5 rounded-full overflow-hidden border border-white/[0.04]">
                      <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${job.percentage}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cost/Runtime Estimator block */}
          <div className="p-4 bg-zinc-900/60 border border-editorial-border rounded-2xl space-y-2 shrink-0">
            <span className="block font-mono text-[0.6875rem] text-zinc-555 uppercase tracking-widest">
              TELEMETRY ESTIMATORS
            </span>
            <div className="flex justify-between font-mono text-[0.6875rem] text-zinc-400">
              <span>UNBAKED SECONDS:</span>
              <span className="text-white">{runtimeEstimators.estimatedRuntimeSec}s</span>
            </div>
            <div className="flex justify-between font-mono text-[0.6875rem] text-zinc-400">
              <span>EST_RAW_COST:</span>
              <span className="text-white">${runtimeEstimators.estimatedCostUsd.toFixed(2)}</span>
            </div>
          </div>

        </aside>

      </div>

      {/* Revision comparison room overlay block rendering comparison lists */}
      <footer className="p-6 border-t border-editorial-border/30 bg-[#07070a] flex flex-col md:flex-row items-stretch justify-between gap-6 shrink-0 relative z-20">
        
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-pink-500" />
              <span className="font-mono text-[0.6875rem] font-black tracking-widest text-white uppercase">
                Clip Review Room
              </span>
            </div>
            <p className="text-[0.6875rem] text-zinc-400 font-light max-w-sm leading-normal">
              Examine the output of the active storyboards. Drag other local mp4 sequences here to load external review revisions.
            </p>
          </div>

          <div className="flex-1 relative aspect-video max-w-sm border border-editorial-border bg-black rounded-2xl overflow-hidden shadow-lg select-none">
            <video
              src={comparisonTargetUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 border border-editorial-border rounded-md font-mono text-[0.6875rem] text-red-500/80 font-bold uppercase tracking-widest">
              v1_reference.mp4
            </div>
          </div>
        </div>

        {/* Local Clip Attachment Selector */}
        <div className="w-full md:w-80 flex flex-col justify-between p-4 bg-zinc-950 border border-editorial-border rounded-[1.5rem] shrink-0 gap-3">
          <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest font-black">
            MANUAL CLIP DIRECT ATTACHMENT
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setComparisonTargetUrl("https://videos.files.wordpress.com/zsH6jAkj/raw-official-wide-3840-final.mp4");
                addToast("V1 reference clip linked.", "success");
              }}
              className="flex-1 py-2 bg-zinc-90 w bg-zinc-900 border border-editorial-border hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl font-mono text-[0.6875rem] uppercase tracking-widest font-bold"
            >
              LINK_REF_V1
            </button>
            <button
              onClick={() => {
                setComparisonTargetUrl("https://videos.files.wordpress.com/h8D4zswX/raw-combat-reel-2160x2160-1.mp4");
                addToast("V2 combat clip linked.", "success");
              }}
              className="flex-1 py-2 bg-zinc-90 w bg-zinc-900 border border-editorial-border hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl font-mono text-[0.6875rem] uppercase tracking-widest font-bold"
            >
              LINK_REF_V2
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
              className="absolute inset-0 bg-[#040406]/95 backdrop-blur-md"
            />

            {/* Popup Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0c0c10] border border-editorial-border rounded-[2.5rem] p-8 max-w-xl w-full z-10 shadow-depth-3 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4">
                <Camera className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <span className="block font-mono text-[0.6875rem] text-zinc-550 uppercase tracking-widest">
                    SHOT_FORGE // SCENE_{editingShot.sceneNo.toString().padStart(2, '0')}
                  </span>
                  <h3 className="font-sans font-black text-lg text-white uppercase tracking-wider mt-0.5 animate-pulse">
                    Advanced Lens Calibrator
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                    AI RENDERING PROMPT INSTRUCTIONS
                  </label>
                  <textarea
                    value={forgePrompt}
                    onChange={(e) => setForgePrompt(e.target.value)}
                    className="w-full bg-black border border-editorial-border rounded-xl p-3 font-mono text-[0.6875rem] text-white focus:outline-none focus:border-red-500 h-24 placeholder:text-zinc-700 resize-none uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                      LENS_PRESET
                    </label>
                    <select
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
                    <label className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                      CAMERA_MOTION
                    </label>
                    <select
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
