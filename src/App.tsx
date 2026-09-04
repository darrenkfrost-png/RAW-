import { Routes, Route } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import PageLoader from "./components/PageLoader";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const OurStory = lazy(() => import("./pages/OurStory"));
const RawCares = lazy(() => import("./pages/RawCares"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Nutrients = lazy(() => import("./pages/Nutrients"));
const Recovery = lazy(() => import("./pages/Recovery"));
const Combat = lazy(() => import("./pages/Combat"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ProductGallery = lazy(() => import("./pages/ProductGallery"));
const Contact = lazy(() => import("./pages/Contact"));
const Logistics = lazy(() => import("./pages/Logistics"));
const Manifesto = lazy(() => import("./pages/Manifesto"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Account = lazy(() => import("./pages/Account"));
const ProtocolBuilder = lazy(() => import("./pages/ProtocolBuilder"));
const ProtocolStacks = lazy(() => import("./pages/ProtocolStacks"));
const ProtocolStackDetail = lazy(() => import("./pages/ProtocolStackDetail"));
const PerformanceSystem = lazy(() => import("./pages/PerformanceSystem"));
const CompareProducts = lazy(() => import("./pages/CompareProducts"));
const RawAcademy = lazy(() => import("./pages/RawAcademy"));
const CustomerType = lazy(() => import("./pages/CustomerType"));
const KnowledgeCore = lazy(() => import("./pages/KnowledgeCore"));
const DeFrost = lazy(() => import("./pages/DeFrost"));
/* ⚠️ TEN OVERLAY PANELS WERE STATIC IMPORTS, so every visitor downloaded all
   of them — the AI drawer with its charting library, two terminals, the
   diagnostics dashboards — on first paint, to render nothing, because they are
   all closed until asked for. They are lazy now and mounted behind one
   Suspense with a null fallback: nothing appears any differently, but the
   first page no longer pays for panels nobody has opened. */
const NeuralCommandTerminal = lazy(() => import("./components/NeuralCommandTerminal"));
const ProtocolDrawer = lazy(() => import("./components/ProtocolDrawer"));
const GlobalSettingsPanel = lazy(() => import("./components/GlobalSettingsPanel"));
const ImmersiveReaderHUD = lazy(() => import("./components/ImmersiveReaderHUD"));
const DiscoveryHub = lazy(() => import("./components/common/DiscoveryHub"));

const StaySafe = lazy(() => import("./pages/StaySafe"));
const Showcase = lazy(() => import("./pages/Showcase"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { ErrorBoundary } from "./components/common/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import IntroScreen from "./components/IntroScreen";
import SmoothScroll from "./components/SmoothScroll";
import { AppProviders } from "./components/AppProviders";
import { useUI } from "./context/UIContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

function AppContent() {
  const { 
    chromeHidden,
    isSidebarCollapsed, 
    isCommandPaletteOpen, setIsCommandPaletteOpen,
    isDiscoveryOpen, setIsDiscoveryOpen
  } = useUI();

  useKeyboardShortcuts();

  useEffect(() => {
    // Living App Shell: Sync route to body for global CSS adaptations
    document.body.setAttribute('data-route', window.location.pathname);
  }, [window.location.pathname]);

  return (
    <SmoothScroll>
      {/* Global Layer Orchestration */}
      <IntroScreen />
      <ScrollToTop />
      
      <Sidebar />

      {/* Application Layout Shell Orchestrated via padding injection */}
      <div 
         id="app-shell"
         className="min-h-svh transition-all duration-[var(--layout-transition-duration)] ease-[var(--layout-transition-ease)] flex flex-col relative md:pl-[var(--sidebar-current-width)] w-full will-change-[padding-left]"
         style={{
           // A hidden sidebar reserves nothing; a collapsed one still reserves its rail.
           "--sidebar-current-width": chromeHidden.includes('sidebar')
             ? '0px'
             : `var(${isSidebarCollapsed ? '--sidebar-collapsed-width' : '--sidebar-width'})`
         } as React.CSSProperties}
      >
        <Suspense fallback={
          <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(220,38,38,0.1),transparent_70%)] opacity-80" />
            <div className="w-64 h-[1px] bg-white/10 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(0,0,0,0.5)]">
               <div className="h-full w-1/3 bg-gradient-to-r from-red-800 via-red-500 to-red-400 animate-pulse shadow-[0_0_20px_#dc2626]" />
            </div>
            <div className="absolute mt-10 text-meta-premium text-red-500 animate-pulse uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black">
               DECRYPTING_ASSETS
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="gallery" element={<ProductGallery />} />
              <Route path="our-story" element={<OurStory />} />
              <Route path="raw-cares" element={<RawCares />} />
              <Route path="showcase" element={<Showcase />} />
              <Route path="stay-safe" element={<StaySafe />} />
              <Route path="stay-safe/feedback" element={<StaySafe />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms-of-use" element={<TermsOfUse />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="nutrients" element={<Nutrients />} />
              <Route path="recovery" element={<Recovery />} />
              <Route path="combat" element={<Combat />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="account" element={<Account />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="logistics" element={<Logistics />} />
              <Route path="manifesto" element={<Manifesto />} />
              <Route path="protocol-builder" element={<ProtocolBuilder />} />
              <Route path="protocol-stacks" element={<ProtocolStacks />} />
              <Route path="protocol-stacks/:id" element={<ProtocolStackDetail />} />
              <Route path="performance-system" element={<PerformanceSystem />} />
              <Route path="compare" element={<CompareProducts />} />
              <Route path="academy" element={<RawAcademy />} />
              <Route path="knowledge-core" element={<KnowledgeCore />} />
              <Route path="defrost" element={<DeFrost />} />
              <Route path="target/:type" element={<CustomerType />} />
              <Route path="category/:slug" element={<Shop />} />
              {/* ⚠️ MUST STAY LAST. Without this any unknown address rendered the
                  shell with an entirely empty main region — measured at 0
                  characters — which is what a mistyped or outdated campaign
                  link produces. */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </div>

      {/* Persistent Overlay Layer */}
      <Suspense fallback={null}>
      <ProtocolDrawer />
      <NeuralCommandTerminal 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
      <GlobalSettingsPanel />
      <ImmersiveReaderHUD />
      <DiscoveryHub isOpen={isDiscoveryOpen} onClose={() => setIsDiscoveryOpen(false)} />
      </Suspense>
    </SmoothScroll>
  );
}


export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}
