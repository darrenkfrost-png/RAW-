import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useUI } from "./UIContext";
import { useSettings } from "./SettingsContext";

export interface AppState {
  currentRoute: string;
  focusedItem: string | null;
  recentActions: string[];
  recentErrors: string[];
}

interface AppContextType {
  state: AppState;
  setFocusedItem: (item: string | null) => void;
  trackAction: (action: string) => void;
  trackError: (error: string) => void;
  getAppSnapshot: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<AppState>({
    currentRoute: location.pathname,
    focusedItem: null,
    recentActions: [],
    recentErrors: [],
  });

  const { isTerminalOpen, isSearchOpen, isCommandPaletteOpen, isGlobalSettingsOpen } = useUI();

  const { settings } = useSettings();
  useEffect(() => {
    setState(prev => ({ ...prev, currentRoute: location.pathname }));
  }, [location.pathname]);

  const setFocusedItem = (item: string | null) => setState(prev => ({ ...prev, focusedItem: item }));
  
  const trackAction = (action: string) => {
    setState(prev => ({
      ...prev,
      recentActions: [action, ...prev.recentActions].slice(0, 10),
    }));
  };

  const trackError = (error: string) => {
    setState(prev => ({
      ...prev,
      recentErrors: [error, ...prev.recentErrors].slice(0, 5),
    }));
  };

  // Central snapshot for AI/Voice/Analytics
  const getAppSnapshot = () => {
    return JSON.stringify({
      route: state.currentRoute,
      focusedItem: state.focusedItem,
      uiState: { isTerminalOpen, isSearchOpen, isCommandPaletteOpen, isGlobalSettingsOpen },
      settings,
      recentActions: state.recentActions,
      recentErrors: state.recentErrors
    }, null, 2);
  };

  return (
    <AppContext.Provider value={{ state, setFocusedItem, trackAction, trackError, getAppSnapshot }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppCtx = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppCtx must be used within AppContextProvider");
  return context;
};
