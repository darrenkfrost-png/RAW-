import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Lock, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, X,
  Download, Bookmark, Trash2, Search, PanelLeft, Copy, CheckCircle2
} from "lucide-react";
import { booksData, Book, BookPage } from "../data/books";
import { useToast } from "./common/Toast";

const FREE_PREVIEW_PAGE_LIMIT = 10; // Zero-based indices: 0-9 public, 10+ premium locked.

export default function LivingBookEngine() {
  const { addToast } = useToast();
  
  // States
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const touchStartDist = useRef<number>(0);
  const touchStartZoom = useRef<number>(1);
  const lastTouchTime = useRef<number>(0);

  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // below lg the page strip is a drawer
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  

  // Annotations Store: saved by bookId and pageNumber
  const [annotations, setAnnotations] = useState<{ [key: string]: { id: string; text: string; date: string }[] }>({});
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Check if current page is premium locked
  const isPageLocked = useMemo(() => {
    return currentPageIdx >= FREE_PREVIEW_PAGE_LIMIT;
  }, [currentPageIdx]);

  // Current page data
  const currentPageData = useMemo<BookPage | null>(() => {
    if (!selectedBook) return null;
    return selectedBook.pages[currentPageIdx] || null;
  }, [selectedBook, currentPageIdx]);

  // Handle book switching
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentPageIdx(0);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsNotesOpen(false);
    setIsSidebarOpen(false);
    setIsFullscreen(false);
  };

  // Close reader
  const handleExitBook = useCallback(() => {
    setSelectedBook(null);
    setPanOffset({ x: 0, y: 0 });
    setIsFullscreen(false);
    setIsSidebarOpen(false);
  }, []);

  // Safe navigation controls
  const handleNextPage = useCallback(() => {
    if (!selectedBook) return;
    if (currentPageIdx + 1 < selectedBook.pages.length) {
      setCurrentPageIdx(prev => prev + 1);
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [selectedBook, currentPageIdx]);

  const handlePrevPage = useCallback(() => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx(prev => prev - 1);
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [currentPageIdx]);

  // Jump straight to a page (page strip / search results): zoom and pan reset exactly like the arrows do
  const jumpToPage = useCallback((idx: number) => {
    setCurrentPageIdx(idx);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsSidebarOpen(false);
  }, []);

  // Restore back to Safe Public Preview
  const handleReturnToSafePreview = useCallback(() => {
    setCurrentPageIdx(FREE_PREVIEW_PAGE_LIMIT - 1); // Select exactly 10th page (Index 9)
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    addToast("Returned safely to public preview limits.", "info");
  }, [addToast]);

  // Wheel Zoom supporting standard mouse gestures
  const handleWheelZoom = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoomScale(prev => {
        const next = Math.max(0.6, Math.min(3.0, prev + delta));
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  }, []);

  const handleDoubleClickZoom = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (zoomScale > 1) {
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
      addToast("Zoom scale reset.", "info");
    } else {
      setZoomScale(1.6);
      addToast("Double-tap zoom active (1.6x)", "success");
    }
  }, [zoomScale, addToast]);

  const handleMouseDownPan = useCallback((e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDraggingPan(true);
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  }, [zoomScale, panOffset]);

  const handleMouseMovePan = useCallback((e: React.MouseEvent) => {
    if (!isDraggingPan || zoomScale <= 1) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanOffset({ x: dx, y: dy });
  }, [isDraggingPan, zoomScale]);

  const handleMouseUpPan = useCallback(() => {
    setIsDraggingPan(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Touch pinch start
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDist.current = dist;
      touchStartZoom.current = zoomScale;
    } else if (e.touches.length === 1) {
      // Double click toggle check
      const now = Date.now();
      if (now - lastTouchTime.current < 300) {
        if (zoomScale > 1) {
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        } else {
          setZoomScale(1.6);
        }
        e.preventDefault();
      }
      lastTouchTime.current = now;
      if (zoomScale > 1) {
        setIsDraggingPan(true);
        const t = e.touches[0];
        dragStart.current = { x: t.clientX - panOffset.x, y: t.clientY - panOffset.y };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current > 0) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / touchStartDist.current;
      setZoomScale(Math.max(0.6, Math.min(3.0, touchStartZoom.current * ratio)));
    } else if (e.touches.length === 1 && isDraggingPan && zoomScale > 1) {
      const t = e.touches[0];
      const dx = t.clientX - dragStart.current.x;
      const dy = t.clientY - dragStart.current.y;
      setPanOffset({ x: dx, y: dy });
    }
  };

  const handleTouchEnd = () => {
    touchStartDist.current = 0;
    setIsDraggingPan(false);
  };

  // Copy the page text to the clipboard (public pages only)
  const copyPageText = () => {
    if (isPageLocked) {
      addToast("Premium pages cannot be copied.", "error");
      return;
    }
    if (!currentPageData) return;
    navigator.clipboard.writeText(currentPageData.content)
      .then(() => addToast("Page text copied to clipboard.", "success"))
      .catch(() => addToast("Copy failed. Select the text and copy it manually.", "error"));
  };

  // Annotations Handlers
  const activeAnnotationsList = useMemo(() => {
    if (!selectedBook) return [];
    const key = `${selectedBook.id}-${currentPageIdx + 1}`;
    return annotations[key] || [];
  }, [annotations, selectedBook, currentPageIdx]);

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedBook) return;

    if (isPageLocked) {
      addToast("Notes cannot be added to premium pages.", "error");
      return;
    }

    const key = `${selectedBook.id}-${currentPageIdx + 1}`;
    const newNote = {
      id: Math.random().toString(),
      text: newNoteText,
      date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setAnnotations(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newNote]
    }));
    setNewNoteText("");
    setIsAddingNote(false);
    addToast("Note saved for this session.", "success");
  };

  const handleDeleteAnnotation = (id: string) => {
    if (!selectedBook) return;
    const key = `${selectedBook.id}-${currentPageIdx + 1}`;
    setAnnotations(prev => ({
      ...prev,
      [key]: prev[key].filter(note => note.id !== id)
    }));
    addToast("Annotation removed.", "info");
  };

  // Safe Export/Download Tool: Only exports public pages 1-10!
  const triggerSafeExport = () => {
    if (!selectedBook) return;
    addToast("Exporting pages 1-10 as JSON...", "info");

    const exportedPages = selectedBook.pages.slice(0, FREE_PREVIEW_PAGE_LIMIT);
    const contentToSave = {
      bookTitle: selectedBook.title,
      author: selectedBook.author,
      exportDate: new Date().toISOString(),
      note: "Public Preview Edition (Pages 1-10). Pages 11+ require premium license keys.",
      data: exportedPages
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contentToSave, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${selectedBook.id}_public_doctrine.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast("Pages 1-10 exported as JSON.", "success");
  };

  // Book Search: search only pages 1 to 10
  const searchResults = useMemo(() => {
    if (!selectedBook || !searchQuery.trim()) return [];
    
    // Fail-closed block: NEVER search locked premium index 10+ pages
    const searchablePages = selectedBook.pages.slice(0, FREE_PREVIEW_PAGE_LIMIT);
    
    return searchablePages.filter(pg => 
      pg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pg.title && pg.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [selectedBook, searchQuery]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Escape leaves fullscreen (listened for only while it is on)
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  // Notes are unavailable on locked pages: close the panel rather than leave an empty column
  useEffect(() => {
    if (isPageLocked) {
      setIsNotesOpen(false);
      setIsAddingNote(false);
    }
  }, [isPageLocked]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#06060a]/90">
      
      {!selectedBook ? (
        /* Bookstore Mode */
        <div className="p-8 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-editorial-border/40 pb-6 gap-4">
            <div>
              <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-[0.4em] font-black">
                SYSTEM_INTEL_DISTRIBUTION
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                Living Book Bookstore
              </h2>
            </div>
          </div>

          <p className="text-zinc-400 font-light max-w-2xl text-sm leading-relaxed">
            Access RAW performance, recovery, and tactical training manuals. All accounts receive immediate access to the first <strong className="text-red-500">10 pages (public preview)</strong>. Pages 11+ belong to premium protocol streams.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {booksData.map((book) => (
              <div 
                key={book.id} 
                className="bg-black/40 border border-editorial-border rounded-[2.5rem] p-8 flex flex-col hover:border-red-600/30 hover:bg-zinc-900/10 transition-all duration-700 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 font-mono text-[0.6875rem] font-bold text-zinc-700 uppercase tracking-widest">{book.category}</div>
                
                <div className="w-16 h-16 bg-red-600/10 border border-red-500/25 rounded-2xl flex items-center justify-center text-red-500 mb-6 group-hover:scale-105 transition-transform duration-500 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                  <BookOpen className="w-6 h-6" />
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter transition-colors group-hover:text-red-500">
                      {book.title}
                    </h3>
                    <p className="font-mono text-[0.6875rem] text-zinc-500 mt-1 uppercase tracking-widest">
                      BY {book.author}
                    </p>
                    <p className="text-zinc-400 text-xs font-light tracking-tight leading-relaxed mt-4">
                      {book.description}
                    </p>
                  </div>
                  
                  <div className="pt-8 flex items-center justify-between border-t border-editorial-border/40 mt-8">
                    <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                      10 FREE_PAGES // {book.pages.length} TOTAL
                    </span>
                    <button
                      onClick={() => handleSelectBook(book)}
                      className="button-premium !py-3.5 !px-6 !text-[0.6875rem] font-mono tracking-widest uppercase flex items-center gap-2"
                    >
                      OPEN MANUAL <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Immersive Book Reader mode (Multi-panel Workspace) */
        <div className={`flex flex-col flex-1 min-h-0 bg-[#040407] select-none ${isFullscreen ? "fixed inset-0 z-[10000] p-6 lg:p-12 overflow-hidden bg-black" : "relative"}`}>
          
          {/* Reader Top Command Bar */}
          <header className="px-4 sm:px-6 py-4 border-b border-editorial-border/40 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-editorial-surface/30">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handleExitBook}
                className="p-2.5 bg-zinc-900 border border-editorial-border rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-xs font-mono font-bold tracking-widest uppercase whitespace-nowrap"
              >
                ← EXIT_SYS
              </button>
              <div className="h-6 w-px bg-editorial-border/20 mx-2 hidden sm:block" />
              <div className="min-w-0">
                <h4 className="text-sm font-semibold uppercase text-white tracking-widest truncate">
                  {selectedBook.title}
                </h4>
                <p className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-[0.2em] truncate">
                  BY {selectedBook.author} // CORE INTELLIGENCE MODULE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Below lg: open the page strip / search drawer */}
              <button
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className={`lg:hidden p-2.5 rounded-xl border transition-all ${
                  isSidebarOpen
                    ? "bg-red-700/20 text-red-500 border-red-500/50"
                    : "bg-zinc-900 text-zinc-400 border-editorial-border hover:text-white"
                }`}
                title="Pages and search"
                aria-label="Toggle page list and search"
                aria-pressed={isSidebarOpen}
              >
                <PanelLeft className="w-4 h-4" />
              </button>

              {/* Copy page text (public pages only) */}
              <button
                onClick={copyPageText}
                disabled={isPageLocked}
                className="p-2.5 rounded-xl border transition-all flex items-center gap-2 text-[0.6875rem] font-mono whitespace-nowrap uppercase tracking-widest bg-zinc-900 text-zinc-400 border-editorial-border hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                title="Copy this page's text"
                aria-label="Copy this page's text"
              >
                <Copy className="w-4 h-4" /><span className="hidden sm:inline">COPY_TEXT</span>
              </button>

              {/* Notes panel toggle */}
              <button
                onClick={() => {
                  if (isPageLocked) {
                    addToast("Notes are unavailable on premium pages.", "error");
                    return;
                  }
                  setIsNotesOpen(prev => !prev);
                }}
                disabled={isPageLocked}
                className={`p-2.5 rounded-xl border transition-all ${
                  isNotesOpen
                    ? "bg-red-700/20 text-red-500 border-red-500/50"
                    : "bg-zinc-900 text-zinc-400 border-editorial-border hover:text-white"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Toggle page notes"
                aria-label="Toggle page notes"
                aria-pressed={isNotesOpen}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-editorial-border rounded-xl text-zinc-400 hover:text-white transition-all"
                title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen reader"}
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen reader"}
                aria-pressed={isFullscreen}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </header>

          {/* Reader Core Area (Workspace View) */}
          <div className="flex-1 flex min-h-0 relative overflow-hidden" onWheel={handleWheelZoom}>
            
            {/* Left Wing Sidebar: Search & Thumbnail Grid Strip */}
            <div className={`${isSidebarOpen ? "flex" : "hidden"} lg:flex absolute inset-y-0 left-0 z-20 w-72 max-w-full lg:static border-r border-editorial-border/40 bg-zinc-950/95 lg:bg-zinc-950/80 flex-col shrink-0`}>
              
              {/* Document Search Panel */}
              <div className="p-4 border-b border-editorial-border/40">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="SEARCH MODULE (1-10)..."
                    aria-label="Search pages 1-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-editorial-border rounded-xl pl-9 pr-4 py-2 font-mono text-[0.6875rem] text-white focus:border-red-500 focus:outline-none transition-all uppercase tracking-widest placeholder:text-zinc-600"
                  />
                </div>

                {searchQuery.trim() && (
                  <div className="mt-3 bg-black/60 border border-editorial-border/40 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                    <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                      RESULTS ({searchResults.length})
                    </span>
                    {searchResults.length === 0 ? (
                      <span className="block text-[0.6875rem] font-mono text-zinc-500">NO MATCHES (PAGES 1-10)</span>
                    ) : (
                      searchResults.map(result => (
                        <button
                          key={result.pageNumber}
                          onClick={() => {
                            jumpToPage(result.pageNumber - 1);
                            setSearchQuery("");
                          }}
                          className="w-full text-left font-mono text-[0.6875rem] text-zinc-400 hover:text-white truncate border-b border-white/[0.03] pb-1.5 last:border-0 block"
                        >
                          PG {result.pageNumber}: {result.title || "Section"}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Secure Thumbnail Flip Strip */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                <span className="block font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest font-black mb-2">
                  PAGE FLIP STRIP
                </span>
                
                {selectedBook.pages.map((pg, idx) => {
                  const isThumbLocked = idx >= FREE_PREVIEW_PAGE_LIMIT;
                  const isActive = idx === currentPageIdx;
                  
                  return (
                    <button
                      key={pg.pageNumber}
                      onClick={() => jumpToPage(idx)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isActive 
                          ? "bg-red-700/10 border-red-500 text-white" 
                          : "bg-black/40 border-editorial-border text-zinc-400 hover:bg-zinc-900/40 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[0.6875rem] font-bold">
                          {pg.pageNumber.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[0.6875rem] font-light max-w-[140px] truncate text-left">
                          {isThumbLocked ? "••••••••••••" : (pg.title || "Section block")}
                        </span>
                      </div>
                      
                      {isThumbLocked && <Lock className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Reader Canvas (Center Stage) */}
            <div className="flex-1 bg-[#020204] flex flex-col justify-between overflow-hidden relative">
              
              {/* Zoom Scale HUD Badge */}
              <div className="absolute top-4 left-6 z-10 font-mono text-[0.6875rem] text-zinc-500 bg-black/60 border border-editorial-border/60 px-3 py-1.5 rounded-lg">
                ZOOM: {(zoomScale * 100).toFixed(0)}% // CTRL+SCROLL TO PINCH
              </div>

              {/* High-Fidelity Canvas Container */}
              <div 
                className={`flex-1 flex items-center justify-center p-8 select-text ${zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                style={{ overflow: 'hidden' }}
                onMouseDown={handleMouseDownPan}
                onMouseMove={handleMouseMovePan}
                onMouseUp={handleMouseUpPan}
                onMouseLeave={handleMouseUpPan}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="wait">
                  {!isPageLocked ? (
                    /* Public Open Book page rendering */
                    <motion.div
                      key={currentPageIdx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.45 }}
                      onDoubleClick={handleDoubleClickZoom}
                      className="bg-zinc-950 border border-editorial-border flex flex-col p-8 md:p-14 max-w-2xl w-full rounded-2xl shadow-depth-3 select-text relative overflow-hidden"
                      style={{ 
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                        transformOrigin: 'center center',
                        contain: 'content',
                        touchAction: zoomScale > 1 ? 'none' : 'pan-y'
                      }}
                    >
                      {/* Grid background watermark */}
                      <div className="absolute inset-0 bg-[#0f0a0d]/10 opacity-30 pointer-events-none" />

                      <div className="flex justify-between items-center border-b border-red-950/40 pb-4 mb-8">
                        <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-[0.4em] font-black">
                          {selectedBook.title}
                        </span>
                        <span className="font-mono text-[0.6875rem] text-red-500 font-bold tracking-widest uppercase">
                          PAGE {currentPageIdx + 1} // PUBLIC_ACCESS
                        </span>
                      </div>

                      <div className="space-y-6 select-text">
                        <h3 className="text-3xl font-bold uppercase tracking-tight text-white leading-tight">
                          {currentPageData?.title}
                        </h3>
                        <p className="font-light leading-relaxed text-zinc-300 text-lg md:text-xl drop-shadow-sm border-l-2 border-red-700/15 pl-6 py-2 select-text">
                          {currentPageData?.content}
                        </p>
                      </div>

                      <div className="border-t border-editorial-border/20 pt-6 mt-10 flex justify-between items-center">
                        <span className="font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-[0.3em]">
                          DOCTRINE_INDEX_{selectedBook.id.substring(0,6).toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    /* Redwood Frosted Locked Preview (FAIL-CLOSED GUARD) */
                    <motion.div
                      key="locked-premium-screen"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-[#12080a]/95 border border-red-600/30 w-full max-w-xl p-10 md:p-14 rounded-3xl shadow-[0_20px_50px_rgba(220,38,38,0.15)] backdrop-blur-2xl text-center space-y-8 relative overflow-hidden flex flex-col justify-center"
                    >
                      {/* Aesthetic locked glows */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/10 blur-[100px] pointer-events-none" />

                      <div className="mx-auto w-16 h-16 rounded-full bg-red-700/15 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
                        <Lock className="w-8 h-8" />
                      </div>

                      <div className="space-y-3">
                        <span className="font-mono text-[0.6875rem] text-red-500 tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black uppercase">
                          PREMIUM PROTOCOL REQUIRED
                        </span>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                          PREVIEW LIMIT REACHED
                        </h3>
                        <p className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest">
                          "{selectedBook.title}" // PAGE {currentPageIdx + 1} IS RESTRICTED
                        </p>
                      </div>

                      <div className="p-6 bg-black/40 border border-editorial-border rounded-2xl text-left space-y-4">
                        <span className="block font-mono text-[0.6875rem] text-red-500 uppercase tracking-widest font-black italic">
                          ENTITLEMENT ADVISORY:
                        </span>
                        <p className="text-xs text-zinc-400 tracking-tight leading-relaxed">
                          The first 10 pages of this book are provided completely free to diagnostic operatives. Full chapters, mechanical cutting charts, hypoxia calculators, and hormone tuning guides require subscription validation.
                        </p>
                        
                        <div className="space-y-2.5 pt-2">
                          {[
                            "Unlock Complete 30+ Performance Guidelines",
                            "Access Complete Character Mapping and Shot Forge integrations",
                            "Download clear offline structural PDF assets securely",
                          ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs text-zinc-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {benefit}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-4 shrink-0">
                        <button
                          onClick={handleReturnToSafePreview}
                          className="flex-1 px-6 py-4 bg-zinc-900 border border-editorial-border hover:border-zinc-700 rounded-xl font-mono text-[0.6875rem] uppercase font-black text-zinc-400 hover:text-white transition-all tracking-widest"
                        >
                          ← BACK_TO_PAGE_10
                        </button>
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          className="flex-1 button-premium !py-4 text-[0.6875rem] font-mono uppercase tracking-widest opacity-50 cursor-not-allowed flex flex-wrap items-center justify-center gap-2"
                        >
                          SUBSCRIBE TO UNLOCK
                          <span className="font-mono text-[0.5625rem] tracking-widest border border-white/30 rounded px-1.5 py-0.5">COMING_SOON</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reader Bottom Navigation & Zoom Bar */}
              <footer className="px-4 sm:px-6 py-4 border-t border-editorial-border/40 bg-zinc-950 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  {/* Zoom Controls */}
                  <div className="flex items-center bg-[#07070a] border border-editorial-border rounded-xl p-1 gap-1">
                    <button
                      onClick={() => {
                        const next = Math.max(0.8, zoomScale - 0.2);
                        setZoomScale(next);
                        if (next <= 1) setPanOffset({ x: 0, y: 0 });
                      }}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                      title="Zoom Out"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setZoomScale(1);
                        setPanOffset({ x: 0, y: 0 });
                      }}
                      className="px-2 font-mono text-[0.6875rem] text-zinc-500 hover:text-white transition-colors"
                      title="Reset zoom and centre the page"
                    >
                      100%
                    </button>
                    <button
                      onClick={() => {
                        const next = Math.min(2.5, zoomScale + 0.2);
                        setZoomScale(next);
                        if (next <= 1) setPanOffset({ x: 0, y: 0 });
                      }}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                      title="Zoom In"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Export (public pages only) */}
                  <button
                    onClick={triggerSafeExport}
                    className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-editorial-border rounded-xl text-zinc-400 hover:text-white transition-all flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-widest"
                    title="Export pages 1-10 as a JSON file"
                  >
                    <Download className="w-3.5 h-3.5" /> EXPORT_JSON
                  </button>
                </div>

                {/* Left/Right arrow flippers */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPageIdx === 0}
                    className="p-3 bg-[#0a0a0f] border border-editorial-border hover:border-zinc-700 rounded-xl text-zinc-400 disabled:opacity-20 disabled:pointer-events-none transition-all"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="font-mono text-[0.6875rem] text-zinc-400 min-w-16 text-center">
                    PAGE {currentPageIdx + 1} / {selectedBook.pages.length}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPageIdx === selectedBook.pages.length - 1}
                    className="p-3 bg-[#0a0a0f] border border-editorial-border hover:border-zinc-700 rounded-xl text-zinc-400 disabled:opacity-20 disabled:pointer-events-none transition-all"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </footer>
            </div>

            {/* Right side notes panel: a drawer over the page below lg, a column beside it from lg */}
            <AnimatePresence>
              {isNotesOpen && (
                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ type: "spring", damping: 30, stiffness: 220 }}
                  className="absolute inset-y-0 right-0 z-20 w-full max-w-[340px] lg:static lg:w-[340px] border-l border-editorial-border/40 bg-zinc-950/95 flex flex-col shrink-0 min-h-0 select-text"
                >
                  <div className="p-6 border-b border-editorial-border/40 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-red-500" />
                      <span className="font-sans font-bold text-xs uppercase text-white tracking-widest">
                        Page Notes
                      </span>
                    </div>
                    <button
                      onClick={() => setIsNotesOpen(false)}
                      className="p-2 min-h-11 min-w-11 flex items-center justify-center hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white"
                      aria-label="Close notes panel"
                      title="Close notes panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Session notes block */}
                    {!isPageLocked && (
                      <div className="space-y-4 select-text">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-widest leading-none">
                            PAGE_ANNOTATIONS ({activeAnnotationsList.length})
                          </span>
                          <button
                            onClick={() => setIsAddingNote(!isAddingNote)}
                            className="min-h-11 px-3 bg-red-700/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 rounded-lg text-[0.6875rem] font-mono uppercase font-black tracking-widest transition-all"
                            aria-pressed={isAddingNote}
                          >
                            + ADD_NOTE
                          </button>
                        </div>
                        <p className="font-mono text-[0.625rem] text-zinc-600 uppercase tracking-widest leading-relaxed">
                          Session only: notes are not kept once the reader closes.
                        </p>

                        {isAddingNote && (
                          <form onSubmit={handleAddAnnotation} className="space-y-3 bg-black/60 border border-editorial-border p-4 rounded-xl relative select-text">
                            <textarea
                              placeholder="COMPILE LOCAL NOTE..."
                              aria-label="New note"
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              className="w-full bg-[#07070a] border border-editorial-border/60 rounded-xl p-3 font-mono text-[0.6875rem] text-white focus:border-red-500 outline-none uppercase placeholder:text-zinc-700 resize-none h-20"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setIsAddingNote(false)}
                                className="flex-1 py-2 bg-zinc-900 border border-editorial-border rounded-lg font-mono text-[0.6875rem] text-zinc-400 hover:text-white"
                              >
                                CANCEL
                              </button>
                              <button
                                type="submit"
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-mono text-[0.6875rem] tracking-widest font-black uppercase"
                              >
                                COMMIT_NOTE
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar select-text">
                          {activeAnnotationsList.map(note => (
                            <div 
                              key={note.id}
                              className="p-3.5 bg-[#0a0a0f] border border-editorial-border/80 rounded-xl flex flex-col gap-2 relative select-text"
                            >
                              <div className="flex justify-between items-center select-none shrink-0">
                                <span className="font-mono text-[0.6875rem] text-zinc-500">TIMESTAMP: {note.date}</span>
                                <button
                                  onClick={() => handleDeleteAnnotation(note.id)}
                                  className="p-2.5 min-h-11 min-w-11 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors"
                                  title="Delete note"
                                  aria-label="Delete note"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-xs text-zinc-300 font-light leading-relaxed select-text capitalize">
                                {note.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      )}
    </div>
  );
}
