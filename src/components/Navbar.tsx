import {
  ShoppingCart,
  Store,
  User,
  X,
  Search,
  Command,
  ArrowRight,
  Layers,
  LayoutGrid,
} from "lucide-react";
import Fuse from 'fuse.js';
import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUI } from "../context/UIContext";
import { useProtocol } from "../context/ProtocolContext";
import { Tooltip } from "./common/Tooltip";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import { openScreensaver } from './Screensaver';
import LazyImage from "./LazyImage";
import { allProducts } from "../data/products";
import { PRIMARY, DIRECTORY, type NavItem } from "../data/navigation";
import { useFocusTrap } from "../hooks/useFocusTrap";

const fuse = new Fuse(allProducts, {
  keys: ['name', 'category'],
  threshold: 0.3,
});

/**
 * THE TOP BAR — one place a visitor looks, at every width.
 *
 * ⚠️ WHAT THIS REPLACES, AND WHY. The way through this site used to be split
 * across three pieces of furniture that did not agree with each other:
 *
 *   · a LEFT RAIL holding eight destinations (Academy, Performance, the
 *     knowledge base, The Vault) that appeared NOWHERE in the top bar, under
 *     names a visitor had to decode — the home page was "Terminal", the shop
 *     was "Arsenal", the knowledge base was "Database", and the rail's own
 *     title was "OS_CORE". Collapsed, which is how it loads, it was eight
 *     glyphs in a 104px strip.
 *   · a FLOATING BADGE bottom-right that was the only way to open a protocol
 *     stack — and it is hidden on a first visit by DEFAULT_HIDDEN, so someone
 *     could gather a stack and find no control anywhere that would open it.
 *   · a TOP BAR whose eleven links were a third, different list.
 *
 * Both are folded in here, and every list on the site now reads one file
 * (src/data/navigation.ts). The founder's words for why: people were getting
 * confused about how to use it.
 *
 * ⚠️ THE PHONE GETS THE SAME DESTINATIONS AS THE DESKTOP, NOT A SUBSET. The
 * named row scrolls sideways below 1400px instead of being replaced by a
 * hamburger-only menu, so the eight destinations are on screen on a phone
 * exactly as they are on a monitor. "Everything" opens the same directory
 * panel on both — there is no separate phone menu left to drift out of step.
 */
