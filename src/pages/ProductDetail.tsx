import { Atmosphere } from '../components/common/Atmosphere';
import { useParams, Link } from "react-router-dom";
import { ImageViewerPortal } from "../components/ImageViewer";
import { VideoViewerPortal } from "../components/VideoViewer";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll, useMotionTemplate } from "motion/react";
import { Maximize, ChevronLeft, ChevronRight, Plus, Minus, ArrowRight, Shield, Truck, RefreshCw, ZoomIn, Bot, X, Star, Facebook, Twitter, Zap, Activity, Target, Copy, ChevronUp, Database, ChevronDown, Layers, Sparkles, Cpu, LineChart, Play } from "lucide-react";
import React, { useState, useEffect, useRef, lazy, Suspense} from "react";
import { useToast } from "../components/common/Toast";
import { useCart } from "../context/CartContext";
import { allProducts } from "../data/products";
import LazyImage from "../components/LazyImage";
import CascadingOptionsViewer from "../components/CascadingOptionsViewer";
import Breadcrumb from "../components/Breadcrumb";
import { getHighResImageUrl } from "../lib/utils";
import { useUI } from "../context/UIContext";
import { useProtocol } from "../context/ProtocolContext";
import { useCompare } from "../context/CompareContext";
import MagneticWrapper from "../components/MagneticWrapper";
import ProductGallery, { GalleryItem } from "../components/ProductGallery";
/* ⚠️ three.js + @react-three/fiber + drei is roughly a megabyte, and it was a
   STATIC import — so every visitor to any product page downloaded a 3D engine
   whether or not they ever switched to the 3D view. Measured: the
   ProductDetail chunk was 1,032KB. Lazy now: the engine arrives only when the
   3D tab is actually chosen. */
/**
 * Reviews need a store before they can be collected: one written today would
 * live in a single browser tab and disappear on refresh. Flip this when there
 * is somewhere to keep them.
 */
const REVIEWS_ENABLED = false;

const Product3DViewer = lazy(() => import("../components/Product3DViewer"));
import NeuralTelemetryRadar from "../components/NeuralTelemetryRadar";

