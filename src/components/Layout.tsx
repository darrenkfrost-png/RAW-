import { Outlet, Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TechnicalStatusBar from "./TechnicalStatusBar";
import CartDrawer from "./CartDrawer";
import CompareTray from "./CompareTray";
import CustomCursor from "./CustomCursor";
import PageLoader from "./PageLoader";
import WallpaperMode from "./WallpaperMode";
import ShopIframePanel from "./ShopIframePanel";
import VoiceFeedbackOverlay from "./VoiceFeedbackOverlay";
import WallpaperSettingsPanel from "./WallpaperSettingsPanel";
import VoiceInteractionHub from "./VoiceInteractionHub";
import VoiceSettingsDropdown from "./VoiceSettingsDropdown";
import Particles from "./Particles";
import AmbientField from "./AmbientField";
import VideoWallpaper from "./VideoWallpaper";
import Screensaver from "./Screensaver";
import ChromeRestore from "./ChromeRestore";
import { usePageMeta } from "../hooks/usePageMeta";
import { useUI } from "../context/UIContext";
import { useSettings } from "../context/SettingsContext";
import { motion, AnimatePresence, useScroll } from "motion/react";
import { ChevronLeft, ChevronRight, Menu, Bot, Zap } from "lucide-react";

export default function Layout() {
  const { diagnosticsActive } = useUI();
  const location = useLocation();

  // One call here gives every route its own title and share preview.
  usePageMeta();

  return (
    <div className="bg-editorial-bg text-editorial-text font-sans min-h-screen relative selection:bg-editorial-accent/30 overflow-x-hidden">
      {/* Background Layer - Deep & Immersive */}
      <div className="fixed inset-0 z-[var(--z-background)] bg-editorial-bg" aria-hidden="true" />
      
      {/* THE AMBIENT FIELD — one canvas, route-aware, behind everything.
          It replaces the app-wide Atmosphere instance that used to sit here:
          same job, one rAF and one pointer listener instead of several
          animated blur layers, and a different character per channel. */}
      <AmbientField />

      {/* The brand's own film behind the site, at the visitor's chosen opacity.
          Above the ambient field, below every pixel of content. */}
      <VideoWallpaper />

      {/* Visuals - Particles & fixed light furniture */}
      <div className="fixed inset-0 z-[1] pointer-events-none" aria-hidden="true">
        <Particles />

        {/* Cinematic Background Enhancements */}
        <div className="absolute inset-x-0 -top-40 h-[800px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.06),transparent_60%)] mix-blend-screen pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[600px] bg-[radial-gradient(ellipse_at_50%_100%,rgba(220,38,38,0.04),transparent_60%)] mix-blend-screen pointer-events-none" />
        
        {/* Subtle Edge Lights */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-red-600/5 to-transparent mix-blend-color-dodge pointer-events-none opacity-50" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-red-600/5 to-transparent mix-blend-color-dodge pointer-events-none opacity-50" />
        {/* ⚠️ A near-black `mix-blend-mode: color` sheet used to sit here at 98%
            opacity, labelled "ambient noise". That blend takes the hue and
            saturation of its own colour — and grey has none — so it was not
            adding texture, it was draining the colour out of every layer
            beneath it. Measured against the ambient field with it hidden: the
            same red read visibly deeper. Removed rather than tuned. */}
      </div>

      {/* Main Content wrapper - High Fidelity Interaction Layer */}
      <Navbar />

      <AnimatePresence>
        {diagnosticsActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[1000] border-[1px] border-red-500/10 m-4 lg:m-8 rounded-[4rem] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-red-500/30 rounded-tl-[4rem] m-[-1px]" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-red-500/30 rounded-tr-[4rem] m-[-1px]" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-red-500/30 rounded-bl-[4rem] m-[-1px]" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-red-500/30 rounded-br-[4rem] m-[-1px]" />
            
            <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.02)_1px,transparent_1px)] bg-[size:100%_40px] animate-scan-slow opacity-20" />
            <div className="absolute top-10 right-14 font-mono text-[9px] text-red-500/40 uppercase tracking-[0.5em] font-black drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
               HUD_ACTIVE // SYSTEM_VERIFIED
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        id="content-wrapper"
        className="relative z-[var(--z-content)] flex flex-col min-h-screen pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] px-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
        style={{ 
          paddingTop: 'calc(var(--header-current-height) + env(safe-area-inset-top))',
          paddingBottom: 'calc(2.75rem + env(safe-area-inset-bottom))' // Offset for TechnicalStatusBar height (h-11 = 44px) + safe area
        } as React.CSSProperties}
      >
          <main 
            id="main-content"
            className="flex-1 w-full relative"
            role="main"
          >
              <AnimatePresence mode="wait">
                <motion.div 
                  key={location.pathname}
                  initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="section-container py-12">
                    <nav className="text-[10px] uppercase tracking-[0.4em] text-editorial-text-meta/40 mb-20 font-mono flex items-center gap-6 group/breadcrumb" aria-label="Breadcrumb">
                       <span className="text-red-500 font-bold group-hover/breadcrumb:scale-110 transition-transform duration-500" aria-hidden="true">RAW://</span>
                       <span className="sr-only">You are here:</span>
                       <div className="flex items-center gap-4">
                          {['SYSTEM', ...location.pathname.split('/').filter(x => x)].map((part, i, arr) => (
                            <React.Fragment key={i}>
                              <span className={i === arr.length - 1 ? 'text-editorial-text' : ''}>
                                {part.toUpperCase().replace(/-/g, '_')}
                              </span>
                              {i < arr.length - 1 && <span className="opacity-20">/</span>}
                            </React.Fragment>
                          ))}
                       </div>
                       <div className="flex-1 h-[1px] bg-white/[0.03]" aria-hidden="true" />
                    </nav>
                  </div>
                  <Outlet />
                </motion.div>
              </AnimatePresence>
          </main>

          <Footer />
          <TechnicalStatusBar />
      </div>
      
      {/* Interaction Layer - Panels */}
      <CartDrawer />
      <CompareTray />
      <ShopIframePanel />
      <WallpaperSettingsPanel />
      <VoiceInteractionHub />

      {/* Nothing may hide without leaving a door: the RAW mark is it. */}
      <ChromeRestore />

      {/* Takes the whole screen after a minute of stillness, or on demand. */}
      <Screensaver />
    </div>
  );
}
