import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, ShieldCheck, Target, Zap, Waves, Activity, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { allProducts } from '../data/products';
import { useProtocol } from '../context/ProtocolContext';
import { useToast } from '../components/common/Toast';

const steps = [
  {
    id: 'goal',
    title: 'Primary Performance Goal',
    options: [
      { id: 'strength', label: 'Build Muscle & Strength', icon: Target },
      { id: 'endurance', label: 'Endurance & Stamina', icon: Activity },
      { id: 'recovery', label: 'Accelerate Recovery', icon: RefreshCw },
      { id: 'sleep', label: 'Improve Sleep & Calm', icon: Waves },
      { id: 'combat', label: 'Combat Readiness', icon: Zap },
    ]
  },
  {
    id: 'frequency',
    title: 'Training Frequency',
    options: [
      { id: '1-2', label: '1-2 Days / Week' },
      { id: '3-4', label: '3-4 Days / Week' },
      { id: '5+', label: '5+ Days / Week' },
      { id: 'everyday', label: 'Everyday / Tactical' },
    ]
  },
  {
    id: 'experience',
    title: 'Experience Level',
    options: [
      { id: 'beginner', label: 'Beginner / Foundation' },
      { id: 'intermediate', label: 'Intermediate / Structured' },
      { id: 'advanced', label: 'Advanced / Competitive' },
    ]
  },
  {
    id: 'budget',
    title: 'Monthly Protocol Budget',
    options: [
      { id: 'essentials', label: 'Essentials Only (£40 - £80)' },
      { id: 'standard', label: 'Standard Stack (£80 - £150)' },
      { id: 'comprehensive', label: 'Comprehensive Stack (£150+)' },
    ]
  },
  {
    id: 'preferred_type',
    title: 'Preferred Format',
    options: [
      { id: 'powders', label: 'Powders & Mixes' },
      { id: 'capsules', label: 'Capsules & Pills' },
      { id: 'mixed', label: 'Mixed / No Preference' },
    ]
  },
  {
    id: 'recovery_priority',
    title: 'Recovery Focus',
    options: [
      { id: 'muscle_soreness', label: 'Muscle Soreness & Repair' },
      { id: 'joint_health', label: 'Joint Health & Mobility' },
      { id: 'cns_faigue', label: 'CNS Fatigue & Burnout' },
      { id: 'hydration', label: 'Hydration & Electrolytes' },
    ]
  },
  {
    id: 'energy_focus',
    title: 'Energy & Focus Preference',
    options: [
      { id: 'high_stim', label: 'Maximum Stimulation (High Caffeine)' },
      { id: 'smooth_focus', label: 'Smooth Focus (Nootropics & Low Caffeine)' },
      { id: 'stim_free', label: 'Stim-Free Pump & Endurance' },
      { id: 'none', label: 'Not a Priority' },
    ]
  },
  {
    id: 'sleep_calm',
    title: 'Sleep & Calm Priority',
    options: [
      { id: 'deep_sleep', label: 'Deep Sleep & Recovery' },
      { id: 'stress_relief', label: 'Stress Relief & Relaxation' },
      { id: 'none', label: 'Not a Priority' },
    ]
  },
  {
    id: 'combat_style',
    title: 'Combat / Training Style',
    options: [
      { id: 'striking', label: 'Striking (Boxing, Muay Thai)' },
      { id: 'grappling', label: 'Grappling (BJJ, Wrestling)' },
      { id: 'mixed', label: 'MMA / Mixed Martial Arts' },
      { id: 'lifting', label: 'Heavy Lifting & Powerbuilding' },
      { id: 'tactical', label: 'Tactical / Hybrid Athlete' },
    ]
  }
];

