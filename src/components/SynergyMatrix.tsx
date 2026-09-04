import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Activity, Zap, ShieldCheck, HelpCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Product } from '../types';

interface SynergyMatrixProps {
  products: Product[];
}

export default function SynergyMatrix({ products }: SynergyMatrixProps) {
  // Compute synergic parameters based on categories of chosen items
  const stateScore = useMemo(() => {
    if (products.length < 2) return null;

    const categories = products.map(p => p.category.toLowerCase());
    
    // Default score params
    let neuroFocus = 40;
    let vascularSustain = 40;
    let cellEndurance = 40;
    let riskFactor = 15;
    
    let advice = "Select products to calculate bio-kinetic integration synergy standard score.";

    // Logic representing deep biochemical synergy evaluation
    if (categories.includes('nutrients') && categories.includes('combat')) {
      neuroFocus += 45;
      vascularSustain += 35;
      cellEndurance += 30;
      riskFactor += 10;
      advice = "HIGH COMPATIBILITY: Combining precision nutrients with tactical combat formulas accelerates neuromuscular firing and safeguards cardiovascular output.";
    }
    if (categories.includes('nutrients') && categories.includes('recovery')) {
      cellEndurance += 50;
      vascularSustain += 40;
      neuroFocus += 10;
      riskFactor = Math.max(5, riskFactor - 10); // safer combination
      advice = "OPTIMAL RESTORATION: Deep recovery compounds synergize perfectly with macronutrient stacks. Enhances sleep-depth and muscle protein synthesization.";
    }
    if (categories.includes('combat') && categories.includes('recovery')) {
      vascularSustain += 45;
      neuroFocus += 30;
      cellEndurance += 40;
      riskFactor += 25; // higher shock
      advice = "HIGH-EXERTION LOAD: Combining adrenaline stimulants with recovery agents demands caution. Ensure active hydration and precise time separation.";
    }

    // Individual item specific triggers
    const names = products.map(p => p.name.toLowerCase());
    if (names.some(n => n.includes('whey')) && names.some(n => n.includes('amino'))) {
      cellEndurance += 15;
      vascularSustain += 10;
    }

    return {
      neuroFocus: Math.min(100, neuroFocus),
      vascularSustain: Math.min(100, vascularSustain),
      cellEndurance: Math.min(100, cellEndurance),
      riskFactor: Math.min(100, riskFactor),
      advice
    };
  }, [products]);

  if (products.length < 2) {
    return (
      <div className="bg-zinc-950/30 border border-zinc-900 border-dashed rounded-[2.5rem] p-12 text-center text-zinc-500">
        <HelpCircle className="w-10 h-10 mx-auto text-zinc-650 mb-4 animate-bounce" />
        <span className="font-mono text-[0.6875rem] uppercase font-black tracking-widest block mb-2">SYNERGY_AI_MATRIX</span>
        <p className="text-xs leading-relaxed max-w-sm mx-auto font-light">Select at least two units in the Hardware Decision Matrix above to execute high-fidelity metabolic capability modeling.</p>
      </div>
    );
  }

  return (
    <div className="bg-editorial-surface border border-editorial-border rounded-[3rem] p-8 lg:p-12 shadow-premium relative overflow-hidden" id="synergy-matrix-module">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.04),_transparent_60%)] pointer-events-none" />
      
      <div className="flex flex-col xl:flex-row gap-12 relative z-10">
        {/* Progress & Vector bars representing calculations */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
            <span className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
              <Activity className="w-5 h-5 shadow-[0_0_8px_currentColor]" />
            </span>
            <div>
              <span className="text-[0.6875rem] font-mono font-black text-red-500 uppercase tracking-[0.3em] block">DECISION ENGINE V4.0</span>
              <h3 className="text-xl font-sans font-black uppercase text-white tracking-tight">MOLECULAR SYNERGY ASSESSMENT</h3>
            </div>
          </div>

          <div className="space-y-6">
            {/* Neuro-Focus Synergy */}
            <div className="space-y-2">
              <div className="flex justify-between text-[0.6875rem] font-bold tracking-wider uppercase text-zinc-400">
                <span>Neurofeedback Stimulus</span>
                <span className="font-mono text-white">{stateScore?.neuroFocus}%</span>
              </div>
              <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden w-full">
                <div 
                  className="h-full bg-gradient-to-r from-red-650 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all duration-1000" 
                  style={{ width: `${stateScore?.neuroFocus}%` }}
                />
              </div>
            </div>

            {/* Vascular Sustain */}
            <div className="space-y-2">
              <div className="flex justify-between text-[0.6875rem] font-bold tracking-wider uppercase text-zinc-400">
                <span>Vascular Expansion</span>
                <span className="font-mono text-white">{stateScore?.vascularSustain}%</span>
              </div>
              <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden w-full">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-1000" 
                  style={{ width: `${stateScore?.vascularSustain}%` }}
                />
              </div>
            </div>

            {/* Cell Endurance */}
            <div className="space-y-2">
              <div className="flex justify-between text-[0.6875rem] font-bold tracking-wider uppercase text-zinc-400">
                <span>Aerobic ATP Recycle Rate</span>
                <span className="font-mono text-white">{stateScore?.cellEndurance}%</span>
              </div>
              <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden w-full">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-1000" 
                  style={{ width: `${stateScore?.cellEndurance}%` }}
                />
              </div>
            </div>

            {/* Contra-Indication Warning level */}
            <div className="space-y-2">
              <div className="flex justify-between text-[0.6875rem] font-bold tracking-wider uppercase text-zinc-400">
                <span>Metabolic Clearance Warn</span>
                <span className="font-mono text-red-500 font-black">{stateScore?.riskFactor}%</span>
              </div>
              <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden w-full">
                <div 
                  className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)] transition-all duration-1000" 
                  style={{ width: `${stateScore?.riskFactor}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Output Details Frame */}
        <div className="flex-1 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6.5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
              <span className="text-[0.6875rem] font-mono font-black text-emerald-500 uppercase tracking-[0.3em]">INTEGRATION READOUT</span>
            </div>
            <p className="text-[0.75rem] text-zinc-300 leading-relaxed font-light">{stateScore?.advice}</p>
          </div>

          <div className="border-t border-zinc-900 mt-6 pt-5 flex items-center justify-between">
            <span className="text-[0.6875rem] font-mono font-bold text-zinc-500 tracking-wider">UNIT SYSTEM</span>
            <div className="flex items-center gap-2 text-[0.6875rem] font-mono font-black text-white bg-zinc-900 px-3.5 py-1.5 rounded-lg border border-zinc-800">
              METABOLIC_PERFORMANCE_MATCH_V4 <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
