
import { AITone } from '../context/SettingsContext';

// Simple speech service using browser SpeechSynthesis API
const synth = window.speechSynthesis;

export const stopSpeaking = () => {
    synth.cancel();
};

export const speak = (
  text: string, 
  voiceName?: string, 
  cancelExisting: boolean = true, 
  tone: AITone = 'technical',
  onStart?: () => void,
  onEnd?: () => void
) => {
  if (!text || text === "NO_DATA_RECEIVED" || text === "TECHNICAL_DEEP_DIVE_AVAILABLE_ON_REQUEST") {
    if (onEnd) onEnd();
    return;
  }
  
  // Only cancel if explicitly requested (e.g. for a brand new user query)
  if (cancelExisting) {
    synth.cancel();
  }

  // Aggressive cleaning to remove markdown clutter
  // Aiming for conversational, punchy audio
  const cleanText = text
    .replace(/[*#`_~]/g, '')     // Remove MD
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Plain text links
    .replace(/(?:\r\n|\r|\n)/g, '. ')   // Replace newlines with pauses
    .replace(/\s+/g, ' ')              // Normalize whitespace
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  let preferredLang = 'en-US';
  
  // Adjusted for a more "flowing" natural speed/pitch and region
  if (tone === 'technical') {
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
  } else if (tone === 'friendly') {
      utterance.rate = 1.1;
      utterance.pitch = 1.1;
  } else if (tone === 'concise') {
      utterance.rate = 1.4;
      utterance.pitch = 1.0;
  } else if (tone === 'british_scholar') {
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      preferredLang = 'en-GB';
  } else if (tone === 'aussie_mate') {
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      preferredLang = 'en-AU';
  } else if (tone === 'gym_bro') {
      utterance.rate = 1.1;
      utterance.pitch = 0.8;
  } else if (tone === 'zen_master') {
      utterance.rate = 0.85;
      utterance.pitch = 0.8;
      preferredLang = 'en-IN'; // often has a calmer prosody, or fallback to US
  } else if (tone === 'cyberpunk_hacker') {
      utterance.rate = 1.2;
      utterance.pitch = 0.7;
  } else if (tone === 'military_commander') {
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
  } else if (tone === 'calm_scientist') {
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
  } else if (tone === 'french_sophisticate') {
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      preferredLang = 'fr-FR';
  } else if (tone === 'texas_ranger') {
      utterance.rate = 0.9;
      utterance.pitch = 0.85;
  }

  utterance.lang = preferredLang;
  
  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  
  const voices = synth.getVoices();
  let voice;
  
  if (voiceName) {
    // Try to find a voice matching the name AND english language
    voice = voices.find(v => v.name.includes(voiceName) && v.lang.startsWith(preferredLang.split('-')[0]));
    // Fallback to name only
    if (!voice) {
       voice = voices.find(v => v.name.includes(voiceName));
    }
  }
  
  // If no voice found by name or no name provided, prefer the preferred language
  if (!voice) {
    // try exact preferred language
    voice = voices.find(v => v.lang === preferredLang);
    // fallback to any english language matching region
    if (!voice) {
       voice = voices.find(v => v.lang.startsWith(preferredLang));
    }
    // general fallback
    if (!voice) {
       voice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
    }
  }
  
  if (voice) {
    utterance.voice = voice;
  }
  
  synth.speak(utterance);
};
