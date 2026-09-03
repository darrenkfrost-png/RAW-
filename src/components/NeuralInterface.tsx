import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  X, Mic, MicOff, Send, Volume2, VolumeX, Sparkles, 
  Terminal, Zap, Activity, Cpu, Shield, Box, Target, 
  BarChart3, RefreshCw, AlertCircle, FileSearch, ShieldAlert, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUI } from '../context/UIContext';
import { useAIContext } from '../context/AIContext';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { speak as speakService } from '../services/speechService';
import { generateSystemInstruction } from '../services/aiKnowledge';
import MagneticWrapper from './MagneticWrapper';
import { requestAIResponse } from '../services/AiOrchestrator';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function NeuralInterface({ inline = false }: { inline?: boolean }) {
  const { 
    isAIChatOpen, 
    setIsAIChatOpen, 
    focusedProduct, 
    setFocusedProduct,
    initialAction,
    setInitialAction,
    isShopIframeOpen,
    setIsOracleChatOpen
  } = useUI();
  const { aiContext } = useAIContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'IDLE' | 'ANALYZING' | 'TRANSMITTING' | 'NEURAL_LOCK'>('IDLE');
  const [visionMode, setVisionMode] = useState(false);
  const [deepDiveMode, setDeepDiveMode] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  const { 
    isListening, 
    startListening, 
    stopListening, 
    transcript, 
    voiceState, 
    audioLevel,
    speak: contextSpeak 
  } = useVoiceControl();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update input text when voice transcript changes
  useEffect(() => {
    if (transcript) {
        setInputText(transcript);
    }
  }, [transcript]);

  // Trigger auto-scan or deep-dive when focusedProduct/action changes
  useEffect(() => {
    if (focusedProduct && isAIChatOpen && initialAction) {
      if (initialAction === 'SCAN') {
        handleSendMessage(`INITIALIZE_NEURAL_SCAN: ${focusedProduct.name}`, true);
        setVisionMode(true);
        setDeepDiveMode(false);
      } else if (initialAction === 'DEEP_DIVE') {
        setDeepDiveMode(true);
        handleSendMessage(`GENERATE_NEURAL_DEEP_DIVE_FOR: ${focusedProduct.name}`, true);
        setVisionMode(true);
      }
      
      setInitialAction(null); // Reset after consumption
      
      // Animate scan progress
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [focusedProduct, isAIChatOpen, initialAction]);

  // Trigger Uplink Greeting
  useEffect(() => {
    if (isShopIframeOpen && !isAIChatOpen) {
      setIsAIChatOpen(true);
      handleSendMessage("SYSTEM_NOTIFICATION: EXTERNAL_UPLINK_ESTABLISHED. I am monitoring your session on the official procurement node. Ask any questions about technical specifications or protocol compatibility.", true);
    }
  }, [isShopIframeOpen]);

  // Initialize Speech Recognition
  // REPLACED BY useVoiceControl HOOK

  // Audio Visualization
  useEffect(() => {
    if (!isAIChatOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const bars = 64;
      const barWidth = canvas.width / bars;
      
      // Use audioLevel to drive multiple bars with some variation
      for (let i = 0; i < bars; i++) {
        // Create a fake spectrum based on audioLevel
        const centerDist = Math.abs(bars / 2 - i) / (bars / 2);
        const heightFactor = Math.max(0.1, 1 - centerDist);
        const noise = Math.random() * 0.1;
        const actualLevel = isListening ? audioLevel : (voiceState === 'speaking' ? Math.random() * 0.2 : 0);
        
        const barHeight = (actualLevel * 2 + noise) * heightFactor * canvas.height;
        
        const opacity = Math.min(1, actualLevel * 2 + 0.1);
        ctx.fillStyle = `rgba(220, 38, 38, ${opacity})`;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }
      
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isAIChatOpen, audioLevel, isListening, voiceState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const [voiceName, setVoiceName] = useState<string>('Google'); // Default voice for tech feel
  
  // Memoize status indicators to prevent re-renders
  const statusMetrics = React.useMemo(() => ({
    latency: "12ms",
    sync: "98.4%",
    security: "ENCRYPTED"
  }), []);

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  const speakMessage = (text: string, voiceName?: string) => {
    if (isMuted) return;
    speakService(
      text, 
      voiceName, 
      true, 
      'technical',
      () => {
        if (isListening) {
           stopListening();
        }
      },
      () => {
        if (isListening) {
           startListening();
        }
      }
    );
  };

  // Helper to fetch and convert image to base64 for Gemini
  const urlToGenerativePart = async (url: string, mimeType: string) => {
    try {
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      // Browser environment doesn't have Buffer, so we use a different approach
      let binary = '';
      const bytes = new Uint8Array(data);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return {
        inlineData: {
          data: btoa(binary),
          mimeType
        },
      };
    } catch (e) {
      console.warn("Could not fetch image for vision analysis", e);
      return null;
    }
  };

  const handleSendMessage = async (text: string, isAutoScan: boolean = false) => {
    if (!text.trim() || (isProcessing && !isAutoScan)) return;
    
    setInputText('');
    setIsProcessing(true);
    setSystemStatus('ANALYZING');
    
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'ai', text: '', timestamp: new Date() }]);
    
    await requestAIResponse(
      text,
      location.pathname,
      { ...aiContext, ...{ /* ... */ } },
      'technical', // Or current tone
      (msgText) => {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = msgText;
          return newMessages;
        });
      },
      (fullResponse) => {
        setIsProcessing(false);
        setSystemStatus('IDLE');
        // Auto-navigation detection (Simple heuristic)
        if (fullResponse.toLowerCase().includes('navigating to shop')) navigate('/shop');
        if (fullResponse.toLowerCase().includes('opening combat protocols')) navigate('/combat');
        if (fullResponse.toLowerCase().includes('opening nutrients')) navigate('/nutrients');
      },
      (error) => {
        const errMsg: Message = { 
          id: crypto.randomUUID(), 
          role: 'ai', 
          text: `SYSTEM_FAILURE: ${error.message || 'UNKNOWN_ERROR'}. ATTEMPTING_REBOOT...`, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, errMsg]);
        setIsProcessing(false);
        setSystemStatus('IDLE');
      },
      false
    );
  };



  // Minimal persistent state
  if (!isAIChatOpen && !inline) {
    return null;
  }
  
  if (isShopIframeOpen && !inline) return null;

  const containerClasses = inline 
    ? "h-full w-full bg-editorial-bg/90 relative flex flex-col"
    : "fixed inset-y-0 right-0 z-[1000] w-full md:w-[500px] bg-editorial-bg/90 backdrop-blur-3xl border-l border-editorial-border flex flex-col shadow-[-20px_0_100px_rgba(0,0,0,0.1)]";

  return (
    <AnimatePresence>
      <motion.div
        initial={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={inline ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
        className={containerClasses}
      >
        {/* Tech Header */}
        <div className="p-8 border-b border-editorial-border-light relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse" />
          
          {/* Vision Scan Overlay (If product is focused) */}
          <AnimatePresence>
            {focusedProduct && visionMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 relative rounded-3xl overflow-hidden border border-red-500/30 group/vision shadow-[0_0_40px_rgba(220,38,38,0.2)]"
              >
                <div className="aspect-video bg-editorial-bg relative">
                   <img src={focusedProduct.image} alt="Target" className="w-full h-full object-cover mix-blend-screen opacity-80 group-hover/vision:scale-110 transition-transform duration-[3000ms]" />
                   
                   {/* Scanning Grid */}
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#dc262620_1px,transparent_1px),linear-gradient(to_bottom,#dc262620_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                   
                   {/* Moving Scan Bar */}
                   <motion.div 
                     animate={{ y: ['0%', '100%', '0%'] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-x-0 h-[2px] bg-red-600 shadow-[0_0_15px_#dc2626] z-10"
                   />
                   
                   {/* Data points */}
                   <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 bg-editorial-bg/80 px-2 py-1 rounded border border-red-500/30">
                        <Target size={10} className="text-red-500 animate-pulse" />
                        <span className="font-mono text-[8px] text-editorial-text">LOCK: {scanProgress}%</span>
                      </div>
                      <div className="flex items-center gap-2 bg-editorial-bg/80 px-2 py-1 rounded border border-editorial-border-light">
                        <Activity size={10} className="text-emerald-500" />
                        <span className="font-mono text-[8px] text-editorial-text">INTEGRITY: 99.8%</span>
                      </div>
                   </div>

                   <div className="absolute bottom-4 right-4 flex gap-4">
                      <button 
                        onClick={() => {
                          setDeepDiveMode(true);
                          handleSendMessage(`GENERATE_NEURAL_DEEP_DIVE_FOR: ${focusedProduct.name}`, false);
                        }}
                        className="flex items-center gap-2 bg-red-600 hover:bg-editorial-text hover:text-editorial-bg transition-all px-4 py-2 rounded-xl"
                      >
                         <BarChart3 size={14} />
                         <span className="font-mono text-[9px] font-black uppercase tracking-widest">DEEP_DIVE</span>
                      </button>
                      <button 
                        onClick={() => setVisionMode(false)}
                        className="bg-editorial-bg/80 p-2 rounded-xl text-editorial-text-muted hover:text-red-500 transition-colors border border-editorial-border-light"
                      >
                         <X size={14} />
                      </button>
                   </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-1 w-full bg-editorial-surface overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${scanProgress}%` }}
                     className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]"
                   />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                <span className="text-meta-premium">NEURAL_CORE_V2.0</span>
              </div>
              <h2 className="text-2xl font-display text-editorial-text tracking-widest italic text-premium">PROTOCOL_ORACLE</h2>
            </div>
            <button 
              onClick={() => setIsOracleChatOpen(false)}
              className="p-2 hover:bg-editorial-text/5 rounded-full transition-colors group"
            >
              <X className="w-6 h-6 text-editorial-text-muted group-hover:text-red-500 transition-colors" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <StatusMetric icon={<Cpu size={12}/>} label="LATENCY" value={statusMetrics.latency} />
            <StatusMetric icon={<Activity size={12}/>} label="NEURAL_SYNC" value={statusMetrics.sync} />
            <StatusMetric icon={<Shield size={12}/>} label="SECURE_LINK" value={statusMetrics.security} />
            <StatusMetric 
              icon={<Box size={12}/>} 
              label="FOCUSED_TARGET" 
              value={focusedProduct ? focusedProduct.name : 'NONE'} 
              highlight={!!focusedProduct}
              onClear={() => setFocusedProduct(null)}
            />
          </div>
        </div>

        {/* Neural Pulse Area */}
        <div className="relative h-24 bg-gradient-to-b from-transparent to-transparent border-b border-editorial-border">
          <canvas ref={canvasRef} className="w-full h-full opacity-50" width={500} height={96} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[9px] font-mono text-red-500/50 tracking-[0.3em] font-bold">
              {systemStatus}
            </span>
          </div>
        </div>

        {/* Intelligence Stream */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 relative">
          {deepDiveMode && (
            <div className="absolute inset-0 bg-red-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-10 pointer-events-none">
               <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <RefreshCw className="w-16 h-16 text-red-600 animate-spin" />
                    <div className="absolute inset-0 blur-2xl bg-red-600/30 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-mono text-[11px] text-red-500 font-black tracking-[0.6em] uppercase">DEEP_DIVE_ACTIVE</span>
                    <span className="font-mono text-[9px] text-editorial-text-muted uppercase tracking-widest animate-pulse italic">Aggregating Global Telemetry...</span>
                  </div>
               </div>
            </div>
          )}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-red-600 animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-red-600/20" />
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-mono text-editorial-text-muted uppercase tracking-widest leading-relaxed">
                  // STANDING BY FOR COMMANDS<br />
                  // VOICE_INTEGRATION_ACTIVE<br />
                  // APPS_KNOWLEDGE_LOADED
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-2 w-full max-w-sm mt-8">
                {(() => {
                  let chips = [];
                  if (aiContext.currentProductName) {
                    chips = [
                      { icon: <Box className="text-red-500" />, text: `Explain ${aiContext.currentProductName} simply` },
                      { icon: <Zap className="text-emerald-500" />, text: 'What pairs best with this?' },
                      { icon: <Target className="text-blue-500" />, text: 'Build a stack around this' },
                      { icon: <ShieldAlert className="text-amber-500" />, text: 'Is this beginner friendly?' },
                    ];
                  } else if (aiContext.knowledgeEntryId) {
                    chips = [
                      { icon: <Box className="text-red-500" />, text: 'Summarise this entry' },
                      { icon: <Zap className="text-emerald-500" />, text: 'Explain the benefits simply' },
                      { icon: <Target className="text-blue-500" />, text: 'Build a protocol around this' },
                    ];
                  } else if (aiContext.comparedProducts && aiContext.comparedProducts.length > 0) {
                    chips = [
                      { icon: <Target className="text-red-500" />, text: 'Which is best for beginners?' },
                      { icon: <Zap className="text-emerald-500" />, text: 'Which is best for recovery?' },
                      { icon: <Box className="text-blue-500" />, text: 'Which should I add to my stack?' },
                    ];
                  } else if (aiContext.selectedProtocolItems && aiContext.selectedProtocolItems.length > 0) {
                    chips = [
                      { icon: <Zap className="text-red-500" />, text: 'Review my protocol stack' },
                      { icon: <Target className="text-emerald-500" />, text: 'Optimise my stack' },
                      { icon: <AlertCircle className="text-amber-500" />, text: 'What is missing?' },
                      { icon: <Shield className="text-blue-500" />, text: 'Make this beginner friendly' },
                    ];
                  } else {
                    chips = [
                      { icon: <Target className="text-red-500" />, text: 'Build me a £50 recovery stack' },
                      { icon: <Zap className="text-emerald-500" />, text: 'What pairs well with creatine?' },
                      { icon: <Box className="text-blue-500" />, text: 'What should I use for sleep and calm?' },
                      { icon: <Shield className="text-amber-500" />, text: 'Build me a beginner gym stack' },
                      { icon: <Activity className="text-purple-500" />, text: 'I train combat 3 times a week, what do I need?' },
                    ];
                  }
                  
                  return chips.map(s => (
                    <button 
                      key={s.text}
                      onClick={() => handleSendMessage(s.text)}
                      className="flex items-center gap-4 p-4 border border-editorial-border bg-editorial-text/5 hover:bg-zinc-800 transition-all rounded-xl text-left text-[11px] font-mono uppercase tracking-widest group"
                    >
                      {s.icon}
                      <span className="text-editorial-text-muted group-hover:text-editorial-text">{s.text}</span>
                    </button>
                  ));
                })()}
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={m.id} 
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-2 opacity-30 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-editorial-text-muted">
                  {m.role === 'user' ? 'OPERATIVE' : 'NEURAL_CORE'}
                </span>
                <span className="text-[8px] font-mono text-zinc-600">
                  [{m.timestamp.toLocaleTimeString()}]
                </span>
                {m.role === 'ai' && (
                   <MagneticWrapper strength={0.2}>
                     <button 
                        onClick={() => speakMessage(m.text)} 
                        className={`ml-3 p-2 rounded-xl transition-all duration-500 flex items-center gap-2 group/speaker ${voiceState === 'speaking' ? 'bg-red-600 text-white shadow-[0_0_15px_#dc2626]' : 'text-meta-premium bg-white/5 hover:bg-white/10 hover:!text-red-500'}`}
                        title="Neural Synthesis"
                     >
                        <Volume2 className={`w-4 h-4 ${voiceState === 'speaking' ? 'animate-pulse' : ''}`} />
                        <span className="text-[8px] font-black uppercase tracking-widest hidden group-hover/speaker:inline-block">Read Aloud</span>
                     </button>
                   </MagneticWrapper>
                )}
              </div>
              <div className={`p-6 text-[13px] font-mono leading-relaxed max-w-[90%] relative group/msg ${
                m.role === 'user' 
                  ? 'bg-editorial-surface text-editorial-text rounded-2xl rounded-tr-none border border-editorial-border' 
                : 'bg-red-950/10 text-editorial-text rounded-2xl rounded-tl-none border border-red-900/20 shadow-[0_10px_40px_rgba(220,38,38,0.05)]'
              }`}>
                {m.role === 'ai' && (
                  <div className="absolute -left-1 top-0 bottom-0 w-1 bg-red-600/50 blur-sm group-hover/msg:bg-red-600 transition-colors" />
                )}
                {m.role === 'ai' ? (
                  <div className="relative">
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4 text-premium-content">
                      {m.text.split(/(?=\d+\.\s*[A-Z_]+:)/).map((section, idxx) => {
                        const match = section.match(/^\d+\.\s*([A-Z_]+):\s*([\s\S]*)/);
                        if (match) {
                          const [, title, content] = match;
                          return (
                            <div key={idxx} className="border border-editorial-border bg-editorial-bg/20 p-4 rounded-xl shadow-depth-inset backdrop-blur-sm group/section hover:border-red-500/30 transition-colors">
                              <span className="block text-[10px] text-red-500 font-black mb-2 tracking-[0.4em] uppercase text-meta-premium drop-shadow-[0_0_8px_rgba(220,38,38,0.3)]">{title.replace(/_/g, ' ')}</span>
                              <span className="text-editorial-text block leading-relaxed opacity-90 group-hover/section:opacity-100 transition-opacity">{content.trim()}</span>
                            </div>
                          );
                        }
                        return (
                          <div key={idxx} className="space-y-3">
                            {section.trim().split('\n').map((line, lIdx) => (
                              <p key={lIdx} className="leading-relaxed opacity-80">{line}</p>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    {/* Visual fade masks for scroll indicator */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-editorial-bg/20 to-transparent pointer-events-none z-10" />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
                  </div>
                ) : (
                  <div>{m.text}</div>
                )}

                {m.role === 'ai' && idx === messages.length - 1 && !isProcessing && (
                  <div className="mt-6 pt-6 border-t border-red-500/10 flex gap-4">
                     <button 
                       onClick={() => handleSendMessage("INITIALIZE_DEEP_DIVE: REQUESTING_RELEVANT_TECHNICAL_LOGS")}
                       className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all text-[9px] font-black tracking-widest uppercase group/dive"
                     >
                        <FileSearch size={12} className="group-hover/dive:scale-125 transition-transform" />
                        Deep Dive
                     </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1 h-1 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <span className="text-[9px] font-mono text-editorial-text-muted uppercase tracking-widest animate-pulse">
                DECRYPTING_NEURAL_RESPONSE...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Command Input Area */}
        <div className="p-8 border-t border-editorial-border-light bg-editorial-bg space-y-6">
          <div className="flex gap-4">
            <MagneticWrapper>
              <button 
                onClick={toggleListening}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                  isListening 
                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse' 
                    : 'bg-editorial-surface border-editorial-border text-editorial-text-muted hover:text-editorial-text hover:border-editorial-border-light'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </MagneticWrapper>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
              className="flex-1 relative group"
            >
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="EXECUTE_COMMAND_..."
                className="w-full h-14 bg-editorial-surface/50 border border-editorial-border rounded-2xl px-6 pr-14 font-mono text-sm text-editorial-text focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all placeholder:text-zinc-700"
              />
              {isProcessing && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 ">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
              )}
              <button 
                type="submit"
                disabled={isProcessing || !inputText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-editorial-surface border border-editorial-border-light rounded-xl text-editorial-text-muted hover:text-editorial-text hover:border-red-600/50 hover:bg-neutral-800 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>

            <MagneticWrapper>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                  isMuted 
                    ? 'bg-editorial-surface border-editorial-border text-red-500' 
                    : 'bg-editorial-surface border-editorial-border-light text-editorial-text-muted hover:text-red-600'
                }`}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </MagneticWrapper>
          </div>

          <div className="flex justify-between items-center text-[8px] font-mono text-zinc-700 tracking-[0.2em]">
            <button
               onClick={() => setVoiceName(v => v === 'Google' ? 'Microsoft' : 'Google')}
               className="hover:text-red-500 transition-colors"
            >
              VOICE: {voiceName}
            </button>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><Zap size={8} /> TURBO_MODE: ON</span>
              <span className="flex items-center gap-1"><Terminal size={8} /> SHELL: BASH_Z</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatusMetric({ icon, label, value, highlight, onClear }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean, onClear?: () => void }) {
  return (
    <div className={`p-3 card-glass border transition-colors relative ${highlight ? 'border-red-600/50 bg-red-600/5' : 'border-editorial-border hover:border-editorial-border-light'}`}>
      {onClear && highlight && (
        <button 
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={8} />
        </button>
      )}
      <div className={`flex items-center gap-2 mb-1 transition-colors ${highlight ? 'text-editorial-accent' : 'text-editorial-text-muted group-hover:text-editorial-accent'}`}>
        {icon}
        <span className="text-[7px] font-black tracking-widest">{label}</span>
      </div>
      <div className="text-[10px] font-mono text-editorial-text group-hover:scale-105 transition-transform origin-left truncate">{value}</div>
    </div>
  );
}
