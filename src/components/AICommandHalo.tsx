import { motion } from "motion/react";
import { Bot, Mic, Activity } from "lucide-react";
import { useUI } from "../context/UIContext";
import { useVoiceControl } from "../context/VoiceContext";

export default function AICommandHalo() {
  const { isAIChatOpen, setIsAIChatOpen } = useUI();
  const { voiceState, isListening, startListening, stopListening } = useVoiceControl();

  const getHaloStyles = () => {
    switch(voiceState) {
       case 'listening': return 'border-emerald-500 shadow-[0_0_20px_#10b981] bg-emerald-500/20';
       case 'processing': return 'border-cyan-500 shadow-[0_0_20px_#06b6d4] bg-cyan-500/20';
       case 'speaking': return 'border-purple-500 shadow-[0_0_20px_#a855f7] bg-purple-500/20';
       case 'error': return 'border-red-500 shadow-[0_0_20px_#ef4444] bg-red-500/20';
       default: return 'border-zinc-700/50 hover:border-zinc-500 bg-zinc-900/50 backdrop-blur-xl hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]';
    }
  };

  const getIcon = () => {
     if (voiceState === 'listening') return <Mic className="w-5 h-5 text-emerald-500 animate-pulse" />;
     if (voiceState === 'processing') return <Activity className="w-5 h-5 text-cyan-500 animate-pulse" />;
     if (voiceState === 'speaking') return <Bot className="w-5 h-5 text-purple-500" />;
     return <Bot className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />;
  };

  return (
    <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAIChatOpen(!isAIChatOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 group ${getHaloStyles()}`}
        aria-label="Toggle Neural Advisor"
      >
        {getIcon()}
      </motion.button>
      
      {/* Voice Toggle Mini Action */}
      <motion.button
         whileHover={{ scale: 1.1 }}
         whileTap={{ scale: 0.9 }}
         onClick={() => isListening ? stopListening() : startListening('command')}
         className={`w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-xl transition-colors ${isListening ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'}`}
         aria-label={isListening ? "Stop Listening" : "Start Voice Command"}
      >
         <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-emerald-500' : 'text-zinc-500'}`} />
      </motion.button>
    </div>
  );
}
