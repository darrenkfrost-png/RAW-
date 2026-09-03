import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { UIProvider } from "../context/UIContext";
import { SettingsProvider } from "../context/SettingsContext";
import { AIProvider } from "../context/AIContext";
import { CompareProvider } from "../context/CompareContext";
import { ToastProvider } from "./common/Toast";
import { CartProvider } from "../context/CartContext";
import { ProtocolProvider } from "../context/ProtocolContext";
import { VoiceProvider } from "../context/VoiceContext";
import { AppContextProvider } from "../context/AppContext";
import { CommandProvider } from "../context/CommandContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <UIProvider>
        <SettingsProvider>
          <AIProvider>
            <CompareProvider>
              <ToastProvider>
                <CartProvider>
                  <ProtocolProvider>
                    <VoiceProvider>
                      <AppContextProvider>
                        <CommandProvider>
                          {children}
                        </CommandProvider>
                      </AppContextProvider>
                    </VoiceProvider>
                  </ProtocolProvider>
                </CartProvider>
              </ToastProvider>
            </CompareProvider>
          </AIProvider>
        </SettingsProvider>
      </UIProvider>
    </BrowserRouter>
  );
}
