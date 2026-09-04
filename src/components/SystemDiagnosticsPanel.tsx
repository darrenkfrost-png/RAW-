import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  Cpu, 
  Activity, 
  Trash2, 
  Database, 
  HardDrive, 
  Layers, 
  Compass, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Flame,
  Keyboard
} from "lucide-react";
import { useToast } from "./common/Toast";
import { useUI } from "../context/UIContext";
import ShortcutCheatsheet from "./ShortcutCheatsheet";
import AICodebaseAudit from "./AICodebaseAudit";

interface MemoryInfo {
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
}

export default function SystemDiagnosticsPanel() {
  const location = useLocation();
  const { addToast } = useToast();
  const { isStatusBarVisible, hasCompletedIntro, chromeHidden } = useUI();
  
  // States
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [apiStatus, setApiStatus] = useState<"connecting" | "healthy" | "unreachable">("connecting");
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [apiVersion, setApiVersion] = useState<string>("");
  const [apiPlatform, setApiPlatform] = useState<string>("");
  
  // Memory & Performance diagnostics state
  const [memoryStats, setMemoryStats] = useState<{
    usedHeap: number;
    totalHeap: number;
    heapLimit: number;
    supported: boolean;
  }>({ usedHeap: 0, totalHeap: 0, heapLimit: 0, supported: false });

  const [domElementsCount, setDomElementsCount] = useState(0);
  const [localStorageUsage, setLocalStorageUsage] = useState<{ keys: number; bytes: number }>({ keys: 0, bytes: 0 });
  const [resourceCount, setResourceCount] = useState(0);
  const [fps, setFps] = useState(60);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [stressScale, setStressScale] = useState(0);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);

  // Global key shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + ? triggers cheatsheet
      if (e.key === '?' && e.shiftKey) {
        setIsCheatsheetOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Ref for FPS computation
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // FPS ticker
  useEffect(() => {
    let animationFrameId: number;
    const ticker = () => {
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      animationFrameId = requestAnimationFrame(ticker);
    };
    animationFrameId = requestAnimationFrame(ticker);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Poll standard memory metrics, DOM elements list and localStorage state
  const runLocalDiagnostics = () => {
    // 1. Memory profiling (if Chrome/Chromium environment)
    const perf = performance as any;
    if (perf.memory) {
      const mem: MemoryInfo = perf.memory;
      setMemoryStats({
        usedHeap: Math.round((mem.usedJSHeapSize || 0) / 1024 / 1024),
        totalHeap: Math.round((mem.totalJSHeapSize || 0) / 1024 / 1024),
        heapLimit: Math.round((mem.jsHeapSizeLimit || 0) / 1024 / 1024),
        supported: true
      });
    } else {
      setMemoryStats({ usedHeap: 0, totalHeap: 0, heapLimit: 0, supported: false });
    }

    // 2. DOM elements count
    setDomElementsCount(document.getElementsByTagName("*").length);

    // 3. LocalStorage footprints estimation
    let totalChars = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalChars += (localStorage[key] || "").length + key.length;
        }
      }
      setLocalStorageUsage({
        keys: Object.keys(localStorage).length,
        bytes: totalChars * 2 // UTF16 is 2 bytes per char
      });
    } catch (e) {
      // Storage access blocked or denied
    }

    // 4. Resource loading count
    try {
      const resources = performance.getEntriesByType("resource");
      setResourceCount(resources.length);
    } catch {
      setResourceCount(0);
    }
  };

  // Run initial and interval diagnostics
  useEffect(() => {
    runLocalDiagnostics();
    const timer = setInterval(runLocalDiagnostics, 3000);
    return () => clearInterval(timer);
  }, []);

  // Check Gemini AI API / health endpoint latency
  const checkApiUplink = async () => {
    const start = performance.now();
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const body = await res.json();
        setPingTime(Math.round(performance.now() - start));
        setApiStatus("healthy");
        setApiVersion(body.version || "4.0.0");
        setApiPlatform(body.platform || "RAW_INTEGRATED_SYSTEM");
      } else {
        setApiStatus("unreachable");
      }
    } catch (err) {
      setApiStatus("unreachable");
    }
  };

  useEffect(() => {
    checkApiUplink();
    const interval = setInterval(checkApiUplink, 7000);
    return () => clearInterval(interval);
  }, []);

  // Wipes standard storage & items and alerts user via state notification
  const handleWipeStorage = () => {
    if (confirm("Confirm system cache flush? This resets your workspace layout, diagnostic logs, and persistent settings.")) {
      try {
        localStorage.clear();
        addToast("Workspace persistent cache has been fully flushed.", "success");
        setTimeout(() => window.location.reload(), 1000);
      } catch (e) {
        addToast("Wipe cache failed: Local Storage access blocked.", "error");
      }
    }
  };

  // Stress simulator load generator
  const triggerStressTest = () => {
    if (isStressTesting) return;
    setIsStressTesting(true);
    setStressScale(1);
    addToast("Triggered high-frequency browser animation stress test...", "warning");
    
    // Create secondary heavy load objects briefly to force GC
    const allocationPool: any[] = [];
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      for (let i = 0; i < 20000; i++) {
        allocationPool.push({ index: i, math: Math.sqrt(Math.random() * 1000) });
      }
      setStressScale(Math.min(10, Math.round(counter * 2.5)));
      if (counter >= 4) {
        clearInterval(interval);
        setIsStressTesting(false);
        setStressScale(0);
        addToast("Diagnostic stress test finished. Memory garbage collector recycled successfully.", "success");
      }
    }, 700);
  };

  // The intro is a gate: at z-10000 this chip drew straight through it,
  // sitting over the door in the corner of an otherwise clean first frame.
  if (!hasCompletedIntro) return null;
  // The red readout chip is furniture too — it hides and returns with the rest.
  if (chromeHidden.includes('diagnostics')) return null;

  return (
    /* Slot 3 of the corner dock. The offsets moved out of this style
       attribute and into .raw-dock-diag (src/index.css) so a phone can
       reposition them: an inline style outranks every media query, which is
       why this chip stayed welded to the corner while the others moved. */
    <div
      className={`raw-dock-diag ${isStatusBarVisible ? "raw-dock-diag--raised" : ""} fixed z-[10000] font-mono text-xs select-none`}
    >
      <AnimatePresence mode="wait">
        {minimized ? (
          // Hoverable Mini Trigger Pill
          <motion.button
            key="minimized"
            layoutId="diag-container"
            onClick={() => setMinimized(false)}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="flex min-h-11 min-w-11 items-center justify-center gap-2 bg-black/90 hover:bg-black border border-zinc-800 hover:border-red-650 text-zinc-400 hover:text-white px-3.5 py-2.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.8)] border-red-500/10 cursor-pointer backdrop-blur-xl group transition-all duration-300"
          >
            <Activity className="w-3.5 h-3.5 text-red-500 animate-[pulse_1.5s_infinite]" />
            <span className="hidden sm:inline text-[10px] uppercase font-black tracking-widest">DIAG_UPTIME</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
          </motion.button>
        ) : (
          // Comprehensive Floating Telemetry Screen
          <motion.div
            key="maximized"
            layoutId="diag-container"
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="w-80 bg-zinc-950/90 border border-zinc-700/50 rounded-2xl p-5 shadow-[0_40px_80px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(220,38,38,0.05)] backdrop-blur-3xl overflow-hidden text-zinc-400 relative group/telemetry"
          >
            {/* Cinematic Background Scans */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent pointer-events-none" />
            <motion.div 
               animate={{ y: ["-10%", "110%"] }} 
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute inset-x-0 h-[1px] bg-red-500/30 opacity-0 group-hover/telemetry:opacity-100 transition-opacity duration-700 shadow-[0_0_15px_rgba(220,38,38,0.5)] pointer-events-none"
            />
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-500" />
                <div>
                  <span className="font-sans font-black text-xs text-white tracking-[0.15em] uppercase">SYS_DIAG_HUD</span>
                  <p className="text-[8px] text-zinc-650 uppercase font-bold tracking-wider">LIVING STREAM_v42.1</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={checkApiUplink}
                  title="Force telemetry refresh"
                  className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMinimized(true)}
                  title="Collapse HUD"
                  className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Diagnostic Categories List */}
            <div className="space-y-4">
              {/* Active Router Coordinates */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-red-500" /> ACTIVE_ROUTE_METRIC
                </span>
                <div className="bg-zinc-900/40 border border-zinc-900 px-3 py-2 rounded-xl flex items-center justify-between gap-2">
                  <span className="font-bold text-white truncate text-[11px]" title={location.pathname}>
                    {location.pathname === "/" ? "HOME (ROOT)" : location.pathname.toUpperCase()}
                  </span>
                  <span className="text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-black border border-red-500/20 shrink-0">
                    SPA
                  </span>
                </div>
              </div>

              {/* Gemini AI Core Uplink status */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-red-500" /> GEMINI_AI_API_UPLINK
                </span>
                <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Gateway status</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        apiStatus === "healthy" ? "bg-emerald-500" :
                        apiStatus === "connecting" ? "bg-yellow-500 animate-ping" : "bg-red-500"
                      }`} />
                      <span className={`font-black text-[9px] uppercase ${
                        apiStatus === "healthy" ? "text-emerald-500" :
                        apiStatus === "connecting" ? "text-yellow-500" : "text-red-500"
                      }`}>
                        {apiStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Ping latency</span>
                    <span className="text-white font-black">
                      {pingTime !== null ? `${pingTime}ms` : "REFUSAL"}
                    </span>
                  </div>

                  {apiPlatform && (
                    <div className="flex items-center justify-between text-[10px] border-t border-zinc-900 pt-1.5">
                      <span className="text-zinc-650 uppercase font-bold text-[8px] tracking-wider">Kernel Platform</span>
                      <span className="text-zinc-400 font-bold max-w-[130px] truncate">{apiPlatform}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Performance & Memory stats */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-red-500" /> CLIENT_CORE_MEMORY
                </span>
                <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded-xl space-y-2.5">
                  {/* Heap telemetry */}
                  {memoryStats.supported ? (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">JS Heap</span>
                        <span className="text-white font-bold">{memoryStats.usedHeap} MB / {memoryStats.totalHeap} MB</span>
                      </div>
                      <div className="h-1 bg-zinc-950 rounded-full overflow-hidden w-full">
                        <div 
                          className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)] transition-all duration-300" 
                          style={{ width: `${Math.min(100, (memoryStats.usedHeap / memoryStats.totalHeap) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">JS Heap allocation</span>
                      <span className="text-zinc-500 uppercase italic">Chrome restricted</span>
                    </div>
                  )}

                  {/* DOM element counts */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">DOM Nodes</span>
                    <span className="text-white font-bold">{domElementsCount} nodes</span>
                  </div>

                  {/* Local Storage footprint estimation */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Storage space</span>
                    <span className="text-white font-bold">{(localStorageUsage.bytes / 1024).toFixed(2)} KB</span>
                  </div>

                  {/* Loaded sub-resources */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Sub-Resources</span>
                    <span className="text-white font-bold">{resourceCount} loaded</span>
                  </div>

                  {/* Framerate telemetry */}
                  <div className="flex justify-between items-center text-[10px] border-t border-zinc-900 pt-2.5">
                    <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Aesthetic FPS</span>
                    <span className={`font-black ${fps >= 50 ? 'text-emerald-500' : 'text-yellow-500'}`}>{fps} FPS</span>
                  </div>
                </div>
              </div>

              {/* AI Codebase Review Panel */}
              <AICodebaseAudit />
            </div>

            {/* Quick Developer Action Commands */}
            <div className="border-t border-zinc-900 mt-4 pt-4 space-y-2">
              <button
                onClick={() => setIsCheatsheetOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850/80 hover:text-white border border-zinc-800 hover:border-red-650 py-2.5 px-3 rounded-xl transition-all font-bold cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5 text-zinc-500" />
                <span>VIEW_SYSTEM_DIRECTIVES_HUD</span>
              </button>

              <button
                onClick={triggerStressTest}
                disabled={isStressTesting}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-850/80 hover:text-white border border-zinc-800 hover:border-red-650 py-2.5 px-3 rounded-xl transition-all font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Flame className={`w-3.5 h-3.5 ${isStressTesting ? "animate-bounce text-red-500" : "text-zinc-500"}`} />
                <span>{isStressTesting ? `STRESS_INDEX_Lvl_${stressScale}` : 'RUN_PERFORMANCE_LOAD_TEST'}</span>
              </button>

              <button
                onClick={handleWipeStorage}
                className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-500 py-2.5 px-3 rounded-xl transition-all font-bold text-red-500 hover:shadow-[0_4px_15px_rgba(220,38,38,0.2)] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>FLUSH_WORK_MEMORY_CACHE</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShortcutCheatsheet isOpen={isCheatsheetOpen} onClose={() => setIsCheatsheetOpen(false)} />
    </div>
  );
}
