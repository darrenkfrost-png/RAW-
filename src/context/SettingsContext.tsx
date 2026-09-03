import React, { createContext, useContext, useState, useEffect } from 'react';

export type AITone = 
  'technical' | 'friendly' | 'concise' | 'british_scholar' | 'aussie_mate' | 
  'gym_bro' | 'zen_master' | 'cyberpunk_hacker' | 'military_commander' | 
  'calm_scientist' | 'french_sophisticate' | 'texas_ranger';

export const allAITones: AITone[] = [
  'technical', 'friendly', 'concise', 'british_scholar', 'aussie_mate', 
  'gym_bro', 'zen_master', 'cyberpunk_hacker', 'military_commander', 
  'calm_scientist', 'french_sophisticate', 'texas_ranger'
];

interface Settings {
  /** The film playing behind the whole site, and how present it is. */
  videoWallpaper: boolean;
  videoWallpaperId: string;
  /** 0–1. Defaults to a third: enough to feel, not enough to fight the words. */
  videoWallpaperOpacity: number;
  /** The screensaver, and how long the site waits before it takes over. */
  screensaverEnabled: boolean;
  screensaverDelayMs: number;
  screensaverVideoId: string;
  activeWallpaper: string;
  wallpaperColor: string;
  wallpaperSpeed: number;
  wallpaperBrightness: number;
  aiVoiceTone: AITone;
  voiceRate: number;
  voicePitch: number;
  voiceContinuous: boolean;
  visualFidelity: 'low' | 'balanced' | 'high' | 'overdrive';
  realtimeDiagnostics: boolean;
  motionIntensity: 'reduced' | 'standard' | 'enhanced';
  uiStabilityFeedback: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Settings = {
  videoWallpaper: true,
  videoWallpaperId: 'giveaway',
  videoWallpaperOpacity: 0.33,
  screensaverEnabled: true,
  screensaverDelayMs: 60000,
  screensaverVideoId: 'wide',
  activeWallpaper: 'polyrhythm',
  wallpaperColor: '#dc2626',
  wallpaperSpeed: 1,
  wallpaperBrightness: 1,
  aiVoiceTone: 'technical',
  voiceRate: 1,
  voicePitch: 1,
  voiceContinuous: false,
  visualFidelity: 'balanced',
  realtimeDiagnostics: true,
  motionIntensity: 'standard',
  uiStabilityFeedback: true,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('raw_global_settings');
      if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
    return defaultSettings;
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('raw_global_settings', JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage access denied:", e);
      }
      return updated;
    });
  };

  // Apply settings to body classes and dynamic visual design accents
  useEffect(() => {
    const classList = document.body.classList;
    
    // Remove old classes
    classList.remove('fidelity-low', 'fidelity-balanced', 'fidelity-high', 'fidelity-overdrive');
    classList.remove('motion-reduced', 'motion-standard', 'motion-enhanced');
    classList.remove('diagnostics-enabled', 'diagnostics-disabled');

    // Add new classes
    classList.add(`fidelity-${settings.visualFidelity}`);
    classList.add(`motion-${settings.motionIntensity}`);
    classList.add(settings.realtimeDiagnostics ? 'diagnostics-enabled' : 'diagnostics-disabled');

    // Dynamically inject color variables for custom themes
    if (settings.wallpaperColor) {
      document.documentElement.style.setProperty('--color-editorial-accent', settings.wallpaperColor);
      
      try {
        // Compute subtle accent glows dynamically based on selected HEX representation
        const hex = settings.wallpaperColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) || 220;
        const g = parseInt(hex.substring(2, 4), 16) || 38;
        const b = parseInt(hex.substring(4, 6), 16) || 38;
        document.documentElement.style.setProperty('--color-editorial-accent-glow', `rgba(${r}, ${g}, ${b}, 0.5)`);
      } catch (err) {
        document.documentElement.style.setProperty('--color-editorial-accent-glow', 'rgba(220, 38, 38, 0.5)');
      }
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
