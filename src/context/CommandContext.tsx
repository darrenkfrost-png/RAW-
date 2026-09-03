import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUI } from "./UIContext";
import { useSettings } from "./SettingsContext";
import { useToast } from "../components/common/Toast";
import { useAppCtx } from "./AppContext";
import { useCart } from "./CartContext";

export interface AppCommand {
  id: string;
  label: string;
  description?: string;
  category: string;
  handler: () => void | Promise<void>;
}

interface CommandContextType {
  commands: AppCommand[];
  executeCommand: (id: string) => Promise<boolean>;
  registerCommand: (command: AppCommand) => () => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [dynamicCommands, setDynamicCommands] = useState<AppCommand[]>([]);
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { 
    setIsAIChatOpen, 
    setIsTerminalOpen, 
    setIsSearchOpen,
    isWallpaperMode,
    setIsWallpaperMode,
    isWallpaperSettingsOpen,
    setIsWallpaperSettingsOpen,
    isGlobalSettingsOpen,
    setIsGlobalSettingsOpen,
    isSystemHealthOpen,
    setIsSystemHealthOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen
  } = useUI();
  const { isCartOpen, setIsCartOpen } = useCart();
  const { addToast } = useToast();
  const { trackAction, trackError } = useAppCtx();

  // Core static commands
  const coreCommands: AppCommand[] = [
    {
      id: "open_ai_chat",
      label: "Open AI Advisor",
      category: "System",
      handler: () => setIsAIChatOpen(true)
    },
    {
      id: "close_ai_chat",
      label: "Close AI Advisor",
      category: "System",
      handler: () => setIsAIChatOpen(false)
    },
    {
      id: "open_search",
      label: "Open Search",
      category: "System",
      handler: () => setIsSearchOpen(true)
    },
    {
      id: "switch_theme",
      label: "Cycle Accent Theme",
      category: "System",
      handler: () => {
        const themeColors = ['#ff1d48', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'];
        const themeNames = ['Crimson Protocols', 'Toxic Emerald', 'Hyper Cyan', 'Warning Amber', 'Psionic Violet'];
        const currentIndex = themeColors.indexOf(settings.wallpaperColor);
        const nextIndex = (currentIndex + 1) % themeColors.length;
        const nextColor = themeColors[nextIndex];
        const nextName = themeNames[nextIndex];
        updateSettings({ wallpaperColor: nextColor });
        addToast(`Visual environment calibrated: ${nextName} theme active.`, "success");
      }
    },
    {
      id: "navigate_home",
      label: "Go Home",
      category: "Navigation",
      handler: () => navigate("/")
    },
    {
      id: "navigate_shop",
      label: "Go to Shop",
      category: "Navigation",
      handler: () => navigate("/shop")
    },
    {
      id: "run_system_check",
      label: "System Health Check",
      category: "System",
      handler: () => {
        setIsSystemHealthOpen(true);
        addToast("Retrieving real-time telemetry diagnostics...", "info");
      }
    },
    {
      id: "open_diagnostics",
      label: "Open Diagnostics",
      category: "System",
      handler: () => setIsSystemHealthOpen(true)
    },
    {
      id: "close_diagnostics",
      label: "Close Diagnostics",
      category: "System",
      handler: () => setIsSystemHealthOpen(false)
    },
    {
      id: "open_settings",
      label: "Open System Settings",
      category: "System",
      handler: () => setIsGlobalSettingsOpen(true)
    },
    {
      id: "close_settings",
      label: "Close System Settings",
      category: "System",
      handler: () => setIsGlobalSettingsOpen(false)
    },
    {
      id: "open_wallpaper_settings",
      label: "Open Wallpaper Settings",
      category: "System",
      handler: () => setIsWallpaperSettingsOpen(true)
    },
    {
      id: "close_wallpaper_settings",
      label: "Close Wallpaper Settings",
      category: "System",
      handler: () => setIsWallpaperSettingsOpen(false)
    },
    {
      id: "open_cart",
      label: "Open Cart Drawer",
      category: "Shopping",
      handler: () => setIsCartOpen(true)
    },
    {
      id: "close_cart",
      label: "Close Cart Drawer",
      category: "Shopping",
      handler: () => setIsCartOpen(false)
    },
    {
      id: "navigate_checkout",
      label: "Go to Checkout",
      category: "Navigation",
      handler: () => navigate("/checkout")
    },
    {
      id: "toggle_sidebar",
      label: "Toggle Sidebar",
      category: "System",
      handler: () => setIsSidebarCollapsed(!isSidebarCollapsed)
    },
    {
      id: "toggle_wallpaper",
      label: "Toggle Wallpaper Focus Mode",
      category: "System",
      handler: () => setIsWallpaperMode(!isWallpaperMode)
    },
    {
      id: "navigate_story",
      label: "Go to Our Story",
      category: "Navigation",
      handler: () => navigate("/our-story")
    },
    {
      id: "navigate_cares",
      label: "Go to Raw Cares",
      category: "Navigation",
      handler: () => navigate("/raw-cares")
    },
    {
      id: "navigate_academy",
      label: "Go to Raw Academy",
      category: "Navigation",
      handler: () => navigate("/academy")
    },
    {
      id: "navigate_knowledge",
      label: "Go to Knowledge Core",
      category: "Navigation",
      handler: () => navigate("/knowledge-core")
    },
    {
      id: "navigate_combat",
      label: "Go to Combat Protocols",
      category: "Navigation",
      handler: () => navigate("/combat")
    },
    {
      id: "navigate_nutrients",
      label: "Go to Nutrients",
      category: "Navigation",
      handler: () => navigate("/nutrients")
    },
    {
      id: "navigate_recovery",
      label: "Go to Recovery Hub",
      category: "Navigation",
      handler: () => navigate("/recovery")
    },
    {
      id: "navigate_protocol",
      label: "Go to Protocol Builder",
      category: "Navigation",
      handler: () => navigate("/protocol-builder")
    },
    {
      id: "navigate_stacks",
      label: "Go to Protocol Stacks",
      category: "Navigation",
      handler: () => navigate("/protocol-stacks")
    },
    {
      id: "reader_play",
      label: "Reader: Resume/Play Read Aloud",
      category: "Reader",
      handler: () => {
        if ((window as any).readerControls) {
          (window as any).readerControls.play();
        } else {
          addToast("No doctrine open in Reader Focus Mode", "warning");
        }
      }
    },
    {
      id: "reader_pause",
      label: "Reader: Pause Read Aloud",
      category: "Reader",
      handler: () => {
        if ((window as any).readerControls) {
          (window as any).readerControls.pause();
        }
      }
    },
    {
      id: "reader_next",
      label: "Reader: Next Paragraph",
      category: "Reader",
      handler: () => {
        if ((window as any).readerControls) {
          (window as any).readerControls.next();
        }
      }
    },
    {
      id: "reader_prev",
      label: "Reader: Previous Paragraph",
      category: "Reader",
      handler: () => {
        if ((window as any).readerControls) {
          (window as any).readerControls.prev();
        }
      }
    },
    {
      id: "reader_close",
      label: "Reader: Close Immersive Mode",
      category: "Reader",
      handler: () => {
        if ((window as any).readerControls) {
          (window as any).readerControls.close();
        }
      }
    },
    {
      id: "set_fidelity_low",
      label: "Render Style: Low Fidelity",
      category: "System",
      handler: () => {
        updateSettings({ visualFidelity: 'low' });
        addToast("Fidelity adjusted: Performance focus enabled.", "success");
      }
    },
    {
      id: "set_fidelity_balanced",
      label: "Render Style: Balanced Fidelity",
      category: "System",
      handler: () => {
        updateSettings({ visualFidelity: 'balanced' });
        addToast("Balanced rendering parameters applied.", "success");
      }
    },
    {
      id: "set_fidelity_high",
      label: "Render Style: High Fidelity",
      category: "System",
      handler: () => {
        updateSettings({ visualFidelity: 'high' });
        addToast("High definition styling applied.", "success");
      }
    },
    {
      id: "set_fidelity_overdrive",
      label: "Render Style: Max Overdrive",
      category: "System",
      handler: () => {
        updateSettings({ visualFidelity: 'overdrive' });
        addToast("Visual parameters calibrated to MAXIMUM OVERDRIVE.", "success");
      }
    }
  ];

  const allCommands = [...coreCommands, ...dynamicCommands];

  const executeCommand = useCallback(async (id: string): Promise<boolean> => {
    const cmd = allCommands.find(c => c.id === id);
    if (cmd) {
      try {
        await cmd.handler();
        trackAction(`Executed command: ${id}`);
        return true;
      } catch (err: any) {
        trackError(`Command ${id} failed: ${err.message}`);
        addToast(`Failed: ${err.message}`, "error");
        return false;
      }
    }
    trackError(`Command unknown: ${id}`);
    addToast(`Unknown command: ${id}`, "error");
    return false;
  }, [allCommands, trackAction, trackError, addToast]);

  useEffect(() => {
    if (typeof window !== "undefined") {
        (window as any).executeAppCommand = executeCommand;
        (window as any).availableCommands = allCommands.map(c => ({ id: c.id, label: c.label }));
    }
  }, [executeCommand, allCommands]);

  const registerCommand = useCallback((command: AppCommand) => {
    setDynamicCommands(prev => [...prev.filter(c => c.id !== command.id), command]);
    return () => {
      setDynamicCommands(prev => prev.filter(c => c.id !== command.id));
    };
  }, []);

  return (
    <CommandContext.Provider value={{ commands: allCommands, executeCommand, registerCommand }}>
      {children}
    </CommandContext.Provider>
  );
}

export const useCommandEngine = () => {
  const context = useContext(CommandContext);
  if (!context) throw new Error("useCommandEngine must be used within CommandProvider");
  return context;
};
