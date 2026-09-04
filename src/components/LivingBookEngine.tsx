import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Lock, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, X, 
  Sparkles, FileText, Download, Bookmark, Plus, Trash2, Search, HelpCircle,
  Network, Copy, CheckCircle2, ShieldCheck, RefreshCw, Cpu
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

  const [isOcrEnabled, setIsOcrEnabled] = useState<boolean>(false);
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  

  // Annotations Store: saved by bookId and pageNumber
  const [annotations, setAnnotations] = useState<{ [key: string]: { id: string; text: string; date: string }[] }>({});
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Reference hooks
  const readerStageRef = useRef<HTMLDivElement>(null);

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
    setIsOcrEnabled(false);
    setIsKnowledgeGraphOpen(false);
  };

  // Close reader
  const handleExitBook = useCallback(() => {
    setSelectedBook(null);
    setPanOffset({ x: 0, y: 0 });
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

  // Restore back to Safe Public Preview
  const handleReturnToSafePreview = useCallback(() => {
    setCurrentPageIdx(FREE_PREVIEW_PAGE_LIMIT - 1); // Select exactly 10th page (Index 9)
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    addToast("Returned safely to public preview limits.", "info");
  }, [addToast]);

  // Mock unlock sequence
  const handleTriggerSubscription = useCallback(() => {
    addToast("Submitting subscription authorization token to node matrix...", "info");
    setTimeout(() => {
      addToast("ACCESS RESTRICTED: Subscription / stripe gate requires backend environment credentials.", "error");
    }, 1200);
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

  // OCR Copy Action
  const copyOcrToClipboard = () => {
    if (isPageLocked) {
      addToast("Security violation: Restricted premium pages cannot be scanned.", "error");
      return;
    }
    if (currentPageData) {
      navigator.clipboard.writeText(currentPageData.content);
      addToast("OCR Text successfully copied to clipboard system.", "success");
    }
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
      addToast("Writing annotation protocols to secure premium chapters is prohibited.", "error");
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
    addToast("Annotation note anchored to page matrix.", "success");
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
    addToast("Compiling secure public preview export...", "info");

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

    addToast("Public documents downloaded successfully. Premium tier pages cleared from bundle stream.", "success");
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

  // Semantic Knowledge Graph: mock nodes matching the current active content (allowed pages only)
  const activeKnowledgeNodes = useMemo(() => {
    if (isPageLocked || !currentPageData) return [];
    
    const keyphrases = ["aerobic", "strength", "overdrive", "ruck", "sleep", "water", "stress", "sunlight", "hyperthermic", "combative"];
    return keyphrases.map((phrase, i) => {
      const active = currentPageData.content.toLowerCase().includes(phrase);
      return {
        id: `node-${i}`,
        label: phrase.toUpperCase(),
        active,
        connection: active ? "Direct Chapter Link" : "Secondary System Influence"
      };
    });
  }, [isPageLocked, currentPageData]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#06060a]/90">
      
      {!selectedBook ? (
        /* Bookstore Mode */
        <div className="p-8 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-editorial-border/40 pb-6 gap-4">
            <div>
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.4em] font-black">
                SYSTEM_INTEL_DISTRIBUTION // ACTIVE
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                Living Book Bookstore
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 animate-pulse" /> SECURITY_STATUS: SECURE_FAIL_CLOSED
            </div>
          </div>

          <p className="text-zinc-400 font-light max-w-2xl text-sm leading-relaxed">
            Access secure RAW performance, recovery, and tactical training manuals. All accounts receive immediate access to the first <strong className="text-red-500">10 pages (public preview)</strong>. Pages 11+ belong to premium protocol streams.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {booksData.map((book) => (
              <div 
                key={book.id} 
                className="bg-black/40 border border-editorial-border rounded-[2.5rem] p-8 flex flex-col hover:border-red-600/30 hover:bg-zinc-900/10 transition-all duration-700 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 font-mono text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{book.category}</div>
                
                <div className="w-16 h-16 bg-red-600/10 border border-red-500/25 rounded-2xl flex items-center justify-center text-red-500 mb-6 group-hover:scale-105 transition-transform duration-500 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                  <BookOpen className="w-6 h-6" />
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter transition-colors group-hover:text-red-500">
                      {book.title}
                    </h3>
                    <p className="font-mono text-[9px] text-zinc-500 mt-1 uppercase tracking-widest">
                      BY {book.author}
                    </p>
                    <p className="text-zinc-400 text-xs font-light tracking-tight leading-relaxed mt-4">
                      {book.description}
                    </p>
                  </div>
                  
                  <div className="pt-8 flex items-center justify-between border-t border-editorial-border/40 mt-8">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                      10 FREE_PAGES // {book.pages.length} TOTAL
                    </span>
                    <button
                      onClick={() => handleSelectBook(book)}
                      className="button-premium !py-3.5 !px-6 !text-[11px] font-mono tracking-widest uppercase flex items-center gap-2"
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
          <header className="px-6 py-4 border-b border-editorial-border/40 flex items-center justify-between shrink-0 bg-editorial-surface/30">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExitBook}
                className="p-2.5 bg-zinc-900 border border-editorial-border rounded-xl text-zinc-400 hover:text-white hover:border-zinc-705 transition-all text-xs font-mono font-bold tracking-widest uppercase"
              >
                ← EXIT_SYS
              </button>
              <div className="h-6 w-px bg-editorial-border/20 mx-2" />
              <div>
                <h4 className="text-sm font-semibold uppercase text-white tracking-widest">
                  {selectedBook.title}
                </h4>
                <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-[0.2em]">
                  BY {selectedBook.author} // CORE INTELLIGENCE MODULE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* OCR Toggle (Allowed Pages Only!) */}
              <button
                onClick={() => {
                  if (isPageLocked) {
                    addToast("OCR Text scanning is completely disabled on locked premium contents.", "error");
                    return;
                  }
                  setIsOcrEnabled(prev => !prev);
                  addToast(isOcrEnabled ? "OCR selection mode paused." : "OCR scan selection enabled. Text blocks copyable.", "info");
                }}
                disabled={isPageLocked}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-mono whitespace-nowrap uppercase tracking-widest ${
                  isOcrEnabled 
                    ? "bg-red-650/25 text-red-500 border-red-500/50" 
                    : "bg-zinc-900 text-zinc-400 border-editorial-border hover:text-white"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Select OCR Selectable Text Mode"
              >
                <FileText className="w-4 h-4" /> OCR_MODE
              </button>

              {/* Knowledge Graph Toggle */}
              <button
                onClick={() => {
                  if (isPageLocked) {
                    addToast("Knowledge Graph connections are premium-locked for Page 11+.", "error");
                    return;
                  }
                  setIsKnowledgeGraphOpen(!isKnowledgeGraphOpen);
                }}
                disabled={isPageLocked}
                className={`p-2.5 rounded-xl border transition-all ${
                  isKnowledgeGraphOpen 
                    ? "bg-red-650/20 text-red-500 border-red-500/50" 
                    : "bg-zinc-900 text-zinc-400 border-editorial-border hover:text-white"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
                title="Toggle Semantic Knowledge Graph"
              >
                <Network className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-editorial-border rounded-xl text-zinc-400 hover:text-white transition-all"
                title="Toggle Immersive Fullscreen Reader"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Reader Core Area (Workspace View) */}
          <div className="flex-1 flex min-h-0 relative overflow-hidden" onWheel={handleWheelZoom}>
            
            {/* Left Wing Sidebar: Search & Thumbnail Grid Strip */}
            <div className="w-72 border-r border-editorial-border/40 bg-zinc-950/80 flex flex-col shrink-0">
              
              {/* Document Search Panel */}
              <div className="p-4 border-b border-editorial-border/40">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="SEARCH MODULE (1-10)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-editorial-border rounded-xl pl-9 pr-4 py-2 font-mono text-[10px] text-white focus:border-red-500 focus:outline-none transition-all uppercase tracking-widest placeholder:text-zinc-650"
                  />
                </div>

                {searchQuery.trim() && (
                  <div className="mt-3 bg-black/60 border border-editorial-border/40 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                    <span className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                      RESULTS ({searchResults.length})
                    </span>
                    {searchResults.length === 0 ? (
                      <span className="block text-[10px] font-mono text-zinc-500">NO MATCHES (PAGES 1-10)</span>
                    ) : (
                      searchResults.map(result => (
                        <button
                          key={result.pageNumber}
                          onClick={() => {
                            setCurrentPageIdx(result.pageNumber - 1);
                            setSearchQuery("");
                          }}
                          className="w-full text-left font-mono text-[10px] text-zinc-400 hover:text-white truncate border-b border-white/[0.03] pb-1.5 last:border-0 block"
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
                <span className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-black mb-2">
                  PAGE FLIP STRIP
                </span>
                
                {selectedBook.pages.map((pg, idx) => {
                  const isThumbLocked = idx >= FREE_PREVIEW_PAGE_LIMIT;
                  const isActive = idx === currentPageIdx;
                  
                  return (
                    <button
                      key={pg.pageNumber}
                      onClick={() => {
                        setCurrentPageIdx(idx);
                        setZoomScale(1);
                      }}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isActive 
                          ? "bg-red-650/10 border-red-500 text-white" 
                          : "bg-black/40 border-editorial-border text-zinc-400 hover:bg-zinc-900/40 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] font-bold">
                          {pg.pageNumber.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-light max-w-[140px] truncate text-left">
                          {isThumbLocked ? "••••••••••••" : (pg.title || "Section block")}
                        </span>
                      </div>
                      
                      {isThumbLocked && <Lock className="w-3.5 h-3.5 text-zinc-650 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Reader Canvas (Center Stage) */}
            <div className="flex-1 bg-[#020204] flex flex-col justify-between overflow-hidden relative" ref={readerStageRef}>
              
              {/* Zoom Scale HUD Badge */}
              <div className="absolute top-4 left-6 z-10 font-mono text-[9px] text-zinc-500 bg-black/60 border border-editorial-border/60 px-3 py-1.5 rounded-lg">
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
                        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.4em] font-black">
                          {selectedBook.title}
                        </span>
                        <span className="font-mono text-[9px] text-red-500 font-bold tracking-widest uppercase">
                          PAGE {currentPageIdx + 1} // PUBLIC_ACCESS
                        </span>
                      </div>

                      <div className={`space-y-6 ${isOcrEnabled ? "select-text text-white/95" : "select-all"}`}>
                        <h3 className="text-3xl font-bold uppercase tracking-tight text-white leading-tight">
                          {currentPageData?.title}
                        </h3>
                        <p className="font-light leading-relaxed text-zinc-300 text-lg md:text-xl drop-shadow-sm border-l-2 border-red-650/15 pl-6 py-2 select-text">
                          {currentPageData?.content}
                        </p>
                      </div>

                      <div className="border-t border-editorial-border/20 pt-6 mt-10 flex justify-between items-center">
                        <span className="font-mono text-[8px] text-zinc-650 uppercase tracking-[0.3em]">
                          DOCTRINE_INDEX_{selectedBook.id.substring(0,6).toUpperCase()}
                        </span>
                        <div className="flex gap-2">
                          {isOcrEnabled && (
                            <button
                              onClick={copyOcrToClipboard}
                              className="px-3 py-1.5 bg-red-650/10 hover:bg-red-600 hover:text-white border border-red-500/20 rounded-lg font-mono text-[9px] text-red-400 transition-all uppercase tracking-widest flex items-center gap-1.5"
                            >
                              <Copy className="w-3 h-3" /> COPY_OCR_RAW
                            </button>
                          )}
                        </div>
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

                      <div className="mx-auto w-16 h-16 rounded-full bg-red-650/15 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
                        <Lock className="w-8 h-8" />
                      </div>

                      <div className="space-y-3">
                        <span className="font-mono text-[9px] text-red-500 tracking-[0.5em] font-black uppercase">
                          PREMIUM PROTOCOL REQUIRED
                        </span>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                          PREVIEW LIMIT REACHED
                        </h3>
                        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                          "{selectedBook.title}" // PAGE {currentPageIdx + 1} IS RESTRICTED
                        </p>
                      </div>

                      <div className="p-6 bg-black/40 border border-editorial-border rounded-2xl text-left space-y-4">
                        <span className="block font-mono text-[9px] text-red-500 uppercase tracking-widest font-black italic">
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
                          className="flex-1 px-6 py-4 bg-zinc-90 w bg-zinc-900 border border-editorial-border hover:border-zinc-700 rounded-xl font-mono text-[10px] uppercase font-black text-zinc-400 hover:text-white transition-all tracking-widest"
                        >
                          ← BACK_TO_PAGE_10
                        </button>
                        <button
                          onClick={handleTriggerSubscription}
                          className="flex-1 button-premium !py-4 text-[10px] font-mono uppercase tracking-widest"
                        >
                          SUBSCRIBE TO UNLOCK
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reader Bottom Navigation & Zoom Bar */}
              <footer className="px-6 py-4 border-t border-editorial-border/40 bg-zinc-950 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                  {/* Zoom Controls */}
                  <div className="flex items-center bg-[#07070a] border border-editorial-border rounded-xl p-1 gap-1">
                    <button
                      onClick={() => setZoomScale(prev => Math.max(0.8, prev - 0.2))}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomScale(1)}
                      className="px-2 font-mono text-[9px] text-zinc-500 hover:text-white transition-colors"
                      title="Reset Zoom"
                    >
                      100%
                    </button>
                    <button
                      onClick={() => setZoomScale(1.3)}
                      className="px-2 font-mono text-[9px] text-zinc-500 hover:text-white transition-colors border-l border-white/[0.04]"
                      title="Fit Width Zoom"
                    >
                      FIT_W
                    </button>
                    <button
                      onClick={() => setZoomScale(0.85)}
                      className="px-2 font-mono text-[9px] text-zinc-500 hover:text-white transition-colors border-l border-white/[0.04]"
                      title="Fit Height Zoom"
                    >
                      FIT_H
                    </button>
                    <button
                      onClick={() => {
                        setZoomScale(1);
                        setPanOffset({ x: 0, y: 0 });
                        addToast("Centered and aligned to viewport screen.", "info");
                      }}
                      className="px-2 font-mono text-[9px] text-zinc-500 hover:text-white transition-colors border-l border-white/[0.04]"
                      title="Fit Screen Zoom"
                    >
                      FIT_SCR
                    </button>
                    <button
                      onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.2))}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Safe Downloader (Only Allowed Pages!) */}
                  <button
                    onClick={triggerSafeExport}
                    className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-editorial-border rounded-xl text-zinc-400 hover:text-white transition-all flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest"
                    title="Export Allowed Pages to JSON"
                  >
                    <Download className="w-3.5 h-3.5" /> EXPORT_GUIDE
                  </button>

                  {/* Active Page Diagnostics Node */}
                  <span className="font-mono text-[8px] text-zinc-650 max-w-[200px] truncate uppercase tracking-widest hidden lg:block">
                    MDL_VER_STABLE_{currentPageIdx + 1}
                  </span>
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
                  
                  <span className="font-mono text-[10px] text-zinc-400 min-w-16 text-center">
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

            {/* Right Side Sliding Panel overlaying Knowledge Graph, or Sticky Notes */}
            <AnimatePresence>
              {(isKnowledgeGraphOpen || activeKnowledgeNodes.length > 0) && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 30, stiffness: 220 }}
                  className="border-l border-editorial-border/40 bg-zinc-950/95 flex flex-col shrink-0 min-h-0 relative select-text"
                >
                  <div className="p-6 border-b border-editorial-border/40 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
                      <span className="font-sans font-bold text-xs uppercase text-white tracking-widest">
                        Page Connections
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsKnowledgeGraphOpen(false);
                      }}
                      className="p-1 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content area */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    

                    {isKnowledgeGraphOpen && !isPageLocked && (
                      /* Semantic knowledge graph connections panel */
                      <div className="space-y-5">
                        <span className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest leading-none">
                          KNOWLEDGE CONNECTIVITY NODES
                        </span>
                        
                        <div className="space-y-3">
                          {activeKnowledgeNodes.map(node => (
                            <div 
                              key={node.id}
                              className={`p-3.5 rounded-xl border flex flex-col gap-1 transition-all ${
                                node.active 
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                  : "bg-black/40 border-editorial-border/40 text-zinc-500"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[9px] font-black tracking-widest">
                                  {node.label}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${node.active ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-zinc-800"}`} />
                              </div>
                              <span className="font-sans text-[10px] font-light">
                                {node.connection}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Annotation Sticky Notes Block */}
                    {!isPageLocked && (
                      <div className="border-t border-editorial-border/40 pt-6 space-y-4 select-text">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest leading-none">
                            PAGE_ANNOTATIONS ({activeAnnotationsList.length})
                          </span>
                          <button
                            onClick={() => setIsAddingNote(!isAddingNote)}
                            className="p-1 px-2.5 bg-red-650/10 hover:bg-red-600 hover:text-white border border-red-500/20 text-red-500 rounded-lg text-[9px] font-mono uppercase font-black tracking-widest transition-all"
                          >
                            + ADD_NOTE
                          </button>
                        </div>

                        {isAddingNote && (
                          <form onSubmit={handleAddAnnotation} className="space-y-3 bg-black/60 border border-editorial-border p-4 rounded-xl relative select-text">
                            <textarea
                              placeholder="COMPILE LOCAL NOTE..."
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              className="w-full bg-[#07070a] border border-editorial-border/60 rounded-xl p-3 font-mono text-[10px] text-white focus:border-red-500 outline-none uppercase placeholder:text-zinc-700 resize-none h-20"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setIsAddingNote(false)}
                                className="flex-1 py-2 bg-zinc-900 border border-editorial-border rounded-lg font-mono text-[9px] text-zinc-400 hover:text-white"
                              >
                                CANCEL
                              </button>
                              <button
                                type="submit"
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-mono text-[9px] tracking-widest font-black uppercase"
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
                              className="p-3.5 bg-[#0a0a0f] border border-editorial-border/80 rounded-xl flex flex-col gap-2 relative select-text group/note"
                            >
                              <div className="flex justify-between items-center select-none shrink-0">
                                <span className="font-mono text-[8px] text-zinc-500">TIMESTAMP: {note.date}</span>
                                <button
                                  onClick={() => handleDeleteAnnotation(note.id)}
                                  className="p-1 text-zinc-600 hover:text-red-500 opacity-0 group-hover/note:opacity-100 transition-all"
                                  title="Delete Note"
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
