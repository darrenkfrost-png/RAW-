import { Outlet, useLocation } from "react-router-dom";
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TechnicalStatusBar from "./TechnicalStatusBar";
import CartDrawer from "./CartDrawer";
import CompareTray from "./CompareTray";
import ShopIframePanel from "./ShopIframePanel";
import WallpaperSettingsPanel from "./WallpaperSettingsPanel";
import Particles from "./Particles";
import AmbientField from "./AmbientField";
import VideoWallpaper from "./VideoWallpaper";
import Screensaver from "./Screensaver";
import ChromeRestore from "./ChromeRestore";
import InstallPrompt from "./InstallPrompt";
import { usePageMeta } from "../hooks/usePageMeta";
import { motion, AnimatePresence } from "motion/react";
import SelectionReader from "./common/SelectionReader";

/**
 * THE PAGE ARRIVAL ANIMATION.
 *
 * ⚠️ A FINISHED BLUR IS STILL A FILTER, AND IT BROKE 50 OF 78 PAGES.
 *
 * This used to animate `filter: blur(10px)` to `blur(0px)` inline and leave it
 * there. `blur(0px)` paints identically to no filter, so it looked finished and
 * nothing on screen suggested otherwise — but a filtered element becomes the
 * containing block for every `position: fixed` descendant, and a stacking
 * context besides. Every page's content therefore sat inside a box that quietly
 * redefined what "fixed to the viewport" meant:
 *
 *   · /defrost asks for a full-screen desktop with `fixed inset-0`. It was
 *     given a 171px strip, with the rest overflowing behind the page. All
 *     SEVEN of its controls were unclickable on the live site — the ebook
 *     reader, Storyboard Studio, Video Sequencer, PWA Sync and the wallpaper
 *     switch. Nothing inside them was broken; they could not be opened.
 *   · The product pages' fixed backdrop was being stretched to the full
 *     document instead of the viewport — 11,600px tall and scrolling with the
 *     content rather than staying put.
 *
 * And it defeated the obvious fix: raising the desktop's z-index did nothing,
 * because the filtered wrapper had already trapped it in its own stacking
 * context. The z-index was not the fault and changing it was not the cure.
 *
 * ⚠️ AND CLEARING IT AFTERWARDS DOES NOT WORK — I TRIED THAT FIRST.
 * Setting `filter: none` from `onAnimationComplete`, via the style prop, leaves
 * the wrapper still reporting `filter: blur(0px)` once the dust settles: the
 * animation library owns that inline property and wins. Measured, not assumed —
 * all seven /defrost controls were still unreachable after that "fix", which is
 * the second wrong fix this one bug has attracted.
 *
 * So the blur is gone, and the arrival is a fade and a rise. That is a real if
 * small loss of polish, and it is deliberate: a flourish nobody can see the end
 * of is not worth fifty broken pages, and no version of keeping it could be
 * verified to stay fixed. If it is wanted back it has to go somewhere that is
 * not an ancestor of page content. scripts/fixedtrap.mjs fails the build if a
 * trapped `position: fixed` element ever reappears.
 */
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Layout() {
  const location = useLocation();

  // One call here gives every route its own title and share preview.
  usePageMeta();

  /* ⚠️ overflow-x-hidden ON THE WRAPPER BELOW DISABLED EVERY STICKY ELEMENT IN
     THE APP. Setting ONE axis to `hidden` makes the browser compute the other
     as `auto`, so this wrapper became a scroll container — and a sticky element
     cannot stick inside one. Every `position: sticky` on the site was therefore
     dead: the protocol-stack sidebars and the product page's buy panel simply
     scrolled away, with nothing in the console and nothing that looked wrong.
     Measured on /protocol-stacks: a sidebar that should pin at 190px rode up to
     -210px instead. The same rule was on `body` in index.css and is changed
     there too.
     `overflow-x-clip` does the job this was here for — containing the
     decorative full-bleed glows so nothing scrolls sideways — WITHOUT creating
     a scroll container. scripts/stickycheck.mjs scrolls each sticky element
     into its own range and fails if it comes loose. */
  return (
    <div className="bg-editorial-bg text-editorial-text font-sans min-h-svh relative selection:bg-editorial-accent/30 overflow-x-clip">
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

      <div 
        id="content-wrapper"
        className="relative z-[var(--z-content)] flex flex-col min-h-svh pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
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
              {/* ⚠️ THE BREADCRUMB LIVED INSIDE THE ANIMATED WRAPPER BELOW, AND
                  FROZE THERE. AnimatePresence keeps the outgoing child mounted
                  while it animates away, and that copy was the one left on
                  screen — so the trail read "SYSTEM / NUTRIENTS" on the shop,
                  the combat page, the privacy policy and everywhere else,
                  while the page content beside it was correct. (The <Outlet />
                  kept updating because it reads the router directly, which is
                  what made the fault look impossible.)

                  The breadcrumb is chrome, not page content, so it does not
                  belong in the page transition at all. Out here it re-renders
                  with every navigation. Same family as the stranded image
                  viewer: anything that must stay current cannot live inside an
                  exiting subtree. */}
              <div className="section-container py-12">
                <nav className="text-[0.6875rem] uppercase tracking-[0.4em] text-editorial-text-meta/40 mb-20 font-mono flex items-center gap-6 group/breadcrumb" aria-label="Breadcrumb">
                   <span className="text-red-500 font-bold group-hover/breadcrumb:scale-110 transition-transform duration-500" aria-hidden="true">RAW://</span>
                   <span className="sr-only">You are here:</span>
                   <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
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

              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <Outlet />
                </PageTransition>
              </AnimatePresence>
          </main>

          {/* Select any passage on a page and a play button offers to read it
              aloud in the browser's own voice. Mounted here so it survives
              navigation rather than restarting on every route. */}
          <SelectionReader />
          <Footer />
          <TechnicalStatusBar />
      </div>
      
      {/* Interaction Layer - Panels */}
      <CartDrawer />
      <CompareTray />
      <ShopIframePanel />
      <WallpaperSettingsPanel />

      {/* Nothing may hide without leaving a door: the RAW mark is it. */}
      <ChromeRestore />
      <InstallPrompt />

      {/* Takes the whole screen after a minute of stillness, or on demand. */}
      <Screensaver />
    </div>
  );
}
