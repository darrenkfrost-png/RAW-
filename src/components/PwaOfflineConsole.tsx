import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, HardDrive, Trash2 } from "lucide-react";
import { useToast } from "./common/Toast";

type SwState = "checking" | "active" | "installing" | "not_installed" | "unsupported";

const formatBytes = (n: number) =>
  n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${(n / 1024).toFixed(1)} KB`;

export default function PwaOfflineConsole() {
  const { addToast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  // null = not readable in this browser (no Cache API / no storage estimate)
  const [cacheCount, setCacheCount] = useState<number | null>(null);
  const [storageUsage, setStorageUsage] = useState<number | null>(null);
  const [swState, setSwState] = useState<SwState>("checking");

  // Network listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("Network connection restored. Back online.", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("You're offline. Pages you've already opened still work.", "info");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Real readings: how many caches the service worker holds and how much this
  // origin is using. Both are origin-wide figures — the browser cannot break
  // them down per asset type.
  const readStorage = useCallback(async () => {
    let count: number | null = null;
    let usage: number | null = null;
    try {
      if ("caches" in window) count = (await caches.keys()).length;
    } catch {
      count = null;
    }
    try {
      if (navigator.storage && typeof navigator.storage.estimate === "function") {
        const est = await navigator.storage.estimate();
        usage = typeof est.usage === "number" ? est.usage : null;
      }
    } catch {
      usage = null;
    }
    return { count, usage };
  }, []);

  useEffect(() => {
    let live = true;
    readStorage().then(({ count, usage }) => {
      if (!live) return;
      setCacheCount(count);
      setStorageUsage(usage);
    });

    if (!("serviceWorker" in navigator)) {
      setSwState("unsupported");
    } else {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (live) setSwState(reg?.active ? "active" : reg && (reg.installing || reg.waiting) ? "installing" : "not_installed");
        })
        .catch(() => {
          if (live) setSwState("not_installed");
        });
    }

    return () => {
      live = false;
    };
  }, [readStorage]);

  const clearCachedStates = async () => {
    if (isClearing) return;
    if (!isOnline) {
      addToast("You're offline — clearing the cache now would leave nothing to load from. Reconnect first.", "warning");
      return;
    }
    setIsClearing(true);
    try {
      const keys = "caches" in window ? await caches.keys() : [];
      const results = await Promise.all(keys.map((k) => caches.delete(k)));
      const removed = results.filter(Boolean).length;
      addToast(
        removed === 0
          ? "No local caches to clear."
          : `Cleared ${removed} local cache${removed === 1 ? "" : "s"}. Pages will load fresh from the network.`,
        "success"
      );
    } catch {
      addToast("Couldn't clear the local caches.", "error");
    }
    const { count, usage } = await readStorage();
    setCacheCount(count);
    setStorageUsage(usage);
    setIsClearing(false);
  };

  const swLabel: Record<SwState, string> = {
    checking: "CHECKING...",
    active: "ACTIVE",
    installing: "INSTALLING...",
    not_installed: "NOT_INSTALLED",
    unsupported: "UNSUPPORTED_IN_THIS_BROWSER",
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
        The site's service worker keeps a copy of the entry page, the build files it has already fetched, and images you have already loaded. Pages you have opened keep working without a signal; anything you have not visited yet still needs a connection.
      </p>

      {/* Local cache panel — every figure below is read from the browser */}
      <div className="bg-black/40 border border-editorial-border p-6 rounded-[2rem] space-y-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-red-500" />
          <h3 className="font-mono text-[0.6875rem] font-black uppercase tracking-widest text-[#f5f5f7]">
            LOCAL CACHE
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap justify-between gap-2 text-xs border-b border-white/[0.02] pb-2 text-zinc-400">
            <span>Service worker:</span>
            <span className={`font-mono ${swState === "active" ? "text-emerald-400" : "text-zinc-300"}`}>{swLabel[swState]}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-xs border-b border-white/[0.02] pb-2 text-zinc-400">
            <span>Caches held by this site:</span>
            <span className="font-mono text-white">{cacheCount === null ? "UNAVAILABLE" : cacheCount}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-xs border-b border-white/[0.02] pb-2 text-zinc-400">
            <span>Storage used by this site (all types):</span>
            <span className="font-mono text-white">{storageUsage === null ? "UNAVAILABLE" : formatBytes(storageUsage)}</span>
          </div>
        </div>

        <button
          onClick={clearCachedStates}
          disabled={isClearing || !isOnline}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-editorial-border rounded-xl font-mono text-[0.6875rem] uppercase font-black text-zinc-400 hover:text-white tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> {isClearing ? "CLEARING..." : "FLUSH_LOCAL_CACHE"}
        </button>
        {!isOnline && (
          <p className="text-[0.6875rem] font-mono text-amber-500/80 uppercase tracking-widest">
            Disabled while offline — the cache is all you have to load from.
          </p>
        )}
      </div>

    </div>
  );
}
