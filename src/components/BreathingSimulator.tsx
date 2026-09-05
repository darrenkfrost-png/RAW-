import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface BreathingTechnique {
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  color: string;
  bgGlow: string;
}

const TECHNIQUES: BreathingTechnique[] = [
  {
    name: "BOX BREATHING",
    description: "Standard tactical down-regulation. Used by military elite to restore autonomic balance.",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    color: "text-emerald-500",
    bgGlow: "rgba(16,185,129,0.12)"
  },
  {
    name: "RESONANT COHERENCE",
    description: "Brings autonomic and cardiac cycles into perfect electrical resonance.",
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
    color: "text-blue-500",
    bgGlow: "rgba(59,130,246,0.12)"
  },
  {
    name: "4-7-8 OUTFLOW RESET",
    description: "Induces profound deep parasympathetic relaxation. Deactivates combat stress levels.",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    color: "text-purple-500",
    bgGlow: "rgba(168,85,247,0.12)"
  }
];

export default function BreathingSimulator() {
  const [techIndex, setTechIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Simulation states
  const [stepName, setStepName] = useState<'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT'>('INHALE');
  const [timeLeft, setTimeLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  
  const currentTech = TECHNIQUES[techIndex];
  
  // Tickers and refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef<'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT'>('INHALE');
  const timeLeftRef = useRef(4);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const startSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopSound();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Pure, organic tone
      osc.frequency.setValueAtTime(110, ctx.currentTime); // Standard 110Hz low G hum for parasympathetic resonance
      gain.gain.setValueAtTime(0, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn("Could not activate breathing sound synthesis:", e);
    }
  };

  const stopSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    gainNodeRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopSound();
      const ctx = audioContextRef.current;
      audioContextRef.current = null;
      if (ctx) {
        try {
          ctx.close().catch(() => {});
        } catch (e) {}
      }
    };
  }, []);

  // Modulate oscillator parameters based on respiratory cycle phases
  useEffect(() => {
    if (!isActive) return;

    if (!oscillatorRef.current) startSound();

    const ctx = audioContextRef.current;
    const osc = oscillatorRef.current;
    const gain = gainNodeRef.current;
    if (!ctx || !osc || !gain) return;

    const now = ctx.currentTime;
    try {
      if (stepName === 'INHALE') {
        osc.frequency.setValueAtTime(osc.frequency.value, now);
        osc.frequency.exponentialRampToValueAtTime(196, now + currentTech.inhale); // Calm harmonic rise

        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.12, now + currentTech.inhale);
      } else if (stepName === 'HOLD_IN') {
        osc.frequency.setValueAtTime(196, now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.5);
      } else if (stepName === 'EXHALE') {
        osc.frequency.setValueAtTime(osc.frequency.value, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + currentTech.exhale); // Gentle fall

        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.01, now + currentTech.exhale);
      } else if (stepName === 'HOLD_OUT') {
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0, now + 0.5); // Silent pause
      }
    } catch (err) {
      console.warn("Fidelity cycle modulation exception: ", err);
    }
  }, [stepName, isActive, currentTech]);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSound();
      stepRef.current = 'INHALE';
      timeLeftRef.current = currentTech.inhale;
      setStepName('INHALE');
      setTimeLeft(currentTech.inhale);
      return;
    }

    stepRef.current = 'INHALE';
    timeLeftRef.current = currentTech.inhale;
    setTimeLeft(currentTech.inhale);
    setStepName('INHALE');

    timerRef.current = setInterval(() => {
      const remaining = timeLeftRef.current - 1;
      if (remaining >= 1) {
        timeLeftRef.current = remaining;
        setTimeLeft(remaining);
        return;
      }

      // Time to cycle to next state — computed from the ref, then dispatched at top level
      const currentStep = stepRef.current;
      let nextStep: typeof currentStep = 'INHALE';
      let duration = currentTech.inhale;
      let cycleDone = false;

      if (currentStep === 'INHALE') {
        if (currentTech.hold1 > 0) {
          nextStep = 'HOLD_IN';
          duration = currentTech.hold1;
        } else {
          nextStep = 'EXHALE';
          duration = currentTech.exhale;
        }
      } else if (currentStep === 'HOLD_IN') {
        nextStep = 'EXHALE';
        duration = currentTech.exhale;
      } else if (currentStep === 'EXHALE') {
        if (currentTech.hold2 > 0) {
          nextStep = 'HOLD_OUT';
          duration = currentTech.hold2;
        } else {
          nextStep = 'INHALE';
          duration = currentTech.inhale;
          cycleDone = true;
        }
      } else if (currentStep === 'HOLD_OUT') {
        nextStep = 'INHALE';
        duration = currentTech.inhale;
        cycleDone = true;
      }

      stepRef.current = nextStep;
      timeLeftRef.current = duration || 1;
      setStepName(nextStep);
      setTimeLeft(duration || 1);
      if (cycleDone) setCompletedCycles((c) => c + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, techIndex]);

  // Reset simulator state
  const handleReset = () => {
    setIsActive(false);
    setStepName('INHALE');
    setTimeLeft(TECHNIQUES[techIndex].inhale);
    setCompletedCycles(0);
  };

  // Change breathing method
  const handleTechChange = (index: number) => {
    setTechIndex(index);
    setIsActive(false);
    setStepName('INHALE');
    setTimeLeft(TECHNIQUES[index].inhale);
  };

  // Compute size factor of visual circle based on active step
  const circleScale = stepName === 'INHALE' 
    ? 1.5 
    : stepName === 'HOLD_IN' 
      ? 1.5 
      : stepName === 'EXHALE' 
        ? 0.9 
        : 0.9; // HOLD_OUT is fully contracted

  return (
    <div className="w-full bg-editorial-surface border border-editorial-border rounded-[3rem] p-6 lg:p-14 shadow-premium relative overflow-hidden text-editorial-text" id="recovery-breathing-module">
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${isActive ? currentTech.bgGlow : 'transparent'} 0%, transparent 60%)`
        }}
      />

      <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-12 gap-16 items-center">
        {/* Selector & Information Hub */}
        <div className="lg:col-span-5 space-y-10 w-full">
          <div className="space-y-4">
            <span className="text-[0.6875rem] font-mono font-black text-emerald-500 uppercase tracking-[0.4em] block">PROTOCOL // 04 RESET</span>
            <h3 className="text-3xl font-sans font-black uppercase text-white tracking-tight">AUTONOMIC DOWN-REGULATOR</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">Optimize heart rate variability (HRV) and balance CNS activity through isometric respiratory synchronization.</p>
          </div>

          {/* Technique selectors */}
          <div className="space-y-4">
            <span className="text-[0.6875rem] font-mono font-black text-zinc-500 tracking-widest uppercase block">SELECT RESPIRATORY VECTOR</span>
            <div className="space-y-3">
              {TECHNIQUES.map((tech, idx) => (
                <button
                  key={tech.name}
                  onClick={() => handleTechChange(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-500 flex items-center justify-between group ${techIndex === idx ? 'bg-zinc-950 border-emerald-500/40 shadow-inner' : 'bg-zinc-950/40 border-zinc-900/60 hover:bg-zinc-950'}`}
                >
                  <div className="space-y-1 max-w-[80%]">
                    <span className={`block text-[0.6875rem] font-mono font-black tracking-widest ${techIndex === idx ? tech.color : 'text-zinc-400 group-hover:text-white'}`}>{tech.name}</span>
                    <span className="block text-[0.6875rem] text-zinc-500 font-light">{tech.description}</span>
                  </div>
                  <span className="text-[0.6875rem] font-mono font-black text-zinc-600 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg group-hover:text-zinc-300">
                    {tech.inhale}-{tech.hold1}-{tech.exhale}-{tech.hold2}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Session counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-zinc-900 pt-8">
            <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-4 text-center">
              <span className="text-[0.6875rem] font-mono font-bold text-zinc-500 uppercase block tracking-wider mb-1">COMPLETED</span>
              <span className="text-lg font-mono font-black text-white">{completedCycles} <span className="text-[0.6875rem] text-zinc-600">SETS</span></span>
            </div>
          </div>
        </div>

        {/* Circular Expansive Breath Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-12 w-full lg:border-l border-zinc-900/60 lg:pl-16">
          <div className="relative w-full max-w-[20rem] aspect-square flex items-center justify-center">
            {/* Pulsing Back Glow grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:20px_20px] rounded-full overflow-hidden" />
            <div className="absolute inset-8 border border-zinc-900 rounded-full opacity-60" />
            <div className="absolute inset-16 border border-zinc-900 rounded-full opacity-40" />
            <div className="absolute inset-24 border border-zinc-900 rounded-full opacity-25" />

            {/* Simulated breathing circle using inline standard motion styles */}
            <motion.div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '9999px',
                border: '1px solid rgba(16,185,129,0.3)',
                background: isActive ? currentTech.bgGlow : 'rgba(255,255,255,0.02)',
                boxShadow: isActive ? `0 0 50px ${currentTech.bgGlow}` : 'none'
              }}
              animate={{
                scale: isActive ? circleScale : 1.0,
                borderColor: isActive 
                  ? stepName === 'INHALE' ? '#10b981' : stepName === 'HOLD_IN' ? '#3b82f6' : '#a855f7'
                  : '#1f2937'
              }}
              transition={{
                duration: isActive ? (stepName === 'INHALE' ? currentTech.inhale : stepName === 'HOLD_IN' ? currentTech.hold1 : stepName === 'EXHALE' ? currentTech.exhale : currentTech.hold2) : 1,
                ease: "easeInOut"
              }}
              className="flex flex-col items-center justify-center p-8 absolute"
            >
              <div className="text-center space-y-1 text-black">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stepName}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`font-sans font-black text-[0.8125rem] tracking-[0.25em] block ${isActive ? currentTech.color : 'text-zinc-500'}`}
                  >
                    {isActive ? stepName : 'IDLE_OFF'}
                  </motion.span>
                </AnimatePresence>

                <span className="font-mono text-3xl font-black text-white block">
                  {timeLeft}s
                </span>
              </div>
            </motion.div>
          </div>

          {/* Action Controllers */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-3 py-4 px-8 rounded-full border text-[0.6875rem] font-mono font-black uppercase tracking-widest cursor-pointer transition-all duration-300 ${isActive ? 'bg-red-700/10 border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white' : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)]'}`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" /> Stop session
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Initialize restore
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-white rounded-full transition-all cursor-pointer"
              title="Reset parameters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