export default function Navbar() {
  const { setIsCartOpen, items } = useCart();
  const {
    setIsShopIframeOpen,
    setIsWallpaperSettingsOpen,
    setIsGlobalSettingsOpen,
    setIsDiscoveryOpen,
    setIsProtocolOpen,
    isSearchOpen,
    setIsSearchOpen,
    chromeHidden,
    toggleChrome,
  } = useUI();
  const { protocolItems } = useProtocol();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const location = useLocation();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const stackCount = protocolItems.length;

  /* ⚠️ THE DIRECTORY COVERS THE WHOLE SCREEN, SO THE KEYBOARD MUST STAY IN
     IT. Measured on the live site before this: with the directory open, the
     next Tab after the button that opened it landed on a breadcrumb link on
     the page UNDERNEATH — so a keyboard visitor tabbed invisibly through the
     page behind the panel they had just opened. See useFocusTrap. */
  const directoryRef = useFocusTrap<HTMLDivElement>(isDirectoryOpen);
  const searchRef = useFocusTrap<HTMLDivElement>(isSearchOpen);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const progressColor = useTransform(scrollYProgress, [0.1, 0.2], ["#3b82f6", "#dc2626"]);

  /* The layout pads itself by --header-current-height. The bar is a fixed two
     tiers now rather than a value that shrank as you scrolled: a header that
     changed height on every scroll frame moved the whole page under the
     reader's eye, and it wrote a style property per frame. Hidden, it reserves
     nothing, so the page reclaims the band instead of leaving a void where it
     used to be. Clearing the property (rather than setting a number) hands the
     height back to the media query in index.css. */
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--header-current-height',
      chromeHidden.includes('header') ? '0px' : '',
    );
  }, [chromeHidden]);

  /* ⚠️ THE NAMED ROW FITS ITSELF — DO NOT GO BACK TO BREAKPOINTS. Hiding
     links at hand-picked widths was guessed three times and wrong three
     times: the room the row really has depends on the buttons beside it,
     which change with cart contents and the root font size. So the row claims
     the leftover space and this measures what actually fits; anything that
     does not fit is still in the directory, and below 1400px the row scrolls
     instead, so nothing is ever lost or half-drawn. */
  const stripRef = useRef<HTMLDivElement>(null);
  const naturalRef = useRef<number[]>([]);
  const [fitCount, setFitCount] = useState(PRIMARY.length);

  useLayoutEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const measure = () => {
      if (window.innerWidth < 1400) { setFitCount(PRIMARY.length); return; }
      const kids = Array.from(el.children) as HTMLElement[];
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

  const filteredProducts = useMemo(() =>
    searchQuery
      ? fuse.search(searchQuery).map(result => result.item)
      : [], [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsDirectoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  /* Any navigation closes whatever was open over the page. */
  useEffect(() => {
    setIsDirectoryOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  /* ⚠️ ONE PLACE DECIDES WHAT A PANEL ITEM DOES. Every surface that lists
     navigation reads src/data/navigation.ts, so the action behind `opens` is
     resolved once, here, rather than re-written per menu — which is how the
     old phone menu ended up holding controls the desktop did not have. */
  const openPanel = (what: NavItem['opens']) => {
    setIsDirectoryOpen(false);
    switch (what) {
      case 'store': setIsShopIframeOpen(true); break;
      case 'search': setIsSearchOpen(true); break;
      case 'stack': setIsProtocolOpen(true); break;
      case 'settings': setIsGlobalSettingsOpen(true); break;
      case 'wallpaper': setIsWallpaperSettingsOpen(true); break;
      case 'manual': setIsDiscoveryOpen(true); break;
      case 'screensaver': openScreensaver(); break;
    }
  };

  const isHere = (to?: string) =>
    !!to && (to === '/' ? location.pathname === '/' : location.pathname === to || location.pathname.startsWith(to + '/'));

  /** A named destination button, used by the wide row and the narrow rail. */
  const DestinationButton = ({ item }: { item: NavItem }) => {
    const here = isHere(item.to);
    const className = `inline-flex min-h-11 items-center whitespace-nowrap rounded-lg border px-4 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
      here
        ? 'border-red-500/60 bg-red-600/20 text-white'
        : 'border-white/[0.06] bg-white/[0.04] text-editorial-text-muted hover:border-red-500/30 hover:bg-white/[0.08] hover:text-white'
    }`;
    return item.to ? (
      <Link to={item.to} className={className} aria-current={here ? 'page' : undefined}>{item.label}</Link>
    ) : (
      <button type="button" onClick={() => openPanel(item.opens)} className={className}>{item.label}</button>
    );
  };

  /** One icon button in the actions group, sized for a thumb at every width. */
  const iconButton = "relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-transparent p-2 text-editorial-text-muted transition-colors duration-300 hover:bg-editorial-text/5 hover:text-editorial-text focus:outline-none sm:p-3";

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[70]"
        style={{ scaleX, backgroundColor: progressColor }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
        aria-hidden="true"
      />

      {/* ───────────────── THE DIRECTORY ─────────────────
          Every page and panel on the site in one panel, the same on a phone
          and on a monitor. It replaces BOTH the old four-link "Explore
          Everything" mega menu and the separate phone menu. */}
      <AnimatePresence>
        {isDirectoryOpen && (
          <motion.div
            key="directory"
            ref={directoryRef}
            role="dialog"
            aria-modal="true"
            aria-label="Everything on this site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 top-[var(--header-current-height)] z-[var(--z-overlay)] overflow-y-auto border-t border-white/[0.05] bg-editorial-bg/95 backdrop-blur-[40px]"
            data-lenis-prevent="true"
          >
            <div className="section-container py-10 md:py-14">
              <div className="mb-10 flex items-start justify-between gap-6">
                <div>
                  <h2 className="font-sans text-2xl font-black uppercase leading-none tracking-tight text-editorial-text md:text-4xl">
                    Everything on this site
                  </h2>
                  <p className="mt-3 max-w-[48ch] font-mono text-[0.75rem] uppercase tracking-[0.2em] text-editorial-text-meta/60">
                    {DIRECTORY.reduce((n, g) => n + g.items.length, 0)} places, grouped. Nothing is kept anywhere else.
                  </p>
                </div>
                <button
                  onClick={() => setIsDirectoryOpen(false)}
                  aria-label="Close the directory"
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-editorial-bg text-editorial-text transition-colors duration-300 hover:border-red-500/50 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {DIRECTORY.map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-5 flex items-center gap-3 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-red-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#dc2626]" aria-hidden="true" />
                      {group.title}
                    </h3>
                    <ul className="space-y-1">
                      {group.items.map((item) => {
                        const here = isHere(item.to);
                        const inner = (
                          <>
                            <span className="flex items-center justify-between gap-3">
                              <span className={`font-sans text-base font-semibold tracking-tight ${here ? 'text-red-400' : 'text-editorial-text'}`}>
                                {item.label}
                              </span>
                              <ArrowRight className="h-4 w-4 shrink-0 text-red-500 opacity-0 transition-opacity duration-300 group-hover/dir:opacity-100" aria-hidden="true" />
                            </span>
                            {item.note && (
                              <span className="mt-0.5 block font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-editorial-text-meta/60">
                                {item.note}
                              </span>
                            )}
                          </>
                        );
                        const cls = "group/dir block w-full rounded-lg px-3 py-2.5 text-left transition-colors duration-300 hover:bg-white/[0.05]";
                        return (
                          <li key={item.label}>
                            {item.to ? (
                              <Link to={item.to} className={cls} aria-current={here ? 'page' : undefined}>{inner}</Link>
                            ) : (
                              <button type="button" onClick={() => openPanel(item.opens)} className={cls}>{inner}</button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                {/* ⚠️ THE HIDE CONTROL WAS `hidden lg:block` IN THE OLD ICON
                    ROW, so below 1024px a visitor could not clear the screen
                    at all. It belongs with the other display choices, where
                    every width can reach it. */}
                <div>
                  <h3 className="mb-5 flex items-center gap-3 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-red-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#dc2626]" aria-hidden="true" />
                    Full screen
                  </h3>
                  <button
                    type="button"
                    onClick={() => { setIsDirectoryOpen(false); toggleChrome('header'); }}
                    className="group/dir block w-full rounded-lg px-3 py-2.5 text-left transition-colors duration-300 hover:bg-white/[0.05]"
                  >
                    <span className="font-sans text-base font-semibold tracking-tight text-editorial-text">Hide the top bar</span>
                    <span className="mt-0.5 block font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-editorial-text-meta/60">
                      The RAW mark bottom-left brings it back
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────── THE BAR ───────────────── */}
      <nav
        id="main-nav"
        aria-label="Main Navigation"
        data-chrome-hidden={chromeHidden.includes('header') || undefined}
        className="fixed inset-x-0 top-0 z-[var(--z-header)] h-[var(--header-current-height)] border-b border-white/[0.05] bg-editorial-bg/70 backdrop-blur-[40px] transition-transform duration-[var(--layout-transition-duration)] ease-[var(--layout-transition-ease)] data-[chrome-hidden]:pointer-events-none data-[chrome-hidden]:-translate-y-full"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-red-600/5 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex h-full max-w-[var(--content-max-width)] flex-col px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)]">

          {/* TIER ONE — the mark, the named row on a wide screen, the actions */}
          {/* ⚠️ MEASURED AT 375px: the mark plus the action buttons came to 361px
              inside a 327px row, so the Everything button — the door to half
              the site — was clipped by the right edge of the screen. The gap
              and the mark both step down on a narrow screen; the row is
              re-measured by scripts/fitcheck.mjs. */}
          <div className="flex min-h-[3.5rem] flex-1 items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className="flex shrink-0 items-center rounded-xl border border-transparent p-2 transition-colors duration-300 hover:border-white/5"
              aria-label="RAW Official — home"
            >
              <img
                src="/brand/raw-logo-red.png"
                alt="RAW Official"
                className="h-6 object-contain invert contrast-125 transition-all duration-500 hover:invert-0 sm:h-7 md:h-8"
                referrerPolicy="no-referrer"
              />
            </Link>

            {/* The named destinations on one line, from 1400px up. */}
            <div
              ref={stripRef}
              className="hidden min-w-0 flex-1 gap-2 overflow-hidden min-[1400px]:flex"
            >
              {PRIMARY.map((item, i) => (
                <div key={item.label} className="flex shrink-0" style={{ display: i < fitCount ? undefined : 'none' }}>
                  <DestinationButton item={item} />
                </div>
              ))}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
              {/* ⚠️ THE ONLY CONTROL ON THIS SITE THAT CAN TAKE MONEY, SO IT
                  IS THE ONLY ONE THAT PULSES. This app's own /shop is a
                  catalogue — payments are off and it says so. Orders are taken
                  by the real WooCommerce site, which opens in a panel here.
                  The ring is slow (@keyframes pulse-ring in index.css): a fast
                  pulse on a buy button reads as pressure, and reduced-motion
                  gets a steady ring rather than nothing. */}
              <Tooltip content="Buy at the official store">
                <button
                  onClick={() => setIsShopIframeOpen(true)}
                  aria-label="Buy at the official RAW store"
                  className="inline-flex min-h-11 items-center justify-center gap-2 animate-[pulse-ring_3s_ease-out_infinite] rounded-full bg-red-600 px-3 text-white transition-colors duration-300 hover:bg-red-500 focus:outline-none sm:px-5"
                >
                  <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="hidden font-mono text-[0.6875rem] font-black uppercase tracking-[0.2em] sm:inline">Buy</span>
                </button>
              </Tooltip>

              <Tooltip content="Search the products  [⌘K]">
                <button onClick={() => setIsSearchOpen(true)} className={iconButton} aria-label="Search products">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
              </Tooltip>

              {/* ⚠️ THE STACK LIVES HERE NOW. It was a floating badge in the
                  bottom-right corner that a first-time visitor never saw,
                  because that badge is hidden by DEFAULT_HIDDEN — so a stack
                  could be gathered with no control anywhere that opened it. */}
              <Tooltip content="My stack — what you have gathered">
                <button
                  onClick={() => setIsProtocolOpen(true)}
                  className={iconButton}
                  aria-label={`My stack, ${stackCount} ${stackCount === 1 ? 'item' : 'items'}`}
                >
                  <Layers className="h-5 w-5" aria-hidden="true" />
                  {stackCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-red-400/50 bg-red-600 font-mono text-[0.6875rem] font-black text-white sm:h-5 sm:w-5">
                      {stackCount}
                    </span>
                  )}
                </button>
              </Tooltip>

              <Tooltip content="Basket">
                <button onClick={() => setIsCartOpen(true)} className={iconButton} aria-label={`Basket, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}>
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        key={itemCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-red-400/50 bg-red-600 font-mono text-[0.6875rem] font-black text-white sm:h-5 sm:w-5"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </Tooltip>

              {/* ⚠️ THE HIDING CLASS MUST GO ON THE WRAPPER, NOT THE LINK.
                  `hidden sm:inline-flex` on the Link left the Tooltip's own
                  wrapper holding a 44px slot for an invisible control, which
                  is what pushed the Everything button off a 375px screen.
                  Account is also in the directory, under "Your account". */}
              <span className="hidden sm:inline-flex">
                <Tooltip content="Your account">
                  <Link to="/account" className={iconButton} aria-label="Your account">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Tooltip>
              </span>

              {/* ⚠️ A NAMED BUTTON, NOT A BARE HAMBURGER. Three lines in a
                  corner was the only door to half the site, and it said
                  nothing about what was behind it. The word is kept wherever
                  there is room for it. */}
              <button
                onClick={() => setIsDirectoryOpen((v) => !v)}
                aria-expanded={isDirectoryOpen}
                aria-label={isDirectoryOpen ? "Close the directory of everything on this site" : "Open the directory of everything on this site"}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-editorial-text transition-colors duration-300 hover:border-red-500/40 hover:bg-white/[0.08]"
              >
                {isDirectoryOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <LayoutGrid className="h-4 w-4" aria-hidden="true" />}
                <span className="hidden min-[420px]:inline">{isDirectoryOpen ? 'Close' : 'Everything'}</span>
              </button>
            </div>
          </div>

          {/* TIER TWO — the SAME eight destinations on a phone as on a
              monitor, scrolling sideways rather than being swapped for a
              hamburger. `scrollbar-none` hides the scrollbar only; the row is
              still a real scroll container, swipeable and keyboard-reachable,
              and every button in it is a tab stop. */}
          <div className="-mx-[var(--shell-padding-mobile)] flex items-center gap-2 overflow-x-auto px-[var(--shell-padding-mobile)] pb-2.5 scrollbar-none min-[1400px]:hidden md:-mx-[var(--shell-padding)] md:px-[var(--shell-padding)] lg:-mx-[var(--shell-padding-lg)] lg:px-[var(--shell-padding-lg)]">
            {PRIMARY.map((item) => (
              <DestinationButton key={item.label} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* ───────────────── PRODUCT SEARCH ───────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            key="search-modal"
            ref={searchRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[var(--z-overlay)] flex flex-col bg-editorial-bg/98 backdrop-blur-2xl"
            data-lenis-prevent="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/15 via-transparent to-transparent pointer-events-none mix-blend-screen opacity-50" aria-hidden="true" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-[var(--content-max-width)] flex-col p-6 md:p-16">
              <div className="mb-10 flex items-center justify-between gap-4 md:mb-16">
                <div className="flex items-center gap-4 rounded-2xl border border-editorial-border bg-editorial-bg px-5 py-3">
                  <Command className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-editorial-text-muted">Search products</span>
                  <span className="hidden items-center gap-2 border-l border-white/10 pl-4 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-label-dim lg:flex">
                    <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-sans text-white">⌘K</kbd>
                  </span>
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close search"
                  className="group inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-editorial-border bg-editorial-bg p-4 transition-colors duration-500 hover:border-red-500/50"
                >
                  <X className="h-6 w-6 text-editorial-text transition-all duration-500 group-hover:rotate-90 group-hover:text-red-500" />
                </button>
              </div>

              <div className="relative mb-10 w-full xl:w-2/3">
                <label htmlFor="product-search" className="mb-4 flex items-center gap-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.3em] text-red-500">
                  <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" /> What are you looking for?
                </label>
                <input
                  id="product-search"
                  data-autofocus
                  placeholder="PROTEIN, PRE-WORKOUT, GLOVES…"
                  className="w-full border-b-[3px] border-editorial-border-light bg-transparent py-6 font-sans text-display-sm font-black uppercase leading-none tracking-tighter text-editorial-text transition-all duration-500 placeholder:text-editorial-text/10 focus:border-red-600 focus:outline-none md:text-[3.75rem]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="group flex h-full flex-col rounded-[2rem] border border-editorial-border bg-editorial-bg p-6 transition-all duration-500 hover:-translate-y-1 hover:border-red-600/50"
                      >
                        <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-editorial-border bg-editorial-bg">
                          <LazyImage
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover opacity-80 mix-blend-screen grayscale transition-transform duration-[1200ms] group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-[50%]"
                            containerClassName="w-full h-full absolute inset-0 p-6"
                          />
                        </div>
                        <h4 className="mb-4 line-clamp-2 font-sans text-2xl font-black uppercase tracking-tight text-premium">{product.name}</h4>
                        <div className="mt-auto flex items-center justify-between border-t border-editorial-border pt-4">
                          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-editorial-text-muted">{product.category}</span>
                          <span className="font-mono text-lg text-editorial-text">{product.price}</span>
                        </div>
                      </Link>
                    ))
                  ) : searchQuery && (
                    <div className="col-span-full rounded-[2rem] border border-dashed border-editorial-border py-24 text-center">
                      <p className="font-mono text-base uppercase tracking-[0.3em] text-editorial-text-muted">
                        Nothing matched
                        <span className="mt-4 block text-2xl tracking-tight text-editorial-text">{searchQuery}</span>
                      </p>
                      <p className="mt-6 font-mono text-[0.75rem] uppercase tracking-widest text-label-dim">Try a shorter word, or browse the shop</p>
                    </div>
                  )}
                  {!searchQuery && (
                    <div className="col-span-full border-t border-editorial-border pt-10">
                      <span className="mb-8 block font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-editorial-text-muted">Popular searches</span>
                      <div className="flex flex-wrap gap-4">
                        {["Nutrients", "Combat", "Recovery", "Official Gear"].map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="group inline-flex min-h-11 items-center rounded-2xl border border-editorial-border bg-editorial-bg px-6 font-mono text-[0.75rem] font-bold uppercase tracking-widest text-editorial-text-muted transition-all duration-500 hover:-translate-y-0.5 hover:border-red-500/50 hover:text-editorial-text"
                          >
                            {tag} <ArrowRight className="ml-3 inline-block h-4 w-4 -translate-x-2 text-red-500 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
