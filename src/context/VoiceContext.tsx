import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUI } from './UIContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from './SettingsContext';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
export type VoiceMode = 'command' | 'dictation';

interface VoiceContextType {
    isSupported: boolean;
    transcript: string;
    aiResponse: string | null;
    error: string | null;
    voiceState: VoiceState;
    voiceMode: VoiceMode;
    audioLevel: number;
    startListening: (mode?: VoiceMode, onDictationResult?: (text: string, isFinal: boolean) => void) => void;
    stopListening: () => void;
    resetError: () => void; // Added
    isListening: boolean;
    speak: (text: string, onEndCallback?: () => void) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
    const { setIsListening: setGlobalListening, setIsAIChatOpen, isVoiceCommandActive, setIsVoiceCommandActive } = useUI();
    const { settings } = useSettings();
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const voiceStateRef = useRef<VoiceState>('idle');
    const [voiceMode, setVoiceMode] = useState<VoiceMode>('command');
    const [error, setError] = useState<string | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    
    const settingsRef = useRef(settings);
    const voiceModeRef = useRef(voiceMode);
    const manualStopRef = useRef(false);
    const isProcessingRef = useRef(false);

    useEffect(() => {
        voiceStateRef.current = voiceState;
    }, [voiceState]);

    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    useEffect(() => {
        voiceModeRef.current = voiceMode;
    }, [voiceMode]);
    
    const recognitionRef = useRef<any>(null);
    const dictationCallbackRef = useRef<((text: string, isFinal: boolean) => void) | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    const isListening = voiceState === 'listening';
    const isContinuous = isVoiceCommandActive || settings.voiceContinuous;
    const isContinuousRef = useRef(isContinuous);

