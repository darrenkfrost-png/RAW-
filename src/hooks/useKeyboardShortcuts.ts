import { useEffect } from 'react';
import { useUI } from '../context/UIContext';

export function useKeyboardShortcuts() {
  const { 
    setIsSidebarCollapsed, isSidebarCollapsed,
    setIsTerminalOpen, isTerminalOpen,
    setIsSearchOpen, isSearchOpen,
    setIsCommandPaletteOpen, isCommandPaletteOpen,
    setIsAIChatOpen, isAIChatOpen,
    setIsDiscoveryOpen, isDiscoveryOpen,
    isGlobalSettingsOpen, setIsGlobalSettingsOpen
  } = useUI();

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Toggle Global Settings: Meta+,
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsGlobalSettingsOpen(!isGlobalSettingsOpen);
      }

      // Toggle Sidebar: Meta+B or Ctrl+B
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(!isSidebarCollapsed);
      }
      
      // Toggle Search: / or Meta+K
      if (
          (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) ||
          ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && !e.shiftKey)
      ) {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }

      // Toggle Terminal: Meta+T
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTerminalOpen(!isTerminalOpen);
      }

      // Toggle AI Advisor (Neural Core): Meta+Shift+K
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAIChatOpen(!isAIChatOpen);
      }

      // Toggle Command Palette: Meta+P
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }

      // Toggle Discovery Hub: Meta+J
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsDiscoveryOpen(!isDiscoveryOpen);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [
    isSidebarCollapsed, setIsSidebarCollapsed, 
    isTerminalOpen, setIsTerminalOpen, 
    isSearchOpen, setIsSearchOpen, 
    isCommandPaletteOpen, setIsCommandPaletteOpen, 
    isAIChatOpen, setIsAIChatOpen,
    isDiscoveryOpen, setIsDiscoveryOpen,
    isGlobalSettingsOpen, setIsGlobalSettingsOpen
  ]);
}
