import { geminiService } from './geminiService';
import { generateSystemInstruction } from './aiKnowledge';
import { speak } from './speechService';
import { AIState } from '../context/AIContext';

export const requestAIResponse = async (
  message: string,
  pathname: string,
  aiContext: AIState,
  voiceTone: string,
  onProgress: (text: string) => void,
  onComplete: (fullResponse: string) => void,
  onError: (error: Error) => void,
  isShopIframeOpen: boolean = false
) => {
  try {
    const systemInstruction = `${generateSystemInstruction(pathname, aiContext, isShopIframeOpen)}
    CRITICAL_DIRECTIVE: YOU ARE AN EXCLUSIVE AI ADVISOR FOR RAW OFFICIAL. Act as a natural, knowledgeable, and engaging performance coach. Engage in a fluent, human-like dialogue, providing concise but comprehensive advice. Do not act like a terminal or raw computer command interface. 
    LANGUAGE_RESTRICTION: Respond strictly in English.
    
    RESPONSE_STRUCTURE: Keep responses conversational, concise, and structured logically, integrating product information naturally.
    
    TONE_DIRECTIVE: ALWAYS PROVIDE ANSWERS IN THE STYLE OF A ${voiceTone.toUpperCase()} EXPERT. Avoid making medical claims. Focus on performance, recovery, output optimization, and structural support. Be authoritative yet approachable, elite, and deeply knowledgeable. Be proactive and suggest the next step in their performance journey.`;

    let fullResponse = '';
    let spokenUntil = 0;

    await geminiService.analyzeStream(message, systemInstruction, (text) => {
      fullResponse = text;
      onProgress(fullResponse);

      // Incremental speech
      const remaining = fullResponse.slice(spokenUntil);
      const sentenceMatch = remaining.match(/[.!?|](\s+|$)/);
      if (sentenceMatch) {
          const sentence = remaining.slice(0, sentenceMatch.index! + sentenceMatch[0].length);
          speak(
              sentence, 
              undefined, 
              false,
              voiceTone as any
          );
          spokenUntil += sentence.length;
      }
    });
    
    // Speak any remaining
    if (spokenUntil < fullResponse.length) {
        speak(fullResponse.slice(spokenUntil), undefined, false, voiceTone as any);
    }

    onComplete(fullResponse);
  } catch (error) {
    console.error("AI Orchestrator Error:", error);
    onError(error as Error);
  }
};
