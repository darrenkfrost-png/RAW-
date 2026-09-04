import React from 'react';
import { motion } from 'motion/react';
import { allProducts } from '../data/products';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Target, ShieldCheck } from 'lucide-react';

const customerTypes = {
  athletes: {
    title: 'For Athletes',
    subtitle: 'Strength, hydration, recovery, output.',
    description: 'Designed for high-output individuals focused on progressive overload, cardiovascular endurance, and rapid systemic recovery.',
    filter: (p: any) => p.category === 'Supplements' || p.name.includes('Water') || p.name.includes('Shaker')
  },
  fighters: {
    title: 'For Fighters',
    subtitle: 'Combat gear, endurance, impact readiness, recovery.',
    description: 'Purpose-built hardware and nutritional frameworks to support striking, grappling, and violent biological stressors.',
    filter: (p: any) => p.category === 'Combat' || p.category === 'Apparel' || p.name.includes('Ice')
  },
  everyday: {
    title: 'For Everyday Performance',
    subtitle: 'Energy, wellness, sleep, focus, daily discipline.',
    description: 'Foundational components to elevate the baseline format of your life. Drive energy states up and regulate sleep cycles.',
    filter: (p: any) => p.category === 'Supplements' && !p.name.includes('Creatine') && !p.name.includes('Performance')
  },
  recovery: {
    title: 'For Recovery',
    subtitle: 'Cold therapy, magnesium, mobility, nervous system regulation.',
    description: 'The tools necessary to drop into parasympathetic dominance. Essential required use after heavy physical or mental trauma.',
    filter: (p: any) => p.name.includes('Ice') || p.name.includes('Magnesium') || p.name.includes('Towel') || p.category === 'Supplements'
  }
};

export default function CustomerType() {
  const { type = 'athletes' } = useParams();
  // @ts-ignore
  const customer = customerTypes[type] || customerTypes.athletes;
  const products = allProducts.filter(customer.filter).slice(0, 8);

  return (
    <div className="min-h-svh bg-editorial-bg pt-32 pb-24 font-sans px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)]">
      <div className="max-w-[var(--content-max-width)] mx-auto">
        
        {/* Header */}
        <div className="mb-24 flex flex-col md:flex-row gap-8 items-end justify-between border-b border-editorial-border pb-12">
           <div className="max-w-3xl">
             <div className="flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-red-600" />
                <span className="font-mono text-[10px] text-editorial-text-muted uppercase tracking-widest font-bold">Targeted Profiles</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-black text-editorial-text uppercase tracking-tighter mb-4">{customer.title}</h1>
             <p className="font-mono text-sm text-red-500 uppercase tracking-widest font-bold mb-4">{customer.subtitle}</p>
             <p className="text-editorial-text-muted font-light text-lg leading-relaxed">{customer.description}</p>
           </div>
           
           <div className="flex flex-col gap-2 shrink-0">
             {Object.keys(customerTypes).map(k => (
               <Link 
                 key={k} 
                 to={`/target/${k}`}
                 className={`px-6 py-3 font-mono text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all ${k === type ? 'bg-red-600 text-white' : 'bg-editorial-text/5 text-editorial-text-muted hover:bg-editorial-text/10 hover:text-editorial-text'}`}
               >
                 {customerTypes[k as keyof typeof customerTypes].title}
               </Link>
             ))}
           </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <Link 
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-editorial-bg border border-editorial-border rounded-3xl p-6 hover:border-red-500/50 transition-colors group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-screen pointer-events-none" />
              <div className="aspect-square bg-editorial-surface rounded-xl overflow-hidden mb-6 relative">
                 <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-screen grayscale group-hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="flex flex-col flex-1 relative z-10">
                 <span className="font-mono text-[9px] text-editorial-text-muted uppercase tracking-widest mb-2 block">{product.category}</span>
                 <h3 className="font-black text-xl text-editorial-text uppercase tracking-tight leading-tight space-y-1 mb-2 group-hover:text-red-500 transition-colors">{product.name}</h3>
                 <p className="font-mono text-xs text-red-500 font-bold mb-6">{product.price}</p>
                 <div className="mt-auto flex items-center justify-between text-editorial-text-muted group-hover:text-editorial-text font-mono text-[10px] uppercase tracking-widest font-bold">
                    <span>View Product</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
