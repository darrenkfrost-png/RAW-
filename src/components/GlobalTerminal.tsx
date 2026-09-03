import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Terminal, X } from "lucide-react";
import { useUI } from "../context/UIContext";

export default function GlobalTerminal() {
  const { isTerminalOpen: isOpen, setIsTerminalOpen: setIsOpen, setVisualFidelity, setDiagnosticsActive } = useUI();
  const [inputVal, setInputVal] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Limit terminal history for performance
  const MAX_LOGS = 100;
  
  useEffect(() => {
    if (logs.length > MAX_LOGS) {
        setLogs(prev => prev.slice(-MAX_LOGS));
    }
    // Auto-scroll on log change
    if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      if (logs.length === 0) {
        setLogs([
          "SYSTEM: ROOT_TERMINAL_ONLINE. [110%]",
          "Type 'help' for technical documentation.",
        ]);
      }
    }
  }, [isOpen]);

  const executeCommand = (cmd: string) => {
    const raw = cmd.toUpperCase().trim();
    setLogs((prev) => [...prev, `> ${cmd}`]);
    
    // Add brief "processing" delay for premium feel
    setTimeout(() => {
        switch (raw) {
          case "HELP":
            setLogs((prev) => [...prev, "SYSTEM_COMMANDS: HELP, OVERRIDE, GOD_MODE, CLEAR, CONTACT_ORACLE, 110_PERCENT"]);
            break;
          case "CLEAR":
            setLogs([]);
            break;
          case "OVERRIDE":
            setLogs((prev) => [...prev, "INITIATING VISUAL OVERRIDE...", "VISUAL FIDELITY OVERCLOCKED TO 200%"]);
            setVisualFidelity(200);
            break;
          case "GOD_MODE":
            setLogs((prev) => [...prev, "GOD_MODE ENABLED.", "DIAGNOSTICS FULLY REVEALED."]);
            setDiagnosticsActive(true);
            break;
          case "ENGAGE_ORACLE":
          case "CONTACT_ORACLE":
            setLogs((prev) => [...prev, "PINGING ORACLE ENTITY..."]);
            setTimeout(() => {
                setIsOpen(false);
            }, 800);
            break;
          default:
            setLogs((prev) => [...prev, `ERR_UNKNOWN_COMMAND: '${cmd}'`]);
            break;
        }
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    executeCommand(inputVal);
    setInputVal("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md bg-editorial-bg/80 cursor-crosshair"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl bg-editorial-surface/95 border border-editorial-border shadow-2xl flex flex-col h-[60vh] rounded-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-editorial-accent/5 via-transparent to-transparent pointer-events-none" />

            <div className="flex justify-between items-center bg-editorial-card/90 px-8 py-4 border-b border-editorial-border relative z-10">
              <div className="flex gap-4 items-center text-editorial-text font-mono text-[10px] tracking-[0.2em] uppercase font-bold cursor-default">
                  <Terminal className="w-3.5 h-3.5 text-editorial-text-meta" /> ROOT_TERMINAL_ACCESS
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-editorial-text-meta hover:text-editorial-accent transition-colors p-1.5 rounded-full border border-editorial-border hover:border-editorial-accent"
              >
                  <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div id="terminal-logs" className="flex-1 overflow-y-auto p-8 font-mono text-[13px] text-editorial-text-muted space-y-2 custom-scrollbar relative z-10">
                {logs.map((log, i) => (
                    <div key={i} className={`${
                        log.startsWith('>') ? 'text-editorial-text' :
                        log.startsWith('ERR') || log.includes('WARNING') ? 'text-red-500 tracking-wider' : 
                        'text-editorial-text-muted'
                    }`}>
                        <span className="text-zinc-700 mr-4 tabular-nums">[{String(i).padStart(3, '0')}]</span> {log}
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>

            <div className="p-6 bg-editorial-bg/95 border-t border-editorial-border flex items-center relative z-10">
                <span className="font-mono text-zinc-600 mr-4 font-bold text-lg">{">"}</span>
                <form onSubmit={handleSubmit} className="flex-1 relative">
                    <input 
                       ref={inputRef}
                       value={inputVal}
                       onChange={(e) => setInputVal(e.target.value)}
                       className="w-full bg-transparent font-mono text-editorial-text text-[15px] outline-none caret-editorial-accent tracking-[0.05em] focus:placeholder-zinc-800 transition-all"
                       spellCheck={false}
                       autoComplete="off"
                       placeholder="AWAITING_INPUT..."
                    />
                </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}