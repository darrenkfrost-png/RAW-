import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { insideDefrost, ownerWebsite, OWN_SITE } from "../lib/defrost";

export type ChromePart = 'header' | 'statusBar';

/* voiceHub, aiHub, diagnostics and hudFrame were removed with the AI and
   diagnostics features, and 'sidebar' and 'protocolChip' went when the left
   rail and the floating stack badge were folded into the top bar. A saved list
   that still names any of them is filtered against this array on load, so
   nobody's stored choice breaks. */
export const CHROME_PARTS: ChromePart[] = ['header', 'statusBar'];

/**
 * What a first-time visitor sees: the top bar, and nothing else.
 *
 * Everything in CHROME_PARTS that is NOT listed here is on at load. The list
 * is written as "everything except" rather than spelled out, so a panel added
 * to CHROME_PARTS later starts hidden by default and has to be argued INTO
 * the opening screen — the opposite of how this got crowded in the first
 * place, where each new overlay simply appeared.
 *
 * The visitor's own choice always wins: this only applies when nothing has
 * been saved.
 */
export const DEFAULT_HIDDEN: ChromePart[] = CHROME_PARTS.filter(
  (p) => p !== 'header',
);

interface UIContextType {
  uiScale: number;
  setUIScale: (scale: number) => void;
  isStatusBarVisible: boolean;
  setStatusBarVisible: (visible: boolean) => void;
  hasCompletedIntro: boolean;
  setIntroCompleted: (completed: boolean) => void;
  visualFidelity: number;
  setVisualFidelity: (fidelity: number) => void;
  isWallpaperMode: boolean;
  setIsWallpaperMode: (active: boolean) => void;
  isShopIframeOpen: boolean;
  setIsShopIframeOpen: (open: boolean) => void;
  is110Percent: boolean;
  setIs110Percent: (overdrive: boolean) => void;
  isWallpaperSettingsOpen: boolean;
  setIsWallpaperSettingsOpen: (open: boolean) => void;
  isGlobalSettingsOpen: boolean;
  setIsGlobalSettingsOpen: (open: boolean) => void;
  /** Which pieces of the app's furniture are put away. See ChromeRestore. */
  chromeHidden: ChromePart[];
  toggleChrome: (part: ChromePart) => void;
  setChromeHidden: (parts: ChromePart[]) => void;
  enterFocusMode: () => void;
  restoreChrome: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isDiscoveryOpen: boolean;
  setIsDiscoveryOpen: (open: boolean) => void;
  /** ⚠️ THE STACK DRAWER IS OPENED FROM THE TOP BAR, SO ITS STATE LIVES HERE.
      It used to be private to ProtocolDrawer and opened only by the floating
      badge beside it — and that badge was hidden by default, so a first-time
      visitor could add products to a stack and then had no control anywhere on
      the site that would open it. */
  isProtocolOpen: boolean;
  setIsProtocolOpen: (open: boolean) => void;
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
  /* Full-screen mode. Stored, because someone who cleared the furniture away
     to read meant it — being handed the whole interface back on reload would
     undo the choice every time. */
  const [chromeHidden, setChromeHiddenState] = useState<ChromePart[]>(() => {
    try {
      const saved = localStorage.getItem("raw_chrome_hidden");
      /* ⚠️ THE ABSENCE OF A SAVED CHOICE IS NOT AN EMPTY CHOICE.
         `saved ? … : []` treated a first-time visitor as someone who had
         asked for every panel, so the site opened wearing all eight at once.
         A first visit now gets DEFAULT_HIDDEN — the top bar, and nothing
         else — and only a real saved value overrides it. */
      if (saved === null) return [...DEFAULT_HIDDEN];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter((p: string) => CHROME_PARTS.includes(p as ChromePart)) : [...DEFAULT_HIDDEN];
    } catch { return [...DEFAULT_HIDDEN]; }
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

  const [isWallpaperMode, setIsWallpaperMode] = useState(false);
  const [isShopIframeOpen, setIsShopIframeOpenState] = useState(false);

  /**
   * ⚠️ THE STORE DOOR OBEYS ONE RULE, IN ONE PLACE. Six different controls open
   * the official store — the top bar's Buy button, the basket, the stack
   * drawer, the command palette, the checkout page and the directory. Putting
   * the DEFROST rule at each of them would be six chances to forget it, which
   * is exactly how this app once ended up with four navigation menus that
   * disagreed. The rule lives on the setter instead, so every door obeys it
   * and none of them has to know.
   *
   * DEFROST.WORLD never takes payments, and the panel this opens is a frame —
   * a frame inside DEFROST's own sandboxed frame, which the store's headers
   * refuse anyway. Inside DEFROST the visitor gets a new tab on the real shop.
   * On our own domain nothing changes.
   */
  const setIsShopIframeOpen = useCallback((open: boolean) => {
    if (open && insideDefrost()) {
      window.open(ownerWebsite() || OWN_SITE, '_blank', 'noopener,noreferrer');
      return;
    }
    setIsShopIframeOpenState(open);
  }, []);
  const [is110Percent, setIs110Percent] = useState(false);
  const [isWallpaperSettingsOpen, setIsWallpaperSettingsOpen] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [focusedProduct, setFocusedProduct] = useState<any | null>(null);
  const [initialAction, setInitialAction] = useState<'SCAN' | 'DEEP_DIVE' | 'VISUAL_ANALYSIS' | null>(null);
  const [activeReaderItem, setActiveReaderItem] = useState<any | null>(null);

  // Persistence
  // Removed redundant useEffect: state is initialized lazily via useState
  
  /* ⚠️ THE INTERFACE SCALE SLIDER CHANGED A NUMBER THAT NOTHING READ.
     Its only consumers were two labels that displayed the percentage. It
     now multiplies the fluid root font-size (html {} in index.css), so
     50%-150% is a real, whole-site text size — the "autosize" control. */
  useEffect(() => {
    try { document.documentElement.style.setProperty('--ui-scale', String(uiScale)); } catch { /* no document */ }
  }, [uiScale]);

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

  const updateStatusBarVisible = useCallback((visible: boolean) => {
    setStatusBarVisible(visible);
    try {
      localStorage.setItem("raw_status_bar", visible.toString());
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
    isWallpaperMode,
    setIsWallpaperMode,
    isShopIframeOpen,
    setIsShopIframeOpen,
    is110Percent,
    setIs110Percent,
    isWallpaperSettingsOpen,
    setIsWallpaperSettingsOpen,
    isGlobalSettingsOpen,
    setIsGlobalSettingsOpen,
    chromeHidden,
    toggleChrome,
    setChromeHidden: persistChrome,
    enterFocusMode,
    restoreChrome,
    isSearchOpen,
    setIsSearchOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isDiscoveryOpen,
    setIsDiscoveryOpen,
    isProtocolOpen,
    setIsProtocolOpen,
    focusedProduct,
    setFocusedProduct,
    initialAction,
    setInitialAction,
    activeReaderItem,
    setActiveReaderItem,
  }), [chromeHidden, toggleChrome, persistChrome, enterFocusMode, restoreChrome, uiScale, isStatusBarVisible, hasCompletedIntro, visualFidelity, isWallpaperMode, isShopIframeOpen, is110Percent, isWallpaperSettingsOpen, isGlobalSettingsOpen, setIsShopIframeOpen, isSearchOpen, isCommandPaletteOpen, focusedProduct, initialAction, activeReaderItem, isDiscoveryOpen, isProtocolOpen, updateScale, updateStatusBarVisible, setIntroCompletedWrapper, updateVisualFidelity]);

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
