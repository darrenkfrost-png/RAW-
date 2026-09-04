import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{
  addToast: (message: string, type?: ToastType) => number;
  removeToast: (id: number) => void;
  clearAll: () => void;
} | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'success'): number => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const filtered = (type === 'success' || type === 'error')
        ? prev.filter(t => t.type !== 'loading')
        : (type === 'loading' ? prev.filter(t => t.type !== 'loading') : prev);

      // Precision Max 3 logic: Newest always enters, oldest exits if limit reached
      if (filtered.length >= 3) {
        return [...filtered.slice(filtered.length - 2), { id, message, type }];
      }
      return [...filtered, { id, message, type }];
    });
    
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000); 
    }
    return id;
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAll }}>
      {children}
      <div className={`fixed top-32 transition-all duration-700 z-[var(--z-toast)] flex flex-col gap-5 items-end pointer-events-none w-full max-w-sm right-10`}>
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.length >= 1 && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="pointer-events-auto mb-4"
            >
              <button
                onClick={clearAll}
                className="px-8 py-4 bg-red-600 shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:bg-black text-[10px] font-black uppercase tracking-[0.5em] rounded-2xl border border-red-500/20 backdrop-blur-3xl transition-all active:scale-95 flex items-center gap-4 group/clear text-white"
              >
                <X className="w-4 h-4 group-hover/clear:rotate-90 transition-transform" />
                Clear_Stack
              </button>
            </motion.div>
          )}
          
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 20, scale: 0.95, filter: "blur(10px)" }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 40,
                layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }}
              className="pointer-events-auto group w-72 md:w-80 lg:w-96"
            >
              <div 
                className={`flex items-center gap-4 p-5 bg-editorial-surface/90 backdrop-blur-3xl border border-editorial-border rounded-2xl shadow-depth-3 relative overflow-hidden group-hover:border-editorial-accent/30 transition-all duration-500`}
                role={toast.type === 'error' ? 'alert' : 'status'}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-700 ${
                  toast.type === 'success' ? 'bg-emerald-500' : 
                  toast.type === 'error' ? 'bg-red-600' :
                  toast.type === 'loading' ? 'bg-zinc-400' :
                  toast.type === 'warning' ? 'bg-yellow-500' :
                  'bg-editorial-accent'
                } opacity-60 group-hover:opacity-100 shadow-[0_0_15px_currentColor]`} />
                
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                  toast.type === 'error' ? 'bg-red-600/10 text-red-500' :
                  toast.type === 'loading' ? 'bg-zinc-500/10 text-zinc-400' :
                  toast.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-editorial-accent/10 text-editorial-accent'
                }`}>
                  {toast.type === 'loading' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Check className="w-5 h-5 opacity-40" />
                    </motion.div>
                  ) : toast.type === 'success' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <div className="font-mono text-[10px] font-black italic">!</div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="font-mono text-[9px] font-black tracking-[.25em] uppercase text-editorial-text-muted mb-0.5 flex items-center gap-2">
                    {toast.type === 'success' && 'PROTOCOL_VERIFIED'}
                    {toast.type === 'error' && 'INTEGRITY_COMPROMISED'}
                    {toast.type === 'info' && 'DATA_HANDSHAKE'}
                    {toast.type === 'warning' && 'PARAMETER_ANOMALY'}
                    {toast.type === 'loading' && 'PROCESSING_LOG...'}
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                  </div>
                  <p className="text-sm font-medium text-editorial-text tracking-tight leading-snug line-clamp-2">
                    {toast.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="absolute top-4 right-4 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5 active:scale-90"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-zinc-600 hover:text-editorial-text transition-colors" />
                </button>
                
                {/* Visual pulse for important ones */}
                {(toast.type === 'error' || toast.type === 'warning') && (
                  <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
