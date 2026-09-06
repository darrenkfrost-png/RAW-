import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUI } from "../context/UIContext";
import { motion, AnimatePresence } from "motion/react";
import { Home, ShoppingBag, BookOpen, Layers, Menu, ChevronLeft, Activity, Database, FileText, Monitor, PanelLeftClose } from "lucide-react";
import { Tooltip } from "./common/Tooltip";

/* --layout-transition-duration (index.css) is a constant; read it once on the
   first render rather than forcing a style recalc on every route change. */
let layoutTransitionSeconds: number | null = null;
function getLayoutTransitionSeconds(): number {
  if (layoutTransitionSeconds === null) {
    try {
      layoutTransitionSeconds = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-transition-duration')) / 1000 || 0.7;
    } catch {
      layoutTransitionSeconds = 0.7;
    }
  }
  return layoutTransitionSeconds;
}

function Sidebar() {
  const { pathname } = useLocation();
  const { isSidebarCollapsed, setIsSidebarCollapsed, setIsDiscoveryOpen, isDiscoveryOpen, chromeHidden, toggleChrome } = useUI();
  const hidden = chromeHidden.includes('sidebar');

  const links = [
    { name: "Terminal", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "DeFrost OS", path: "/defrost", icon: <Monitor className="w-5 h-5" /> },
    { name: "Arsenal", path: "/shop", icon: <ShoppingBag className="w-5 h-5" /> },
    { name: "Protocols", path: "/protocol-stacks", icon: <Layers className="w-5 h-5" /> },
    { name: "Academy", path: "/academy", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Performance", path: "/performance-system", icon: <Activity className="w-5 h-5" /> },
    { name: "Database", path: "/knowledge-core", icon: <Database className="w-5 h-5" /> },
    { name: "Manual", path: "#", icon: <FileText className="w-5 h-5" />, action: () => setIsDiscoveryOpen(!isDiscoveryOpen) },
  ];

  return (
    <motion.aside
      id="main-sidebar"
      initial={false}
      animate={{ 
         /* Collapsed narrows it; hidden removes it entirely — width 0, so the
            content beside it reclaims the space instead of sitting beside an
            empty rail. */
         width: hidden ? '0px' : (isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'),
         transform: hidden ? 'translateX(-100%)' : 'translateX(0)',
         pointerEvents: hidden ? 'none' : undefined
      }}
      transition={{ duration: getLayoutTransitionSeconds(), ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 z-[var(--z-sidebar)] bg-editorial-bg border-r border-editorial-border border-opacity-30 overflow-hidden hidden md:flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl group/sidebar"
      aria-label="Main Navigation Sidebar"
    >
      <div className="flex items-center justify-between p-6 mt-2 relative min-h-[80px]">
         <AnimatePresence mode="wait">
           {!isSidebarCollapsed && (
             <motion.div 
               key="logo-text"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
               className="font-display text-2xl font-black uppercase tracking-tighter text-red-500 whitespace-nowrap overflow-hidden"
             >
                 OS_CORE
             </motion.div>
           )}
         </AnimatePresence>
         
         <div className={`absolute flex items-center transition-all duration-700 ease-[var(--layout-transition-ease)] ${isSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-6'}`}>
            {!isSidebarCollapsed && (
              <Tooltip content="Hide side bar" placement="right">
                <button
                  onClick={() => toggleChrome('sidebar')}
                  aria-label="Hide the side bar"
                  className="mr-2 text-editorial-text-muted hover:text-red-500 transition-all duration-300 p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-red-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              </Tooltip>
            )}
            <Tooltip content={isSidebarCollapsed ? "Expand Sidebar [⌘B]" : "Collapse Sidebar [⌘B]"} placement="right">
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-editorial-text-muted hover:text-white transition-all duration-300 p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.15] rounded-2xl flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-premium active:scale-90 transform-gpu"
                aria-expanded={!isSidebarCollapsed}
                aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5 transition-transform group-hover/sidebar:-translate-x-0.5" />}
              </button>
            </Tooltip>
         </div>
      </div>

      <nav className="flex flex-col gap-1.5 p-4 mt-8 flex-1 scrollbar-none overflow-y-auto" aria-label="Primary navigation links">
         <div className="text-[0.6875rem] uppercase tracking-[0.4em] font-mono font-black text-editorial-text-muted/20 ml-4 mb-8 flex items-center gap-4" aria-hidden="true">
             <div className="w-4 h-[1px] bg-white/[0.05]" />
             {isSidebarCollapsed ? "---" : "System_Management"}
         </div>
          {links.map((link) => {
            const isActive = link.path !== '#' && pathname === link.path;
            
            const itemClass = `relative z-10 flex items-center rounded-2xl transition-all duration-500 font-mono text-[0.6875rem] uppercase tracking-[0.2em] font-black whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-500/50 group-hover:px-6 ${isSidebarCollapsed ? 'flex-col justify-center gap-1.5 px-1 py-2.5 mx-auto w-[88px] group-hover:px-1' : 'gap-4 px-5 py-4'} ${isActive ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.4)]' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`;

            const itemInner = (
              <>
                   <span className={`flex-shrink-0 transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] text-white' : 'group-hover:scale-125 group-hover:text-red-500 group-hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]'}`}>
                      {link.icon}
                   </span>
                   {isSidebarCollapsed && (
                     /* ⚠️ THE POINT OF THE WHOLE CHANGE. Without this the rail is
                        eight anonymous glyphs. tracking-normal because 0.2em
                        spacing pushes "PERFORMANCE" past the rail; leading-none
                        so the word sits tight under its icon. */
                     <span className={`text-[0.6875rem] leading-none tracking-normal font-black ${isActive ? "text-white" : "text-editorial-text-muted group-hover:text-red-100"}`}>
                       {link.name}
                     </span>
                   )}
                   <AnimatePresence>
                     {!isSidebarCollapsed && (
                       <motion.span 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -10 }}
                         transition={{ duration: 0.2 }}
                         className={isActive ? '' : 'group-hover:text-red-100 transition-colors'}
                       >
                          {link.name}
                       </motion.span>
                     )}
                   </AnimatePresence>
              </>
            );

            const LinkContent = (
              <div key={link.name} className="relative group">
                {link.action ? (
                  <button
                    type="button"
                    onClick={link.action}
                    /* ⚠️ COLLAPSED, THIS CONTROL IS AN ICON AND NOTHING ELSE.
                       The label below is only rendered when the sidebar is open, so
                       every one of these was an unnamed control to a screen reader —
                       axe found 8 unnamed links and 1 unnamed button on all 26
                       routes. The name matches the visible text exactly, so it adds
                       nothing for sighted users and everything for the rest. */
                    aria-label={link.name}
                    aria-expanded={isDiscoveryOpen}
                    className={`${itemClass} cursor-pointer ${isSidebarCollapsed ? '' : 'w-full text-left'}`}
                  >
                    {itemInner}
                  </button>
                ) : (
                  <Link 
                    to={link.path}
                    aria-label={link.name}
                    aria-current={isActive ? "page" : undefined}
                    className={itemClass}
                  >
                    {itemInner}
                  </Link>
                )}
                {/* Cinematic Hover Glow */}
                {!isActive && (
                   <div className="absolute inset-0 bg-red-600/0 blur-[10px] pointer-events-none group-hover:bg-red-600/20 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100 mix-blend-screen" />
                )}
              </div>
            );

            if (isSidebarCollapsed) {
              return (
                <Tooltip key={link.name} content={link.name} placement="right">
                  <div>{LinkContent}</div>
                </Tooltip>
              );
            }

            return LinkContent;
         })}
      </nav>
      
    </motion.aside>
  );
}

export default Sidebar;
