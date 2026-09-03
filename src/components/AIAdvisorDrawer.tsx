import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Brain, Sparkles, ChevronRight, Loader2, Mic, MicOff, Volume2, BarChart3, LineChart, PieChart, Activity, Cpu, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart as ReLineChart, Line, AreaChart, Area, Cell } from 'recharts';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAIContext } from '../context/AIContext';
import { useUI } from '../context/UIContext';
import { useAppCtx } from '../context/AppContext';
import { useVoiceControl } from '../hooks/useVoiceControl';
import MagneticWrapper from './MagneticWrapper';
import { geminiService } from '../services/geminiService';
import { useToast } from './common/Toast';

export default function AIAdvisorDrawer() {
  const { aiContext } = useAIContext();
  const { isAIChatOpen, setIsAIChatOpen, initialAction, setInitialAction } = useUI();
  const { getAppSnapshot } = useAppCtx();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string, isVisualData?: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [showVisuals, setShowVisuals] = useState(false);
  const [visualData, setVisualData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { startListening, stopListening, voiceState, audioLevel, speak } = useVoiceControl();

  const handleActionTrigger = useCallback(async (action: 'SCAN' | 'DEEP_DIVE' | 'VISUAL_ANALYSIS') => {
    if (isLoading) return;
    setIsLoading(true);
    
    // Add the user command message
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: `[COMMAND_INIT] // ${action}_PROTOCOL` 
    }]);

    if (action === 'VISUAL_ANALYSIS') {
        setShowVisuals(true);
        // Mocking dynamic visual data based on product context
        const mockData = {
            performance: [
                { name: 'Stability', value: 85 + Math.random() * 10 },
                { name: 'Potency', value: 90 + Math.random() * 8 },
                { name: 'Recovery', value: 75 + Math.random() * 15 },
                { name: 'Focus', value: 88 + Math.random() * 10 },
                { name: 'Purity', value: 99 }
            ],
            synergy: [
                { name: 'Phase 1', current: 45, projected: 60 },
                { name: 'Phase 2', current: 52, projected: 75 },
                { name: 'Phase 3', current: 68, projected: 88 },
                { name: 'Phase 4', current: 85, projected: 95 }
            ]
        };
        setVisualData(mockData);
        
        setMessages(prev => [...prev, { 
            role: 'ai', 
            content: `Visual telemetry active for **${aiContext.currentProductName}**. I have initialized high-fidelity performance metrics and synergy projection models. See live data visualizations below for technical benchmarking.`,
            isVisualData: true
        }]);
        setIsLoading(false);
        return;
    }

    const systemPrompt = "You are a RAW_NEURAL_ADVISOR. Provide high-fidelity, tactical insights. Tone: Elite, industrial, terminal aesthetic. English only.";
    const userPrompt = action === 'SCAN' 
      ? `Perform a rapid NEURAL_SCAN on ${aiContext.currentProductName}. Focus on primary synergies and immediate operational advantages. Context: ${aiContext.currentProductSummary}. Use minimalist terminal formatting.`
      : `Execute a DEEP_DIVE telemetry audit on ${aiContext.currentProductName}. Provide a comprehensive multi-phase diagnostic report including molecular stability, pairing synergy, and long-term bio-trajectory. Context: ${aiContext.currentProductSummary}.`;

    try {
        const response = await geminiService.analyze(userPrompt, systemPrompt);
        setMessages(prev => [...prev, { role: 'ai', content: response.text || `ERROR: Unable to complete ${action}.` }]);
    } catch (err) {
        setMessages(prev => [...prev, { role: 'ai', content: `CRITICAL_FAILURE: UPLINK_LOST during ${action}.` }]);
    } finally {
        setIsLoading(false);
    }
  }, [aiContext, isLoading]);

  const [selectedContext, setSelectedContext] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<string>('technical');
  const toneOptions = ['technical', 'friendly', 'concise', 'military_commander', 'calm_scientist'];
  const contextSections = ['Neural Core', 'Biometry', 'Logistics', 'Performance'];

  useEffect(() => {
    if (isAIChatOpen && aiContext.currentProductName) {
        if (messages.length === 0) {
            setMessages([{ role: 'ai', content: `Neural Advisor initialized for ${aiContext.currentProductName}. I am ready to provide strategic insights on usage, pairing, and optimization. How can I assist?` }]);
        }
        
        if (initialAction) {
            handleActionTrigger(initialAction);
            setInitialAction(null);
        }
    }
  }, [isAIChatOpen, aiContext.currentProductName, messages.length, initialAction, handleActionTrigger, setInitialAction]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleDictation = () => {
      if (isDictating) {
          stopListening();
          setIsDictating(false);
      } else {
          setIsDictating(true);
          let baseInput = input;
          startListening('dictation', (text, isFinal) => {
              setInput((baseInput ? baseInput + ' ' : '') + text);
              if (isFinal) {
                  baseInput = (baseInput ? baseInput + ' ' : '') + text;
              }
          });
      }
  };

  // Sync dictating state if voice system is stopped externally
  useEffect(() => {
      if (isDictating && voiceState === 'idle') {
          setIsDictating(false);
      }
  }, [voiceState, isDictating]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // Validation
    const sanitizedInput = input.trim().substring(0, 2000); 
    if (sanitizedInput.length === 0) return;

    const userMsg = sanitizedInput;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    
    // Add empty AI message to stream into
    setMessages(prev => [...prev, { role: 'ai', content: '' }]);

    const contextContextStr = selectedContext.length > 0 
      ? ` The user has prioritized these knowledge bases for this query: ${selectedContext.join(', ')}.`
      : '';

    const globalCommandsStr = (window as any).availableCommands 
        ? ` Available system commands you could instruct the user to use via the Neural Command Terminal: ${JSON.stringify((window as any).availableCommands)}.`
        : '';
        
    const appSnapshotStr = ` Current Application Snapshot: ${getAppSnapshot()}`;

    let aiResponse = '';
    try {
        await geminiService.analyzeStream(
            `You are a professional Neural Advisor for RAW Official. Provide concise, high-impact insights on this product: ${aiContext.currentProductName || 'Unknown'}. Context: ${aiContext.currentProductSummary || ''}.${contextContextStr}${globalCommandsStr}${appSnapshotStr} User Query: ${userMsg}`,
            `You are an expert advisor for high-performance athletic and cognitive supplements. Tone Mode: ${selectedTone}. Your tone should match this mode precisely, being professional, precise, and empowering. Use bold, clear formatting where helpful.`,
            (chunk) => {
                aiResponse += chunk;
                setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1].content = aiResponse;
                    return next;
                });
            }
        );
    } catch (err) {
        setMessages(prev => {
            const next = [...prev];
            next[next.length - 1].content = 'Connection to Neural Core failed. Please try again.';
            return next;
        });
        addToast("Connection to Neural Core failed", "error");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAIChatOpen && (
        <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAIChatOpen(false)}
                className="fixed inset-0 bg-editorial-bg/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 35, stiffness: 250 }}
                className="fixed right-0 top-0 h-full w-full max-w-[650px] bg-editorial-bg/98 backdrop-blur-3xl border-l border-editorial-border-light z-[101] shadow-[-50px_0_150px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/[0.05] via-transparent to-transparent pointer-events-none mix-blend-screen" />
                
                {/* HUD Scanning Line */}
                <div className="absolute inset-x-0 h-[1px] bg-red-600/20 top-0 z-50 animate-scan pointer-events-none" />

                <div className="p-10 lg:p-14 border-b border-editorial-border flex items-center justify-between relative z-20 bg-editorial-bg/40 active-reflection">
                    <div className="flex items-center gap-10">
                        <div className="relative w-24 h-24 flex items-center justify-center bg-editorial-bg rounded-[2.5rem] border border-editorial-border-light shadow-depth-2 group">
                             <motion.div 
                               animate={{ rotate: 360 }}
                               transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                               className="absolute inset-0 border-[2px] border-red-600/10 rounded-[2.5rem] border-t-red-600"
                             />
                             <div className="absolute inset-2 border border-red-600/5 rounded-[2rem] animate-pulse" />
                            <Brain className="w-10 h-10 text-editorial-text drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                               <div className="w-2 h-6 bg-red-600" />
                               <h2 className="font-sans font-black text-editorial-text text-4xl xl:text-5xl uppercase tracking-tighter leading-none">Neural Core</h2>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]" />
                               <p className="font-mono text-[10px] text-editorial-text-muted uppercase tracking-[0.5em] font-black">{aiContext.currentProductName || 'SYSTEM_READY'}</p>
                            </div>
                        </div>
                    </div>
                    <MagneticWrapper>
                        <button 
                          onClick={() => setIsAIChatOpen(false)} 
                          aria-label="Close Neural Core"
                          className="p-6 hover:bg-red-600/10 rounded-[2rem] transition-all duration-700 bg-editorial-text/5 border border-editorial-border hover:border-red-600/40 group/close"
                        >
                            <X className="w-7 h-7 text-zinc-600 group-hover/close:text-editorial-text group-hover/close:rotate-90 transition-all duration-700" />
                        </button>
                    </MagneticWrapper>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 lg:p-14 space-y-12 custom-scrollbar relative z-10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
                    
                    {/* System Context Monitor */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/40 border border-editorial-border p-6 rounded-[2rem] backdrop-blur-md mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.4em]">_SYSTEM_CONTEXT_MONITOR</span>
                            <div className="flex gap-1">
                                <div className="w-1 h-3 bg-red-600 animate-pulse" />
                                <div className="w-1 h-3 bg-red-600/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <div className="w-1 h-3 bg-red-600/30 animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-editorial-bg border border-editorial-border-light p-4 rounded-xl">
                                <span className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest mb-1">TARGET_PRODUCT</span>
                                <span className="font-mono text-[10px] text-editorial-text truncate block">{aiContext.currentProductName || 'UNDEFINED'}</span>
                            </div>
                            <div className="bg-editorial-bg border border-editorial-border-light p-4 rounded-xl">
                                <span className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest mb-1">ADVISOR_TONE</span>
                                <span className="font-mono text-[10px] text-editorial-text uppercase">{selectedTone}</span>
                            </div>
                        </div>
                    </motion.div>

                    {messages.map((msg, i) => (
                        <motion.div 
                           key={i} 
                           initial={{ opacity: 0, x: msg.role === 'user' ? 40 : -40, y: 20, filter: "blur(10px)" }} 
                           animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }} 
                           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                           className={`flex ${msg.role === 'user' ? 'justify-end pl-20' : 'justify-start pr-20'}`}
                        >
                            <div className={`relative p-8 lg:p-10 rounded-[3rem] shadow-depth-2 backdrop-blur-3xl border border-editorial-border group overflow-hidden ${
                                msg.role === 'user' 
                                ? 'bg-red-600/90 text-white border-red-500/20 shadow-[0_20px_50px_rgba(220,38,38,0.3)]' 
                                : 'bg-editorial-bg/60 text-editorial-text'
                            }`}>
                                <div className={`absolute top-0 w-1/4 h-[1px] ${msg.role === 'user' ? 'bg-editorial-text/20' : 'bg-red-500/20'} ${msg.role === 'user' ? 'right-10' : 'left-10'}`} />
                                {/* Cinematic Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${msg.role === 'user' ? 'from-white/10' : 'from-red-600/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                                {msg.role === 'ai' && <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:100%_4px] opacity-10 pointer-events-none" />}
                                
                                <div className="flex items-center gap-4 mb-4 font-mono text-[9px] tracking-[0.4em] font-black uppercase relative z-10" aria-hidden="true">
                                   <span className="opacity-40">{msg.role === 'user' ? 'AUTHORIZED_COMMAND' : 'NEURAL_LINK_STREAM'}</span>
                                   <div className="h-[1px] flex-1 bg-current opacity-40" />
                                   {msg.role === 'ai' && (
                                       <button 
                                          onClick={() => speak(msg.content)} 
                                          className="text-editorial-text-muted hover:text-red-500 transition-colors z-10 relative cursor-pointer"
                                          aria-label="Read AI response aloud"
                                       >
                                          <Volume2 className="w-5 h-5" />
                                       </button>
                                   )}
                                </div>
                                <div className="text-[16px] lg:text-[17px] leading-relaxed font-medium tracking-tight markdown-body" aria-live={msg.role === 'ai' ? 'polite' : 'off'}>
                                   <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>

                                {msg.isVisualData && visualData && (
                                     <motion.div 
                                         initial={{ opacity: 0, height: 0 }}
                                         animate={{ opacity: 1, height: 'auto' }}
                                         className="mt-8 space-y-8 overflow-hidden"
                                     >
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                             <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                                                 <div className="flex items-center gap-3 mb-6">
                                                     <BarChart3 className="w-4 h-4 text-red-500" />
                                                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">PERFORMANCE_METRICS</span>
                                                 </div>
                                                 <div className="h-[200px] w-full">
                                                     <ResponsiveContainer width="100%" height="100%">
                                                         <BarChart data={visualData.performance}>
                                                             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                             <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} axisLine={false} />
                                                             <YAxis stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} axisLine={false} />
                                                             <Tooltip 
                                                                contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                                                itemStyle={{ color: '#fff' }}
                                                             />
                                                             <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                                         </BarChart>
                                                     </ResponsiveContainer>
                                                 </div>
                                             </div>

                                             <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                                                 <div className="flex items-center gap-3 mb-6">
                                                     <Activity className="w-4 h-4 text-red-500" />
                                                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SYNERGY_PROJECTION</span>
                                                 </div>
                                                 <div className="h-[200px] w-full">
                                                     <ResponsiveContainer width="100%" height="100%">
                                                         <AreaChart data={visualData.synergy}>
                                                             <defs>
                                                                 <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                                                     <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                                                                     <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                                                                 </linearGradient>
                                                             </defs>
                                                             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                             <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} axisLine={false} />
                                                             <YAxis stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} axisLine={false} />
                                                             <Tooltip 
                                                                contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                                                itemStyle={{ color: '#fff' }}
                                                             />
                                                             <Area type="monotone" dataKey="projected" stroke="#dc2626" fillOpacity={1} fill="url(#colorProjected)" />
                                                             <Area type="monotone" dataKey="current" stroke="rgba(255,255,255,0.4)" fill="transparent" />
                                                         </AreaChart>
                                                     </ResponsiveContainer>
                                                 </div>
                                             </div>
                                         </div>

                                         <div className="bg-red-600/5 border border-red-600/10 rounded-2xl p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-red-600/20 rounded-xl">
                                                    <ShieldCheck className="w-5 h-5 text-red-500" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black uppercase text-red-500 tracking-widest">VALIDATED_SYNERGY</div>
                                                    <div className="text-[12px] text-zinc-400">Neutral stack integrity at 99.4%</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">UPLINK_STABILITY</div>
                                                <div className="text-[14px] text-zinc-200 font-mono">OPTIMAL</div>
                                            </div>
                                         </div>
                                    </motion.div>
                                 )}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex flex-col gap-6 p-10 bg-red-600/[0.03] backdrop-blur-xl rounded-[3rem] border border-red-600/10 animate-pulse relative overflow-hidden shadow-inner group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/[0.08] to-transparent animate-shimmer mix-blend-screen" />
                            {/* Premium Loading Sweep Overlay */}
                            <motion.div 
                              animate={{ y: ["-100%", "200%"] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-red-600/10 to-transparent pointer-events-none opacity-50"
                            />
                            
                            <div className="flex items-center gap-6 relative z-10">
                               <div className="relative w-12 h-12 flex items-center justify-center">
                                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                                  <motion.div 
                                     animate={{ rotate: -360 }}
                                     transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                     className="absolute inset-0 border-2 border-transparent border-l-red-600/40 rounded-full"
                                  />
                                  <div className="absolute inset-0 border-2 border-red-600/20 rounded-full border-t-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                               </div>
                                <div className="space-y-1">
                                   <div className="text-red-500 font-mono text-[11px] tracking-[0.5em] font-black uppercase text-glow">PROCESSING_NEURAL_COMMAND</div>
                                   <div className="text-zinc-600 font-mono text-[8px] tracking-[0.3em] font-bold">LATENCY: 0.14ms // CORE: GEMINI_V3_TURBO</div>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                               <div className="h-[2px] w-full bg-red-600/10 rounded-full overflow-hidden relative shadow-[inset_0_0_2px_rgba(255,255,255,0.05)]">
                                  <motion.div 
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-red-600 to-transparent drop-shadow-[0_0_15px_rgba(220,38,38,1)]"
                                  />
                               </div>
                               <div className="h-[2px] w-2/3 bg-red-600/10 rounded-full relative overflow-hidden">
                                 <motion.div 
                                    initial={{ x: "-50%" }}
                                    animate={{ x: "150%" }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    className="h-full w-1/4 bg-red-600/50"
                                  />
                               </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-10 lg:p-14 border-t border-editorial-border bg-editorial-bg/98 relative z-20 shadow-premium">
                    <div className="mb-6 flex gap-2 flex-wrap">
                        <DropdownMenu.Root>
                             <DropdownMenu.Trigger className="bg-editorial-bg text-[10px] font-black uppercase text-white p-3 rounded-xl border border-editorial-border-light hover:border-red-600/50 transition-colors">
                                 {selectedContext.length === 0 ? 'Select Context' : `${selectedContext.length} Context(s) Selected`}
                             </DropdownMenu.Trigger>
                             <DropdownMenu.Portal>
                                 <DropdownMenu.Content className="bg-editorial-bg border border-editorial-border-light rounded-2xl p-4 z-[105] shadow-depth-2">
                                     {contextSections.map(section => (
                                         <DropdownMenu.CheckboxItem 
                                            key={section}
                                            checked={selectedContext.includes(section)}
                                            onCheckedChange={(checked) => {
                                                setSelectedContext(prev => checked ? [...prev, section] : prev.filter(s => s !== section));
                                            }}
                                            className="text-[12px] text-white p-3 rounded-lg hover:bg-red-600/20 data-[state=checked]:bg-red-600/40 flex items-center gap-3 cursor-pointer"
                                         >
                                             {section}
                                         </DropdownMenu.CheckboxItem>
                                     ))}
                                 </DropdownMenu.Content>
                             </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                        <DropdownMenu.Root>
                             <DropdownMenu.Trigger className="bg-editorial-bg text-[10px] font-black uppercase text-white p-3 rounded-xl border border-editorial-border-light hover:border-red-600/50 transition-colors">
                                 Tone: {selectedTone.replace('_', ' ')}
                             </DropdownMenu.Trigger>
                             <DropdownMenu.Portal>
                                 <DropdownMenu.Content className="bg-editorial-bg border border-editorial-border-light rounded-2xl p-4 z-[105] shadow-depth-2">
                                     {toneOptions.map(tone => (
                                         <DropdownMenu.Item 
                                            key={tone}
                                            onClick={() => setSelectedTone(tone)}
                                            className={`text-[12px] text-white p-3 rounded-lg hover:bg-red-600/20 ${selectedTone === tone ? 'bg-red-600/40' : ''} flex items-center gap-3 cursor-pointer`}
                                         >
                                             {tone.replace('_', ' ')}
                                         </DropdownMenu.Item>
                                     ))}
                                 </DropdownMenu.Content>
                             </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                    <motion.div 
                         style={{ 
                            boxShadow: isDictating ? `0 0 ${20 + audioLevel * 100}px rgba(220, 38, 38, ${0.1 + audioLevel * 0.4}) inset` : '',
                            borderColor: isDictating ? `rgba(220, 38, 38, ${0.3 + audioLevel * 0.7})` : ''
                         }}
                         className={`relative flex gap-6 p-4 rounded-[3rem] border shadow-depth-inset group focus-within:border-red-600/40 transition-all duration-1000 items-center ${isDictating ? 'bg-red-950/10' : 'bg-editorial-bg border-editorial-border-light'}`}>
                        <div className="absolute -top-6 left-10 px-4 bg-editorial-bg border-x border-t border-editorial-border-light font-mono text-[8px] text-editorial-text-muted uppercase tracking-[0.4em] font-black rounded-t-lg">
                           Command_Interface_v4
                        </div>
                        <button
                          onClick={toggleDictation}
                          aria-label={isDictating ? "Stop voice dictation" : "Start voice dictation"}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isDictating 
                            ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                            : 'bg-editorial-bg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {isDictating ? (
                               <motion.div 
                                  animate={{ scale: 1 + audioLevel * 0.5 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                               >
                                  <MicOff className="w-5 h-5" />
                               </motion.div>
                          ) : <Mic className="w-5 h-5" />}
                        </button>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            aria-label="Ask Neural Core a question"
                            placeholder={isDictating ? "Listening..." : "Initialize query protocol..."}
                            className={`flex-1 bg-transparent px-2 py-6 text-[16px] text-editorial-text focus:outline-none transition-all placeholder:text-zinc-700 font-sans tracking-tight ${isDictating ? 'opacity-80' : ''}`}
                        />
                        {isDictating && (
                            <div className="absolute left-28 right-28 bottom-2 flex items-center justify-center gap-1 opacity-50 pointer-events-none">
                               {Array.from({ length: 40 }).map((_, i) => {
                                  let hFactor = Math.random() * 0.5 + 0.5;
                                  return (
                                     <motion.div 
                                        key={i} 
                                        className="w-1 bg-red-500 rounded-full"
                                        animate={{ height: 4 + audioLevel * hFactor * 24 }}
                                        transition={{ type: "tween", duration: 0.1 }}
                                     />
                                  );
                               })}
                            </div>
                        )}
                        <button 
                          onClick={handleSend} 
                          disabled={isLoading} 
                          aria-label="Send query"
                          className="w-16 h-16 lg:w-20 lg:h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center hover:bg-red-500 transition-all duration-700 active:scale-90 shadow-depth-2 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] disabled:opacity-30 disabled:grayscale group/send overflow-hidden relative z-10"
                        >
                            <Send className="w-8 h-8 relative z-10 transform group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent/20 to-transparent opacity-0 group-hover/send:opacity-100 transition-opacity" />
                        </button>
                    </motion.div>
                    <div className="mt-8 flex justify-between items-center px-6">
                       <div className="flex gap-2">
                          {[1,2,3,4].map(i => <div key={i} className={`w-1 h-3 bg-red-600/${i*10} border border-editorial-border`} />)}
                       </div>
                       <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-[0.6em] font-black">Secure_Encryption_Active</span>
                    </div>
                </div>
            </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
