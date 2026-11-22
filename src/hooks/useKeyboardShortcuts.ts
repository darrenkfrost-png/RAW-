import { useEffect } from 'react';
import { useUI } from '../context/UIContext';

export function useKeyboardShortcuts() {
  const {
    toggleChrome,
    setIsSearchOpen, isSearchOpen,
    setIsCommandPaletteOpen, isCommandPaletteOpen,
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

      /* ⌘B used to collapse the left rail. The rail is gone — its
         destinations are named buttons in the top bar — so the same key now
         puts the top bar away and brings it back, which is the nearest thing
         it did: clear the furniture to read. */
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleChrome('header');
      }
      
      // Toggle Search: / or Meta+K
      if (
          (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) ||
          ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && !e.shiftKey)
      ) {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
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
    toggleChrome,
    isSearchOpen, setIsSearchOpen, 
    isCommandPaletteOpen, setIsCommandPaletteOpen, 
    isDiscoveryOpen, setIsDiscoveryOpen,
    isGlobalSettingsOpen, setIsGlobalSettingsOpen
  ]);
}
