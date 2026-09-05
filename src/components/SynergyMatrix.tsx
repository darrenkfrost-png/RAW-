import { useMemo } from 'react';
import { Layers, HelpCircle, Link2 } from 'lucide-react';
import { Product } from '../types';

interface SynergyMatrixProps {
  products: Product[];
}

export default function SynergyMatrix({ products }: SynergyMatrixProps) {
  // Every number and note here is read straight from the catalogue: each
  // product lists the products it is meant to pair with (protocolPairings).
  // Nothing is scored or estimated.
  const rows = useMemo(() => {
    const selectedNames = new Set(products.map(p => p.name));
    return products.map(product => {
      const pairings = product.protocolPairings ?? [];
      return {
        product,
        inStack: pairings.filter(n => selectedNames.has(n) && n !== product.name),
        elsewhere: pairings.filter(n => !selectedNames.has(n)),
      };
    });
  }, [products]);

  const listedLinks = rows.reduce((n, r) => n + r.inStack.length, 0);

  if (products.length < 2) {
    return (
      <div className="bg-zinc-950/30 border border-zinc-900 border-dashed rounded-[2.5rem] p-8 sm:p-12 text-center text-zinc-500">
        <HelpCircle className="w-10 h-10 mx-auto text-zinc-600 mb-4 animate-bounce" />
        <span className="font-mono text-[0.6875rem] uppercase font-black tracking-widest block mb-2">STACK_NOTES</span>
        <p className="text-xs leading-relaxed max-w-sm mx-auto font-light">Select at least two products to see how they combine.</p>
      </div>
    );
  }

  return (
    <div className="bg-editorial-surface border border-editorial-border rounded-[3rem] p-6 sm:p-8 lg:p-12 shadow-premium relative overflow-hidden" id="synergy-matrix-module">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(239,68,68,0.04),_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
          <span className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 shrink-0">
            <Layers className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <span className="text-[0.6875rem] font-mono font-black text-red-500 uppercase tracking-[0.3em] block">LISTED_PAIRINGS</span>
            <h3 className="text-xl font-sans font-black uppercase text-white tracking-tight">STACK OVERVIEW</h3>
          </div>
        </div>

        <p className="text-[0.75rem] text-zinc-300 leading-relaxed font-light">
          {listedLinks > 0
            ? `${listedLinks} listed pairing${listedLinks === 1 ? '' : 's'} between the selected products.`
            : 'None of the selected products list each other as a pairing.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rows.map(({ product, inStack, elsewhere }) => (
            <div key={product.id} className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 min-w-0 space-y-5">
              <div className="min-w-0">
                <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">{product.category}</span>
                <h4 className="font-sans font-black uppercase text-white tracking-tight leading-tight break-words">{product.name}</h4>
              </div>

              <div className="space-y-2">
                <span className="flex items-center gap-2 text-[0.6875rem] font-mono font-black text-emerald-500 uppercase tracking-[0.3em]">
                  <Link2 className="w-3.5 h-3.5 shrink-0" /> IN THIS STACK
                </span>
                {inStack.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {inStack.map(name => (
                      <li key={name} className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[0.6875rem] font-mono text-white break-words">{name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[0.75rem] text-zinc-500 font-light">Does not list any of the other selected products.</p>
                )}
              </div>

              {elsewhere.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[0.6875rem] font-mono font-bold text-zinc-500 uppercase tracking-[0.3em]">ALSO LISTED WITH</span>
                  <ul className="flex flex-wrap gap-2">
                    {elsewhere.map(name => (
                      <li key={name} className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-[0.6875rem] font-mono text-zinc-400 break-words">{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
