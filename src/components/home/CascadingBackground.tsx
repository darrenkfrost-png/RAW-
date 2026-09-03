import React from 'react';
import { motion } from 'motion/react';

interface CascadingBackgroundProps {
  text: string;
}

export const CascadingBackground: React.FC<CascadingBackgroundProps> = ({ text }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-overlay [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        animate={{ y: ['-50%', '0%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="text-[12px] sm:text-[14px] leading-relaxed font-mono text-white/5 whitespace-pre-wrap break-all px-10 xl:px-24 tracking-[0.2em]"
      >
        {Array(40).fill(text).join('  //  ')}
      </motion.div>
    </div>
  );
};
