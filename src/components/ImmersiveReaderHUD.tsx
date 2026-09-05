import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useUI } from "../context/UIContext";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "./common/Toast";

export default function ImmersiveReaderHUD() {
  const { activeReaderItem, setActiveReaderItem } = useUI();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(16); // px
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [speechRate, setSpeechRate] = useState(settings.voiceRate || 1.0);
  const [speechPitch, setSpeechPitch] = useState(settings.voicePitch || 1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");

  // Rate/pitch the current utterance was started with, so slider edits (and only slider edits) restart speech
  const appliedVoiceParamsRef = useRef({ rate: speechRate, pitch: speechPitch });

  // Fixed target heights for the 15 pulse bars, dealt once so re-renders never restart the animation
  const pulseBarHeights = useMemo(
    () => Array.from({ length: 15 }, (_, i) => 14 + ((i * 7) % 11) * 2.4),
    []
  );

  // Discover and list available browser speech voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      const saved = localStorage.getItem("raw_reader_voice_uri");
      if (saved && voices.some(v => v.voiceURI === saved)) {
        setSelectedVoiceURI(saved);
      } else if (voices.length > 0) {
        // Preference fallback order for rich English system voices
        const defaultVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) ||
                             voices.find(v => v.lang.startsWith("en") && v.name.includes("Natural")) ||
                             voices.find(v => v.lang.startsWith("en")) ||
                             voices[0];
        if (defaultVoice) {
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      }
    };

    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
  }, []);

  const sections = useMemo(() => {
    if (!activeReaderItem) return [];
    // A reader item may carry its own titled sections (e.g. the Manifesto); otherwise fall back to the nutrient layout
    const own = Array.isArray(activeReaderItem.sections)
      ? activeReaderItem.sections.map((s: any) => ({ title: String(s?.title || ""), text: String(s?.text || "") }))
      : null;
    const list = own && own.length > 0 ? own : [
      { title: "MOLECULAR OVERVIEW", text: activeReaderItem.overview || "" },
      { title: "OPERATIONAL MECHANISM", text: activeReaderItem.whatItDoes || "" },
      { title: "KEY BENEFITS", text: (activeReaderItem.keyBenefits || []).join(". ") },
      { title: "DEPLOYMENT STRATEGY", text: activeReaderItem.suggestedUse || "" },
      { title: "RESPONSIBILITY DIRECTIVE", text: activeReaderItem.responsibleUse || "" }
    ];
    return list.filter((s: { title: string; text: string }) => s.text && s.text.trim() !== "");
  }, [activeReaderItem]);

  const activeSection = sections[activeSectionIdx];

  // Every document opens at its first section, stopped
  useEffect(() => {
    setActiveSectionIdx(0);
    setIsPlaying(false);
  }, [activeReaderItem]);

  // Stop synthesis when component unmounts or active item changes
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeReaderItem]);

  // Debounced speech update when rate/pitch are adjusted while reading.
  // Only a real rate/pitch change may restart the utterance: Play, Resume, Next and auto-advance must not.
  useEffect(() => {
    const applied = appliedVoiceParamsRef.current;
    if (applied.rate === speechRate && applied.pitch === speechPitch) return;
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      // Re-trigger playback from current position to apply updated speed/pitch parameters
      startReading(activeSectionIdx);
    }, 280); // 280ms debounce window avoids constant speech resets while dragging sliders

    return () => clearTimeout(timer);
  }, [speechRate, speechPitch]);

  // Handle Speech Synthesis Play / Pause
  const startReading = (index: number) => {
    if (!("speechSynthesis" in window)) {
      addToast("Speech synthesis not supported in this browser.", "error");
      return;
    }

    window.speechSynthesis.cancel();

    if (index < 0 || index >= sections.length) {
      setIsPlaying(false);
      return;
    }

    const section = sections[index];
    const textToSpeak = `${section.title}. ${section.text}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    appliedVoiceParamsRef.current = { rate: speechRate, pitch: speechPitch };

    // Select the chosen voice, falling back to the first English voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith("en"));
    }
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onend = () => {
      if (index + 1 < sections.length) {
        setActiveSectionIdx(index + 1);
        startReading(index + 1);
      } else {
        setIsPlaying(false);
        addToast("Read-aloud sequence completed.", "success");
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== "interrupted") {
        setIsPlaying(false);
        console.error("SpeechSynthesis error:", e);
      }
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const pauseReading = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const resumeReading = () => {
    if ("speechSynthesis" in window) {
      const applied = appliedVoiceParamsRef.current;
      const paramsUnchanged = applied.rate === speechRate && applied.pitch === speechPitch;
      if (window.speechSynthesis.paused && paramsUnchanged) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        startReading(activeSectionIdx);
      }
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      pauseReading();
    } else {
      resumeReading();
    }
  };

  const handleNext = () => {
    if (activeSectionIdx + 1 < sections.length) {
      const nextIdx = activeSectionIdx + 1;
      setActiveSectionIdx(nextIdx);
      if (isPlaying) {
        startReading(nextIdx);
      }
    }
  };

  const handlePrev = () => {
    if (activeSectionIdx > 0) {
      const prevIdx = activeSectionIdx - 1;
      setActiveSectionIdx(prevIdx);
      if (isPlaying) {
        startReading(prevIdx);
      }
    }
  };

  const handleClose = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveReaderItem(null);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeReaderItem) return;
      if (e.key === "Escape") handleClose();
      // Leave Space to focused form controls and buttons so they activate normally
      const tag = (e.target as HTMLElement | null)?.tagName;
      const onControl = tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || tag === "BUTTON";
      if (e.key === " " && !onControl) {
        e.preventDefault();
        handleTogglePlay();
      }
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReaderItem, isPlaying, activeSectionIdx, sections]);

  // Command Engine Registration Mapping
  useEffect(() => {
    if (activeReaderItem) {
      // Connect commands dynamically to window
      (window as any).readerControls = {
        play: resumeReading,
        pause: pauseReading,
        next: handleNext,
        prev: handlePrev,
        close: handleClose,
        zoomIn: () => setFontSize(prev => Math.min(24, prev + 2)),
        zoomOut: () => setFontSize(prev => Math.max(12, prev - 2))
      };
    } else {
      delete (window as any).readerControls;
    }
  }, [activeReaderItem, activeSectionIdx, isPlaying]);

  return (
    <AnimatePresence>
      {activeReaderItem && (
      <motion.div
        key="immersive-reader"
        role="dialog"
        aria-modal="true"
        aria-label={`Reader: ${activeReaderItem?.name || "document"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-[#030303]/95 backdrop-blur-2xl flex flex-col justify-between font-sans text-editorial-text select-none"
      >
        {/* HUD Header Bar */}
        <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-editorial-border/40 flex items-center justify-between gap-4 shrink-0 bg-editorial-surface/40 backdrop-blur-md">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 shrink-0 bg-red-600/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 animate-pulse">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-[0.4em] font-black">
                RAW_IMMERSIVE_DOC_READER
              </span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-white truncate">
                {activeReaderItem?.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Font Control */}
            <div className="flex items-center bg-zinc-900/60 border border-editorial-border rounded-xl p-1 gap-1">
              <button
                onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Decrease Font Size (Zoom Out)"
                aria-label="Decrease font size"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="font-mono text-[0.6875rem] w-12 text-center text-zinc-400 px-1">
                {fontSize}PX
              </div>
              <button
                onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title="Increase Font Size (Zoom In)"
                aria-label="Increase font size"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-3 min-h-11 min-w-11 bg-red-600/10 hover:bg-red-600 hover:text-white border border-red-500/20 rounded-xl text-red-500 transition-all outline-none"
              title="Close System Reader (ESC)"
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Ambient Reading Core */}
        <main className="flex-1 overflow-y-auto px-6 md:px-16 py-12 flex flex-col items-center justify-center relative max-w-4xl mx-auto w-full custom-scrollbar">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {sections.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 transition-all duration-500 rounded-full ${
                  idx === activeSectionIdx
                    ? "w-8 bg-red-600 shadow-[0_0_10px_#dc2626]"
                    : "w-2 bg-zinc-800"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSectionIdx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-8 select-text w-full my-auto"
            >
              <span className="font-mono text-[0.6875rem] text-red-500 tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] font-black uppercase inline-block border-y border-red-500/10 py-1.5 px-6">
                {activeSection?.title}
              </span>

              <p
                style={{ fontSize: `${fontSize}px` }}
                className="font-light leading-relaxed text-editorial-text max-w-3xl mx-auto transition-all duration-300 drop-shadow-sm first-letter:text-4xl first-letter:font-black first-letter:text-red-500 first-letter:mr-2 first-letter:float-left"
              >
                {activeSection?.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Voice Pulse Visualizer */}
          <div className="mt-12 h-8 flex items-center gap-1">
            {isPlaying ? (
              pulseBarHeights.map((peak, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [8, peak, 8],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                  className="w-1 bg-red-600 rounded-full"
                />
              ))
            ) : (
              <div className="text-[0.6875rem] font-mono text-zinc-600 tracking-widest uppercase">
                READING_PAUSED
              </div>
            )}
          </div>
        </main>

        {/* HUD Controls Bottom Dock */}
        <footer className="px-4 sm:px-8 py-4 sm:py-6 border-t border-editorial-border/40 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 bg-editorial-surface/40 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 min-w-0 max-w-full">
            <div className="font-mono text-[0.6875rem] text-zinc-500">
              SECTION {activeSectionIdx + 1} OF {sections.length}
            </div>

            {/* Speed & Pitch Calibration Console */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-zinc-950/85 border border-editorial-border/40 rounded-xl px-4 py-2 shadow-inner hover:border-zinc-800 transition-all max-w-full">
              {/* Rate Slider */}
              <div className="flex items-center gap-3">
                <label htmlFor="reader-rate" className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest leading-none">
                  RATE
                </label>
                <input
                  id="reader-rate"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => {
                    setSpeechRate(parseFloat(e.target.value));
                  }}
                  className="accent-red-600 cursor-pointer h-11 w-28 min-w-[112px] outline-none"
                  title="Speech rate"
                  aria-label="Speech rate"
                />
                <button
                  onClick={() => setSpeechRate(1.0)}
                  className={`font-mono text-[0.6875rem] transition-all px-1 rounded-sm min-h-11 ${
                    Math.abs(speechRate - 1.0) < 0.01
                      ? "text-zinc-600 pointer-events-none cursor-default font-normal"
                      : "text-red-500 hover:text-red-400 cursor-pointer font-bold"
                  }`}
                  title="Reset voice rate to 1.0x"
                >
                  {speechRate.toFixed(1)}x
                </button>
              </div>

              {/* Slider Divider Accent */}
              <div className="hidden sm:block h-10 w-px bg-editorial-border/20 self-center" />

              {/* Pitch Slider */}
              <div className="flex items-center gap-3">
                <label htmlFor="reader-pitch" className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest leading-none">
                  PITCH
                </label>
                <input
                  id="reader-pitch"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechPitch}
                  onChange={(e) => {
                    setSpeechPitch(parseFloat(e.target.value));
                  }}
                  className="accent-red-600 cursor-pointer h-11 w-28 min-w-[112px] outline-none"
                  title="Speech pitch"
                  aria-label="Speech pitch"
                />
                <button
                  onClick={() => setSpeechPitch(1.0)}
                  className={`font-mono text-[0.6875rem] transition-all px-1 rounded-sm min-h-11 ${
                    Math.abs(speechPitch - 1.0) < 0.01
                      ? "text-zinc-600 pointer-events-none cursor-default font-normal"
                      : "text-red-500 hover:text-red-400 cursor-pointer font-bold"
                  }`}
                  title="Reset voice pitch to 1.0x"
                >
                  {speechPitch.toFixed(1)}x
                </button>
              </div>
            </div>

            {/* Voice select Dropdown */}
            {availableVoices.length > 0 && (
              <div className="flex items-center gap-3 animate-fade-in">
                <label htmlFor="reader-voice" className="font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-widest">
                  VOICE:
                </label>
                <select
                  id="reader-voice"
                  aria-label="Read-aloud voice"
                  value={selectedVoiceURI}
                  onChange={(e) => {
                    const newVoiceURI = e.target.value;
                    setSelectedVoiceURI(newVoiceURI);
                    localStorage.setItem("raw_reader_voice_uri", newVoiceURI);
                    addToast(`Voice protocol updated`, "success");
                    if (isPlaying) {
                      // Restart active line audio synchronously on new voice mapping
                      setTimeout(() => {
                        startReading(activeSectionIdx);
                      }, 50);
                    }
                  }}
                  className="bg-zinc-950 hover:bg-zinc-900 text-[0.6875rem] text-zinc-400 hover:text-white font-mono rounded-lg border border-editorial-border px-3 py-1.5 min-h-11 focus:border-red-500 outline-none max-w-[180px] md:max-w-[220px] cursor-pointer transition-all truncate"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI} className="bg-zinc-950 text-white font-mono text-[0.6875rem]">
                      {voice.name} [{voice.lang}]
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={activeSectionIdx === 0}
              className="p-3.5 min-h-11 min-w-11 bg-zinc-900/60 border border-editorial-border rounded-xl text-zinc-500 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all outline-none"
              title="Previous Paragraph (Left Arrow)"
              aria-label="Previous section"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_20px_#dc2626] hover:scale-105 active:scale-95 transition-all outline-none"
              title="Toggle Read-Aloud (SPACE)"
              aria-label={isPlaying ? "Pause read-aloud" : "Play read-aloud"}
              aria-pressed={isPlaying}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-1" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={activeSectionIdx === sections.length - 1}
              className="p-3.5 min-h-11 min-w-11 bg-zinc-900/60 border border-editorial-border rounded-xl text-zinc-500 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all outline-none"
              title="Next Paragraph (Right Arrow)"
              aria-label="Next section"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
