import { ReactNode } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { insideDefrost } from "../lib/defrost";
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
/**
 * ⚠️ WHICH ROUTER, AND WHY IT IS NOT ALWAYS THE SAME ONE.
 *
 * On our own domain this is a BrowserRouter and the address bar reads
 * rawofficial.co/shop, exactly as it always has — the URL-truth rule stands.
 *
 * Inside DEFROST.WORLD the site is STATIC FILES in a sandboxed frame mounted
 * at defrost-world.com/sites/<slug>/. There is no server there to answer a
 * deep link, so a path-routed address typed or shared from inside the frame
 * would 404 on the host. Hash routing needs no server: every address resolves
 * from index.html. So that is what runs inside, and only inside.
 *
 * Decided ONCE, at module level, before anything mounts — a router swapped
 * after the first render would throw away the visitor's history.
 */
const Router = insideDefrost() ? HashRouter : BrowserRouter;

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Router>
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
    </Router>
  );
}