export default function ProtocolBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resultStack, setResultStack] = useState<any[] | null>(null);
  const advanceTimer = useRef<number | null>(null);

  const { addToProtocol } = useProtocol();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Clear a pending step advance if the visitor leaves mid-transition.
  useEffect(() => {
    return () => {
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  const handleSelect = (stepId: string, optionId: string) => {
    // A second tap inside the 400ms transition must not skip a question.
    if (advanceTimer.current !== null) return;
    const newAnswers = { ...answers, [stepId]: optionId };
    setAnswers(newAnswers);

    if (currentStep < steps.length - 1) {
      advanceTimer.current = window.setTimeout(() => {
        advanceTimer.current = null;
        setCurrentStep(prev => prev + 1);
      }, 400);
    } else {
      generateProtocol(newAnswers);
    }
  };

  const generateProtocol = (userAnswers: Record<string, string>) => {
    // A plain rule table over the catalogue: every answer maps to products by name. No wait, no "analysis".
      try {
        const {
          goal, frequency, experience, budget, preferred_type: format,
          recovery_priority: recovery, energy_focus: energy, sleep_calm: sleep, combat_style: combatStyle,
        } = userAnswers;

        const nameHas = (...needles: string[]) =>
          allProducts.filter(p => needles.some(n => p.name.toLowerCase().includes(n)));
        const categoryHas = (needle: string) =>
          allProducts.filter(p => p.category.toLowerCase().includes(needle));
        const isPowder = (p: any) => /powder|drink mix|coffee|\(\d+(\.\d+)?k?g\)/i.test(p.name);
        const isCapsule = (p: any) => /capsule|gumm|tabs|tablet|\d+mg/i.test(p.name);
        const matchesFormat = (p: any) =>
          format === 'powders' ? isPowder(p) : format === 'capsules' ? isCapsule(p) : true;
        // Prefer the chosen format, but never drop a product the goal needs just because of its format.
        const preferFormat = (products: any[]) =>
          [...products.filter(matchesFormat), ...products.filter(p => !matchesFormat(p))];
        const pick = (products: any[], reason: string) =>
          preferFormat(products).slice(0, 1).map(p => ({ ...p, reason }));

        let filtered: any[] = [];

        // 1. Primary goal
        if (goal === 'strength') {
           filtered = [
             ...pick(nameHas('protein'), "Fundamental building block for muscle repair and growth after heavy lifting."),
             ...pick(nameHas('creatine'), "Increases ATP production for enhanced strength and power output."),
             ...pick(nameHas('pre-workout'), "Maximizes intensity and focus during strength sessions."),
           ];
        } else if (goal === 'endurance') {
           filtered = [
             ...pick(nameHas('electrolyte'), "Keeps hydration and nerve function steady through long sessions."),
             ...pick(nameHas('bcaa'), "Spares muscle tissue and eases fatigue over extended work."),
             ...pick(nameHas('creatine'), "Supports repeated high-output efforts and faster recovery between them."),
           ];
        } else if (goal === 'recovery') {
           filtered = [
             ...pick(nameHas('magnesium'), "Supports muscle relaxation and prevents cramping post-training."),
             ...pick(nameHas('protein'), "Essential for repairing muscle fibers damaged during training."),
             ...pick(nameHas('electrolyte'), "Replenishes essential minerals lost through sweat."),
           ];
        } else if (goal === 'sleep') {
           filtered = [
             ...pick(nameHas('magnesium'), "Crucial for down-regulating the nervous system before bed."),
             ...pick(nameHas('gaba', 'melatonin'), "Promotes deep, restorative sleep cycles for optimal recovery."),
           ];
        } else if (goal === 'combat') {
           filtered = [
             ...preferFormat(categoryHas('combat')).slice(0, 2).map(p => ({ ...p, reason: "Engineered specifically for the demands of martial arts and fighting." })),
             ...pick(nameHas('electrolyte'), "Critical for maintaining hydration and nerve function during intense rounds."),
           ];
        }

        // 2. Training style: combat kit only when the goal is combat; otherwise the style steers one pick.
        if (goal === 'combat' && ['striking', 'grappling', 'mixed'].includes(combatStyle)) {
           filtered.push(...pick(nameHas('gloves'), "Round-ready kit for striking and sparring work."));
        } else if (combatStyle === 'lifting') {
           filtered.push(...pick(nameHas('creatine'), "The most studied supplement for heavy lifting and powerbuilding."));
        } else if (combatStyle === 'tactical') {
           filtered.push(...pick(nameHas('electrolyte'), "Hybrid training days demand steady hydration across sessions."));
        }

        // 3. Recovery focus
        if (recovery === 'joint_health') {
           filtered.push(...pick(nameHas('turmeric', 'bone strength'), "Supports joint comfort and mobility under load."));
        } else if (recovery === 'muscle_soreness') {
           filtered.push(...pick(nameHas('bcaa', 'protein'), "Amino acids to support repair after hard sessions."));
        } else if (recovery === 'cns_faigue') {
           filtered.push(...pick(nameHas('ashwagandha'), "Adaptogenic support for stress load and CNS fatigue."));
        } else if (recovery === 'hydration') {
           filtered.push(...pick(nameHas('electrolyte'), "Replaces the minerals lost through sweat."));
        }

        // 4. Energy & focus
        if (energy === 'high_stim') {
           filtered.push(...pick(nameHas('pre-workout'), "Maximum stimulation for high-intensity sessions."));
        } else if (energy === 'smooth_focus') {
           filtered.push(...pick(nameHas('lion', 'mushroom coffee'), "Nootropic support for clean, low-caffeine focus."));
        } else if (energy === 'stim_free') {
           filtered.push(...pick(nameHas('l-arginine', 'bcaa'), "Stim-free pump and endurance support."));
        }

        // 5. Sleep & calm
        if (sleep === 'deep_sleep') {
           filtered.push(...pick(nameHas('melatonin', 'gaba'), "Supports falling asleep and staying in deep sleep."));
        } else if (sleep === 'stress_relief') {
           filtered.push(...pick(nameHas('ashwagandha', '5-htp'), "Calming support for stress relief and relaxation."));
        }

        // 6. Frequency & experience
        if (frequency === '5+' || frequency === 'everyday') {
           filtered.push(...pick(nameHas('magnesium'), "Training most days raises the recovery load; magnesium helps you keep up."));
        }
        if (experience === 'beginner') {
           filtered.push(...pick(nameHas('whey', 'protein'), "A foundation product to build the habit around."));
        } else if (experience === 'advanced') {
           filtered.push(...pick(nameHas('creatine'), "Advanced output relies on saturated creatine stores."));
        }

        // 7. Budget sets how many products the stack may hold.
        const maxItems = budget === 'essentials' ? 3 : budget === 'comprehensive' ? 6 : 4;
        const minItems = Math.min(3, maxItems);

        // Dedupe (first reason wins) and cap to the budget.
        const uniqueProducts = Array.from(new Map(filtered.map(item => [item.id, item])).values()).slice(0, maxItems);

        // Fill to the minimum from the supplement range only, chosen format first.
        if (uniqueProducts.length < minItems) {
           const pool = preferFormat(allProducts.filter(p => p.productType === 'supplement'));
           for (const p of pool) {
              if (uniqueProducts.length >= minItems) break;
              if (!uniqueProducts.find(up => up.id === p.id)) {
                 uniqueProducts.push({ ...p, reason: "Rounds out the stack for the goals you picked." });
              }
           }
        }

        setResultStack(uniqueProducts);
        addToast("Your protocol is ready.", "success");
      } catch (err: any) {
        addToast(`Couldn't build a protocol: ${err.message || err}`, "error");
      }
  };

  const handleEditSelections = () => {
    setResultStack(null);
    setCurrentStep(0);
    setAnswers({});
    addToast("Answers cleared. Start again.", "info");
  };

  // ProtocolContext.addToProtocol is a functional, de-duplicating update, so
  // every product in the stack lands even when added in one handler.
  const addAllToProtocol = () => {
    if (!resultStack) return;
    resultStack.forEach(product => addToProtocol(product));
    addToast("Performance protocol deployed. Redirection underway.", "success");
    navigate('/shop');
  };

  return (
    <div className="min-h-svh bg-editorial-bg pt-32 pb-24 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-editorial-accent/5 blur-[250px] pointer-events-none rounded-full mix-blend-screen z-0" />
      <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-editorial-accent/5 blur-[200px] pointer-events-none rounded-full mix-blend-screen z-0" />

      <div className="max-w-[var(--content-max-width)] mx-auto relative z-10">
        <div className="mb-24 text-center space-y-8 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-5"
          >
            <div className="flex gap-2">
              {[1,2,3].map(i => <div key={i} className="w-1.5 h-6 bg-red-600 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
            <span className="text-meta-premium">PROTOCOL_BUILDER</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans font-black uppercase tracking-[-0.05em] leading-[0.8] drop-shadow-strong text-premium text-display-lg"
          >
            Protocol <br/> Builder
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-meta-premium max-w-2xl mx-auto border-y border-editorial-border py-8"
          >
            Configure your personal performance stack based on your objectives, output level, and recovery needs.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!resultStack ? (
            <motion.div 
              key={`step-${currentStep}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="bg-editorial-bg/40 backdrop-blur-3xl border border-editorial-border-light p-6 sm:p-12 md:p-20 rounded-[3rem] shadow-premium relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.03] to-transparent pointer-events-none" />
              
              {/* Stepper HUD */}
              <div className="flex items-center gap-4 sm:gap-10 mb-20 relative z-10">
                 <div className="flex flex-col">
                   <span className="text-meta-premium opacity-40 mb-1">Step_Index</span>
                   <span className="text-meta-premium text-2xl !text-editorial-text">0{currentStep + 1}</span>
                 </div>
                 <div className="flex-1 h-[1px] bg-editorial-text/5 relative">
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 bg-red-600 shadow-[0_0_20px_#dc2626]" 
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                    {/* Tick marks */}
                    <div className="absolute inset-0 flex justify-between px-0">
                      {steps.map((_, i) => (
                        <div key={i} className={`w-[2px] h-3 -top-1 absolute bg-editorial-text/10 ${i === currentStep ? 'bg-red-600 shadow-[0_0_10px_#dc2626]' : ''}`} style={{ left: `${(i / (steps.length-1)) * 100}%` }} />
                      ))}
                    </div>
                 </div>
                 <div className="flex flex-col text-right">
                   <span className="text-meta-premium opacity-40 mb-1">Final_Unit</span>
                   <span className="text-meta-premium text-2xl">0{steps.length}</span>
                 </div>
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-editorial-text uppercase tracking-tighter mb-16 drop-shadow-strong relative z-10 max-w-xl">
                {steps[currentStep].title}
              </h2>

              <div className="grid sm:grid-cols-2 gap-6 relative z-10">
                {steps[currentStep].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(steps[currentStep].id, option.id)}
                    className="flex flex-col items-start gap-8 p-6 sm:p-10 bg-editorial-text/5 backdrop-blur-xl border border-editorial-border rounded-[2rem] hover:border-red-600/50 hover:bg-red-600/[0.03] transition-all duration-700 group/btn transform-gpu active:scale-[0.98] text-left relative overflow-hidden"
                    aria-label={`Select ${option.label}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700" />
                    
                    <div className="w-14 h-14 bg-editorial-text/5 rounded-2xl flex items-center justify-center group-hover/btn:bg-red-600 group-hover/btn:text-white transition-all duration-700 border border-editorial-border relative z-10">
                      {option.icon ? <option.icon className="w-6 h-6" /> : <ChevronRight className="w-6 h-6 opacity-40 group-hover/btn:opacity-100" />}
                    </div>
                    <div className="relative z-10 w-full flex items-center justify-between">
                      <span className="text-lg md:text-xl font-black text-editorial-text-muted group-hover/btn:text-editorial-text uppercase tracking-tight transition-colors duration-500">{option.label}</span>
                      <ArrowRight className="w-6 h-6 text-red-600 opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-700 ease-[0.16,1,0.3,1]" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="bg-editorial-bg/60 backdrop-blur-3xl border border-editorial-border-light rounded-[3rem] p-6 sm:p-12 md:p-20 relative overflow-hidden shadow-premium">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-red-600 shadow-[0_0_20px_#dc2626]" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.02] to-transparent pointer-events-none" />
                
                <div className="mb-20 text-center relative z-10">
                  <div className="inline-flex items-center gap-3 bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full mb-8">
                     <Target className="w-4 h-4 text-red-500" />
                     <span className="text-meta-premium !text-red-500">YOUR_RECOMMENDED_STACK</span>
                  </div>
                  <h2 className="font-sans font-black uppercase tracking-tighter mb-6 drop-shadow-strong text-premium text-display-sm">Target Protocol</h2>
                  <p className="text-meta-premium opacity-60">Deployment methodology optimized for your parameters.</p>
                </div>

                <div className="space-y-6 mb-20 relative z-10">
                  {resultStack?.map((product, idx) => (
                    <motion.div 
                      key={product.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="flex flex-col xl:flex-row items-center gap-10 p-10 bg-editorial-text/5 border border-editorial-border rounded-[2.5rem] hover:border-red-600/30 hover:bg-editorial-text/[0.07] transition-all duration-700 group shadow-inner"
                    >
                      <div className="w-40 h-40 bg-editorial-bg rounded-[2rem] overflow-hidden border border-editorial-border shrink-0 p-6 shadow-depth-1 group-hover:scale-105 transition-transform duration-700">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform duration-1000" />
                      </div>
                      <div className="flex-1 text-center xl:text-left space-y-6">
                        <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                           <h4 className="font-black uppercase tracking-tighter text-3xl md:text-4xl drop-shadow-strong text-premium">{product.name}</h4>
                           <span className="text-meta-premium opacity-40">{product.category}</span>
                        </div>
                        <div className="bg-red-600/5 border-l-2 border-red-600 p-6 rounded-r-2xl transform-gpu group-hover:translate-x-2 transition-transform duration-700">
                           <p className="text-sm md:text-base text-editorial-text font-light leading-relaxed flex items-start gap-4 italic font-sans">
                             <Target className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                             "{product.reason}"
                           </p>
                        </div>
                      </div>
                      <div className="xl:text-right shrink-0 space-y-4">
                        <span className="font-sans font-black text-4xl tracking-tighter text-premium block drop-shadow-strong">{product.price}</span>
                        <Link to={`/product/${product.id}`} className="inline-flex text-meta-premium opacity-40 hover:opacity-100 transition-opacity border-b border-editorial-border hover:border-red-500/50 pb-1">Technical_Spec</Link>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col xl:flex-row items-center justify-between gap-12 pt-16 border-t border-editorial-border relative z-10">
                  <div className="text-center xl:text-left">
                    <span className="text-meta-premium opacity-40 block mb-2">Cumulative_Total</span>
                    <span className="text-5xl md:text-6xl font-black tracking-tighter drop-shadow-strong text-premium">
                      £{resultStack?.reduce((acc, p) => acc + Number(p.price.toString().replace('£', '')), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto items-center">
                    <button 
                      onClick={addAllToProtocol}
                      className="button-premium px-12 py-6 w-full md:w-auto text-[0.6875rem]"
                    >
                      Deploy Protocol Stack <ArrowRight className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleEditSelections}
                      className="button-secondary px-12 py-6 w-full md:w-auto text-[0.6875rem]"
                    >
                      Reset_Configurator
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row items-start gap-8 p-6 sm:p-12 bg-editorial-bg/40 backdrop-blur-xl border border-editorial-border-light rounded-[3rem] shadow-depth-1">
                <ShieldCheck className="w-10 h-10 text-red-600 shrink-0 mt-1 drop-shadow-strong" />
                <div className="space-y-4">
                  <span className="text-meta-premium text-lg">Responsible_Deployment_Notice</span>
                  <p className="text-editorial-text-muted font-light leading-relaxed text-lg italic">
                    RAW Official products are designed to support active lifestyles and performance routines. Supplements should be used as directed on the label and are not intended to diagnose, treat, cure, or prevent disease. Always consult a qualified professional if pregnant, taking medication, under 18, or managing a health condition.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
