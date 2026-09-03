import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  placement?: Placement;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, placement = 'bottom' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const id = React.useId();

  const placementStyles: Record<Placement, { wrapper: string; arrow: string }> = {
    top: {
      wrapper: "bottom-full mb-3",
      arrow: "-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r"
    },
    bottom: {
      wrapper: "top-full mt-3",
      arrow: "-top-1.5 left-1/2 -translate-x-1/2 border-t border-l"
    },
    left: {
      wrapper: "right-full mr-3 top-1/2 -translate-y-1/2",
      arrow: "-right-1.5 top-1/2 -translate-y-1/2 border-t border-r"
    },
    right: {
      wrapper: "left-full ml-3 top-1/2 -translate-y-1/2",
      arrow: "-left-1.5 top-1/2 -translate-y-1/2 border-b border-l"
    }
  };

  const currentStyles = placementStyles[placement];

  return (
    <div 
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      aria-describedby={isVisible ? id : undefined}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id={id}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute ${currentStyles.wrapper} px-4 py-2 bg-editorial-bg border border-editorial-border border-opacity-50 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(220,38,38,0.2)] z-[var(--z-tooltip)] pointer-events-none whitespace-nowrap`}
          >
            <span className="font-mono text-[9px] text-zinc-300 uppercase tracking-widest font-bold">
              {content}
            </span>
            {/* Tooltip arrow */}
            <div className={`absolute w-3 h-3 bg-editorial-bg border-editorial-border border-opacity-50 rotate-45 ${currentStyles.arrow}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