function RotationDisplay({ x, y, active }: { x: any, y: any, active: boolean }) {
  const rotationX = useTransform(x, (v: number) => Math.round(v));
  const rotationY = useTransform(y, (v: number) => Math.round(v));
  
  return (
    <div className="absolute top-6 left-6 z-30 pointer-events-none flex gap-2">
       <div className={`px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-[0.6875rem] font-mono text-white/80 uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 shadow-xl`}>
          X:<motion.span>{rotationX}</motion.span>° Y:<motion.span>{rotationY}</motion.span>°
       </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const product = allProducts.find(p => p.id === Number(id)) || allProducts[0];
  const { addToast } = useToast();
  const { addToCart, items: cartItems } = useCart();
  const { addToProtocol, protocolItems } = useProtocol();
  const { toggleProduct, selectedItems } = useCompare();
  const isCompared = selectedItems.some(p => p.id === product.id);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [videoOpen, setVideoOpen] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const [activeRadarAxis, setActiveRadarAxis] = useState<string | null>(null);
  
  const [isHoverZoomed, setIsHoverZoomed] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXTransform = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const rotateYTransform = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  
  // Create a subtle glare effect based on mouse position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
  const glareOpacity = useTransform(mouseX, [-0.5, 0, 0.5], [0.3, 0, 0.3]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(0,0,0,0.04) 0%, transparent 60%)`;

  const rotateX = useSpring(rotateXTransform, { stiffness: 300, damping: 40 });
  const rotateY = useSpring(rotateYTransform, { stiffness: 300, damping: 40 });

  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const smoothScale = useSpring(scale, { stiffness: 300, damping: 30 });
  const smoothX = useSpring(x, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(y, { stiffness: 300, damping: 30 });

  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 800], [0, -100]);

  const innerXVal = useTransform(mouseX, [-0.5, 0.5], [15, -15]);
  const innerYVal = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const innerScaleVal = useTransform(mouseX, [-0.5, 0, 0.5], [isHoverZoomed ? 1.05 : 1, 1, isHoverZoomed ? 1.05 : 1]);

  const innerX = useSpring(innerXVal, { stiffness: 60, damping: 20 });
  const innerY = useSpring(innerYVal, { stiffness: 60, damping: 20 });
  const innerScale = useSpring(innerScaleVal, { stiffness: 60, damping: 20 });

  const originX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const originY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
  
  const [showStickyAdd, setShowStickyAdd] = useState(false);

  // 3D Viewer State
  const [modelRotationX, setModelRotationX] = useState(0);
  const [modelRotationY, setModelRotationY] = useState(0);
  const [keyboardScale, setKeyboardScale] = useState(1);
  const [isViewerActive, setIsViewerActive] = useState(false);
  const smoothRotationX = useSpring(modelRotationX, { stiffness: 100, damping: 20 });
  const smoothRotationY = useSpring(modelRotationY, { stiffness: 100, damping: 20 });
  const smoothKeyboardScale = useSpring(keyboardScale, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isViewerActive) return;
      const increment = 15;
      const scaleInc = 0.1;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setModelRotationX(prev => prev + increment);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setModelRotationX(prev => prev - increment);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setModelRotationY(prev => prev - increment);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setModelRotationY(prev => prev + increment);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setKeyboardScale(prev => Math.min(prev + scaleInc, 4));
          break;
        case '-':
        case '_':
          e.preventDefault();
          setKeyboardScale(prev => Math.max(prev - scaleInc, 0.5));
          break;
        case '0':
          e.preventDefault();
          setModelRotationX(0);
          setModelRotationY(0);
          setKeyboardScale(1);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerActive]);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
       setShowStickyAdd(latest > 800);
    });
  }, [scrollY]);

  /**
   * ⚠️ THE TWO "CUSTOMER REVIEWS" HERE WERE INVENTED, AND SHOWN ON ALL 47
   * PRODUCTS.
   *
   * "Alex M. — 5 stars — Incredible product. Highly recommend." and
   * "Sarah K. — 4 stars — Works great but shipping took a while." were
   * hard-coded, so every item in the shop carried the same two testimonials
   * from people who do not exist — and the star rating displayed on the page
   * was the average OF THOSE INVENTIONS.
   *
   * That is not a style problem. In the UK, publishing fake consumer reviews
   * is banned outright by the Digital Markets, Competition and Consumers Act
   * 2024, and the exposure sits with the trader. Removed rather than reworded.
   *
   * The list starts empty and the page says so. Real reviews need somewhere to
   * live — see REVIEWS_ENABLED below.
   */
  const [reviews, setReviews] = useState<Array<{
    id: string; author: string; rating: number; date: string;
    content: string; reported: boolean; status: string;
  }>>([]);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, content: '' });
  const [isHoveringStar, setIsHoveringStar] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const visibleReviews = isAdmin ? reviews : reviews.filter(r => r.status === 'approved');
    /* ⚠️ THE FALLBACK WAS '5.0' — a perfect score displayed for a product with
     no reviews at all. An unrated product must read as unrated. */
  const averageRating = visibleReviews.length > 0
    ? (visibleReviews.reduce((acc, r) => acc + r.rating, 0) / visibleReviews.length).toFixed(1)
    : null;

  /**
   * ⚠️ A REVIEW POSTED HERE ONLY EVER EXISTED IN THIS BROWSER TAB.
   * It was pushed into local state, so it appeared, looked published, and
   * vanished on refresh — nobody else ever saw it and nothing was stored.
   * Gated like the checkout: honest while there is nowhere to keep them.
   */
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!REVIEWS_ENABLED) return;
    if (!newReview.author || !newReview.content) return;
    const review = {
      id: Date.now().toString(),
      author: newReview.author,
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
      content: newReview.content,
      reported: false,
      status: 'pending' // New reviews need approval
    };
    setReviews([review, ...reviews]);
    setNewReview({ author: '', rating: 5, content: '' });
  };

  const toggleReportStatus = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, reported: true } : r));
  };

  const updateReviewStatus = (id: string, newStatus: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus, reported: newStatus === 'approved' ? false : r.reported } : r));
  };
  
  const related = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  /* ⚠️ THE PLACEHOLDERS ARE GONE, AND THAT MATTERS MORE NOW THAN IT DID.
     This gallery shipped with two Unsplash stock photos and Google's demo
     clip "ForBiggerBlazes.mp4" sitting beside the real product shot — scaffold
     content nobody removed. It was easy to overlook while the viewer opened
     halfway down the page; now that a click fills the screen with whatever is
     in this list, a stranger's gym photo and a browser-vendor test video are
     presented as this product's own media, full size, to a customer deciding
     whether to buy.
     Only genuine RAW media belongs here. Add real photography and the entries
     come straight back — the gallery, the viewer and the thumbnails all read
     this array. */
  const galleryItems: GalleryItem[] = [
    {type: 'image', url: getHighResImageUrl(product.image)},
    {type: '3d', url: "interactive-model"},
  ];

  const cascadingOptions = allProducts.slice(0, 6).map(p => ({
    id: p.id,
    image: p.image,
    title: p.name,
    description: p.shortBenefit || 'Premium formulation'
  }));
  const [selectedOptionId, setSelectedOptionId] = useState<number | string>(product.id);

  const productDetails = [
    { title: "Product Overview", content: product.overview || "Precision Engineered for elite performance environments." },
    { title: "Key Features", content: product.keyBenefits?.length ? `• ${product.keyBenefits.join("\n• ")}` : "• Industry leading purity." },
    { title: "Performance Purpose", content: product.whatItDoes || "Supports your body's natural output mechanisms." },
    { title: "Who It’s For", content: product.whoItsFor?.length ? `• ${product.whoItsFor.join("\n• ")}` : "• Athletes\n• Fighters\n• High performers" },
    { title: "Suggested Use", content: product.suggestedUse || "Follow the product label." },
    { title: "Protocol Pairings", content: product.protocolPairings?.length ? `• ${product.protocolPairings.join("\n• ")}` : "• RAW Protein\n• RAW Creatine" },
    { title: "Quality Notes", content: typeof product.qualityNotes === 'string' ? product.qualityNotes : product.qualityNotes?.length ? `• ${product.qualityNotes.join("\n• ")}` : "• Verified sourcing." }
  ];

  if (product.responsibleUse) {
    productDetails.push({ title: "Responsible Use", content: product.responsibleUse });
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /* The legacy zoom effect lived here: a second global wheel+key handler bound
     whenever isZoomed was true. It preventDefault'd every wheel event and drove
     its own scale/x/y motion values, so it fought the new viewer for the same
     gestures. The viewer owns zooming now — one handler, on its own stage
     rather than the window. */

  const getStockStatus = (status: string | undefined) => {
    switch (status) {
      case 'AVAILABLE': return { label: 'AVAILABLE', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> };
      case 'LOW_STOCK': return { label: 'LOW_STOCK', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> };
      case 'COMING_SOON': return { label: 'COMING_SOON', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: <div className="w-2 h-2 rounded-full bg-blue-500" /> };
      case 'OUT_OF_STOCK': return { label: 'OUT_OF_STOCK', color: 'text-editorial-text-muted bg-zinc-500/10 border-zinc-500/20', icon: <div className="w-2 h-2 rounded-full bg-zinc-500" /> };
      case 'PREORDER_READY': return { label: 'PREORDER_READY', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> };
      default: return { label: 'AVAILABLE', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> };
    }
  };

  const currentStatus = getStockStatus(product.stockStatus);

  return (
    <div className="pt-40 pb-32 px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] max-w-[var(--content-max-width)] mx-auto min-h-svh relative selection:bg-red-600 selection:text-white" aria-label="Product Detail Page">
      {/* Background HUD Matrix */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(220,38,38,0.08),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.1]" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
        <Breadcrumb items={[
          { label: "Home", path: "/" },
          { label: "Archive", path: "/shop" },
          { label: product.category, path: `/shop/${product.category.toLowerCase()}` },
          { label: product.name }
        ]} />
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-[0.4em] font-black mb-1">REGISTRY_STATUS</span>
              <div className={`flex items-center gap-3 px-5 py-2 rounded-full border ${currentStatus.color} backdrop-blur-3xl shadow-depth-1`}>
                {currentStatus.icon}
                <span className="font-mono text-[0.6875rem] uppercase font-black tracking-[0.3em]">{currentStatus.label}</span>
              </div>
           </div>
        </div>
      </div>


      {/* ⚠️ min-w-0 ON BOTH COLUMNS. On a phone this grid is one auto-sized track, and an
          auto track takes each item's content minimum — the thumbnail strip and one label row
          each held it at 404px on a 375px screen, centred and clipped. With min-w-0 the track
          is the container and the rows inside wrap or shrink as they were designed to. */}
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 xl:gap-32 items-start mt-12">
        {/* Product Images */}
        <div className="min-w-0 space-y-8">
            <motion.div
             className="aspect-square bg-editorial-bg border border-editorial-border overflow-hidden relative rounded-[4rem] shadow-premium"
             whileHover={{ scale: 1.02 }}
             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
             drag
             dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
             onDrag={(_, info) => {
               const { x: dx, y: dy } = info.offset;
               mouseX.set(-dx / 100);
               mouseY.set(dy / 100);
             }}
             onDragEnd={() => {
               mouseX.set(0);
               mouseY.set(0);
             }}
             style={{ 
               rotateX: rotateX,
               rotateY: rotateY,
               transformStyle: "preserve-3d", 
               perspective: 1000 
             }}
             role="img"
             aria-label="Product Image - Drag to rotate"
           >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.1),transparent_70%)] pointer-events-none opacity-50 transition-opacity duration-500 group-hover:opacity-80" />
            
            {/* Rotation Status */}
            <RotationDisplay x={smoothRotationX} y={smoothRotationY} active={isViewerActive} />

            {/* Glare effect */}
            <motion.div 
               className="absolute inset-0 pointer-events-none z-50 mix-blend-screen"
               style={{
                  background: glareBackground,
                  opacity: glareOpacity
               }}
            />
            
            {/* Scroll Parallax Layer */}
            <motion.div style={{ y: yParallax }} className="w-full h-full">

            {/* Inner Parallax Layer */}
            <motion.div 
              style={{ 
                x: innerX,
                y: innerY,
                scale: innerScale,
                transformStyle: "preserve-3d"
              }}
              className="w-full h-full"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(30px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(30px)' }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full h-full relative z-10 ${isHoverZoomed ? 'cursor-none' : 'cursor-zoom-in'}`}
                  style={{ transformStyle: "preserve-3d", transform: "translateZ(50px)" }}
                  onClick={() => {
                    if (galleryItems[activeImage].type === 'image') {
                      scale.set(1);
                      x.set(0);
                      y.set(0);
                      setIsZoomed(true);
                      setIsHoverZoomed(false);
                      setIsViewerActive(false);
                    }
                  }}
                  onMouseEnter={() => { 
                    if (galleryItems[activeImage].type === 'image') {
                       setIsHoverZoomed(true); 
                    }
                    setIsViewerActive(true); 
                  }}
                  onMouseLeave={() => { setIsHoverZoomed(false); setIsViewerActive(false); }}
                >
                    {galleryItems[activeImage].type === 'image' ? (
                      <motion.div
                        className="w-full h-full relative"
                        animate={{ scale: isHoverZoomed ? 2.5 : 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                           originX,
                           originY,
                        }}
                      >
                         <div className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-500 flex flex-col items-center justify-center ${isViewerActive ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-12 border-2 border-editorial-text/20 rounded-full flex items-center justify-center bg-editorial-bg/20 backdrop-blur-sm mb-4">
                               <Plus className="w-6 h-6 text-editorial-text" />
                            </div>
                             {/* Keyboard hints — "Arrows to Rotate", "+/- to Zoom" — mean nothing on a phone,
                                and as an unwrappable row this pill was 402px wide on a 375px screen. Shown
                                from md up, where a keyboard is plausible; allowed to wrap even there. */}
                            <div className="hidden md:flex flex-wrap justify-center gap-2 text-[0.6875rem] font-mono text-zinc-400 bg-editorial-bg/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest shadow-lg">
                              <span><kbd className="text-white">Arrows</kbd> to Rotate</span>
                              <span className="opacity-50">/</span>
                              <span><kbd className="text-white">+/-</kbd> to Zoom</span>
                              <span className="opacity-50">/</span>
                              <span><kbd className="text-white">0</kbd> to Reset</span>
                            </div>
                         </div>
                         <motion.div style={{
                           rotateX: smoothRotationX,
                           rotateY: smoothRotationY,
                           scale: smoothKeyboardScale,
                           transformStyle: "preserve-3d",
                           width: "100%",
                           height: "100%",
                         }}>
                            <LazyImage 
                              src={galleryItems[activeImage].url} 
                              alt={product.name}
                              className="w-full h-full object-contain mix-blend-screen filter drop-shadow-[0_0_80px_rgba(0,0,0,0.05)]" 
                              containerClassName="w-full h-full bg-transparent flex items-center justify-center p-8 lg:p-12 absolute inset-0"
                            />
                         </motion.div>
                      </motion.div>
                    ) : galleryItems[activeImage].type === 'video' ? (
                      <div className="w-full h-full relative group/vid">
                        <video src={galleryItems[activeImage].url} controls autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        {/* The inline player is a preview; this opens the real
                            viewer, with the size choices. */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setVideoOpen(galleryItems[activeImage].url); }}
                          aria-label="Open video full screen"
                          className="absolute bottom-8 right-8 z-30 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-black/70 text-white backdrop-blur-md transition-colors hover:border-red-500"
                        >
                          <Maximize className="w-5 h-5" />
                        </button>
                        <div className="absolute inset-0 bg-editorial-bg/40 group-hover/vid:bg-editorial-bg/20 transition-colors pointer-events-none" />
                        <div className="absolute top-8 left-8 z-20">
                           <div className="flex items-center gap-4 bg-red-600 px-6 py-3 rounded-full border border-red-500/50 shadow-premium">
                              <Play className="w-4 h-4 text-white fill-white" />
                              <span className="font-mono text-[0.6875rem] text-white uppercase tracking-[0.3em] font-black">PRODUCT_DEMONSTRATION</span>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                         <div className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-500 flex flex-col items-center justify-center ${!isViewerActive ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="flex gap-2 text-[0.6875rem] font-mono text-white bg-red-600 px-6 py-3 rounded-full border border-red-500/50 uppercase tracking-[0.2em] font-black shadow-premium animate-pulse">
                               <span>3D_INTERACTIVE_MODEL_ACTIVE</span>
                            </div>
                         </div>
                         <Suspense fallback={
                           <div className="flex h-full w-full items-center justify-center">
                             <span className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-editorial-text-muted">
                               Loading 3D view…
                             </span>
                           </div>
                         }>
                           <Product3DViewer />
                         </Suspense>
                      </div>
                    )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
            </motion.div>
           {galleryItems[activeImage].type === 'image' && (
             <button 
               onClick={() => {
                   scale.set(1);
                   x.set(0);
                   y.set(0);
                   setIsZoomed(true);
               }}
               aria-label="Zoom image"
               className="absolute bottom-8 right-8 bg-editorial-bg/90 p-5 backdrop-blur-md rounded-[1.5rem] border border-editorial-border-light filter backdrop-saturate-[1.5] group/zoom transition-all duration-[600ms] hover:scale-110 hover:border-red-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.08)] z-20"
             >
               <ZoomIn className="w-6 h-6 text-editorial-text-muted group-hover/zoom:text-editorial-text transition-colors duration-[600ms] drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" />
               <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover/zoom:opacity-100 rounded-[1.5rem] transition-opacity duration-[600ms]" />
               <div className="absolute inset-[-1px] rounded-[1.5rem] border border-editorial-border-light opacity-0 group-hover/zoom:opacity-100 group-hover:block transition-all duration-700 pointer-events-none group-hover/zoom:animate-ping" />
             </button>
           )}
          </motion.div>
          
          <ProductGallery 
            galleryItems={galleryItems} 
            activeItem={activeImage} 
            setActiveItem={setActiveImage} 
          />
        </div>

      {/* ⚠️ THE VIEWER MUST LIVE OUTSIDE THIS SUBTREE.
          What was here was `fixed inset-0` and still opened halfway down the
          page. `fixed` was not at fault — the page-transition wrapper animates
          filter+transform, and any such ancestor becomes the containing block
          for fixed positioning inside it. Measured here: the overlay was
          14,702px tall (the document) instead of 1,274px (the viewport). The
          portal renders outside that subtree, so it lands on the screen. */}
      <VideoViewerPortal
        open={videoOpen !== null}
        src={videoOpen || ""}
        title={product.name}
        onClose={() => setVideoOpen(null)}
      />

      <ImageViewerPortal
        open={isZoomed}
        images={galleryItems.filter(g => g.type === 'image').map(g => g.url)}
        index={Math.max(0, galleryItems.filter(g => g.type === 'image').findIndex(g => g.url === galleryItems[activeImage]?.url))}
        onIndexChange={(i) => {
          const imgs = galleryItems.filter(g => g.type === 'image');
          const target = galleryItems.findIndex(g => g.url === imgs[i]?.url);
          if (target >= 0) setActiveImage(target);
        }}
        onClose={() => setIsZoomed(false)}
        title={product.name}
      />


        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="min-w-0 lg:sticky lg:top-32"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-meta-premium !text-red-500 mb-8 block drop-shadow-[0_0_10px_rgba(220,38,38,0.4)] flex items-center gap-4"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#dc2626] animate-pulse" /> RAW PERFORMANCE // {product.category}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)", x: -50 }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }}
            transition={{ delay: 0.6, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans font-black uppercase tracking-[-0.08em] leading-[0.75] mb-16 drop-shadow-[0_40px_120px_rgba(0,0,0,1)] relative text-premium text-display-2xl"
          >
            <span className="block italic text-red-600/30 tracking-tight mb-12 drop-shadow-none text-meta-premium !lowercase !tracking-normal text-[clamp(1.125rem,5vw,6rem)]">
              <span className="opacity-40">[</span> TARGET_ASSET_IDENT <span className="opacity-40">]</span>
            </span>
            {product.name}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-10 mb-20"
          >
             <div className="flex flex-col">
                <span className="text-meta-premium opacity-40 mb-2">PROCUREMENT_VAL</span>
                <div className="font-sans font-black drop-shadow-[0_0_30px_rgba(0,0,0,0.04)] flex items-start text-premium text-display-lg">
                  <span className="text-4xl text-red-600 mr-4 drop-shadow-[0_0_15px_#dc2626] mt-6 font-mono">£</span>{product.price.replace('£', '')}
                </div>
             </div>
             <div className="h-[120px] w-[1px] bg-editorial-text/10 hidden xl:block" />
             <div className="hidden xl:flex flex-col justify-center">
                <span className="text-meta-premium opacity-40 mb-2">SYNERGY_INDEX</span>
                <div className="flex items-center gap-3">
                   <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-8 bg-red-600/40 rounded-sm" />)}
                   </div>
                   <span className="text-meta-premium text-2xl">99%</span>
                </div>
             </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 p-10 bg-editorial-surface/40 backdrop-blur-3xl rounded-[3rem] border border-editorial-border relative overflow-hidden group shadow-depth-2 hover:border-red-600/20 transition-colors duration-1000"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full group-hover:bg-red-600/10 transition-colors duration-1000" />
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="font-mono text-red-500 text-[0.6875rem] uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black flex items-center gap-4">
                     <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_currentColor]" />
                     MISSION_OBJECTIVE_DIAGNOSTIC
                  </h2>
                  <div className="h-[1px] flex-1 mx-8 bg-gradient-to-r from-red-600/40 to-transparent" />
                  <span className="font-mono text-[0.6875rem] text-zinc-700 uppercase tracking-widest font-black opacity-40">INTEL_CORE_V3</span>
               </div>
               <div className="text-white font-medium text-2xl md:text-4xl leading-[1.3] space-y-12">
                   <p className="tracking-tight drop-shadow-sm font-sans font-bold">{product.overview || `The ${product.name} is a high-flux ${product.category} deployment, engineered for tactical efficiency.`}</p>
                   {product.whatItDoes && (
                       <div className="bg-red-600/15 border-l-8 border-red-600 p-12 lg:p-16 rounded-r-[3rem] italic text-white font-serif text-4xl md:text-6xl tracking-tighter leading-[0.95] relative group/quote">
                           <div className="absolute -top-6 -left-4 w-12 h-12 bg-red-600 flex items-center justify-center rounded-xl shadow-[0_0_20px_#dc2626]">
                              <Target className="w-6 h-6 text-white" />
                           </div>
                           <Sparkles className="absolute -top-6 -right-6 w-16 h-16 text-red-500/20 group-hover/quote:animate-spin transition-all duration-1000" />
                           "{product.whatItDoes}"
                           <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-8">
                              <div className="h-1 lg:w-20 bg-red-600" />
                              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] sm:tracking-[0.6em] [overflow-wrap:anywhere] text-red-500 font-black">CORE_MANTRA_01</span>
                           </div>
                       </div>
                   )}
               </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-editorial-text-muted font-light leading-relaxed mb-12 text-xl md:text-2xl max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          >
            Engineered for those who demand more from their bodies. Our elite-grade formula provides industry-leading bioavailability and purity. Tested in the arena. Proven in the grind.
          </motion.div>


          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="flex flex-col gap-8 mb-16"
          >
            <div className="flex flex-col xl:flex-row items-center gap-10">
              <div className="flex items-center border border-editorial-border bg-editorial-bg/80 backdrop-blur-3xl px-8 py-4 w-full xl:w-auto justify-between rounded-[2.5rem] shadow-premium h-[100px] hover:border-editorial-border-light transition-all duration-700">
                <button aria-label="Decrease quantity" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-5 text-editorial-text-muted hover:text-red-500 hover:bg-editorial-bg rounded-2xl transition-all duration-500 group/btn"><Minus className="w-6 h-6 drop-shadow-[0_0_8px_currentColor]" /></button>
                <div className="flex flex-col items-center">
                   <span className="text-meta-premium opacity-40 mb-1">UNITS</span>
                   <span className="w-24 text-center font-sans font-black text-4xl tracking-tighter text-editorial-text">{quantity}</span>
                </div>
                <button aria-label="Increase quantity" onClick={() => setQuantity(q => q + 1)} className="p-5 text-editorial-text-muted hover:text-emerald-500 hover:bg-editorial-bg rounded-2xl transition-all duration-500 group/btn"><Plus className="w-6 h-6 drop-shadow-[0_0_8px_currentColor]" /></button>
              </div>
              
              <MagneticWrapper>
                {product.stockStatus === 'OUT_OF_STOCK' ? (
                  <button className="w-full xl:w-auto xl:flex-1 h-[100px] bg-zinc-800 border-b-[6px] border-editorial-border border border-editorial-border text-editorial-text-muted font-black uppercase tracking-[0.4em] text-[0.875rem] rounded-[2.5rem] px-14 flex items-center justify-center cursor-not-allowed shadow-depth-2">
                    OUT_OF_STOCK // OFFLINE
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                       addToCart(product, quantity);
                       addToProtocol(product);
                    }}
                    className="w-full xl:w-auto xl:flex-1 h-[100px] bg-red-600 border-b-[6px] border-red-900 hover:border-white text-white font-black uppercase tracking-[0.4em] text-[0.875rem] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-[800ms] ease-[0.16,1,0.3,1] outline-none relative overflow-hidden group rounded-[2.5rem] shadow-[0_40px_100px_rgba(220,38,38,0.4)] hover:shadow-glow-intense whitespace-nowrap px-14 flex items-center justify-center transform-gpu active:border-b-0 active:translate-y-[6px]"
                  >
                    <span className="relative z-10 transition-colors drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] group-hover:drop-shadow-none flex items-center gap-6">
                       PROCURE_PROTOCOL <ArrowRight className="w-6 h-6 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-[800ms]" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-editorial-text/20 group-hover:bg-editorial-bg/10" />
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  </button>
                )}
              </MagneticWrapper>
            </div>

              
            <div className="flex flex-wrap gap-6">
              <MagneticWrapper>
                <button 
                  onClick={() => toggleProduct(product)}
                  className={`px-10 h-[80px] border transition-all duration-700 text-meta-premium flex items-center justify-center gap-6 rounded-[2rem] shadow-premium ${isCompared ? 'border-red-600 bg-red-600/10 !text-red-500' : 'border-editorial-border-light bg-editorial-bg/40 text-white-muted hover:text-editorial-text'}`}
                >
                  <Layers className={`w-5 h-5 ${isCompared ? 'animate-pulse text-red-500' : ''}`} />
                  {isCompared ? 'PROTOCOL_COMPARISON_ACTIVE' : 'COMPARE_ASSET'}
                </button>
              </MagneticWrapper>
            </div>
            <button className="w-full border border-editorial-border-light bg-editorial-bg/50 backdrop-blur-md py-8 text-meta-premium hover:bg-editorial-text hover:!text-editorial-bg hover:border-white transition-all duration-[800ms] flex items-center justify-center gap-5 rounded-[2rem] group shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.06)] transform-gpu hover:-translate-y-1">
              Elite Subscription <ArrowRight className="w-5 h-5 group-hover:translate-x-4 transition-transform duration-[800ms] drop-shadow-[0_0_8px_currentColor]" />
            </button>
            
            <div className="pt-10 border-t border-editorial-border-light flex flex-col md:flex-row md:items-center justify-between gap-6">
              <span className="font-mono text-[0.6875rem] text-editorial-text-muted uppercase tracking-[0.4em] font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">Transmit Signal:</span>
              <div className="flex items-center gap-4">
                <button onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  addToast('Link copied to clipboard');
                }} className="p-4 bg-editorial-bg border border-editorial-border hover:text-editorial-text hover:border-red-500 hover:bg-editorial-bg hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition-all duration-[800ms] text-editorial-text-muted rounded-2xl group outline-none" aria-label="Copy Link">
                  <Zap className="w-5 h-5 group-hover:scale-110 transition-transform duration-[800ms]" />
                </button>
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this elite protocol: ' + product.name)}`)} className="p-4 bg-editorial-bg border border-editorial-border hover:text-editorial-text hover:border-red-500 hover:bg-editorial-bg hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition-all duration-[800ms] text-editorial-text-muted rounded-2xl group outline-none" aria-label="Share on Twitter">
                  <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-[800ms]" />
                </button>
                <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)} className="p-4 bg-editorial-bg border border-editorial-border hover:text-editorial-text hover:border-red-500 hover:bg-editorial-bg hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition-all duration-[800ms] text-editorial-text-muted rounded-2xl group outline-none" aria-label="Share on Facebook">
                  <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform duration-[800ms]" />
                </button>
                <button onClick={() => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(window.location.origin + product.image)}&description=${encodeURIComponent(product.name)}`)} className="p-4 bg-editorial-bg border border-editorial-border hover:text-editorial-text hover:border-red-500 hover:bg-editorial-bg hover:shadow-[0_10px_20px_rgba(220,38,38,0.3)] transition-all duration-[800ms] text-editorial-text-muted rounded-2xl group outline-none" aria-label="Share on Pinterest">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-[800ms] fill-current" viewBox="0 0 24 24">
                     <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.688 0 1.029-.653 2.568-.985 3.992-.277 1.197.601 2.172 1.77 2.172 2.122 0 3.753-2.239 3.753-5.471 0-2.861-2.056-4.86-4.991-4.86-3.398 0-5.393 2.549-5.393 5.184 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.279 1.14c-.038.154-.127.189-.286.115-1.068-.498-1.736-2.056-1.736-3.324 0-2.703 1.963-5.18 5.666-5.18 2.973 0 5.289 2.115 5.289 4.939 0 2.956-1.863 5.334-4.453 5.334-1.07 0-2.073-.556-2.417-1.213l-.659 2.507c-.238.913-.883 2.053-1.316 2.753C9.824 23.649 10.89 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6 pt-12 border-t border-editorial-border-light">
            <div className="flex items-center gap-6 text-[0.75rem] font-bold uppercase tracking-[0.25em] sm:tracking-[0.4em] [overflow-wrap:anywhere] text-editorial-text-muted group">
              <Shield className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_10px_#10b981] group-hover:scale-110 transition-transform duration-[800ms]" /> <span className="group-hover:text-editorial-text transition-colors duration-[800ms]">Gold Standard Tested</span>
            </div>
            <div className="flex items-center gap-6 text-[0.75rem] font-bold uppercase tracking-[0.25em] sm:tracking-[0.4em] [overflow-wrap:anywhere] text-editorial-text-muted group">
              <Truck className="w-6 h-6 text-blue-500 drop-shadow-[0_0_10px_#3b82f6] group-hover:scale-110 transition-transform duration-[800ms]" /> <span className="group-hover:text-editorial-text transition-colors duration-[800ms]">Priority Elite Shipping</span>
            </div>
            <div className="flex items-center gap-6 text-[0.75rem] font-bold uppercase tracking-[0.25em] sm:tracking-[0.4em] [overflow-wrap:anywhere] text-editorial-text-muted group">
              <RefreshCw className="w-6 h-6 text-purple-500 drop-shadow-[0_0_10px_#a855f7] group-hover:scale-110 transition-transform duration-[800ms]" /> <span className="group-hover:text-editorial-text transition-colors duration-[800ms]">Conscious Recovery Guarantee</span>
            </div>
          </div>

          {/* Responsible Use Notice */}
          <div className="mt-12 bg-editorial-surface/50 border border-editorial-border p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <h5 className="font-mono text-[0.6875rem] font-bold text-editorial-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" /> Responsible Use Notice
            </h5>
            <p className="text-[0.6875rem] leading-relaxed text-editorial-text-muted font-light mix-blend-screen">
              RAW Official products are designed to support active lifestyles and performance routines. Supplements should be used as directed on the label and are not intended to diagnose, treat, cure, or prevent disease. Always consult a qualified professional if you are pregnant, taking medication, under 18, or managing a health condition.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/knowledge-core" className="button-secondary">
                <Database className="w-4 h-4" /> Core Data
              </Link>
              <Link to="/compare" className="button-secondary">
                <Activity className="w-4 h-4" /> Compare
              </Link>
              <Link to="/academy" className="button-secondary">
                <Target className="w-4 h-4" /> Academy
              </Link>
              <Link to="/protocol-builder" className="button-secondary">
                <Plus className="w-4 h-4" /> Protocol Builder
              </Link>
          </div>
        </motion.div>
      </div>

      {/* Cascading Options */}
      <section className="mt-24 border-y border-editorial-border pt-24 pb-24 max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)]">
        <div className="mb-12 text-center">
             <h3 className="font-sans font-black text-4xl uppercase tracking-tighter text-editorial-text">Product Versions</h3>
             <p className="text-editorial-text-muted font-mono text-xs uppercase mt-4 tracking-widest">Select your desired version</p>
        </div>
        <CascadingOptionsViewer options={cascadingOptions} selectedId={selectedOptionId} onSelect={(option) => setSelectedOptionId(option.id)} />
      </section>


      {/* Cinematic Performance Visualization */}
      <section className="mt-32 xl:mt-48 max-w-[var(--content-max-width)] mx-auto relative group/cinematic">
          <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-red-600/5 opacity-0 group-hover/cinematic:opacity-100 transition-opacity duration-1000" />
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 xl:gap-32 items-center">
              <div className="space-y-12 relative z-10">
                  <div className="flex items-center gap-5">
                      <span className="w-12 h-[2px] bg-red-600 shadow-[0_0_10px_#dc2626]" />
                      <span className="font-mono text-[0.6875rem] text-zinc-500 uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black">Performance_Architecture</span>
                  </div>
                  <h2 className="font-black uppercase tracking-tighter text-white leading-[0.8] transition-all duration-1000 group-hover/cinematic:drop-shadow-[0_0_30px_rgba(239,68,68,0.2)] text-display-md">
                    Validated <br /> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-900 italic">Integrity</span>
                  </h2>
                  <p className="text-xl xl:text-3xl text-editorial-text-muted font-light leading-relaxed max-w-2xl border-l-[4px] border-red-600/50 pl-10 py-4 shadow-[inset_20px_0_40px_rgba(220,38,38,0.05)]">
                    Every formulation undergoes a multi-phase validation cycle. We test for bio-availability, molecular stability, and operational impact in high-stress athletic environments.
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3 bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-red-500/20 transition-all">
                          <span className="block text-[0.6875rem] font-mono text-zinc-500 uppercase tracking-widest font-black">Batch_ID</span>
                          <span className="block text-2xl font-black text-white italic">#RAW_ALPHA_74</span>
                      </div>
                      <div className="space-y-3 bg-white/5 p-8 rounded-3xl border border-white/5 hover:border-red-500/20 transition-all">
                          <span className="block text-[0.6875rem] font-mono text-zinc-500 uppercase tracking-widest font-black">Sector_Rank</span>
                          <span className="block text-2xl font-black text-red-500 italic">ELITE_01</span>
                      </div>
                  </div>
              </div>
              <div className="relative aspect-square w-full max-w-[600px] lg:max-w-none group/vis">
                  <div className="absolute inset-0 bg-editorial-surface/40 backdrop-blur-3xl border border-editorial-border rounded-[4rem] group-hover/vis:border-red-500/30 transition-all duration-[1500ms] shadow-depth-3 relative overflow-hidden flex items-center justify-center">
                     <div className="absolute inset-x-0 h-1 bg-red-600/20 top-0 group-hover/vis:top-full transition-all duration-[4000ms] ease-linear" />
                     <Atmosphere glowOpacity={0.05} gridMode="dots" intensity="high" />
                     <div className="flex flex-col items-center gap-12 relative z-10">
                        <motion.div 
                          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                          className="w-48 h-48 xl:w-64 xl:h-64 border-2 border-red-600/40 rounded-[3.5rem] flex items-center justify-center bg-black/40 shadow-[0_0_80px_rgba(239,68,68,0.2),inset_0_0_40px_rgba(239,68,68,0.1)] relative group-hover/vis:scale-110 transition-transform duration-[1500ms]"
                        >
                            <Activity className="w-24 h-24 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-editorial-bg border border-red-600/40 rounded-2xl flex items-center justify-center font-mono text-xs font-black text-red-500 shadow-xl">V.04</div>
                        </motion.div>
                        <div className="flex flex-col items-center text-center gap-2">
                            <span className="font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black">Live_Telemetry_Signal</span>
                            <div className="flex gap-2">
                                {[1,2,3,4,5,6,7].map(i => (
                                    <motion.div 
                                      key={i}
                                      animate={{ height: ["4px", `${15 + Math.random() * 30}px`, "4px"] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                      className="w-1 bg-red-600 rounded-full" 
                                    />
                                ))}
                            </div>
                        </div>
                     </div>
                  </div>
              </div>
          </div>
      </section>

      {/* NEW: Detailed Information Tabs */}
      <section className="mt-24 border-y border-editorial-border pt-24 pb-24 max-w-[1000px] mx-auto relative bg-editorial-bg px-6">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />
        <div className="mb-12 text-center">
             <h3 className="font-sans font-black text-4xl uppercase tracking-tighter text-editorial-text">Product Intelligence</h3>
             <p className="text-editorial-text-muted font-mono text-xs uppercase mt-4 tracking-widest">Select metric for detailed breakdown</p>
        </div>
        
        <div className="w-full flex flex-col gap-4">
           {productDetails.map((detail, idx) => {
             const isActive = activeAccordion === idx;
             return (
               <div key={idx} className="border border-editorial-border-light rounded-[2rem] bg-editorial-bg/50 backdrop-blur-sm overflow-hidden hover:border-red-500/30 transition-colors duration-500">
                  <button
                    onClick={() => setActiveAccordion(isActive ? null : idx)}
                    className="w-full flex justify-between items-center p-8 text-left group"
                  >
                     <span className={`font-sans font-black text-xl uppercase tracking-tight flex items-center gap-4 ${isActive ? 'text-red-500' : 'text-editorial-text'}`}>
                       <div className={`w-1.5 h-6 rounded-full ${isActive ? 'bg-red-500' : 'bg-zinc-700'}`} />
                       {detail.title}
                     </span>
                     <ChevronDown className={`w-5 h-5 text-editorial-text-muted transition-transform duration-500 ${isActive ? 'rotate-180 text-red-500' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isActive && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                         className="min-h-0 relative z-10"
                       >
                         <div className="px-8 pb-8 pt-0 text-editorial-text-muted font-light text-base md:text-lg leading-relaxed mix-blend-screen whitespace-pre-line border-t border-editorial-border">
                           {detail.content}
                         </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             );
           })}
        </div>
      </section>



      {/* Technical Lab Readout Section */}
      <section className="mt-48 pt-24 border-t border-red-900/40 relative overflow-hidden bg-editorial-bg">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_30px_#dc2626]" />
        <div className="absolute inset-0 bg-[#dc2626]/5 pointer-events-none opacity-50 mix-blend-screen" />
        <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none text-red-500">
           <span className="font-sans font-black text-[clamp(3rem,15vw,30rem)] leading-[0.8] uppercase">ANALYSIS</span>
        </div>
        
        <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative z-10 flex flex-col lg:grid lg:grid-cols-12 gap-20 lg:gap-32 pb-32">
           <div className="lg:col-span-4">
              <div className="flex items-center gap-5 mb-14 bg-editorial-bg border border-red-500/30 px-6 py-4 w-fit rounded-[1.5rem] shadow-[0_10px_20px_rgba(220,38,38,0.1)]">
                 <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shadow-[0_0_10px_#dc2626]" />
                 <span className="font-mono text-[0.75rem] text-red-500 font-bold tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] uppercase drop-shadow-[0_0_5px_currentColor]">BIO_BLUEPRINT_ACCESS // GRANTED</span>
              </div>
              <h2 className="font-sans font-black uppercase tracking-[-0.05em] leading-[0.95] mb-12 text-editorial-text drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-display-md">SPECIFICATION <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">PROTOCOL</span></h2>
              <p className="text-editorial-text font-light text-xl md:text-2xl leading-relaxed max-w-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] mb-16">
                 Each unit is batch-tested for molecular integrity and bioavailability. Our laboratory environments maintain a Grade-5 sterile environment ensuring the highest concentration of active compounds.
              </p>
              
              <div className="hidden lg:block bg-editorial-surface/20 rounded-[3rem] p-10 border border-editorial-border backdrop-blur-3xl group/radar relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent opacity-0 group-hover/radar:opacity-100 transition-opacity duration-1000" />
                <div className="flex items-center gap-4 mb-10 text-[0.6875rem] font-mono tracking-[0.4em] uppercase text-editorial-text-muted">
                    <Target className="w-4 h-4 text-red-500 animate-pulse" />
                    Neural_Telemetry_Radar
                </div>
                <NeuralTelemetryRadar 
                  size={320}
                  activeAxis={activeRadarAxis}
                  metrics={[
                    { axis: "Molecular Stability", value: 92 },
                    { axis: "Absorption Rate", value: 88 },
                    { axis: "Unit Density", value: 75 },
                    { axis: "Filter Level", value: 95 },
                    { axis: "Relational Index", value: 85 },
                    { axis: "Bio-Availability", value: 98 }
                  ]} 
                />
              </div>
           </div>
           
           <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-editorial-bg border border-editorial-border rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.15)] relative z-10 backdrop-blur-3xl h-fit">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 to-transparent pointer-events-none mix-blend-screen opacity-50" />
              {[
                { label: "Molecular Stability", value: "99.98%", stat: "OPTIMIZED", color: "text-emerald-500" },
                { label: "Absorption Rate", value: "Bio-V8", stat: "HIGH", color: "text-blue-500" },
                { label: "Unit Density", value: "Grade A", stat: "MAX", color: "text-purple-500" },
                { label: "Filter Level", value: "0.02μ", stat: "STERILE", color: "text-amber-500" },
                { label: "Batch Code", value: "RAW_ALPHA_04", stat: "VERIFIED", color: "text-red-500" },
                { label: "Relational Index", value: "4.9/5", stat: "ELITE", color: "text-cyan-500" }
              ].map((spec, i) => (
                <div 
                  key={i} 
                  onMouseEnter={() => setActiveRadarAxis(spec.label)}
                  onMouseLeave={() => setActiveRadarAxis(null)}
                  className="bg-editorial-bg/80 p-10 lg:p-12 group hover:bg-editorial-surface transition-all duration-[1000ms] relative cursor-crosshair"
                >
                   <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-[1000ms] pointer-events-none mix-blend-screen" />
                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <span className="font-mono text-[0.6875rem] font-bold text-editorial-text-muted tracking-[0.4em] uppercase">{spec.label}</span>
                      <span className={`font-mono text-[0.6875rem] font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_8px_currentColor] group-hover:animate-pulse ${spec.color}`}>{spec.stat}</span>
                   </div>
                   <div className="font-sans font-black text-5xl md:text-6xl text-editorial-text group-hover:scale-[1.05] group-hover:translate-x-3 transition-transform duration-[1000ms] ease-[0.16,1,0.3,1] drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)] relative z-10">{spec.value}</div>
                   <div className="mt-10 h-[3px] w-12 bg-zinc-800 group-hover:w-full group-hover:bg-red-600 transition-all duration-[1000ms] ease-[0.16,1,0.3,1] relative z-10 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Usage & Composition Section */}
      <section className="mt-40 pt-24 border-t border-editorial-border relative overflow-hidden bg-editorial-bg">
         <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative z-10">
            <div className="grid md:grid-cols-2 gap-20">
               {/* Usage Methodology */}
               <div className="card-glass p-12 lg:p-16 border rounded-[2rem] border-editorial-border">
                  <h3 className="font-sans font-black text-3xl uppercase tracking-tighter text-editorial-text mb-8">Usage Methodology</h3>
                  <p className="text-editorial-text-muted font-light leading-relaxed mb-8">
                     To maximize the efficacy of this protocol, adhere to the recommended daily cadence. Consistent application is critical for establishing the desired bio-response trajectory.
                  </p>
                  <ul className="space-y-6">
                     {[
                        "Administer as dictated by your training intensity protocol.",
                        "Maintain hydration levels post-application to facilitate nutrient transport.",
                        "Store in a cool, dark environment to preserve molecular integrity."
                     ].map((item, i) => (
                        <li key={i} className="flex gap-4 items-start text-editorial-text font-mono text-sm leading-relaxed">
                           <span className="text-red-500 font-black">0{i+1}</span>
                           {item}
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Composition & Provenance */}
               <div className="card-glass p-12 lg:p-16 border rounded-[2rem] border-editorial-border">
                  <h3 className="font-sans font-black text-3xl uppercase tracking-tighter text-editorial-text mb-8">Composition & Provenance</h3>
                  <p className="text-editorial-text-muted font-light leading-relaxed mb-8">
                     Engineered with the highest grade precursors, each RAW compound undergoes rigorous batch testing to ensure purity and bioavailability.
                  </p>
                  {/* ⚠️ THIS GRID WAS FOUR INVENTED CERTIFICATIONS, IDENTICAL ON
                      ALL 47 PRODUCTS: "Purity: 99.98% Certified", "Origin:
                      Verified Lab-Alpha", "Grade: Laboratory Pure",
                      "Bio-Availability: High-Flux" — printed on the t-shirt,
                      the power bank and the sliders as readily as on a
                      supplement.

                      A precise purity figure asserts a lab result that nobody
                      produced, and on something people swallow that is a
                      trading-standards problem, not a wording preference.

                      It now shows the product's OWN qualityNotes from the
                      product data — claims the founder controls and can stand
                      behind — and shows nothing at all when a product has
                      none. */}
                  {Array.isArray(product.qualityNotes) && product.qualityNotes.length > 0 && (
                    <div className="grid grid-cols-2 gap-6">
                       {product.qualityNotes.map((note, i) => (
                          <div key={i} className="bg-editorial-text/5 p-6 rounded-xl">
                             <div className="text-editorial-text font-black tracking-tight">{note}</div>
                          </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>
         </div>
      </section>

      {/* Scientific Underpinnings & Quality Assurance */}
      <section className="mt-20 pt-24 border-t border-editorial-border relative overflow-hidden bg-editorial-bg">
          <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative z-10">
             <div className="grid md:grid-cols-2 gap-12">
                 {/* Scientific Underpinnings */}
                 <div className="bg-gradient-to-br from-editorial-bg to-editorial-bg p-12 lg:p-16 border rounded-[2rem] border-editorial-border">
                    <h3 className="font-sans font-black text-3xl uppercase tracking-tighter text-editorial-text mb-8">Scientific Underpinnings</h3>
                    <p className="text-editorial-text-muted font-light leading-relaxed mb-6">
                        Our mechanics of action are predicated on rapid kinetic absorption. By bypassing standard metabolic bottlenecks, the core compounds facilitate an instantaneous bio-response trajectory.
                    </p>
                    <p className="text-editorial-text-muted font-light leading-relaxed">
                        This formula leverages high-flux nutrient transport mechanisms, ensuring that active principles reach end-target receptor sits within optimal time-frames for maximum impact.
                    </p>
                 </div>

                 {/* Quality Assurance & Compliance */}
                 <div className="bg-gradient-to-br from-transparent to-zinc-900 p-12 lg:p-16 border rounded-[2rem] border-editorial-border">
                    <h3 className="font-sans font-black text-3xl uppercase tracking-tighter text-editorial-text mb-8">Quality Assurance & Compliance</h3>
                    <p className="text-editorial-text-muted font-light leading-relaxed mb-6">
                        Compliance is not an option; it is the foundation. Every batch undergoes exhaustive spectrographic analysis.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {["STERILE_ENV", "SPECTRO_VERIFIED", "BATCH_TRACEABLE", "GMP_COMPLIANT"].map((badge, i) => (
                            <span key={i} className="font-mono text-[0.6875rem] uppercase text-red-500 bg-red-950/20 px-4 py-2 rounded-full border border-red-500/20">
                                {badge}
                            </span>
                        ))}
                    </div>
                 </div>
             </div>
          </div>
       </section>

      {/* Reviews Section - Technical Feedback Log */}
      <section className="mt-40 pt-32 border-t border-editorial-border relative overflow-hidden bg-editorial-bg">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
        <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
            <div>
              <span className="text-meta-premium mb-8 block flex items-center gap-4">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" /> OPERATIVE_FEEDBACK_LOG
              </span>
              <h2 className="font-sans font-black uppercase tracking-[-0.05em] leading-[0.8] text-premium text-display-md">Mission <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900">Debrief</span></h2>
            </div>
            {/* No reviews means no score. Showing five filled stars over a
                score of nothing is the same lie the invented reviews told. */}
            <div className="flex flex-col items-end">
               {averageRating ? (
                 <>
                   <div className="flex items-center gap-4 mb-4">
                      <span className="font-sans font-black text-6xl text-premium">{averageRating}</span>
                      <div className="flex gap-1">
                         {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-8 h-8 ${i <= Number(averageRating) ? 'text-red-500 fill-red-500' : 'text-zinc-800 fill-zinc-800'}`} />
                         ))}
                      </div>
                   </div>
                   <span className="font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-widest font-black">
                     BASED_ON_{visibleReviews.length}_REPORTS
                   </span>
                 </>
               ) : (
                 <>
                   <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(i => (
                         <Star key={i} className="w-8 h-8 text-zinc-800" />
                      ))}
                   </div>
                   <span className="font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-widest font-black">
                     No reviews yet
                   </span>
                 </>
               )}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4 space-y-12">
               <div className="bg-editorial-surface/40 p-10 rounded-[2.5rem] border border-editorial-border backdrop-blur-3xl">
                  <h4 className="font-mono text-[0.6875rem] font-black uppercase tracking-[0.4em] text-red-500 mb-10 flex items-center gap-3">
                     <Plus className="w-4 h-4" /> SUBMIT_REPORT
                  </h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-8">
                     <div>
                        <label className="font-mono text-[0.6875rem] uppercase tracking-widest text-zinc-500 mb-4 block">IDENTIFIER</label>
                        <input 
                           type="text" 
                           placeholder="OPERATIVE_NAME"
                           value={newReview.author}
                           onChange={e => setNewReview({ ...newReview, author: e.target.value })}
                           className="w-full bg-black/40 border border-editorial-border-light rounded-2xl p-5 text-white font-mono text-sm focus:border-red-600 outline-none transition-all"
                        />
                     </div>
                     <div>
                        <label className="font-mono text-[0.6875rem] uppercase tracking-widest text-zinc-500 mb-4 block">EFFICIENCY_RATING</label>
                        <div className="flex gap-4">
                           {[1,2,3,4,5].map(i => (
                              <button
                                 key={i}
                                 type="button"
                                 onMouseEnter={() => setIsHoveringStar(i)}
                                 onMouseLeave={() => setIsHoveringStar(null)}
                                 onClick={() => setNewReview({ ...newReview, rating: i })}
                                 aria-label={`Rate ${i} out of 5`}
                                 aria-pressed={i === newReview.rating}
                                 className="transition-transform active:scale-95"
                              >
                                 <Star 
                                    className={`w-8 h-8 transition-colors ${
                                       i <= (isHoveringStar || newReview.rating) 
                                       ? 'text-red-500 fill-red-500' 
                                       : 'text-zinc-800 fill-zinc-800'
                                    }`} 
                                 />
                              </button>
                           ))}
                        </div>
                     </div>
                     <div>
                        <label className="font-mono text-[0.6875rem] uppercase tracking-widest text-zinc-500 mb-4 block">DEBRIEF_LOG</label>
                        <textarea 
                           placeholder="FIELD_NOTES..."
                           value={newReview.content}
                           onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                           rows={4}
                           className="w-full bg-black/40 border border-editorial-border-light rounded-2xl p-5 text-white font-mono text-sm focus:border-red-600 outline-none transition-all resize-none"
                        />
                     </div>
                     <button type="submit" className="button-premium w-full !text-[0.75rem]">TRANSMIT_LOG</button>
                  </form>
               </div>
               
               <div className="flex items-center gap-6 p-8 bg-red-600/5 border border-red-500/20 rounded-3xl">
                  <Bot className="w-10 h-10 text-red-500" />
                  <p className="text-[0.6875rem] font-mono leading-relaxed text-zinc-400">
                     <span className="text-red-500 font-black tracking-widest block mb-2">AUTO_MODERATION: ACTIVE</span>
                     All debrief logs are subject to neural screening for integrity and system compliance before public distribution.
                  </p>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-10">
               <AnimatePresence mode="popLayout">
                  {visibleReviews.map((review, i) => (
                     <motion.div 
                        key={review.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-editorial-bg p-10 rounded-[2.5rem] border border-editorial-border-light relative group/review hover:border-red-600/30 transition-all duration-1000"
                     >
                        <div className="absolute top-10 right-10 flex gap-4">
                           <div className="flex gap-1">
                              {[1,2,3,4,5].map(star => (
                                 <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-red-500 fill-red-500' : 'text-zinc-800'}`} />
                              ))}
                           </div>
                           <div className="w-[1px] h-4 bg-editorial-border-light mx-2" />
                           <span className="font-mono text-[0.6875rem] text-zinc-600 uppercase tracking-widest font-black">{review.date}</span>
                        </div>
                        <div className="flex items-start gap-8">
                           <div className="w-14 h-14 bg-editorial-surface border border-editorial-border rounded-2xl flex items-center justify-center font-mono font-black text-red-500 text-lg shadow-depth-1 group-hover/review:scale-110 transition-transform duration-700">
                              {review.author[0]}
                           </div>
                           <div className="flex-1">
                              <h5 className="font-sans font-black text-2xl uppercase tracking-tight text-premium mb-4">{review.author}</h5>
                              <p className="text-editorial-text-muted font-light leading-relaxed max-w-2xl mb-8 border-l-2 border-red-900/40 pl-8">
                                 "{review.content}"
                              </p>
                              <div className="flex items-center gap-6">
                                 <button 
                                    onClick={() => toggleReportStatus(review.id)}
                                    className={`font-mono text-[0.6875rem] uppercase tracking-widest font-black transition-colors ${review.reported ? 'text-red-500' : 'text-zinc-700 hover:text-white'}`}
                                 >
                                    {review.reported ? '[ REPORTED ]' : '[ FLAG_FOR_REVISION ]'}
                                 </button>
                                 <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                                 <span className="font-mono text-[0.6875rem] text-zinc-700 uppercase tracking-widest font-black">ENCRYPTED_SIG: {review.id.slice(0, 8)}</span>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
               
               {visibleReviews.length === 0 && (
                  <div className="p-20 text-center border-2 border-dashed border-editorial-border rounded-[3rem]">
                     <span className="font-mono text-zinc-600 uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] font-black">NO_DEBRIEF_LOGS_ON_FILE</span>
                  </div>
               )}
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="mt-40 pt-32 border-t border-red-900/40 relative overflow-hidden bg-editorial-bg">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent shadow-[0_0_20px_#dc2626] opacity-50" />
          <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)] relative z-10 pb-32">
            <div className="mb-16 relative z-10 text-center flex flex-col items-center">
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.3em] sm:tracking-[0.5em] [overflow-wrap:anywhere] text-red-500 mb-8 block drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] flex items-center justify-center gap-4">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_currentColor] animate-pulse" /> Complete the Protocol
              </span>
              <h3 className="font-sans font-black text-4xl md:text-6xl uppercase tracking-tighter mb-16 text-editorial-text drop-shadow-[0_5px_15px_rgba(0,0,0,0.1)] text-center">Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900">Expansion</span></h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
               {related.map((p, rIdx) => (
                 <motion.div 
                   key={p.id}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: rIdx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                   viewport={{ once: true }}
                   className="group relative h-full"
                 >
                   <Link to={`/product/${p.id}`} className="block bg-editorial-bg border border-editorial-border rounded-[3rem] p-8 transition-all duration-[800ms] hover:border-red-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_80px_rgba(220,38,38,0.2)] h-full overflow-hidden flex flex-col transform-gpu hover:-translate-y-2">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/5 to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-[800ms] mix-blend-screen pointer-events-none" />
                      <div className="aspect-[4/5] bg-editorial-bg rounded-[2rem] overflow-hidden mb-8 relative shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
                         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none mix-blend-overlay opacity-50" />
                         <LazyImage 
                            src={p.image} 
                            alt={p.name} 
                            className="w-full h-full object-cover mix-blend-screen scale-100 group-hover:scale-110 transition-transform duration-[1500ms] ease-[0.16,1,0.3,1] grayscale opacity-80 group-hover:grayscale-[50%] group-hover:opacity-100" 
                            containerClassName="w-full h-full absolute inset-0 p-8"
                         />
                      </div>
                      <h4 className="font-sans font-black text-2xl uppercase tracking-tight text-editorial-text mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] line-clamp-1">{p.name}</h4>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-mono text-editorial-text-muted text-lg font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">{p.price}</span>
                        <span className="font-mono text-[0.6875rem] uppercase font-bold tracking-[0.3em] text-red-500 bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-900/50">View Struct</span>
                      </div>
                   </Link>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Add to Cart Header - HUD Style */}
      <AnimatePresence>
        {showStickyAdd && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-[100] py-6 hidden md:block"
          >
            <div className="max-w-[var(--content-max-width)] mx-auto px-[var(--shell-padding-mobile)] md:px-[var(--shell-padding)] lg:px-[var(--shell-padding-lg)]">
              <div className="bg-editorial-bg/90 backdrop-blur-3xl border border-editorial-border-light rounded-[2rem] p-5 flex items-center justify-between relative overflow-hidden shadow-depth-3">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-transparent opacity-50" />
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-red-600/40" />
                
                <div className="flex items-center gap-10 relative z-10">
                  <div className="w-16 h-16 bg-editorial-bg border border-editorial-border-light rounded-2xl overflow-hidden shadow-depth-1 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-shadow">
                    <img src={galleryItems[0].url} alt={product.name} className="w-full h-full object-contain mix-blend-screen scale-110" />
                  </div>
                  <div>
                     <h4 className="font-sans font-black uppercase text-2xl text-editorial-text tracking-widest leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] mb-2">{product.name}</h4>
                     <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]" />
                        <span className="font-mono text-[0.6875rem] text-editorial-text-muted font-black uppercase tracking-[0.4em]">DEPLOYMENT_READY // {product.price}</span>
                     </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 relative z-10">
                   <div className="flex items-center border border-editorial-border bg-editorial-bg/60 backdrop-blur-3xl px-4 py-2 rounded-2xl">
                     <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-4 text-editorial-text-muted hover:text-red-500 transition-colors"><Minus className="w-5 h-5" /></button>
                     <span className="w-16 text-center font-mono font-black text-2xl text-editorial-text">{quantity}</span>
                     <button onClick={() => setQuantity(q => q + 1)} className="p-4 text-editorial-text-muted hover:text-emerald-500 transition-colors"><Plus className="w-5 h-5" /></button>
                   </div>
                   <button 
                     onClick={() => {
                        addToCart(product, quantity);
                        addToProtocol(product);
                     }}
                     className="bg-red-600 text-white font-black uppercase tracking-[0.4em] text-[0.6875rem] px-12 py-6 rounded-[1.5rem] hover:bg-editorial-text hover:text-editorial-bg transition-all duration-700 shadow-glow group whitespace-nowrap"
                   >
                     EXECUTE_ORDER <ArrowRight className="w-4 h-4 inline ml-3 group-hover:translate-x-2 transition-transform" />
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
