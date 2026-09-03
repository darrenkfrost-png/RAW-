import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Command, Bot, Terminal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { allProducts } from "../data/products";
import { useCommandEngine } from "../context/CommandContext";
import { useToast } from "./common/Toast";

export default function NeuralCommandTerminal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { commands, executeCommand } = useCommandEngine();
  const { addToast } = useToast();

  // Reset focus when opened
  useEffect(() => {
    if (isOpen) setQuery("");
  }, [isOpen]);

  // Global close on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const navItems = [
    { name: "HOME_BASE", path: "/" },
    { name: "PRODUCT_ARCHIVE", path: "/shop" },
    { name: "COMBAT_SYSTEMS", path: "/combat" },
    { name: "PROTOCOL_BUILDER", path: "/protocol-builder" },
  ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

  const execFilteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleSelect = (path: string, label: string) => {
    addToast(`Handshaking neural path connection...`, "loading");
    setTimeout(() => {
      navigate(path);
      addToast(`Connection established: ${label.toUpperCase()}`, "success");
    }, 400);
    onClose();
  };

  const executeSystemCommand = (id: string, label: string) => {
    addToast(`SYSNAV_CALIBRATING // Initializing "${label.toUpperCase()}"...`, "loading");
    setTimeout(async () => {
      try {
        const result = await executeCommand(id);
        if (result) {
          addToast(`Routine compiled: ${label}`, "success");
        } else {
          addToast(`Routine aborted: execution failure`, "error");
        }
      } catch (err: any) {
        addToast(`System routing error: ${err?.message || err}`, "error");
      }
    }, 400);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 px-4 bg-editorial-bg/80 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-editorial-surface/90 border border-editorial-border rounded-[2rem] p-6 shadow-premium overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 border-b border-editorial-border pb-4 mb-4 shrink-0">
              <Search className="w-5 h-5 text-red-500" />
              <input
                autoFocus
                placeholder="EXECUTE_PROTOCOL_SEARCH..."
                className="flex-1 bg-transparent border-none outline-none font-mono text-lg text-editorial-text placeholder:text-zinc-600"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="text-[9px] font-black text-editorial-text-muted bg-editorial-bg px-3 py-1 rounded-md border border-editorial-border">
                ESC_TO_EXIT
              </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {execFilteredCommands.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-[8px] font-black tracking-[0.4em] text-zinc-600 uppercase px-2">System Commands</div>
                        {execFilteredCommands.map((cmd) => (
                            <button
                                key={cmd.id}
                                onClick={() => executeSystemCommand(cmd.id, cmd.label)}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/20 text-editorial-text transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Terminal className="w-4 h-4 text-editorial-text-muted" />
                                    <span className="font-mono text-sm">{cmd.label}</span>
                                    <span className="text-[9px] text-zinc-500 border border-editorial-border px-1.5 rounded">{cmd.category}</span>
                                </div>
                                <Command className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                )}

                {navItems.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-[8px] font-black tracking-[0.4em] text-zinc-600 uppercase px-2">Navigation</div>
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleSelect(item.path, item.name)}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-600/10 hover:text-red-500 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Bot className="w-4 h-4" />
                                    <span className="font-mono text-sm">{item.name}</span>
                                </div>
                                <Command className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                )}
                
                {filteredProducts.length > 0 && (
                    <div className="space-y-2">
                       <div className="text-[8px] font-black tracking-[0.4em] text-zinc-600 uppercase px-2">Products</div>
                       {filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => handleSelect(`/product/${product.id}`, product.name)}
                                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-editorial-bg transition-colors"
                            >
                                <img src={product.image} className="w-10 h-10 object-cover rounded-lg" alt="" referrerPolicy="no-referrer" />
                                <div className="flex flex-col items-start gap-1">
                                    <span className="font-mono text-sm">{product.name}</span>
                                    <span className="text-[9px] text-zinc-600">{product.category}</span>
                                </div>
                            </button>
                       ))}
                    </div>
                )}
            </div>
            
            {query && navItems.length === 0 && filteredProducts.length === 0 && execFilteredCommands.length === 0 && (
                <div className="text-center py-10 text-zinc-600 font-mono text-xs">NO_MATCHES_FOUND</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
