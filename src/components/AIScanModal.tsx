import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Target, Plus, ShieldCheck, Check } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useProtocol } from '../context/ProtocolContext';
import { geminiService } from '../services/geminiService';

export default function AIScanModal() {
  const { isAIChatOpen, setIsAIChatOpen, focusedProduct, initialAction, setInitialAction } = useUI();
  const { addToProtocol } = useProtocol();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const isOpen = isAIChatOpen && initialAction === 'SCAN' && focusedProduct;

  useEffect(() => {
    if (isOpen && focusedProduct && !scanResult && !isScanning) {
      performScan();
    }
  }, [isOpen, focusedProduct]);

  const performScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    try {
      const prompt = `Analyze this product realistically for a premium performance commerce site. DO NOT SURROUND THE RESPONSE WITH MARKDOWN CODE BLOCKS. JUST OUTPUT RAW JSON.
      
      Product Name: ${focusedProduct?.name}
      Category: ${focusedProduct?.category}
      Description: ${focusedProduct?.description || 'Premium grade formulation'}
      
      Return a JSON object with EXACTLY these keys:
      {
        "summary": "1 sentence quick summary",
        "performanceCategory": "e.g. Cognitive Output, Muscle Restoration, etc",
        "mainUseCase": "Short description of main use",
        "bestPairedWith": "1 or 2 complementary product types",
        "idealUserType": "Who is this for?",
        "suggestedProtocol": "A short suggested protocol/timing",
        "responsibleUse": "A short responsible use or disclaimer note"
      }`;

      const response = await geminiService.analyze(prompt, "You are the RAW_NEURAL_CORE.");
      
      let text = response.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(text);
      setScanResult(data);
    } catch (e) {
      console.error(e);
      setScanResult({
        summary: "Product analysis unavailable. Please try again.",
        performanceCategory: focusedProduct?.category || "Unknown",
        mainUseCase: "General purpose",
        bestPairedWith: "Other RAW products",
        idealUserType: "All users",
        suggestedProtocol: "Follow label instructions",
        responsibleUse: "Use as directed."
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    setIsAIChatOpen(false);
    setTimeout(() => {
      setInitialAction(null);
      setScanResult(null);
    }, 500);
  };

  const handleCopy = () => {
    if (!scanResult) return;
    const text = `RAW ANALYSIS: ${focusedProduct?.name}\n\nSummary: ${scanResult.summary}\nUse Case: ${scanResult.mainUseCase}\nProtocol: ${scanResult.suggestedProtocol}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-editorial-bg/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-editorial-bg border border-editorial-border-light shadow-[0_30px_100px_rgba(0,0,0,0.15)] rounded-[2rem] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-editorial-border flex items-center justify-between bg-editorial-bg relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-[2px] bg-red-600 shadow-[0_0_15px_#dc2626]" />
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-red-900/20 border border-red-500/30 flex items-center justify-center">
                    <Target className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-xl tracking-tighter text-editorial-text uppercase">{focusedProduct?.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                      <span className="font-mono text-[9px] text-red-500 uppercase tracking-widest font-bold">NEURAL_SCAN_ACTIVE</span>
                    </div>
                  </div>
               </div>
               <button onClick={handleClose} className="p-2 hover:bg-editorial-text/10 rounded-full transition-colors text-editorial-text-muted hover:text-editorial-text">
                 <X className="w-6 h-6" />
               </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6 relative min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isScanning && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-editorial-bg/90 backdrop-blur-sm z-10">
                    <div className="w-16 h-16 border-4 border-red-900 border-t-red-500 rounded-full animate-spin mb-4" />
                    <p className="font-mono text-xs text-red-500 uppercase tracking-widest animate-pulse">Analyzing Formulation...</p>
                 </div>
              )}

              {scanResult && (
                <>
                  <div>
                    <h4 className="font-mono text-[9px] uppercase tracking-widest text-editorial-text-muted font-bold mb-3 flex items-center justify-between">
                      Neural Summary
                      {'speechSynthesis' in window && (
                        <button 
                          onClick={() => {
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(`${scanResult.summary}. Suggested protocol: ${scanResult.suggestedProtocol}`);
                            window.speechSynthesis.speak(utterance);
                          }}
                          className="hover:text-red-500 transition-colors"
                          title="Read Aloud"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                        </button>
                      )}
                    </h4>
                    <p className="text-sm md:text-base text-editorial-text leading-relaxed max-w-xl font-medium">{scanResult.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <DataBlock label="Category" value={scanResult.performanceCategory} />
                     <DataBlock label="Use Case" value={scanResult.mainUseCase} />
                     <DataBlock label="Ideal User" value={scanResult.idealUserType} />
                     <DataBlock label="Best Paired With" value={scanResult.bestPairedWith} />
                  </div>

                  <div className="bg-editorial-bg p-5 rounded-xl border border-editorial-border shadow-inner-glow relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <h4 className="block font-mono text-[9px] uppercase tracking-widest text-editorial-text-muted font-bold mb-2">Suggested Protocol</h4>
                    <p className="text-[13px] md:text-sm text-editorial-text/90 leading-relaxed">{scanResult.suggestedProtocol}</p>
                  </div>

                  <div className="flex items-start gap-3 bg-red-950/10 p-4 rounded-xl border border-red-900/20 shadow-[0_4px_20px_rgba(220,38,38,0.05)]">
                    <ShieldCheck className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] md:text-xs text-editorial-text-muted leading-relaxed font-light">
                      {scanResult.responsibleUse}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-editorial-border bg-editorial-bg flex justify-between items-center">
               <button 
                 onClick={handleCopy}
                 disabled={!scanResult}
                 className="flex items-center gap-2 px-4 py-2 hover:bg-editorial-text/5 rounded-xl text-editorial-text-muted hover:text-editorial-text transition-colors font-mono text-[10px] uppercase font-bold tracking-widest"
               >
                 {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                 {copied ? 'Copied' : 'Copy Analysis'}
               </button>

               <button
                 onClick={() => focusedProduct && addToProtocol(focusedProduct)}
                 className="bg-editorial-text text-editorial-bg px-6 py-3 rounded-xl font-mono text-[11px] uppercase font-bold tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
               >
                 <Plus className="w-4 h-4" />
                 Save to Protocol
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DataBlock({ label, value }: { label: string, value: string }) {
  return (
    <div className="border-l-2 border-editorial-border-light pl-4 py-1">
      <span className="block font-mono text-[9px] uppercase tracking-widest text-editorial-text-muted font-bold mb-1">{label}</span>
      <span className="block text-[13px] text-editorial-text capitalize truncate">{value}</span>
    </div>
  );
}
