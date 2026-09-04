import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { UIProvider } from "../context/UIContext";
import { SettingsProvider } from "../context/SettingsContext";
import { CompareProvider } from "../context/CompareContext";
import { ToastProvider } from "./common/Toast";
import { CartProvider } from "../context/CartContext";
import { ProtocolProvider } from "../context/ProtocolContext";
import { AppContextProvider } from "../context/AppContext";
import { CommandProvider } from "../context/CommandContext";

/**
 * ⚠️ AIProvider AND VoiceProvider USED TO WRAP EVERYTHING HERE.
 * The AI features were removed from the site entirely; these two are gone
 * with them. If anything below ever needs to reach for an advisor or a
 * spoken command again, it is a new decision, not a restoration.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <UIProvider>
        <SettingsProvider>
          <CompareProvider>
            <ToastProvider>
              <CartProvider>
                <ProtocolProvider>
                  <AppContextProvider>
                    <CommandProvider>
                      {children}
                    </CommandProvider>
                  </AppContextProvider>
                </ProtocolProvider>
              </CartProvider>
            </ToastProvider>
          </CompareProvider>
        </SettingsProvider>
      </UIProvider>
    </BrowserRouter>
  );
}
