import React from 'react';
import { motion } from 'motion/react';
import LazyImage from './LazyImage';

interface Option {
  id: number | string;
  image: string;
  title: string;
  description: string;
}

interface CascadingOptionsViewerProps {
  options: Option[];
  onSelect: (option: Option) => void;
  selectedId?: number | string;
}

const CascadingOptionsViewer: React.FC<CascadingOptionsViewerProps> = ({ options, onSelect, selectedId }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {options.map((option, index) => (
        <motion.button
          key={option.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => onSelect(option)}
          className={`group relative overflow-hidden rounded-[2rem] p-6 text-left transition-all duration-500 border ${
            selectedId === option.id 
              ? 'bg-editorial-surface border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.2)]'
              : 'bg-editorial-bg border-editorial-border hover:border-editorial-border-light'
          }`}
        >
          <div className="aspect-square mb-4 rounded-xl overflow-hidden bg-editorial-surface">
            <LazyImage 
              src={option.image} 
              alt={option.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
          <h4 className="font-sans font-black text-lg uppercase tracking-tight text-editorial-text mb-2">{option.title}</h4>
          <p className="font-mono text-[10px] text-editorial-text-muted uppercase tracking-widest leading-relaxed">
            {option.description}
          </p>
        </motion.button>
      ))}
    </div>
  );
};

export default CascadingOptionsViewer;
