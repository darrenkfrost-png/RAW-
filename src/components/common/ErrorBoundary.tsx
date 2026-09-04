import React, { ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh w-full items-center justify-center bg-editorial-bg text-editorial-text overflow-hidden relative">
          <div className="absolute inset-0 bg-atmosphere-depth opacity-30 pointer-events-none" />
          <div className="absolute inset-x-0 h-[1px] bg-red-600/10 top-1/4 z-0 animate-scan pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center p-12 lg:p-16 border border-red-900/40 rounded-[4rem] bg-black/80 backdrop-blur-3xl shadow-[0_40px_120px_rgba(220,38,38,0.2)] relative z-10 w-full max-w-xl mx-4"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent opacity-50 rounded-[4rem] pointer-events-none" />
            
            <div className="w-24 h-24 mx-auto mb-10 rounded-[2rem] border border-red-500/30 bg-red-500/10 flex items-center justify-center relative shadow-depth-2">
               <div className="absolute inset-0 rounded-[2rem] border border-red-500/50 animate-ping opacity-20" />
               <AlertTriangle className="w-10 h-10 text-red-500 drop-shadow-[0_0_15px_#dc2626]" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black mb-6 font-display tracking-tight uppercase text-premium bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Something went wrong
            </h2>
            
            <div className="font-mono text-[0.6875rem] md:text-[0.75rem] uppercase tracking-[0.4em] text-meta-premium mb-12 space-y-3 opacity-60">
                <div className="flex items-center justify-center gap-3">
                   <Terminal className="w-4 h-4" />
                   <span>This page hit an error it couldn't recover from.</span>
                </div>
                <p>Reloading usually fixes it. If it keeps happening, the details below will help us put it right.</p>
                <div className="h-px w-20 bg-red-600/20 mx-auto my-4" />
                <p className="text-[0.6875rem] text-zinc-600 font-bold overflow-auto max-h-32 text-red-400">ERROR: {this.state.error?.message}</p>
                <p className="text-[0.6875rem] text-zinc-600 font-bold overflow-auto max-h-32 text-red-500">{this.state.errorInfo?.componentStack}</p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              className="w-full relative group overflow-hidden h-20 rounded-[2rem] bg-red-600 text-white font-black uppercase tracking-[0.4em] text-[0.8125rem] shadow-[0_20px_40px_rgba(220,38,38,0.3)] hover:shadow-glow transition-all duration-700"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <div className="flex items-center justify-center gap-6 relative z-10">
                 <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                 Reload the page
              </div>
            </motion.button>
            
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
