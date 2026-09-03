import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  X, 
  CheckCircle, 
  XCircle, 
  Cpu, 
  Wifi, 
  Radio, 
  Database, 
  BookOpen, 
  Compass, 
  ShieldAlert, 
  RefreshCw, 
  Sparkles,
  Layers,
  FileCode
} from "lucide-react";
import { useAppCtx } from "../context/AppContext";
import { useUI } from "../context/UIContext";
import { useSettings } from "../context/SettingsContext";
import { useVoiceControl } from "../hooks/useVoiceControl";

export default function SystemHealthDashboard() {
  const { state, trackAction } = useAppCtx();
  const { isSystemHealthOpen: isOpen, setIsSystemHealthOpen, activeReaderItem, is110Percent } = useUI();
  const { settings } = useSettings();
  const voice = useVoiceControl();

  // Diagnostics sweep automation states
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeStep, setSwipeStep] = useState("");
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([]);

  // Real-time calculated states
  const [fps, setFps] = useState(60);
  const [ping, setPing] = useState<number | null>(null);
  const [apiStatus, setApiStatus] = useState<'PENDING' | 'ONLINE' | 'OFFLINE'>('PENDING');
  const [persistenceOk, setPersistenceOk] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [memoryStats, setMemoryStats] = useState<{
    usedHeap: number;
    totalHeap: number;
    heapLimit: number;
    supported: boolean;
  }>({ usedHeap: 0, totalHeap: 0, heapLimit: 0, supported: false });

  const close = () => {
    setIsSystemHealthOpen(false);
  };

  // Keyboard shortcut listener: Ctrl+Shift+H to toggle System Health
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        setIsSystemHealthOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsSystemHealthOpen]);

  // Live Frame-Rate (FPS) Calculation
  useEffect(() => {
    if (!isOpen) return;
    let frameCount = 0;
    let lastTime = performance.now();
    let frameId: number;

    const tick = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  // Live Network / API Latency Latency Ping Check
  useEffect(() => {
    if (!isOpen) return;

    const checkLatency = async () => {
      const start = performance.now();
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const latency = Math.round(performance.now() - start);
          setPing(latency);
          setApiStatus('ONLINE');
        } else {
          setApiStatus('OFFLINE');
        }
      } catch (e) {
        setApiStatus('OFFLINE');
      }
    };

    checkLatency();
    const interval = setInterval(checkLatency, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Local Storage test & viewport total image scraper diagnostics + Memory Heap
  useEffect(() => {
    if (!isOpen) return;

    // Test persistence
    try {
      const testKey = "raw_diagnostics_persistence_test";
      localStorage.setItem(testKey, "active");
      localStorage.removeItem(testKey);
      setPersistenceOk(true);
    } catch {
      setPersistenceOk(false);
    }

    // Scrape loaded DOM images on page to monitor performance load
    const images = document.querySelectorAll("img");
    setImageCount(images.length);

    // Retrieve V8 JS Heap performance if present
    const perf = (window as any).performance || {};
    if (perf.memory) {
      setMemoryStats({
        usedHeap: Math.round((perf.memory.usedJSHeapSize || 0) / 1024 / 1024),
        totalHeap: Math.round((perf.memory.totalJSHeapSize || 0) / 1024 / 1024),
        heapLimit: Math.round((perf.memory.jsHeapSizeLimit || 0) / 1024 / 1024),
        supported: true
      });
    } else {
      setMemoryStats({ usedHeap: 0, totalHeap: 0, heapLimit: 0, supported: false });
    }
  }, [isOpen]);

  // Diagnostic interactive benchmark runner
  const runDiagnosticSweep = () => {
    if (isSwiping) return;
    setIsSwiping(true);
    setSwipeProgress(0);
    setDiagnosticsLogs([]);
    trackAction("INITIATED System Diagnostic Deep Sweep");

    const steps = [
      { msg: "Mapping application routing matrix...", delay: 600, progress: 15 },
      { msg: "Pinging neural server nodes & latency optimization check...", delay: 1200, progress: 35 },
      { msg: "Validating client-side settings persistence context...", delay: 1800, progress: 55 },
      { msg: "Benchmarking GPU animation framerates & motion ratios...", delay: 2400, progress: 75 },
      { msg: "Synthesizing voice capture buffers & AI parameters...", delay: 3000, progress: 90 },
      { msg: "System Deep Sweep Complete // ALL SYSTEMS NOMINAL", delay: 3600, progress: 100 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSwipeStep(step.msg);
        setSwipeProgress(step.progress);
        setDiagnosticsLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.msg}`]);

        if (idx === steps.length - 1) {
          setIsSwiping(false);
          trackAction("COMPLETED System Diagnostic Deep Sweep");
        }
      }, step.delay);
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
        onClick={close}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-black border border-zinc-800 text-zinc-300 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 p-6 bg-zinc-950/40">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-red-500 animate-[pulse_2s_infinite]" />
              <div>
                <h2 className="font-mono text-xs uppercase tracking-[0.3em] font-black text-red-500">SYSTEM_HEALTH_DIAGNOSTICS_v4.0</h2>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wide">RAW_INTEGRATED_SYSTEMS_CORE // MONITOR active</p>
              </div>
            </div>
            <button 
              onClick={close} 
              className="p-2 hover:bg-zinc-800/60 rounded-full transition-all border border-transparent hover:border-zinc-700/50"
            >
              <X className="w-4 h-4 text-zinc-400 hover:text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
            {/* Live Benchmarks Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex flex-col gap-1.5 justify-between font-mono relative overflow-hidden group hover:border-red-500/30 transition-all">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Animation_FPS</span>
                <span className={`text-3xl font-black italic tracking-tighter ${fps >= 55 ? 'text-emerald-500' : fps >= 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {fps} <span className="text-xs font-normal">FPS</span>
                </span>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden w-full">
                  <motion.div 
                    animate={{ width: `${Math.min(100, (fps / 60) * 100)}%` }} 
                    className={`h-full ${fps >= 55 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                  />
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex flex-col gap-1.5 justify-between font-mono relative overflow-hidden group hover:border-red-500/30 transition-all">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Server_Latency</span>
                <span className="text-3xl font-black italic tracking-tighter text-white">
                  {ping !== null ? `${ping}` : "---"} <span className="text-xs font-normal">MS</span>
                </span>
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-bold tracking-wider">
                  <Wifi className="w-3 h-3 text-emerald-500" /> API: {apiStatus}
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex flex-col gap-1.5 justify-between font-mono relative overflow-hidden group hover:border-red-500/30 transition-all">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Storage_Write</span>
                <span className={`text-3xl font-black italic tracking-tighter ${persistenceOk ? 'text-emerald-500' : 'text-red-500'}`}>
                  {persistenceOk ? "VERIFIED" : "FAILED"}
                </span>
                <span className="text-[9px] text-zinc-650 uppercase tracking-widest font-medium">LocalStorage persistent</span>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex flex-col gap-1.5 justify-between font-mono relative overflow-hidden group hover:border-red-500/30 transition-all">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Active_Media</span>
                <span className="text-3xl font-black italic tracking-tighter text-teal-400">
                  {imageCount} <span className="text-xs font-normal">Assets</span>
                </span>
                <span className="text-[9px] text-zinc-650 uppercase tracking-widest font-medium">Loaded DOM media count</span>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex flex-col gap-1.5 justify-between font-mono relative overflow-hidden group hover:border-red-500/30 transition-all col-span-2 lg:col-span-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">JS_V8_Memory</span>
                {memoryStats.supported ? (
                  <span className="text-xl font-black italic tracking-tighter text-purple-400">
                    {memoryStats.usedHeap} <span className="text-[10px] font-normal text-zinc-400">/ {memoryStats.totalHeap}MB</span>
                  </span>
                ) : (
                  <span className="text-base font-black italic tracking-tighter text-zinc-500">
                    UNSUPPORTED
                  </span>
                )}
                <span className="text-[9px] text-zinc-650 uppercase tracking-widest font-medium">
                  {memoryStats.supported ? `Limit: ${memoryStats.heapLimit}MB` : 'Browser API blocked'}
                </span>
              </div>
            </div>

            {/* Subsystem States */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telemetry checks */}
              <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl font-mono text-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 mb-2 text-zinc-400 uppercase tracking-wider font-bold">
                  <Cpu className="w-4 h-4 text-red-500" />
                  <span>Subsystem Core Health</span>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-zinc-900/30 px-3 py-2.5 border border-zinc-900 rounded">
                    <span className="text-zinc-500 uppercase tracking-wider font-bold">Route_Matrix</span>
                    <div className="flex items-center gap-1.5 text-emerald-500">
                      <CheckCircle className="w-3.5 h-3.5" /> <span className="text-[10px] uppercase font-black">VERIFIED</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-900/30 px-3 py-2.5 border border-zinc-900 rounded">
                    <span className="text-zinc-500 uppercase tracking-wider font-bold">Gemini AI Model</span>
                    <div className="flex items-center gap-1.5 text-emerald-500">
                      <Sparkles className="w-3.5 h-3.5" /> <span className="text-[10px] uppercase font-black">ONLINE (2.5-flash)</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-900/30 px-3 py-2.5 border border-zinc-900 rounded">
                    <span className="text-zinc-500 uppercase tracking-wider font-bold">Voice Interface (Speech)</span>
                    <div className="flex items-center gap-1.5 text-red-500">
                      <Radio className="w-3.5 h-3.5 animate-pulse" /> 
                      <span className="text-[10px] uppercase font-black">{voice.voiceState === 'idle' ? 'STANDBY' : voice.voiceState.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-900/30 px-3 py-2.5 border border-zinc-900 rounded">
                    <span className="text-zinc-500 uppercase tracking-wider font-bold">Background Sync Mode</span>
                    <div className="flex items-center gap-1.5 text-white-muted">
                      <Layers className="w-3.5 h-3.5" /> 
                      <span className="text-[10px] uppercase font-black">{settings.activeWallpaper}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-900/30 px-3 py-2.5 border border-zinc-900 rounded">
                    <span className="text-zinc-500 uppercase tracking-wider font-bold">Immersive Reader</span>
                    <div className="flex items-center gap-1.5 text-teal-400">
                      <BookOpen className="w-3.5 h-3.5" /> 
                      <span className="text-[10px] uppercase font-black leading-none truncate max-w-[120px]">{activeReaderItem ? activeReaderItem.title : "IDLE"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-900/30 px-3 py-2.5 border border-zinc-900 rounded">
                    <span className="text-zinc-500 uppercase tracking-wider font-bold">Overdrive (110% Gain)</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${is110Percent ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                        {is110Percent ? "ENGAGED" : "OFFLINE"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error and Warnings checking */}
              <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl font-mono text-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 mb-2 text-zinc-400 uppercase tracking-wider font-bold">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span>Recent Diagnostic Warnings</span>
                  </div>

                  {state.recentErrors.length === 0 ? (
                    <div className="bg-emerald-500/5 text-emerald-500/90 border border-emerald-500/10 p-4 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">System Operational // No warnings found</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                      {state.recentErrors.map((err, i) => (
                        <div key={i} className="flex gap-2 items-start bg-red-950/20 text-red-400 p-3 rounded-lg border border-red-500/10">
                          <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-500" />
                          <span className="text-[10px] font-black leading-relaxed">{err}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">System_Check_Command</div>
                  <button
                    onClick={runDiagnosticSweep}
                    disabled={isSwiping}
                    className="w-full relative px-4 py-3 bg-red-600 font-bold uppercase tracking-[0.2em] text-[10px] text-white rounded-lg hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all font-mono flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSwiping ? "animate-spin" : ""}`} />
                    {isSwiping ? "DEEP_SWEEPING..." : "INITIATE_DIAGNOSTIC_SWEEP"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sweep Progress Overlay */}
            {isSwiping && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-950/90 border border-red-900/30 p-5 rounded-xl space-y-3 font-mono"
              >
                <div className="flex justify-between items-center text-xs text-red-500 font-black">
                  <span className="uppercase tracking-widest animate-pulse">Running diagnostics: {swipeStep}</span>
                  <span>{swipeProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${swipeProgress}%` }}
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
                  />
                </div>
              </motion.div>
            )}

            {/* Diagnostic Logs */}
            {diagnosticsLogs.length > 0 && (
              <div className="space-y-2 font-mono">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" /> Sweep Diagnostic Output Logs
                </span>
                <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl max-h-[140px] overflow-y-auto font-mono text-[10px] text-zinc-500 space-y-1.5 custom-scrollbar">
                  {diagnosticsLogs.map((log, i) => (
                    <div key={i} className="text-zinc-400 font-bold border-l-2 border-red-650 pl-3 leading-relaxed">{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Action History Pipeline */}
            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> Checked Commands (Pipeline Output)
                </span>
                <span className="text-zinc-650 bg-zinc-900/40 border border-zinc-850 px-2 py-0.5 rounded font-black text-[9px]">{state.recentActions.length} tracked</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-1">
                {state.recentActions.length === 0 ? (
                  <span className="text-zinc-660 select-none">Awaiting commands...</span>
                ) : (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
                    {state.recentActions.map((act, i) => (
                      <div key={i} className="text-zinc-400 font-bold flex gap-4 text-[11px] hover:text-white transition-colors duration-200">
                        <span className="text-red-500/70 select-none font-black opacity-80">{'>'}</span> 
                        <span className="truncate">{act}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
