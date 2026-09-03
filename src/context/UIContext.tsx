import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

export type ChromePart = 'header' | 'sidebar' | 'statusBar' | 'voiceHub';

export const CHROME_PARTS: ChromePart[] = ['header', 'sidebar', 'statusBar', 'voiceHub'];

interface UIContextType {
  uiScale: number;
  setUIScale: (scale: number) => void;
  isStatusBarVisible: boolean;
  setStatusBarVisible: (visible: boolean) => void;
  hasCompletedIntro: boolean;
  setIntroCompleted: (completed: boolean) => void;
  visualFidelity: number;
  setVisualFidelity: (fidelity: number) => void;
  diagnosticsActive: boolean;
  setDiagnosticsActive: (active: boolean) => void;
  isWallpaperMode: boolean;
  setIsWallpaperMode: (active: boolean) => void;
  isAIChatOpen: boolean;
  setIsAIChatOpen: (open: boolean) => void;
  isOracleChatOpen: boolean;
  setIsOracleChatOpen: (open: boolean) => void;
  isShopIframeOpen: boolean;
  setIsShopIframeOpen: (open: boolean) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  isVoiceCommandActive: boolean;
  setIsVoiceCommandActive: (active: boolean) => void;
  is110Percent: boolean;
  setIs110Percent: (overdrive: boolean) => void;
  isWallpaperSettingsOpen: boolean;
  setIsWallpaperSettingsOpen: (open: boolean) => void;
  isGlobalSettingsOpen: boolean;
  setIsGlobalSettingsOpen: (open: boolean) => void;
  isSystemHealthOpen: boolean;
  setIsSystemHealthOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  /** Which pieces of the app's furniture are put away. See ChromeRestore. */
  chromeHidden: ChromePart[];
  toggleChrome: (part: ChromePart) => void;
  setChromeHidden: (parts: ChromePart[]) => void;
  enterFocusMode: () => void;
  restoreChrome: () => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isDiscoveryOpen: boolean;
  setIsDiscoveryOpen: (open: boolean) => void;
  focusedProduct: any | null;
  setFocusedProduct: (product: any | null) => void;
  initialAction: 'SCAN' | 'DEEP_DIVE' | 'VISUAL_ANALYSIS' | null;
  setInitialAction: (action: 'SCAN' | 'DEEP_DIVE' | 'VISUAL_ANALYSIS' | null) => void;
  activeReaderItem: any | null;
  setActiveReaderItem: (item: any | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [uiScale, setUIScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("raw_ui_scale");
      return saved ? parseFloat(saved) : 1;
    } catch (e) {
      return 1;
    }
  });
  const [isStatusBarVisible, setStatusBarVisible] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("raw_status_bar");
      return saved !== null ? saved === "true" : true;
    } catch (e) {
      return true;
    }
  });
  const [hasCompletedIntro, setHasCompletedIntro] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("raw_intro_seen") !== null;
    } catch (e) {
      return false;
    }
  });
  const [visualFidelity, setVisualFidelity] = useState<number>(() => {
     try {
       const saved = localStorage.getItem("raw_visual_fidelity");
       return saved ? parseInt(saved, 10) : 100;
     } catch (e) {
       return 100;
     }
  });
  const [diagnosticsActive, setDiagnosticsActive] = useState<boolean>(() => {
    try {
       const saved = localStorage.getItem("raw_diagnostics_active");
       return saved !== null ? saved === "true" : true;
    } catch (e) {
      return true;
    }
  });
  /* Full-screen mode. Stored, because someone who cleared the furniture away
     to read meant it — being handed the whole interface back on reload would
     undo the choice every time. */
  const [chromeHidden, setChromeHiddenState] = useState<ChromePart[]>(() => {
    try {
      const saved = localStorage.getItem("raw_chrome_hidden");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((p: string) => CHROME_PARTS.includes(p as ChromePart)) : [];
    } catch { return []; }
  });

  const persistChrome = useCallback((parts: ChromePart[]) => {
    setChromeHiddenState(parts);
    try { localStorage.setItem("raw_chrome_hidden", JSON.stringify(parts)); } catch { /* private mode */ }
  }, []);

  const toggleChrome = useCallback((part: ChromePart) => {
    setChromeHiddenState(prev => {
      const next = prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part];
      try { localStorage.setItem("raw_chrome_hidden", JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }, []);

  const enterFocusMode = useCallback(() => persistChrome([...CHROME_PARTS]), [persistChrome]);
  const restoreChrome = useCallback(() => persistChrome([]), [persistChrome]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("raw_sidebar_collapsed");
      return saved !== null ? saved === "true" : true;
    } catch (e) {
      return true;
    }
  });
  
  const [isWallpaperMode, setIsWallpaperMode] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isOracleChatOpen, setIsOracleChatOpen] = useState(false);
  const [isShopIframeOpen, setIsShopIframeOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceCommandActive, setIsVoiceCommandActive] = useState(false);
  const [is110Percent, setIs110Percent] = useState(false);
  const [isWallpaperSettingsOpen, setIsWallpaperSettingsOpen] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [isSystemHealthOpen, setIsSystemHealthOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [focusedProduct, setFocusedProduct] = useState<any | null>(null);
  const [initialAction, setInitialAction] = useState<'SCAN' | 'DEEP_DIVE' | 'VISUAL_ANALYSIS' | null>(null);
  const [activeReaderItem, setActiveReaderItem] = useState<any | null>(null);

  // Persistence
  // Removed redundant useEffect: state is initialized lazily via useState
  
  const updateScale = useCallback((scale: number) => {
    setUIScale(scale);
    try {
      localStorage.setItem("raw_ui_scale", scale.toString());
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
  }, []);

  const updateVisualFidelity = useCallback((fidelity: number) => {
    setVisualFidelity(fidelity);
    try {
      localStorage.setItem("raw_visual_fidelity", fidelity.toString());
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
  }, []);

  const updateDiagnosticsActive = useCallback((active: boolean) => {
    setDiagnosticsActive(active);
    try {
      localStorage.setItem("raw_diagnostics_active", active.toString());
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
  }, []);

  const updateStatusBarVisible = useCallback((visible: boolean) => {
    setStatusBarVisible(visible);
    try {
      localStorage.setItem("raw_status_bar", visible.toString());
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
  }, []);

  const updateSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    try {
      localStorage.setItem("raw_sidebar_collapsed", collapsed.toString());
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
  }, []);

  const setIntroCompletedWrapper = useCallback((completed: boolean) => {
    setHasCompletedIntro(completed);
    try {
      if (completed) sessionStorage.setItem("raw_intro_seen", "true");
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
  }, []);

  const value = useMemo(() => ({ 
    uiScale, 
    setUIScale: updateScale, 
    isStatusBarVisible, 
    setStatusBarVisible: updateStatusBarVisible,
    hasCompletedIntro,
    setIntroCompleted: setIntroCompletedWrapper,
    visualFidelity,
    setVisualFidelity: updateVisualFidelity,
    diagnosticsActive,
    setDiagnosticsActive: updateDiagnosticsActive,
    isWallpaperMode,
    setIsWallpaperMode,
    isAIChatOpen,
    setIsAIChatOpen,
    isOracleChatOpen,
    setIsOracleChatOpen,
    isShopIframeOpen,
    setIsShopIframeOpen,
    isListening,
    setIsListening,
    isVoiceCommandActive,
    setIsVoiceCommandActive,
    is110Percent,
    setIs110Percent,
    isWallpaperSettingsOpen,
    setIsWallpaperSettingsOpen,
    isGlobalSettingsOpen,
    setIsGlobalSettingsOpen,
    isSystemHealthOpen,
    setIsSystemHealthOpen,
    isSidebarCollapsed,
    chromeHidden,
    toggleChrome,
    setChromeHidden: persistChrome,
    enterFocusMode,
    restoreChrome,
    setIsSidebarCollapsed: updateSidebarCollapsed,
    isTerminalOpen,
    setIsTerminalOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isDiscoveryOpen,
    setIsDiscoveryOpen,
    focusedProduct,
    setFocusedProduct,
    initialAction,
    setInitialAction,
    activeReaderItem,
    setActiveReaderItem,
  }), [chromeHidden, toggleChrome, persistChrome, enterFocusMode, restoreChrome, uiScale, isStatusBarVisible, hasCompletedIntro, visualFidelity, diagnosticsActive, isWallpaperMode, isAIChatOpen, isOracleChatOpen, isShopIframeOpen, isListening, isVoiceCommandActive, is110Percent, isWallpaperSettingsOpen, isGlobalSettingsOpen, isSystemHealthOpen, isSidebarCollapsed, isTerminalOpen, isSearchOpen, isCommandPaletteOpen, focusedProduct, initialAction, activeReaderItem, isDiscoveryOpen, updateScale, updateStatusBarVisible, setIntroCompletedWrapper, updateVisualFidelity, updateDiagnosticsActive, updateSidebarCollapsed]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
