import { useState, useRef, useEffect } from 'react';
import { useSettings, allAITones } from '../context/SettingsContext';
import { Mic, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VoiceSettingsDropdown() {
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-neutral-800 transition-all duration-300 hover:border-red-600/30 group"
      >
        <Mic className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-500 transition-colors" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Voice</span>
        <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="voice-settings-dropdown"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-3 w-72 bg-neutral-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 z-[100] before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-600/10 before:to-transparent before:rounded-2xl before:pointer-events-none"
          >
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] block mb-3">AI Voice Tone</label>
                <select
                  value={settings.aiVoiceTone}
                  onChange={(e) => updateSettings({ aiVoiceTone: e.target.value as any })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-[11px] text-zinc-100 focus:outline-none focus:border-red-600/50"
                >
                  {allAITones.map(tone => (
                    <option key={tone} value={tone}>{tone.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] block mb-3">Voice Rate: {settings.voiceRate.toFixed(1)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.voiceRate}
                  onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] block mb-3">Pitch: {settings.voicePitch.toFixed(1)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.voicePitch}
                  onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div className="flex items-center justify-between">
                 <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] block">Continuous Conversation</label>
                 <button 
                   onClick={() => updateSettings({ voiceContinuous: !settings.voiceContinuous })}
                   className={`w-8 h-4 rounded-full transition-colors relative ${settings.voiceContinuous ? 'bg-red-600' : 'bg-zinc-800'}`}
                 >
                   <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.voiceContinuous ? 'left-4' : 'left-1'}`} />
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
