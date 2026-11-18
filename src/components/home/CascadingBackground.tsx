import React from 'react';
import { motion } from 'motion/react';

interface CascadingBackgroundProps {
  text: string;
}

export const CascadingBackground: React.FC<CascadingBackgroundProps> = ({ text }) => {
  return (
    /* ⚠️ DECORATION THAT TALKS. This is a texture — 5% opacity, behind the
       front page, deliberately broken mid-word by break-all so it reads as
       falling characters rather than words. To a screen reader it was none of
       those things: it was 514 characters of real text, "RAW_..." forty times
       over, announced on arrival before anything that means something.
       pointer-events-none already told a mouse to ignore it; aria-hidden is
       the same instruction to everyone else. */
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-overlay [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
    >
      <motion.div
        animate={{ y: ['-50%', '0%'] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="text-[0.75rem] sm:text-[0.875rem] leading-relaxed font-mono text-white/5 whitespace-pre-wrap break-all px-10 xl:px-24 tracking-[0.2em]"
      >
        {Array(40).fill(text).join('  //  ')}
      </motion.div>
    </div>
  );
};
