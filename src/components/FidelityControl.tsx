import React from 'react';
import { useUI } from '../context/UIContext';
import { Zap, Gauge } from 'lucide-react';
import MagneticWrapper from './MagneticWrapper';

export default function FidelityControl() {
  const { visualFidelity, setVisualFidelity } = useUI();
  const isHighFidelity = visualFidelity >= 50;

  const toggleFidelity = () => {
    setVisualFidelity(isHighFidelity ? 20 : 100);
  };

  return (
    <MagneticWrapper>
      <button
        onClick={toggleFidelity}
        className={`p-3 rounded-xl transition-all border flex items-center gap-2 ${
          isHighFidelity
            ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50'
            : 'bg-editorial-surface/50 text-editorial-text-muted border-editorial-border'
        }`}
        title={`Switch to ${isHighFidelity ? 'Low' : 'High'} Fidelity`}
      >
        {isHighFidelity ? <Zap size={18} /> : <Gauge size={18} />}
        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
          {isHighFidelity ? 'HIGH_FIDELITY' : 'LOW_FIDELITY'}
        </span>
      </button>
    </MagneticWrapper>
  );
}
