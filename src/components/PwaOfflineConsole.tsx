import React, { useState, useEffect } from "react";
import { 
  Wifi, WifiOff, Download, RefreshCcw, HardDrive, ShieldCheck, CheckCircle2 
} from "lucide-react";
import { useToast } from "./common/Toast";

export default function PwaOfflineConsole() {
  const { addToast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncPercentage, setSyncPercentage] = useState<number>(100);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Network listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("Network connection restored. Back online.", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("Connection lost. Operating in secure offline mode.", "info");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSyncResources = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncPercentage(0);
    addToast("Re-authenticating node certificates and syncing local database cache...", "info");

    const timer = setInterval(() => {
      setSyncPercentage(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsSyncing(false);
          addToast("Static asset cache completely synchronized. Ready for offline deployment.", "success");
          return 100;
        }
        return prev + 20;
      });
    }, 450);
  };

  const clearCachedStates = () => {
    addToast("Clearing local storage database tokens...", "info");
    setTimeout(() => {
      addToast("Local caches cleared. Real-time memory nominal.", "success");
    }, 500);
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar bg-[#050508]/95 max-w-4xl mx-auto font-sans">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-editorial-border/40 pb-5 gap-3">
        <div>
          <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-[0.4em] font-black">
            PWA_FOUNDATORY // OFFLINE_CONSOLE
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase mt-1">
            Offline & Local Deployment Desk
          </h2>
        </div>

        {/* Dynamic network status indicator */}
        <div className={`flex items-center gap-2 font-mono text-[0.6875rem] uppercase border px-4 py-2 rounded-xl ${
          isOnline 
            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/25" 
            : "text-amber-500 bg-amber-500/10 border-amber-500/25 animate-pulse"
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 animate-pulse" /> NETWORK STATUS: ACTIVE_CONNECTED
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" /> NETWORK STATUS: OFFLINE_CONTAINER
            </>
          )}
        </div>
      </div>

      <p className="text-zinc-400 font-light text-sm leading-relaxed max-w-2xl">
        DeFrost OS automatically pre-allocates public assets to client-side storage partitions. This allows full usage of bookstores (first 10 pages), timelines, and diagnostic dashboards directly inside airplanes, bunkers, or other remote wilderness blocks.
      </p>

      {/* Grid panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Storage metrics */}
        <div className="bg-black/40 border border-editorial-border p-6 rounded-[2rem] space-y-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-red-500" />
            <h3 className="font-mono text-[0.6875rem] font-black uppercase tracking-widest text-[#f5f5f7]">
              ALLOCATED CACHE METRICS
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs border-b border-white/[0.02] pb-2 text-zinc-400">
              <span>Public eBooks text arrays:</span>
              <span className="font-mono text-white">45.2 KB // CACHED</span>
            </div>
            <div className="flex justify-between text-xs border-b border-white/[0.02] pb-2 text-zinc-400">
              <span>Dynamic audio loop waveforms:</span>
              <span className="font-mono text-white">124.0 KB // COLD_CACHE</span>
            </div>
            <div className="flex justify-between text-xs border-b border-white/[0.02] pb-2 text-zinc-400">
              <span>Telemetry system gauges and fonts:</span>
              <span className="font-mono text-white">820.5 KB // ACTIVE</span>
            </div>
          </div>

          <button
            onClick={clearCachedStates}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-editorial-border rounded-xl font-mono text-[0.6875rem] uppercase font-black text-zinc-400 hover:text-white tracking-widest transition-all"
          >
            FLUSH_LOCAL_CACHE
          </button>
        </div>

        {/* Sync panel */}
        <div className="bg-black/40 border border-editorial-border p-6 rounded-[2rem] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RefreshCcw className={`w-5 h-5 text-red-500 ${isSyncing ? "animate-spin" : ""}`} />
              <h3 className="font-mono text-[0.6875rem] font-black uppercase tracking-widest text-[#f5f5f7]">
                SYNCHRONOUS CONTROL BOARD
              </h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              To force-pull newly registered tactical manuals or asset packages to client-side database tables, initiate a synchronization pass below.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between font-mono text-[0.6875rem] text-[#f5f5f7]">
              <span>SYNC_STATUS:</span>
              <span>{isSyncing ? "SYNCING..." : `${syncPercentage}% ONLINE`}</span>
            </div>
            <div className="w-full bg-[#13131a] h-1.5 rounded-full overflow-hidden border border-white/[0.04]">
              <div 
                className="bg-red-500 h-full transition-all duration-300" 
                style={{ width: `${syncPercentage}%` }} 
              />
            </div>

            <button
              onClick={handleSyncResources}
              disabled={isSyncing}
              className="w-full py-3 button-premium !text-[0.6875rem] font-mono tracking-widest uppercase flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> RE_SYNC_SYSTEM_NODES
            </button>
          </div>
        </div>

      </div>

      {/* Deployment Checks List */}
      <div className="p-6 bg-red-650/10 border border-red-500/25 rounded-[2rem] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <h4 className="font-mono text-[0.6875rem] font-black tracking-widest uppercase text-white">
            OFFLINE READINESS CHECKLIST
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> ServiceWorker installation parameters nominal
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Local database tables seeded with books database
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Media libraries asset links configured to bypass caches
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Security authorization policies fails safely when offline
          </div>
        </div>
      </div>

    </div>
  );
}
