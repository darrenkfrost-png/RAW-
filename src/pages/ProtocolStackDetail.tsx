import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { allProducts } from '../data/products';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Box, Layers, Target, Database, Activity, ShieldCheck, Zap } from 'lucide-react';
import { useProtocol } from '../context/ProtocolContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/common/Toast';
import { useUI } from '../context/UIContext';
import Breadcrumb from '../components/Breadcrumb';

const stacks = [
  {
    id: 'strength',
    title: 'RAW_STRENGTH_PROTOCOL',
    target: 'For gym users, lifters, and power-output training.',
    description: 'Designed to maximize muscular output, promote hypertrophy, and ensure sustained power during intense training cycles.',
    benefits: ['Enhanced ATP Production', 'Accelerated Tissue Repair', 'CNS Output Optimization', 'Sustained Power Delivery'],
    products: allProducts.filter(p => p.category === 'Nutrients' || p.name.includes('Creatine') || p.id === 4 || p.id === 6),
  },
  {
    id: 'recovery',
    title: 'RAW_RECOVERY_PROTOCOL',
    target: 'For cold exposure, sleep, nervous system reset.',
    description: 'A complete restoration system targeting the parasympathetic nervous system, muscle tissue repair, and deep rest.',
    benefits: ['Deep Delta Sleep', 'Inflammation Control', 'Neuro-muscular Repair', 'Hydration Optimization'],
    products: allProducts.filter(p => p.name.includes('Ice') || p.name.includes('Magnesium')),
  },
  {
    id: 'combat',
    title: 'RAW_COMBAT_PROTOCOL',
    target: 'For fighters, sparring, impact readiness.',
    description: 'Specialized gear and support built for the rigors of combat sports, impact absorption, and tactical movement.',
    benefits: ['Joint Impact Resilience', 'Micro-trauma Recovery', 'Focus & Flow State', 'Lactic Acid Clearance'],
    products: allProducts.filter(p => p.category === 'Combat' || p.category === 'Apparel'),
  },
  {
    id: 'longevity',
    title: 'RAW_LONGEVITY_PROTOCOL',
    target: 'For optimized cellular aging and DNA repair.',
    description: 'Advanced molecular support system targeting telomere preservation, NAD+ levels, and metabolic efficiency.',
    benefits: ['DNA Damage Combat', 'Mitochondrial Density', 'Cognitive Preservation', 'Insulin Sensitivity'],
    products: allProducts.filter(p => [10, 11, 12, 13].includes(p.id)),
  },
  {
    id: 'sleep',
    title: 'RAW_SLEEP_CALM_PROTOCOL',
    target: 'For deep rest, nervous system down-regulation.',
    description: 'A targeted formula designed to lower heart rate variability, reduce cortisol, and induce deep delta wave sleep.',
    benefits: ['Accelerated Sleep Onset', 'REM State Expansion', 'Vagus Nerve Tone', 'Morning Readiness Score'],
    products: allProducts.filter(p => [2, 10, 11].includes(p.id)),
  },
  {
    id: 'hydration',
    title: 'RAW_HYDRATION_PROTOCOL',
    target: 'For cellular fluid balance and heat tolerance.',
    description: 'Optimize electrical gradients in the body, prevent muscular cramping, and sustain high output in extreme temperature conditions.',
    benefits: ['Cellular Volumization', 'Heat Tolerance', 'Cramp Resistance', 'Cognitive Output in Fatigue'],
    products: allProducts.filter(p => [8, 14, 1].includes(p.id)),
  },
  {
    id: 'beginner',
    title: 'RAW_BEGINNER_PROTOCOL',
    target: 'For those initiating a foundational performance routine.',
    description: 'The zero-BS entry point. Provides exactly what you need to start rebuilding tissue and fueling workouts without unnecessary complexity.',
    products: allProducts.filter(p => [7, 8, 9].includes(p.id)),
    benefits: ['Simple Administration', 'Broad-Spectrum Support', 'High Bioavailability', 'Cost-Effective Foundation']
  }
];

