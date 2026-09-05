import { useId, useMemo, useState } from 'react';
import { Scale, Activity, ShieldCheck, Zap, Droplet } from 'lucide-react';

export default function BiometricLoadCalculator() {
  const [weight, setWeight] = useState<number>(75); // kg
  const [duration, setDuration] = useState<number>(60); // minutes
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high' | 'overdrive'>('high');
  const [focusArea, setFocusArea] = useState<'strength' | 'aerobic' | 'focus' | 'combat'>('strength');
  const weightId = useId();
  const durationId = useId();

  const calculations = useMemo(() => {
    let hydrationFactor = 1.0;
    if (intensity === 'moderate') hydrationFactor = 1.25;
    if (intensity === 'high') hydrationFactor = 1.5;
    if (intensity === 'overdrive') hydrationFactor = 1.85;

    const recommendedSessionWater = Math.round((duration * 12) * hydrationFactor); // ml
    
    // Core performance powder/gummie ratios calculated isokinetically
    const aminoAcidGrams = parseFloat(((weight * 0.15) * (intensity === 'overdrive' ? 1.4 : intensity === 'high' ? 1.2 : 0.9)).toFixed(1));
    const cognitiveSustainMg = Math.round((weight * 2.5) * (focusArea === 'focus' || focusArea === 'combat' ? 1.8 : 1.0));
    const sodiumElectrolytesMg = Math.round((weight * 6) * hydrationFactor);

    // Dynamic state pairings recommendation based on biometric attributes
    let recommendationHeadline = '';
    let recommendationDetails = '';
    let exactDosage = '';

    if (focusArea === 'strength') {
      recommendationHeadline = 'NITROGENOUS PROTEIN ISOLATE LATTICE';
      recommendationDetails = 'Highly suited for high-load muscle sarcomere expansion and micro-tear synthesis.';
      exactDosage = '2.5 scoops (approx. 38g peptide net)';
    } else if (focusArea === 'aerobic') {
      recommendationHeadline = 'AMINO KINETIC RECOVERY ELECTROLYTES';
      recommendationDetails = 'Optimized for high-temperature cardiac endurance. Supports continuous cellular ATP recycle cycles.';
      exactDosage = '1.5 scoops diluted in 750ml ultra-cooled water';
    } else if (focusArea === 'focus') {
      recommendationHeadline = 'NEURAL FOCUS & CHOLINE CONCENTRATES';
      recommendationDetails = 'Unlocks elevated executive firing speed, brain-mind latency drops, and sustained neurotransmitter saturation.';
      exactDosage = '2 capsules 35 minutes prior to intellectual demand';
    } else {
      recommendationHeadline = 'COMBAT DEFENSE SYNERGETIC STACK';
      recommendationDetails = 'Engineered for fight-or-flight metabolic clearing, maximum sensory speed, and impact-shock resilience.';
      exactDosage = '3 capsules Core Synergy paired with 1 dose Amino Hydration';
    }

    return {
      sessionWater: recommendedSessionWater,
      aminoAcids: aminoAcidGrams,
      cognitiveSustain: cognitiveSustainMg,
      sodiumElectrolytes: sodiumElectrolytesMg,
      headline: recommendationHeadline,
      details: recommendationDetails,
      dosage: exactDosage
    };
  }, [weight, duration, intensity, focusArea]);

  return (
    <div className="w-full bg-editorial-surface border border-editorial-border rounded-[3rem] p-6 lg:p-12 shadow-premium relative overflow-hidden text-editorial-text" id="biometric-calc-module">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Scale className="w-64 h-64" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row gap-12 lg:gap-16">
        {/* Sliders Input Control HUD */}
        <div className="flex-1 space-y-10">
          <div className="flex items-center gap-4 border-b border-editorial-border pb-6">
            <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
              <Scale className="w-5 h-5 shadow-[0_0_8px_currentColor]" />
            </span>
            <div>
              <span className="text-[0.6875rem] font-mono font-black text-blue-500 uppercase tracking-[0.3em] block">PROTOCOL CALCULATOR</span>
              <h3 className="text-2xl font-sans font-black uppercase tracking-tight text-white">BIOMETRIC EXERTION FORMULA</h3>
            </div>
          </div>

          <div className="space-y-8">
            {/* Weight Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label htmlFor={weightId} className="text-[0.6875rem] font-bold tracking-widest text-zinc-500 uppercase block">SUBJECT_MASS_BODY</label>
                <span className="font-mono text-lg font-black text-white">{weight} <span className="text-xs text-zinc-500">KG</span></span>
              </div>
              <input
                type="range"
                id={weightId}
                min="45"
                max="135"
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full accent-blue-600 bg-zinc-900 border border-zinc-800 rounded-lg h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[0.6875rem] font-mono font-bold text-zinc-500">
                <span>45 KG</span>
                <span>90 KG</span>
                <span>135 KG</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label htmlFor={durationId} className="text-[0.6875rem] font-bold tracking-widest text-zinc-500 uppercase block">ACTIVE_DURATION_LOAD</label>
                <span className="font-mono text-lg font-black text-white">{duration} <span className="text-xs text-zinc-500">MINS</span></span>
              </div>
              <input
                type="range"
                id={durationId}
                min="15"
                max="180"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-blue-600 bg-zinc-900 border border-zinc-800 rounded-lg h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[0.6875rem] font-mono font-bold text-zinc-500">
                <span>15 MIN</span>
                <span>90 MIN</span>
                <span>180 MIN</span>
              </div>
            </div>

            {/* Focus Profile & Exertion Intensity */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Focus Selector */}
              <div className="space-y-4">
                <span className="text-[0.6875rem] font-bold tracking-widest text-zinc-500 uppercase block">TRAINING_FOCUS</span>
                <div className="grid grid-cols-2 gap-3" role="group" aria-label="Training focus">
                  {(['strength', 'aerobic', 'focus', 'combat'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={focusArea === mode}
                      onClick={() => setFocusArea(mode)}
                      className={`py-3.5 px-4 font-mono font-bold uppercase text-[0.6875rem] tracking-widest border rounded-xl transition-all duration-300 ${focusArea === mode ? 'bg-blue-600 border-blue-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)]' : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-800'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Selector */}
              <div className="space-y-4">
                <span className="text-[0.6875rem] font-bold tracking-widest text-zinc-500 uppercase block">BIOENERGY_INTENSITY_LEVEL</span>
                <div className="grid grid-cols-2 gap-3" role="group" aria-label="Intensity level">
                  {(['low', 'moderate', 'high', 'overdrive'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      aria-pressed={intensity === level}
                      onClick={() => setIntensity(level)}
                      className={`py-3.5 px-4 font-mono font-bold uppercase text-[0.6875rem] tracking-widest border rounded-xl transition-all duration-300 ${intensity === level ? 'bg-blue-600 border-blue-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)]' : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-800'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Dosage Recommendations HUD */}
        <div className="flex-1 bg-zinc-950/60 border border-zinc-900 rounded-3xl p-5 lg:p-10 flex flex-col justify-between space-y-12">
          {/* Target Recommended Dosage Outputs */}
          <div className="space-y-8">
            <span className="text-[0.6875rem] font-mono font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3">
              <Activity className="w-3.5 h-3.5 text-blue-500" /> BIOAVAILABLE_YIELDS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Water Requirement */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-1">
                <div className="flex items-center gap-2 text-[0.6875rem] text-zinc-500 font-bold tracking-wider uppercase">
                  <Droplet className="w-3.5 h-3.5 text-sky-400" /> Session Hydration
                </div>
                <div className="text-2xl font-mono font-black text-white">{calculations.sessionWater} <span className="text-[0.6875rem] text-sky-400">ML</span></div>
              </div>

              {/* Electrolyte Density */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-1">
                <div className="flex items-center gap-2 text-[0.6875rem] text-zinc-500 font-bold tracking-wider uppercase">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" /> Electrolytes Net
                </div>
                <div className="text-2xl font-mono font-black text-white">{calculations.sodiumElectrolytes} <span className="text-[0.6875rem] text-yellow-400">MG</span></div>
              </div>

              {/* Amino Lattice */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-1">
                <div className="flex items-center gap-2 text-[0.6875rem] text-zinc-500 font-bold tracking-wider uppercase">
                  <Activity className="w-3.5 h-3.5 text-red-500" /> Amino Acids Needed
                </div>
                <div className="text-2xl font-mono font-black text-white">{calculations.aminoAcids} <span className="text-[0.6875rem] text-red-500">GRAMS</span></div>
              </div>

              {/* Cognitive Optimizer */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-1">
                <div className="flex items-center gap-2 text-[0.6875rem] text-zinc-500 font-bold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Neural Sustain
                </div>
                <div className="text-2xl font-mono font-black text-white">{calculations.cognitiveSustain} <span className="text-[0.6875rem] text-emerald-400">MG</span></div>
              </div>
            </div>
          </div>

          {/* Supplement Core Pairing Suggestions */}
          <div className="border-t border-zinc-900 pt-8 space-y-4">
            <span className="text-[0.6875rem] font-mono font-black text-zinc-600 uppercase tracking-[0.4em] block">ESTABLISHED SYSTEM PAIRING</span>
            <div className="space-y-4">
              <span className="font-sans font-black uppercase text-[0.9375rem] text-white tracking-wider block bg-gradient-to-r from-blue-500/10 to-transparent border-l-2 border-blue-500 pl-4 py-1.5">{calculations.headline}</span>
              <p className="text-[0.6875rem] text-zinc-400 leading-relaxed font-light">{calculations.details}</p>
            </div>
            
            <div className="bg-blue-600/10 border border-blue-500/20 px-4.5 py-3 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-[0.6875rem] font-mono font-black text-blue-500 uppercase tracking-widest">DOSAGE_DIRECTIVE</span>
              <span className="min-w-0 break-words text-[0.6875rem] font-mono font-black text-white uppercase sm:text-right">{calculations.dosage}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
