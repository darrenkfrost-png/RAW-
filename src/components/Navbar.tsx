import { 
  ShoppingCart, 
  Store,
  Menu,
  User,
  X,
  Search,
  Command,
  ArrowRight,
  Settings2,
  Image,
  MonitorPlay,
  ChevronUp
} from "lucide-react";
import Fuse from 'fuse.js';
import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { Tooltip } from "./common/Tooltip";
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform, useMotionValueEvent } from "motion/react";
import MagneticWrapper from "./MagneticWrapper";
import { openScreensaver } from './Screensaver';
import LazyImage from "./LazyImage";
import { allProducts } from "../data/products";

const fuse = new Fuse(allProducts, {
  keys: ['name', 'category'],
  threshold: 0.3,
});

/** Start with every link shown so the first layout pass can measure them all.
    Deliberately higher than the number of links: a count that fell SHORT would
    leave the extra links permanently hidden and never measured. */
const NAV_LINK_COUNT = 99;

export default function Navbar() {
  const { setIsCartOpen, items } = useCart();
  const { 
    setIsShopIframeOpen, 
    isWallpaperSettingsOpen, 
    setIsWallpaperSettingsOpen, 
    isGlobalSettingsOpen,
    setIsGlobalSettingsOpen,
    isSearchOpen,
    setIsSearchOpen,
    chromeHidden,
    toggleChrome,
    enterFocusMode,
    restoreChrome
  } = useUI();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const { scrollYProgress, scrollY } = useScroll();
  
  // Use window width to determine which transform to use
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navHeightTransform = useTransform(scrollY, [0, 100], ["var(--header-height)", "calc(var(--header-height) - 10px)"]);
  const mobileNavHeightTransform = useTransform(scrollY, [0, 100], ["var(--header-height-mobile)", "calc(var(--header-height-mobile) - 10px)"]);
  
  const navHeight = useSpring(isMobile ? mobileNavHeightTransform : navHeightTransform, { stiffness: 100, damping: 30 });

  // Dynamically update the CSS variable for the rest of the application
  useMotionValueEvent(navHeight, "change", (latest) => {
    if (chromeHidden.includes('header')) return;
    document.documentElement.style.setProperty('--header-current-height', latest.toString());
  });

  /* The whole layout is padded by --header-current-height. Leaving it set
     while the bar is hidden would hold open an empty band exactly the size of
     the thing that just left. */
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--header-current-height',
      chromeHidden.includes('header') ? '0px' : navHeight.get().toString()
    );
  }, [chromeHidden]);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const progressColor = useTransform(scrollYProgress, [0.1, 0.2], ["#3b82f6", "#dc2626"]);
  const logoLift = useTransform(scrollYProgress, [0, 0.1], [0, -5]);

  const linkScaleTransform = useTransform(scrollY, [0, 100], [1, 0.95]);
  const linkOpacityTransform = useTransform(scrollY, [0, 100], [1, 0.8]);
  
  const linkScale = useSpring(linkScaleTransform, { stiffness: 100, damping: 30 });
  const linkOpacity = useSpring(linkOpacityTransform, { stiffness: 100, damping: 30 });

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  /* ⚠️ THE HEADER LINKS FIT THEMSELVES — DO NOT GO BACK TO BREAKPOINTS.
     Hiding links at hand-picked widths (min-[1700px] and friends) was guessed
     three times and wrong three times: how much room the strip really has
     depends on the action buttons beside it, which change with sign-in state,
     cart contents and the root font size. The result was a row of links sliced
     through the middle at 1440, 1512, 1700 and 2560 — and, before that, the
     whole right-hand side of the header off-screen from 768 to 1680.
     So the strip claims the leftover space (flex-1), and this measures what
     actually fits: each link's natural width is cached the first time it is
     seen, then only the leading links that fit are shown. The rest live in the
     Explore menu, which is always there. Nothing is ever half-drawn. */
  const stripRef = useRef<HTMLDivElement>(null);
  const naturalRef = useRef<number[]>([]);
  const [fitCount, setFitCount] = useState(NAV_LINK_COUNT);

  useLayoutEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const measure = () => {
      const kids = Array.from(el.children) as HTMLElement[];
      /* A hidden child measures 0, so keep the first real width we ever see. */
      kids.forEach((k, i) => {
        const w = k.getBoundingClientRect().width;
        if (w > 0) naturalRef.current[i] = w;
      });
      const widths = naturalRef.current;
      if (widths.length < kids.length || widths.some((w) => !w)) return;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const room = el.clientWidth;
      let used = 0;
      let n = 0;
      for (let i = 0; i < widths.length; i++) {
        const add = widths[i] + (n ? gap : 0);
        if (used + add > room) break;
        used += add;
        n++;
      }
      setFitCount(n);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const borderAlpha = useTransform(scrollYProgress, [0.1, 0.2], [0, 0.5]);
  const smoothedBorderAlpha = useSpring(borderAlpha, { stiffness: 100, damping: 20 });
  const borderColor = useTransform(smoothedBorderAlpha, [0, 1], ["rgba(255,255,255,0.05)", "rgba(220,38,38,0.3)"]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const parallaxX = useSpring(useTransform(mouseX, [0, 1600], [-8, 8]), { stiffness: 50, damping: 20 });
  const parallaxY = useSpring(useTransform(mouseY, [0, 1000], [-8, 8]), { stiffness: 50, damping: 20 });
  const bgGridX = useSpring(useTransform(mouseX, [0, 1600], [15, -15]), { stiffness: 30, damping: 25 });
  const bgGridY = useSpring(useTransform(mouseY, [0, 1000], [15, -15]), { stiffness: 30, damping: 25 });

  const logoX = useSpring(useTransform(mouseX, [0, 1600], [-15, 15]), { stiffness: 50, damping: 20 });
  const logoY = useSpring(useTransform(mouseY, [0, 1000], [-15, 15]), { stiffness: 50, damping: 20 });

  const bg1XTransform = useTransform(mouseX, [0, 1600], [80, -80]);
  const bg1YTransform = useTransform(mouseY, [0, 1000], [80, -80]);
  const bg1X = useSpring(bg1XTransform, { stiffness: 50, damping: 25 });
  const bg1Y = useSpring(bg1YTransform, { stiffness: 50, damping: 25 });

  const bg2XTransform = useTransform(mouseX, [0, 1600], [-120, 120]);
  const bg2YTransform = useTransform(mouseY, [0, 1000], [-120, 120]);
  const bg2X = useSpring(bg2XTransform, { stiffness: 40, damping: 25 });
  const bg2Y = useSpring(bg2YTransform, { stiffness: 40, damping: 25 });

  const filteredProducts = useMemo(() => 
    searchQuery 
    ? fuse.search(searchQuery).map(result => result.item)
    : [], [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMegaMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);


  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsMegaMenuOpen(false);
    setActiveMobileSubmenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      const t = setTimeout(() => setActiveMobileSubmenu(null), 300); // delay reset so animation finishes
      return () => clearTimeout(t);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[70]"
        style={{ scaleX, backgroundColor: progressColor }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      />

      {/* Mega Menu Panel */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            key="mega-menu"
            initial={{ opacity: 0, y: -20, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(20px)" }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
            className="fixed inset-x-0 bottom-0 top-[var(--header-current-height)] bg-editorial-bg/80 backdrop-blur-[60px] p-8 xl:p-24 z-[var(--z-overlay)] shadow-[0_40px_150px_rgba(0,0,0,1)] border-t border-white/[0.05]"
            onMouseMove={(e) => {
              mouseX.set(e.clientX);
              mouseY.set(e.clientY);
            }}
          >
            {/* Parallax Background Elements */}
            <motion.div 
               className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen"
            >
               <motion.div
                  style={{ x: bg1X, y: bg1Y }}
                  className="absolute top-0 left-0 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[280px]"
               />
               <motion.div
                  style={{ x: bg2X, y: bg2Y }}
                  className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-zinc-800/10 rounded-full blur-[280px]"
               />
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020202] to-transparent z-10" />
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:48px_48px] opacity-30 z-0" />
            </motion.div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16,1,0.3,1] }}
              className="relative z-10 max-w-[var(--content-max-width)] mx-auto grid grid-cols-2 xl:grid-cols-4 gap-8 xl:gap-20 font-mono text-sm capitalize h-full"
            >
              <div className="col-span-1 border-r border-white/[0.05] pr-12 xl:pr-20 flex flex-col justify-end pb-32 relative">
                 <div className="absolute top-0 right-0 w-[2px] h-40 bg-gradient-to-b from-red-600/80 to-transparent shadow-[0_0_20px_#dc2626]" />
                 <button 
                  onClick={() => setIsMegaMenuOpen(false)}
                  className="absolute top-8 right-6 p-4 bg-editorial-bg border border-white/10 hover:border-red-500/50 hover:bg-red-950/20 rounded-[1rem] transition-all duration-500 group focus:outline-none focus:ring-2 focus:ring-red-500 z-50 shadow-sm"
                  aria-label="Close Explore Menu"
                 >
                   <X className="w-6 h-6 text-editorial-text group-hover:-rotate-90 group-hover:text-red-500 transition-all duration-500" />
                 </button>
                 <h2 className="font-sans font-black uppercase text-premium mb-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] leading-[0.85] tracking-tight text-display-sm">Explore<br/><span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-900 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)] pb-2 inline-block">Everything.</span></h2>
                 <p className="text-meta-premium max-w-[280px]">Unlock peak human performance protocols.</p>
                 <div className="mt-12 w-16 h-[3px] bg-red-600 shadow-[0_0_15px_#dc2626]" />
              </div>

              {["Nutrients", "Recovery", "Combat", "Apparel"].map((cat, idx) => (
              <motion.div
                key={cat} 
                className="space-y-6 pt-10"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + (idx * 0.1), ease: [0.16,1,0.3,1] }}
              >
                <h3 className="text-red-500 font-sans font-bold tracking-[0.2em] text-[0.6875rem] uppercase flex items-center gap-3">
                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_8px_#dc2626]" />
                   {cat}
                </h3>
                <div className="flex flex-col gap-4 text-premium font-sans font-semibold text-lg md:text-xl tracking-tight">
                  <Link to={`/category/${cat.toLowerCase()}`} onClick={() => setIsMegaMenuOpen(false)} className="hover:text-red-500 transition-colors duration-[400ms] group flex items-center justify-between">
                     <span>Explore {cat}</span>
                     <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-[400ms] text-red-500" />
                  </Link>
                </div>
              </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

<motion.nav
        id="main-nav"
        aria-label="Main Navigation"
        style={{ borderColor, height: navHeight }}
        /* Hidden = lifted clear of the viewport AND out of the layout's height
           reservation (see the effect below), so the page reclaims the space
           rather than leaving a band of nothing at the top. */
        data-chrome-hidden={chromeHidden.includes('header') || undefined}
        className="fixed top-0 right-0 left-0 md:left-[var(--sidebar-current-width)] z-[var(--z-header)] data-[chrome-hidden]:-translate-y-full data-[chrome-hidden]:pointer-events-none border-b border-white/[0.05] bg-editorial-bg/60 backdrop-blur-[40px] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-[var(--layout-transition-duration)] ease-[var(--layout-transition-ease)] will-change-[left,height]"
        onMouseMove={(e) => {
          mouseX.set(e.clientX);
          mouseY.set(e.clientY);
        }}
      >
        {/* Enhanced Holographic background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-red-600/5 pointer-events-none" />
        <motion.div style={{ x: bgGridX, y: bgGridY }} className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <motion.div style={{ x: parallaxX }} className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] flex justify-between items-center relative z-10 h-full">
          <Link to="/" className="flex items-center gap-2 group relative overflow-hidden p-2 rounded-xl border border-transparent hover:border-white/5 transition-all duration-500" onMouseEnter={() => setIsMegaMenuOpen(false)} aria-label="RAW Official - Return to Source">
            <motion.div style={{ y: logoLift }}>
              <motion.div 
                style={{ x: logoX, y: logoY }}
                className="transition-all duration-700 relative"
              >
                <img src="/brand/raw-logo-red.png" alt="RAW Official" className="h-7 md:h-8 object-contain invert brightness-100 contrast-125 group-hover:invert-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(220,38,38,0.9)] transition-all duration-500 relative z-10" referrerPolicy="no-referrer" />
                <img src="/brand/raw-logo-red.png" alt="" className="h-7 md:h-8 object-contain absolute inset-0 opacity-0 group-hover:opacity-40 group-hover:animate-pulse blur-[2px] transition-all duration-500" aria-hidden="true" referrerPolicy="no-referrer" />
              </motion.div>
            </motion.div>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
            <motion.div 
              style={{ scale: linkScale, opacity: linkOpacity }}
              ref={stripRef}
              className="hidden min-w-0 flex-1 justify-end overflow-hidden min-[1400px]:flex gap-4 xl:gap-6 text-[0.6875rem] font-bold uppercase tracking-[0.2em]" 
            >
              {[
                { label: 'Explore', action: () => setIsMegaMenuOpen(!isMegaMenuOpen) },
                { label: 'Shop', to: '/shop' },
                { label: 'Films', to: '/films' },
                { label: 'Nutrients', to: '/nutrients' },
                { label: 'Recovery', to: '/recovery' },
                { label: 'Combat', to: '/combat' },
                { label: 'Compare', to: '/compare' },
                { label: 'Story', to: '/our-story' },
                { label: 'Showcase', to: '/showcase' },
                { label: 'Visual Gallery', to: '/gallery' },
                { label: 'Stay Safe', to: '/stay-safe' },
              ].map((link, i) => (
                <div key={i} className="flex shrink-0" style={{ display: i < fitCount ? undefined : 'none' }}>
                <MagneticWrapper>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group flex shrink-0 items-center justify-center">
                    {link.to ? (
                      <Link to={link.to} className="block px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 group-hover:border-red-500/30 backdrop-blur-md rounded-lg transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-meta-premium !opacity-100 !tracking-[0.15em] !text-[0.6875rem] !xl:text-[0.6875rem] group-hover:text-white relative z-10">
                        {link.label}
                      </Link>
                    ) : (
                      <button onClick={link.action} className="block px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 group-hover:border-red-500/30 backdrop-blur-md rounded-lg transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] text-meta-premium !opacity-100 !tracking-[0.15em] !text-[0.6875rem] !xl:text-[0.6875rem] group-hover:text-white relative z-10">
                        {link.label}
                      </button>
                    )}
                    {/* Premium Hover Glow */}
                    <div className="absolute inset-0 bg-red-600/0 blur-[15px] pointer-events-none group-hover:bg-red-600/30 rounded-lg transition-all duration-500 opacity-0 group-hover:opacity-100 mix-blend-screen" />
                  </motion.div>
                </MagneticWrapper>
                </div>
              ))}

            </motion.div>
            <div className="flex shrink-0 gap-2 sm:gap-3 lg:gap-5 items-center border-l border-editorial-border pl-3 sm:pl-5 lg:pl-8">
              {/* ⚠️ THE ONLY DOOR TO A CHECKOUT THAT WORKS, SO IT LIVES WHERE IT
                  CAN ALWAYS BE REACHED. This app's own /shop is a catalogue —
                  payments are off, and it says so. Orders are taken by the real
                  WooCommerce site, which opens in a panel here. As "Uplink" at
                  the end of a ten-link row it was off-screen at 1440, 1280,
                  1024 and 768, and not rendered at all on a phone: measured,
                  unreachable on everything but a 1920px monitor. */}
              {/* ⚠️ THE ONLY CONTROL ON THIS SITE THAT CAN TAKE MONEY, SO IT
                  IS THE ONLY ONE THAT PULSES. Everything else — the catalogue,
                  the product pages, the research list — gathers and compares;
                  the order is placed at rawofficial.co, which opens from here.
                  The founder asked for this door to be unmistakable. The ring
                  is slow (see @keyframes pulse-ring in index.css): a fast
                  pulse on a buy button reads as pressure, and reduced-motion
                  gets a steady ring rather than nothing, so the button keeps
                  its emphasis either way. */}
              <Tooltip content="OFFICIAL STORE — buy at rawofficial.co">
                <MagneticWrapper>
                  <button
                    onClick={() => setIsShopIframeOpen(true)}
                    aria-label="Open the official RAW store"
                    className="inline-flex items-center justify-center gap-2 min-h-11 animate-[pulse-ring_3s_ease-out_infinite] rounded-full bg-red-600 px-3 sm:px-5 text-white transition-colors duration-300 hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <Store className="h-4 w-4 shrink-0" />
                    <span className="hidden font-mono text-[0.6875rem] font-black uppercase tracking-[0.2em] sm:inline">Buy</span>
                  </button>
                </MagneticWrapper>
              </Tooltip>
              <Tooltip content="SEARCH [⌘K]">
                <MagneticWrapper>
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 sm:p-3.5 text-editorial-text-muted hover:text-editorial-text transition-colors duration-500 relative group/search bg-transparent hover:bg-editorial-text/5 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Search Products"
                  >
                    <Search className="w-5 h-5 group-hover/search:scale-110 group-hover/search:text-red-500 transition-all duration-500 ease-fluid" />
                    <motion.div 
                       initial={{ scale: 0 }}
                       whileHover={{ scale: 1 }}
                       className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-600 rounded-full shadow-[0_0_8px_#dc2626]"
                    />
                  </button>
                </MagneticWrapper>
              </Tooltip>

              
              

              <Tooltip content="WALLPAPER_ENV">
                <MagneticWrapper className="hidden lg:block">
                   <button 
                     aria-label="Display settings"
                     aria-expanded={isWallpaperSettingsOpen}
                     onClick={() => setIsWallpaperSettingsOpen(!isWallpaperSettingsOpen)}
                     className={`p-3.5 transition-colors duration-500 rounded-full focus:outline-none focus:ring-2 focus:ring-white ${isWallpaperSettingsOpen ? 'bg-red-600/20 text-red-500' : 'text-editorial-text-muted hover:text-editorial-text hover:bg-editorial-text/5'}`}
                   >
                     <Settings2 className="w-5 h-5 transition-all duration-500 ease-fluid" />
                   </button>
                </MagneticWrapper>
              </Tooltip>

              <Tooltip content="WALLPAPER_MODE // COMING_SOON">
                <MagneticWrapper className="hidden lg:block">
                  <button
                    aria-label="Wallpaper mode (coming soon)"
                    aria-disabled="true"
                    disabled
                    className="relative p-3.5 text-editorial-text-muted opacity-40 cursor-not-allowed bg-transparent rounded-full block focus:outline-none"
                  >
                    <Image className="w-5 h-5" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 font-mono text-[0.5rem] font-black tracking-[0.1em] leading-none whitespace-nowrap text-label-dim">COMING_SOON</span>
                  </button>
                </MagneticWrapper>
              </Tooltip>

              <Tooltip content="ACCOUNT">
                <MagneticWrapper className="hidden sm:block">
                  <Link to="/account" aria-label="Account" className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 sm:p-3.5 text-editorial-text-muted hover:text-editorial-text transition-colors duration-500 group bg-transparent hover:bg-editorial-text/5 rounded-full block focus:outline-none focus:ring-2 focus:ring-white">
                    <User className="w-5 h-5 group-hover:scale-110 transition-all duration-500 ease-fluid" />
                  </Link>
                </MagneticWrapper>
              </Tooltip>

              {/* Start the screensaver now, rather than waiting out the idle
                  minute — the founder asked for both doors. */}
              <Tooltip content="HIDE TOP BAR">
                <MagneticWrapper>
                  <button
                    aria-label="Hide the top bar"
                    onClick={() => toggleChrome('header')}
                    className="hidden lg:block p-3.5 text-editorial-text-muted hover:text-red-500 transition-colors duration-500 bg-transparent hover:bg-editorial-text/5 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <ChevronUp className="w-5 h-5 transition-all duration-500 ease-fluid" />
                  </button>
                </MagneticWrapper>
              </Tooltip>

              <Tooltip content="SCREENSAVER">
                <MagneticWrapper>
                  <button
                    aria-label="Start screensaver"
                    onClick={openScreensaver}
                    className="hidden lg:block p-3.5 text-editorial-text-muted hover:text-red-500 transition-colors duration-500 bg-transparent hover:bg-editorial-text/5 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <MonitorPlay className="w-5 h-5 transition-all duration-500 ease-fluid" />
                  </button>
                </MagneticWrapper>
              </Tooltip>

              <Tooltip content="CART">
                <MagneticWrapper>
                  <button 
                    aria-label="Open cart"
                    onClick={() => setIsCartOpen(true)}
                    className="relative inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center group outline-none text-editorial-text-muted hover:text-editorial-text transition-colors duration-500 p-2 sm:p-3.5 bg-transparent hover:bg-editorial-text/5 rounded-full focus:ring-2 focus:ring-white"
                  >
                    <ShoppingCart className="w-5 h-5 transition-all duration-500 group-hover:scale-110 ease-fluid" />
                    <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span 
                        key={itemCount}
                        initial={{ scale: 0, filter: "blur(4px)" }}
                        animate={{ scale: 1, filter: "blur(0px)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 text-white text-[0.6875rem] sm:text-[0.6875rem] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_#dc2626] border border-red-400/50"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                    </AnimatePresence>
                  </button>
                </MagneticWrapper>
              </Tooltip>
              <MagneticWrapper>
                <button 
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="min-[1400px]:hidden text-editorial-text-muted hover:text-editorial-text transition-colors duration-500 p-3.5 bg-transparent hover:bg-editorial-text/5 rounded-full"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </MagneticWrapper>
            </div>
          </div>
      </motion.div>
      </motion.nav>

      {/* Mega Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            key="search-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[var(--z-overlay)] bg-editorial-bg/98 backdrop-blur-2xl flex flex-col"
            data-lenis-prevent="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent pointer-events-none mix-blend-screen opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none mix-blend-screen opacity-50" />
            
            <div className="p-8 md:p-24 flex flex-col h-full max-w-[var(--content-max-width)] mx-auto w-full relative z-10">
                <div className="flex justify-between items-center mb-16 md:mb-32">
                   <div className="flex items-center gap-6 bg-editorial-bg border border-editorial-border px-6 py-4 rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                      <Command className="w-5 h-5 text-red-600 drop-shadow-[0_0_8px_#dc2626]" />
                      <span className="text-meta-premium">Inventory_Search // PROTOCOL_SRCH</span>
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping ml-4 shadow-[0_0_10px_#dc2626]" />
                      <div className="hidden lg:flex items-center gap-3 ml-6 pl-6 border-l border-white/10 uppercase font-mono text-[0.6875rem] text-label-dim tracking-[0.2em]">
                         Shortcut: <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded font-sans text-white">⌘K</kbd>
                      </div>
                   </div>
                   <button
                    onClick={() => setIsSearchOpen(false)}
                    aria-label="Close search"
                    className="p-6 bg-editorial-bg border border-editorial-border hover:border-red-500/50 hover:bg-editorial-bg rounded-[1.5rem] transition-all duration-[800ms] group shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_80px_rgba(220,38,38,0.2)]"
                  >
                    <X className="w-8 h-8 text-editorial-text group-hover:rotate-90 group-hover:text-red-500 transition-all duration-[800ms]" />
                  </button>
               </div>

               <div className="relative group/input mb-10 w-full xl:w-2/3">
                  <span className="absolute -top-12 left-0 font-mono text-[0.75rem] text-red-500 font-bold uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] flex items-center gap-4 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                    <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_currentColor] animate-pulse" /> INPUT_QUERY:
                  </span>
                  <input 
                    autoFocus
                    placeholder="IDENTIFY PROTOCOL..."
                    className="w-full bg-transparent border-b-[3px] border-editorial-border-light py-10 md:text-[3.75rem] font-sans font-black uppercase tracking-tighter text-editorial-text placeholder:text-editorial-text/10 focus:outline-none focus:border-red-600 focus:bg-white/[0.01] transition-all duration-[600ms] ease-fluid drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] leading-none text-display-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute bottom-0 left-0 h-[3px] w-full mix-blend-screen overflow-hidden pointer-events-none">
                     <motion.div 
                       animate={{ x: ["-100%", "100%"] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                       className="h-full w-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_20px_#ef4444]"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar pr-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                     <AnimatePresence mode="popLayout">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product, idx) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, scale: 0.95, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -20 }}
                              transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <Link 
                                to={`/product/${product.id}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="group flex flex-col h-full bg-editorial-bg border border-editorial-border rounded-[3rem] p-8 hover:border-red-600/50 transition-all duration-[800ms] shadow-[0_30px_80px_rgba(0,0,0,0.15)] hover:shadow-[0_40px_100px_rgba(220,38,38,0.2)] transform-gpu hover:-translate-y-2 relative overflow-hidden"
                              >
                                 <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[800ms] pointer-events-none mix-blend-screen" />
                                 <div className="aspect-[4/3] bg-editorial-bg rounded-[2rem] overflow-hidden mb-8 relative shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] border border-editorial-border">
                                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none mix-blend-overlay opacity-50" />
                                    <LazyImage 
                                      src={product.image} 
                                      alt={product.name}
                                      className="w-full h-full object-cover mix-blend-screen scale-100 group-hover:scale-110 transition-transform duration-[1500ms] ease-[0.16,1,0.3,1] grayscale opacity-80 group-hover:grayscale-[50%] group-hover:opacity-100" 
                                      containerClassName="w-full h-full absolute inset-0 p-8"
                                    />
                                    <div className="absolute top-6 left-6 text-meta-premium bg-red-950/30 px-4 py-2 rounded-xl border border-red-900/50 drop-shadow-[0_2px_4px_currentColor] z-10 backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.08)]">NODE_{product.id}</div>
                                 </div>
                                 <div className="flex-1 flex flex-col relative z-10">
                                    <h4 className="text-3xl xl:text-4xl font-sans font-black uppercase tracking-tight text-premium mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] line-clamp-2">{product.name}</h4>
                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-editorial-border">
                                       <span className="text-meta-premium ">{product.category}</span>
                                       <span className="text-meta-premium text-xl text-editorial-text">{product.price}</span>
                                    </div>
                                 </div>
                              </Link>
                            </motion.div>
                          ))
                        ) : searchQuery && (
                          <div className="col-span-full py-48 text-center border-t border-dashed border-editorial-border mt-10 relative overflow-hidden bg-editorial-bg rounded-[3rem]">
                             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/5 via-transparent to-transparent pointer-events-none mix-blend-screen opacity-50" />
                             <div className="w-1.5 h-20 bg-red-600 mx-auto mb-12 shadow-[0_0_20px_#dc2626]" />
                             <p className="font-mono text-xl text-editorial-text-muted uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">ZERO_NODES_IDENTIFIED_FOR: <br /><span className="text-editorial-text text-3xl mt-4 block">{searchQuery}</span></p>
                             <p className="font-mono text-[0.75rem] text-label-dim uppercase mt-8 tracking-widest font-bold">CHECK_PROTOCOL_INDEX_AND_RETRY</p>
                          </div>
                        )}
                        {!searchQuery && (
                           <div className="col-span-full pt-16 border-t border-editorial-border">
                              <span className="text-meta-premium mb-14 block relative inline-flex items-center gap-6">
                                SUGGESTED_PROTOCOLS:
                                <div className="h-[2px] w-16 bg-zinc-800" />
                              </span>
                              <div className="flex flex-wrap gap-6">
                                 {["Nutrients", "Combat", "Recovery", "Official Gear"].map(tag => (
                                    <button 
                                       key={tag}
                                       onClick={() => setSearchQuery(tag)}
                                       className="px-10 py-5 bg-editorial-bg border border-editorial-border rounded-[1.5rem] font-mono text-[0.75rem] text-editorial-text-muted hover:text-editorial-text hover:border-red-500/50 hover:bg-editorial-bg transition-all duration-[800ms] uppercase tracking-widest font-bold shadow-[0_10px_30px_rgba(0,0,0,0.1)] transform-gpu hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(220,38,38,0.2)] group"
                                    >
                                       {tag} <ArrowRight className="w-4 h-4 inline-block ml-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-[800ms] text-red-500" />
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[var(--z-overlay)] bg-editorial-bg/98 backdrop-blur-3xl flex flex-col p-6 sm:p-10 pt-[calc(var(--header-current-height)+2rem)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent pointer-events-none mix-blend-screen opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none mix-blend-screen opacity-30" />
            
            <motion.div 
              key="main-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 text-xl sm:text-3xl font-black uppercase tracking-[-0.02em] font-sans relative z-10 custom-scrollbar overflow-y-auto pb-32"
            >
              {[
                { 
                  label: 'SHOP_SYSTEM', 
                  subItems: [
                    { label: 'HOME BASE', to: '/' },
                    { label: 'PRODUCT ARCHIVE', to: '/shop' },
                    { label: 'NUTRIENT MATRIX', to: '/nutrients' },
                    { label: 'RECOVERY GEAR', to: '/recovery' },
                    { label: 'COMBAT SYSTEMS', to: '/combat' },
                  ] 
                },
                { 
                  label: 'PROTOCOL_SYSTEM', 
                  subItems: [
                    { label: 'BUILD PROTOCOL', to: '/protocol-builder' },
                    { label: 'PRE-BUILT STACKS', to: '/protocol-stacks' }
                  ] 
                },
                { 
                  label: 'INTELLIGENCE_SYSTEM', 
                  subItems: [
                    { label: 'KNOWLEDGE CORE', to: '/knowledge-core' },
                    { label: 'COMPARE LAB', to: '/compare' },
                    { label: 'SYSTEM ANALYTICS', to: '/analytics' },
                    { label: 'SEARCH INVENTORY', action: () => { setIsMobileMenuOpen(false); setIsSearchOpen(true); } }
                  ] 
                },
                { 
                  label: 'LEARNING_SYSTEM', 
                  subItems: [
                    { label: 'SHOWCASE', to: '/showcase' },
                    { label: 'STAY SAFE CAMPAIGN', to: '/stay-safe' },
                    { label: 'RAW ACADEMY', to: '/academy' },
                    { label: 'PERFORMANCE SYSTEM', to: '/performance-system' },
                    { label: 'OUR STORY', to: '/our-story' },
                    { label: 'MANIFESTO', to: '/manifesto' }
                  ] 
                },
                { 
                  label: 'ACCOUNT_SYSTEM', 
                  subItems: [
                    { label: 'OPERATIVE PROFILE', to: '/account' },
                    // The order is placed at rawofficial.co, not on this site.
                    { label: 'BUY AT THE STORE', action: () => { setIsMobileMenuOpen(false); setIsShopIframeOpen(true); } },
                    { label: 'LOGISTICS NETWORK', to: '/logistics' },
                    { label: 'COMMS LINK', to: '/contact' },
                    { label: 'RENDER SETTINGS', action: () => { setIsMobileMenuOpen(false); setIsGlobalSettingsOpen(true); } },
                    { label: 'WALLPAPER CONFIG', action: () => { setIsMobileMenuOpen(false); setIsWallpaperSettingsOpen(true); } },
                    /* ⚠️ THE HIDE CONTROLS IN THE HEADER ARE `hidden lg:block`,
                       so below 1024px a visitor could not hide anything at all
                       — the whole full-screen feature was desktop-only. This
                       puts the same power in the mobile menu: one tap clears
                       every panel, and the RAW mark bottom-left brings any of
                       them back. */
                    { label: 'HIDE ALL PANELS', action: () => { setIsMobileMenuOpen(false); enterFocusMode(); } },
                    { label: 'SHOW ALL PANELS', action: () => { setIsMobileMenuOpen(false); restoreChrome(); } }
                  ] 
                },
              ].map((item, idx) => (
                <div key={item.label} className="overflow-hidden">
                  <div>
                    <button
                      onClick={() => setActiveMobileSubmenu(activeMobileSubmenu === item.label ? null : item.label)}
                      aria-expanded={activeMobileSubmenu === item.label}
                      aria-controls={`mobile-submenu-${item.label.toLowerCase()}`}
                      className="flex items-center justify-between gap-4 w-full min-w-0 hover:text-red-500 transition-colors"
                    >
                       <span className="min-w-0">{item.label}</span>
                       <motion.span className="shrink-0" animate={{ rotate: activeMobileSubmenu === item.label ? 180 : 0 }}>
                         <ArrowRight className="w-6 h-6 rotate-90" />
                       </motion.span>
                    </button>
                    <motion.div
                      id={`mobile-submenu-${item.label.toLowerCase()}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: activeMobileSubmenu === item.label ? 'auto' : 0, opacity: activeMobileSubmenu === item.label ? 1 : 0 }}
                      className="overflow-hidden"
                    >
                       <div className="flex flex-col gap-4 mt-6 ml-4 text-2xl text-editorial-text-muted">
                         {item.subItems.map(subItem => (
                           subItem.action 
                             ? <button key={subItem.label} onClick={subItem.action} className="text-left w-full hover:text-editorial-text transition-colors">{subItem.label}</button>
                             : <Link key={subItem.label} to={subItem.to!} className="block hover:text-editorial-text transition-colors">{subItem.label}</Link>
                         ))}
                       </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
