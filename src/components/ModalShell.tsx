import React, { useRef, useState } from "react";
import { motion, useDragControls } from "motion/react";
import { X, Minimize2, Maximize2, ShieldAlert } from "lucide-react";

interface ModalShellProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: string;
  height?: string;
  zIndex?: number;
  onSelect?: () => void;
}

export default function ModalShell({
  isOpen,
  onClose,
  title,
  icon,
  children,
  defaultPosition = { x: 50, y: 50 },
  width = "max-w-4xl",
  height = "h-[700px]",
  zIndex = 100,
  onSelect
}: ModalShellProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[1001] flex items-center justify-center p-4 md:p-8"
      ref={constraintsRef}
    >
      <motion.div
        drag={!isMaximized}
        dragElastic={0.05}
        dragMomentum={false}
        dragTransition={{ power: 0, timeConstant: 0 }}
        dragControls={dragControls}
        dragListener={false}
        onMouseDown={onSelect}
        onTouchStart={onSelect}
        initial={isMaximized ? { width: "100%", height: "100%", x: 0, y: 0 } : { scale: 0.95, opacity: 0, x: defaultPosition.x, y: defaultPosition.y }}
        animate={isMaximized ? { 
          width: "100%", 
          height: "90vh", 
          x: 0, 
          y: 0, 
          scale: 1, 
          opacity: 1,
          left: 0,
          right: 0,
          top: "5vh"
        } : { 
          scale: 1, 
          opacity: 1,
          width: "100%",
          maxWidth: width === "max-w-4xl" ? "880px" : width === "max-w-5xl" ? "1024px" : "600px",
          height: height
        }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className={`pointer-events-auto bg-[#040406]/95 border border-editorial-border rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl`}
        style={{ zIndex }}
      >
        {/* Custom Window Header for Dragging */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="os-window-header h-16 border-b border-editorial-border/60 bg-[#0c0c10]/90 px-6 flex items-center justify-between cursor-move select-none shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="text-red-500 w-5 h-5 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-[0.3em] font-black leading-none">
                SYS_APP // DE_FROST_OS_V4.0
              </span>
              <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider mt-1 select-none">
                {title}
              </h3>
            </div>
          </div>

          {/* Window Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 hover:bg-white/5 border border-editorial-border hover:border-white/20 rounded-xl text-zinc-400 hover:text-white transition-all pointer-events-auto"
              title={isMaximized ? "Restore Window" : "Maximize Window"}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-650/10 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-500/50 rounded-xl text-red-500 transition-all pointer-events-auto"
              title="Close Application (ESC)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Application Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-transparent flex flex-col font-sans">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
