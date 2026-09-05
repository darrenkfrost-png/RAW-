import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { BookOpen, Film, HardDrive, RotateCw } from "lucide-react";
import ModalShell from "../components/ModalShell";
import LivingBookEngine from "../components/LivingBookEngine";
import VideoSequencer from "../components/VideoSequencer";
import PwaOfflineConsole from "../components/PwaOfflineConsole";
import { useUI } from "../context/UIContext";
import { useToast } from "../components/common/Toast";

export default function DeFrost() {
  const { addToast } = useToast();
  const { uiScale, visualFidelity } = useUI();

  // Desktop Date & Time state
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDateStr(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // System Apps open states
  const [openApps, setOpenApps] = useState<{ [key: string]: boolean }>({
    books: false,
    sequencer: false,
    offline: false
  });

  // Focus ordering (active app on top)
  const [appFocus, setAppFocus] = useState<string[]>(["books", "sequencer", "offline"]);

  // Wallpaper index
  const [activeWallpaperIdx, setActiveWallpaperIdx] = useState<number>(0);
  const wallpapersList = [
    { name: "Cosmic Charcoal", class: "from-zinc-950 via-[#0a0a0d] to-zinc-950" },
    { name: "Redwood Eclipse", class: "from-zinc-950 via-[#1a080c] to-zinc-950" },
    { name: "Midnight Nebula", class: "from-zinc-950 via-[#060a12] to-zinc-950" }
  ];

  const handleFocusApp = (appId: string) => {
    setAppFocus(prev => {
      const filtered = prev.filter(id => id !== appId);
      return [...filtered, appId]; // Append to the end (highest z-index)
    });
  };

  // Desktop icon / dock tap: open the app, or bring it to the front if it is
  // already open. Closing is the window's own X, so an open Storyboard is
  // never unmounted (and its scenes lost) by a stray second tap.
  const handleOpenApp = (appId: string) => {
    if (openApps[appId]) {
      handleFocusApp(appId);
      return;
    }
    setOpenApps(prev => ({ ...prev, [appId]: true }));
    handleFocusApp(appId);
    addToast(`SYS: Dispatched application sequence ID -> ${appId.toUpperCase()}`, "info");
  };

  const cycleWallpaper = () => {
    setActiveWallpaperIdx(prev => (prev + 1) % wallpapersList.length);
    addToast(`Wallpaper atmosphere shifted -> ${wallpapersList[(activeWallpaperIdx + 1) % wallpapersList.length].name}`, "success");
  };

  const activeWallpaper = wallpapersList[activeWallpaperIdx];

  return (
    <div className={`fixed inset-0 pt-20 pb-16 z-0 flex flex-col font-sans select-none overflow-hidden bg-gradient-to-br ${activeWallpaper.class} transition-all duration-[1200ms] ease-out`}>

      {/* Absolute background matrix grid overlay */}
      <div className="absolute inset-0 bg-[#ffffff]/[0.01] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none mix-blend-color-dodge z-0" />
      <div className="absolute inset-y-0 left-0 w-80 bg-gradient-to-r from-red-600/[0.02] to-transparent pointer-events-none mix-blend-color z-0" />
      <div className="absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-red-600/[0.02] to-transparent pointer-events-none mix-blend-color z-0" />

      {/* Dynamic Desktop Header Block */}
      <div className="relative z-10 px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pointer-events-none text-white overflow-hidden select-none shrink-0 border-b border-white/[0.03]">
        <div className="flex flex-wrap items-center gap-4 min-w-0">
          <div>
            <span className="block font-mono text-[0.6875rem] text-red-500 uppercase tracking-[0.4em] font-black">
              RAW_OFFICIAL // DESKTOP
            </span>
            <h1 className="text-xl font-black uppercase tracking-wider text-white">
              DeFrost OS Desktop
            </h1>
          </div>
          <div className="pointer-events-auto flex items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-xl sm:ml-4">
            <button
              onClick={cycleWallpaper}
              className="p-1 px-3 min-h-11 hover:bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-wider transition-all"
              title="Cycle Landscape Backdrops"
            >
              <RotateCw className="w-3 h-3" /> ATMOSPHERE: {activeWallpaper.name}
            </button>
          </div>
        </div>

        {/* Floating Clocks & Calendar */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">{dateStr}</span>
            <span className="font-mono text-xs font-black text-white mt-1 block tracking-wider uppercase">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Ambient Widgets & Desktop App Icons */}
      <div className="flex-1 relative z-10 p-8 flex flex-col md:flex-row gap-10 min-h-0 overflow-y-auto custom-scrollbar">

        {/* Left Hand: Desktop App icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-1 gap-6 shrink-0 md:w-64">
          {[
            { id: "books", label: "Living Books Manager", desc: "eBook Bookstore & Reader", icon: BookOpen, color: "from-cyan-500/20 to-blue-500/10 border-blue-500/30 text-blue-400" },
            { id: "sequencer", label: "Storyboard Studio", desc: "Video Sequencer Studio", icon: Film, color: "from-red-500/20 to-orange-500/10 border-red-500/30 text-red-400" },
            { id: "offline", label: "PWA Sync Desktop", desc: "Cache Deployment Unit", icon: HardDrive, color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400" }
          ].map(app => (
            <button
              key={app.id}
              onClick={() => handleOpenApp(app.id)}
              className="group p-5 bg-[#0a0a0e]/60 border border-white/5 backdrop-blur-xl rounded-3xl flex items-center gap-4 text-left hover:border-white/20 hover:bg-[#0c0c14]/85 transition-all duration-500"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${app.color} rounded-2xl flex items-center justify-center border group-hover:scale-105 transition-transform duration-500 shadow-md`}>
                <app.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-sans font-extrabold text-xs text-white uppercase tracking-wider group-hover:text-red-500 transition-colors leading-none">
                  {app.label}
                </h4>
                <p className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-tight mt-1">
                  {app.desc}
                </p>
                {openApps[app.id] && (
                  <span className="inline-block w-2 h-2 rounded-full bg-red-600 mt-2 border border-red-500 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Center Canvas area: houses widgets or simply empty to showcase wallpaper and allow window dragging */}
        <div className="flex-1 relative border border-white/[0.02] bg-[#ffffff]/[0.005] rounded-[3rem] p-8 overflow-hidden hidden md:flex flex-col justify-end">

          <div className="absolute top-8 left-8 p-6 bg-black/30 border border-white/[0.03] backdrop-blur-3xl rounded-[2rem] max-w-sm pointer-events-none select-none">
            <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest mb-2 font-black leading-none">
              ACTIVE_DESKTOP_WIDGET
            </span>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="block font-mono text-[0.6875rem] text-zinc-500 leading-none uppercase">UI_SCALE</span>
                <span className="font-mono text-[0.6875rem] text-white font-bold block mt-1">{(uiScale * 100).toFixed(0)}% SCALE</span>
              </div>
              <div>
                <span className="block font-mono text-[0.6875rem] text-zinc-500 leading-none uppercase">FIDELITY</span>
                <span className="font-mono text-[0.6875rem] text-white font-bold block mt-1">{visualFidelity}% RESOLUTION</span>
              </div>
            </div>
          </div>

          <div className="text-right pointer-events-none select-none space-y-2 max-w-md ml-auto">
            <span className="font-serif text-3xl md:text-4xl text-zinc-700/60 font-medium block uppercase tracking-tight italic">
              "The discipline is the system."
            </span>
            <span className="font-mono text-[0.6875rem] text-zinc-500/80 uppercase tracking-[0.25em] block pt-1 leading-none">
              SECURE DEPLOYMENT ENGINE // GLOBAL CORE
            </span>
          </div>
        </div>

      </div>

      {/* Floating center glass bottom dock */}
      <div className="relative z-10 pb-5 shrink-0 select-none pointer-events-none">
        <div className="mx-auto max-w-sm bg-neutral-950/80 border border-white/10 rounded-[2rem] p-3 shadow-depth-3 flex items-center justify-around gap-2 pointer-events-auto backdrop-blur-3xl">
          {[
            { id: "books", label: "Living Books Manager", icon: BookOpen },
            { id: "sequencer", label: "Storyboard Studio", icon: Film },
            { id: "offline", label: "PWA Sync Desktop", icon: HardDrive }
          ].map(app => {
            const isActive = openApps[app.id];
            return (
              <button
                key={app.id}
                onClick={() => handleOpenApp(app.id)}
                className={`p-3.5 min-h-11 min-w-11 rounded-2xl transition-all relative ${
                  isActive
                    ? "bg-red-600/10 text-red-500 border border-red-500/30 font-bold"
                    : "hover:bg-white/5 text-zinc-400 hover:text-white"
                }`}
                title={app.label}
                aria-label={isActive ? `${app.label} (open — bring to front)` : `Open ${app.label}`}
              >
                <app.icon className="w-5 h-5" />
                {isActive && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Applications in ModalShell containers matched with focus indices */}
      <AnimatePresence>

        {/* Living eBook Bookstore / Reader */}
        {openApps.books && (
          <ModalShell
            id="books"
            isOpen={openApps.books}
            onClose={() => setOpenApps(prev => ({ ...prev, books: false }))}
            onSelect={() => handleFocusApp("books")}
            zIndex={1001 + appFocus.indexOf("books")}
            title="Living Book Bookstore"
            icon={<BookOpen className="w-5 h-5" />}
            width="max-w-5xl"
            height="min(760px, 85svh)"
          >
            <LivingBookEngine />
          </ModalShell>
        )}

        {/* Video Sequencer / Storyboard Studio */}
        {openApps.sequencer && (
          <ModalShell
            id="sequencer"
            isOpen={openApps.sequencer}
            onClose={() => setOpenApps(prev => ({ ...prev, sequencer: false }))}
            onSelect={() => handleFocusApp("sequencer")}
            zIndex={1001 + appFocus.indexOf("sequencer")}
            title="Film Sequencer & Storyboard Studio"
            icon={<Film className="w-5 h-5" />}
            width="max-w-5xl"
            height="min(760px, 85svh)"
          >
            <VideoSequencer />
          </ModalShell>
        )}

        {/* PWA Sync Center page */}
        {openApps.offline && (
          <ModalShell
            id="offline"
            isOpen={openApps.offline}
            onClose={() => setOpenApps(prev => ({ ...prev, offline: false }))}
            onSelect={() => handleFocusApp("offline")}
            zIndex={1001 + appFocus.indexOf("offline")}
            title="Offline Cache Sync Desk"
            icon={<HardDrive className="w-5 h-5" />}
            width="max-w-4xl"
            height="min(650px, 85svh)"
          >
            <PwaOfflineConsole />
          </ModalShell>
        )}

      </AnimatePresence>

    </div>
  );
}