export default function ProtocolStackDetail() {
  const { id } = useParams();
  const stack = stacks.find(s => s.id === id);
  const { addToProtocol } = useProtocol();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!stack) return <div className="text-editorial-text text-center pt-40 min-h-svh">PROTOCOL_NOT_FOUND</div>;

  const totalEstimate = stack.products.reduce((acc, p) => acc + Number(p.price.replace('£', '')), 0);

  const addAllToStack = () => {
    stack.products.forEach(p => {
       addToProtocol(p);
       addToCart(p, 1);
    });
    addToast('All modules deployed to Active Protocol');
  };

  return (
    <div className="min-h-svh bg-editorial-bg pt-32 pb-24 font-sans px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative">
       {/* Background */}
       <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-900/10 blur-[200px] rounded-full pointer-events-none" />

       <div className="max-w-[var(--content-max-width)] mx-auto relative z-10">
         <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Protocol Stacks", path: "/protocol-stacks" }, { label: stack.title }]} />
         
          {/* ⚠️ min-w-0 ON BOTH COLUMNS. Hiding the module list collapsed this grid's single
              phone track from 576px to the container width: every module row is a flex line
              whose text block, though min-w-0 itself, still reports its full nowrap width to
              an AUTO-sized track. The item minimum is what the track listens to. */}
         <div className="mt-8 mb-20 grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
            {/* Left Intel */}
            <div className="min-w-0">
               <div className="flex items-center gap-3 mb-6">
                 <Layers className="w-5 h-5 text-red-600 animate-pulse" />
                 <span className="font-mono text-[0.6875rem] text-red-500 font-bold uppercase tracking-widest">Protocol Series</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-editorial-text uppercase tracking-tighter mb-8">{stack.title}</h1>
               <div className="mb-8 p-5 bg-editorial-bg border border-red-500/20 rounded-xl flex items-start gap-4">
                  <Target className="w-5 h-5 text-red-500 mt-1" />
                  <div>
                    <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase font-bold tracking-widest block mb-1">Target Profile</span>
                    <p className="text-sm text-editorial-text font-bold">{stack.target}</p>
                  </div>
               </div>
               <p className="text-editorial-text-muted font-light text-lg mb-8 leading-relaxed max-w-xl">{stack.description}</p>
               
               <div className="grid sm:grid-cols-2 gap-8 mb-12">
                 <div>
                    <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-widest font-bold block border-b border-editorial-border-light pb-2 mb-4">Core Benefits</span>
                    <ul className="space-y-3">
                      {stack.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs uppercase font-mono tracking-widest text-editorial-text">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {b}
                        </li>
                      ))}
                    </ul>
                 </div>
                 <div>
                    <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-widest font-bold block border-b border-editorial-border-light pb-2 mb-4">Stack Metrics</span>
                    <ul className="space-y-3 font-mono text-[0.6875rem] text-editorial-text">
                      <li>UNITS INCLUDED: <span className="text-editorial-text font-bold">{stack.products.length}</span></li>
                      <li>ESTIMATED DEPLOYMENT: <span className="text-red-500 font-bold">£{totalEstimate.toFixed(2)}</span></li>
                      <li>SYNERGY FACTOR: <span className="text-blue-500 font-bold">ALPHA+</span></li>
                    </ul>
                 </div>
               </div>

               <div className="flex gap-4">
                 <button onClick={addAllToStack} className="flex-1 bg-red-600 hover:bg-editorial-text text-white hover:text-editorial-bg transition-all px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 transform-gpu active:scale-95 shadow-[0_20px_40px_rgba(220,38,38,0.3)]">
                    <Zap className="w-4 h-4" /> Load Entire Protocol
                 </button>
               </div>
            </div>

            {/* Right Matrix Output */}
            <div className="relative min-w-0">
              <div className="absolute inset-0 bg-editorial-bg rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.1)] border border-editorial-border" />
              <div className="relative z-10 p-10 lg:p-12">
                 <h3 className="font-sans font-black text-editorial-text text-xl uppercase tracking-tighter mb-8 border-b border-editorial-border pb-4 flex items-center justify-between">
                    <span>Component Matrix</span>
                    <span className="font-mono text-[0.6875rem] text-red-500 tracking-widest">LIVE_STATUS: ONLINE</span>
                 </h3>

                 <div className="space-y-4">
                    {stack.products.map((p, i) => (
                      <Link to={`/product/${p.id}`} key={p.id} className="flex items-center gap-6 p-4 bg-editorial-bg border border-editorial-border rounded-2xl hover:border-red-500/40 hover:bg-editorial-bg transition-colors group">
                        <div className="w-16 h-16 bg-editorial-bg rounded-xl overflow-hidden shrink-0 relative">
                           <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-screen" />
                           <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-screen grayscale group-hover:grayscale-0 transition-all font-light" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-widest block mb-1">Module 0{i + 1}</span>
                           <h4 className="font-sans font-black text-editorial-text text-sm uppercase tracking-tight truncate group-hover:text-red-500 transition-colors">{p.name}</h4>
                        </div>
                        <div className="shrink-0 flex items-center justify-center w-10 h-10 border border-editorial-border-light rounded-full group-hover:bg-red-600 group-hover:border-red-500 group-hover:text-white text-editorial-text-muted transition-all">
                           <ArrowRight className="w-4 h-4" />
                        </div>
                      </Link>
                    ))}
                 </div>
              </div>
            </div>
         </div>
       </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