    // Text-to-Speech
    const speak = useCallback((text: string, onEndCallback?: () => void) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            // Avoid capturing our own speech
            if (recognitionRef.current && voiceState === 'listening') {
                try { recognitionRef.current.stop(); } catch(e) {}
            }
            
            setVoiceState('speaking');
            
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            let selectedVoice = null;
            if (settings.aiVoiceTone === 'friendly') {
                selectedVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.name.includes('Samantha'));
            } else if (settings.aiVoiceTone === 'british_scholar') {
                selectedVoice = voices.find(v => v.name.includes('Google UK English Female')) || voices.find(v => v.name.includes('Daniel'));
            } else if (settings.aiVoiceTone === 'aussie_mate') {
                 selectedVoice = voices.find(v => v.name.includes('Google UK English Male')) || voices.find(v => v.name.includes('Karen'));
            }
            
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.name.includes('Google US English')) || 
                                voices.find(v => v.name.includes('Samantha')) || 
                                voices.find(v => !!v.lang.match(/^en-/i));
            }
            if (selectedVoice) utterance.voice = selectedVoice;
            
            utterance.lang = 'en-US';
            utterance.rate = settings.voiceRate || 1.0;
            utterance.pitch = settings.voicePitch || 1.0;
            utterance.volume = 0.9;
            
            utterance.onend = () => {
                setVoiceState('idle');
                if (onEndCallback) onEndCallback();
            };
            
            window.speechSynthesis.speak(utterance);
        } else {
             setVoiceState('idle');
             if (onEndCallback) onEndCallback();
        }
    }, [settings.aiVoiceTone, settings.voiceRate, settings.voicePitch, voiceState]);

    const stopMicAnalyser = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        analyserRef.current = null;
        setAudioLevel(0);
    }, []);

    const startMicAnalyser = useCallback(async () => {
        try {
            stopMicAnalyser();
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            mediaStreamRef.current = stream;
            
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
                latencyHint: 'interactive',
                sampleRate: 44100,
            });
            audioContextRef.current = audioCtx;
            
            console.log("[DIAG] AudioContext Status:", audioCtx.state);
            
            // Critical for browsers that suspend AudioContext until user interaction
            if (audioCtx.state === 'suspended') {
                console.log("[DIAG] Attempting to resume suspended AudioContext...");
                await audioCtx.resume().catch(err => console.error("Could not resume AudioContext:", err));
                console.log("[DIAG] AudioContext Resumed Status:", audioCtx.state);
            }
            
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;
            
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const updateLevel = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                // Normalize 0-255 to 0.0-1.0
                const level = Math.min(1, average / 128);
                setAudioLevel(level); 
                
                // Diagnostic logging
                if (Math.random() < 0.05 && level > 0.05) {
                    console.log("[DIAG] Mic Audio Level Active:", level.toFixed(2));
                }

                animationFrameRef.current = requestAnimationFrame(updateLevel);
            };
            
            updateLevel();
        } catch (err) {
            console.error("Failed to start mic analyser:", err);
        }
    }, [stopMicAnalyser]);

    const startListening = useCallback(async (mode: VoiceMode = 'command', onDictationResult?: (text: string, isFinal: boolean) => void) => {
        if (!recognitionRef.current) return;
        
        // Unlock speech synthesis on user gesture
        if ('speechSynthesis' in window) {
            const unlockUtterance = new SpeechSynthesisUtterance('');
            unlockUtterance.volume = 0;
            window.speechSynthesis.speak(unlockUtterance);
        }

        try { 
            setVoiceMode(mode);
            manualStopRef.current = false;
            
            if (onDictationResult) {
                dictationCallbackRef.current = onDictationResult;
            } else {
                dictationCallbackRef.current = null;
            }
            
            // Only update state if not already listening to avoid flickering/re-renders
            if (voiceStateRef.current !== 'listening') {
                setVoiceState('listening');
            }

            // Always attempt to start analyser, as mic needs to be active
            await startMicAnalyser();
            
            // Apply setting and start
            recognitionRef.current.continuous = (mode === 'dictation');
            recognitionRef.current.start();
        } catch (e: any) { 
            if (e.name === 'DOMException' && (e.message.includes('already started') || e.message.includes('has already started'))) {
                console.warn("Already started, ignoring");
            } else {
                console.error("Start error:", e);
                setVoiceState('idle');
                setError('Microphone access failed.');
            }
        }
    }, [startMicAnalyser]);

    // Command processor
    const processCommand = useCallback(async (text: string) => {
        if (voiceMode === 'dictation') return; // Handled via callback
        console.log("VoiceContext: processCommand called with:", text);
        if (!text || text.trim() === '') {
            console.warn("Empty transcript, skipping processing");
            return;
        }
        setVoiceState('processing');
        setAiResponse(null);
        try {
            console.log("Sending request to /api/gemini/command");
            const commandsList = (window as any).availableCommands || [];
            
            const response = await fetch('/api/gemini/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    transcript: text, 
                    context: { 
                        path: location.pathname,
                        availableCommands: commandsList
                    } 
                })
            });
            console.log("Received response from server, status:", response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Voice command fetch error:", errorData);
                throw new Error(errorData.error || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            console.log("Voice command response data:", data);
            
            // AI response handling
            if (data.response) {
                setAiResponse(data.response);
                speak(data.response, () => {
                    // After speaking, if continuous, restart
                    if (isContinuousRef.current && !manualStopRef.current && voiceMode === 'command') {
                        startListening('command');
                    }
                });
            } else {
                setVoiceState('idle');
            }
            
            if (data.command === 'navigate' && data.value) {
                 navigate(data.value);
            } else if (data.command === 'chat') {
                 setIsAIChatOpen(true);
            } else if (data.command === 'execute_system_command' && data.value) {
                if (typeof (window as any).executeAppCommand === 'function') {
                    (window as any).executeAppCommand(data.value);
                }
            }
            
        } catch (e: any) {
            console.error("Command interpretation error in processCommand:", e);
            setError("Command translation failed: " + (e.message || e));
            setVoiceState('idle');
        }
    }, [navigate, setIsAIChatOpen, location.pathname, speak, startListening, voiceMode]);

    // Initialize singleton recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }
        
        if (SpeechRecognition && !recognitionRef.current) {
            const rec = new SpeechRecognition();
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onstart = () => { 
                console.log("SpeechRecognition started - Audio Context state:", audioContextRef.current?.state);
                setVoiceState('listening'); 
                setError(null); 
                isProcessingRef.current = false; 

                // Ensure audio context is running when recognition starts
                if (audioContextRef.current?.state === 'suspended') {
                    audioContextRef.current.resume().then(() => {
                        console.log("AudioContext resumed on rec start");
                    });
                }
            };
            
            rec.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                  if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                  } else {
                    interimTranscript += event.results[i][0].transcript;
                  }
                }
                
                console.log("Recognition result: final=", finalTranscript, "interim=", interimTranscript);
                
                if (dictationCallbackRef.current) {
                    if (finalTranscript || interimTranscript) {
                         dictationCallbackRef.current(finalTranscript + interimTranscript, !!finalTranscript);
                    }
                } else {
                    if (finalTranscript) {
                        setTranscript(finalTranscript);
                        if (!isProcessingRef.current) {
                            isProcessingRef.current = true;
                            processCommandRef.current(finalTranscript).finally(() => {
                                isProcessingRef.current = false;
                            });
                        }
                    } else if (interimTranscript) {
                        setTranscript(interimTranscript);
                    }
                }
            };
            
            rec.onerror = (e: any) => { 
                console.error("SpeechRecognition error:", e.error, e);
                if (e.error === 'no-speech') {
                    // Try to avoid showing hard error if continuous
                    if (isContinuousRef.current && !manualStopRef.current) {
                        return;
                    }
                    setError("No speech detected. Check your microphone.");
                    setVoiceState('error');
                    return;
                }
                
                if (e.error === 'not-allowed') {
                    setError("Microphone access denied. Please check permissions.");
                } else if (e.error === 'network') {
                    setError("Network error in neural uplink.");
                } else {
                    setError(`Voice Error: ${e.error}`);
                }
                setVoiceState('error');
            };
        
            rec.onend = () => {
                console.log("SpeechRecognition ended. Final state requested:", voiceStateRef.current);
                
                // If we are currently processing or speaking, or manual stop was called
                if (manualStopRef.current) {
                    setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
                    return;
                }

                // Auto-restart if continuous mode is enabled and it stopped unexpectedly (not processing/speaking)
                if (isContinuousRef.current && voiceStateRef.current !== 'processing' && voiceStateRef.current !== 'speaking') {
                    console.log("Continuous mode: Attempting auto-restart...");
                    setTimeout(() => {
                        if (isContinuousRef.current && !manualStopRef.current && 
                            (voiceStateRef.current === 'listening' || voiceStateRef.current === 'idle' || voiceStateRef.current === 'error')) {
                            startListeningRef.current(voiceModeRef.current);
                        }
                    }, 300);
                } else {
                    setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
                }
            };
            
            recognitionRef.current = rec;
        }
        
        return () => { 
          if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
            recognitionRef.current = null;
          }
          stopMicAnalyserRef.current();
        };
    }, []);

    const stopListening = useCallback(() => {
        manualStopRef.current = true;
        // Also toggle off the global command mode if it was active
        if (isVoiceCommandActive) {
            setIsVoiceCommandActive(false);
        }
        
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { console.error("Stop error:", e); }
            setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
            stopMicAnalyser();
            if ('speechSynthesis' in window) {
               window.speechSynthesis.cancel();
            }
        }
    }, [stopMicAnalyser]);

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    const processCommandRef = useRef(processCommand);
    const startListeningRef = useRef(startListening);
    const stopListeningRef = useRef(stopListening);
    const stopMicAnalyserRef = useRef(stopMicAnalyser);
    
    useEffect(() => {
        processCommandRef.current = processCommand;
        startListeningRef.current = startListening;
        stopListeningRef.current = stopListening;
        stopMicAnalyserRef.current = stopMicAnalyser;
    }, [processCommand, startListening, stopListening, stopMicAnalyser]);

    useEffect(() => {
        isContinuousRef.current = isContinuous;
        
        // Only handle stopping via global state to ensure direct user gesture for starting
        if (!isVoiceCommandActive && isListening && !settings.voiceContinuous) {
            stopListeningRef.current();
        }
    }, [isVoiceCommandActive, isContinuous, settings.voiceContinuous, isListening]);

    return (
        <VoiceContext.Provider value={{ isSupported: !!recognitionRef.current, transcript, aiResponse, error, voiceState, voiceMode, audioLevel, startListening, stopListening, resetError, isListening, speak }}>
            {children}
        </VoiceContext.Provider>
    );
};

export const useVoiceControl = () => {
    const context = useContext(VoiceContext);
    if (!context) {
        throw new Error("useVoiceControl must be used within a VoiceProvider");
    }
    return context;
};
