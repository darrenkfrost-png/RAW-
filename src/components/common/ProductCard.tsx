import { memo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { Search, Layers, Plus, ExternalLink } from "lucide-react";
import { useProtocol } from "../../context/ProtocolContext";
import { useCart } from "../../context/CartContext";
import { useCompare } from "../../context/CompareContext";
import LazyImage from "../LazyImage";
import { Tooltip } from "./Tooltip";
import { useUI } from "../../context/UIContext";
import { Product } from "../../types";

/**
 * THE PRODUCT CARD — rebuilt so the product is the biggest thing on it.
 *
 * WHAT WAS WRONG, MEASURED RATHER THAN GUESSED
 *
 * 1. THE PHOTOGRAPH WAS BEING STRANGLED. The card carried p-10 (40px) and the
 *    image then carried p-14 (56px per side) inside its own box. On a 330px
 *    column that left roughly 138px of actual product — the shot was a stamp
 *    floating in a very large empty frame. The padding is now p-4/p-6 and the
 *    photograph fills the panel it was always meant to fill.
 *
 * 2. `mix-blend-screen` WAS ERASING HALF OF EVERY SHOT. Screen blending makes
 *    dark pixels transparent — and these are products photographed on black.
 *    The blend was quietly deleting the darkest parts of the merchandise
 *    against a dark card. It is gone; the shots now sit on a soft plinth of
 *    light instead, which is what the blend was pretending to do.
 *
 * 3. THE FLICKERING WAS THE CARD'S OWN FAULT, MULTIPLIED BY FORTY-SEVEN. Each
 *    card ran eight opacity keyframes on an infinite repeat, a pulsing icon, a
 *    pulsing dot, and a scan line that never stopped — and the shelf renders
 *    47 cards, so the page carried several hundred simultaneous infinite
 *    animations, most of them inside a layer at opacity-0 that nobody could
 *    even see. An invisible element still animates and still costs a frame.
 *    Every always-on animation is gone. What remains happens on hover, on the
 *    one card being pointed at.
 *
 * 4. THE READOUTS WERE INVENTED. FIDELITY: 100%, PURITY: 99.9%,
 *    BIO_SYNC: [OPTIMAL], BIOMETRIC_STABILITY, SCAN_VERIFIED — printed
 *    identically on every item, including a t-shirt, a power bank and a pair
 *    of sliders. A power bank has no purity percentage. A brand whose campaign
 *    is built on "no catch" cannot decorate its shop with numbers it made up,
 *    so the fake telemetry is removed and the real facts — category, name,
 *    benefit, price — are given the room it was taking.
 *
 * The tactical language stays: the mono labels, the red, the tilt, the glint.
 * It is the noise that went, not the character.
 */

export interface ProductCardProps {
  key?: React.Key;
  product: Product;
  idx: number;
  onQuickView?: (product: Product) => void;
}

function ProductCardComponent({ product, idx, onQuickView }: ProductCardProps) {
  const { setFocusedProduct, setIsAIChatOpen, setInitialAction } = useUI();
  const { addToProtocol } = useProtocol();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleProduct, selectedItems } = useCompare();
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 100, damping: 30 });

  // 10° of tilt on a card this size threw the photograph out of square; 5° reads
  // as depth without making the product look like it is falling over.
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const glintX = useTransform(mouseX, [-0.5, 0.5], ["-50%", "150%"]);
  const glintY = useTransform(mouseY, [-0.5, 0.5], ["-50%", "150%"]);

  const isCompared = selectedItems.some((p) => p.id === product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || reduced) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const handleNeuralScan = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFocusedProduct(product);
    setInitialAction("SCAN");
    setIsAIChatOpen(true);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={reduced ? undefined : { y: -8 }}
      style={{
        rotateX: reduced ? 0 : rotateX,
        rotateY: reduced ? 0 : rotateY,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      /* The stagger used to be idx * 0.05 with no ceiling, so on a 47-item
         shelf the last card waited 2.35 seconds to exist. Capped. */
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: Math.min(idx, 11) * 0.04 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-editorial-border-light bg-editorial-card p-4 shadow-depth-3 transition-[border-color,box-shadow] duration-500 hover:border-red-600/60 hover:shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85),0_0_60px_rgba(220,38,38,0.15)] sm:p-5"
    >
      {/* Holographic glint — hover only. */}
      <motion.div
        style={{ left: glintX, top: glintY }}
        className="pointer-events-none absolute h-[200%] w-[200%] rotate-45 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 mix-blend-overlay transition-opacity duration-700 group-hover:opacity-30"
      />

      {/* ── THE PHOTOGRAPH ─────────────────────────────────────────────── */}
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent transition-colors duration-500 group-hover:border-red-600/30"
      >
        {/* A soft plinth of light so the product is lit rather than floating. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_65%,rgba(255,255,255,0.10),transparent_62%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.22),transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

        <LazyImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.06] sm:p-6"
          containerClassName="absolute inset-0 flex items-center justify-center !bg-transparent"
        />

        {/* One badge, one fact: what shelf this belongs to. */}
        <span className="absolute left-3 top-3 z-20 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-[0.25em] text-white/80 backdrop-blur-md">
          {product.category}
        </span>

        {/* Quick actions — revealed on hover, real functions only. */}
        <div className="absolute inset-x-0 bottom-3 z-30 flex items-center justify-center gap-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <Tooltip content="Compare">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleProduct(product); }}
              className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
                isCompared
                  ? "border-red-500 bg-red-600 text-white"
                  : "border-white/15 bg-black/70 text-white hover:border-red-500/60"
              }`}
              aria-label={`${isCompared ? "Remove" : "Add"} ${product.name} to comparison`}
              aria-pressed={isCompared}
            >
              <Layers className="h-4 w-4" />
            </button>
          </Tooltip>

          <Tooltip content="Add to protocol stack">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToProtocol(product); }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.35)] transition-colors hover:bg-white hover:text-red-700"
              aria-label={`Add ${product.name} to protocol`}
            >
              <Plus className="h-5 w-5" />
            </button>
          </Tooltip>

          <Tooltip content="Ask the advisor">
            <button
              onClick={handleNeuralScan}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-md transition-colors hover:border-red-500/60"
              aria-label={`Ask the advisor about ${product.name}`}
            >
              <Search className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </Link>

      {/* ── THE FACTS ──────────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="font-sans text-lg font-black uppercase leading-[1.05] tracking-tight transition-colors duration-300 group-hover:text-red-400 sm:text-xl">
          {product.name}
        </h3>

        {product.shortBenefit && (
          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-editorial-text-muted">
            {product.shortBenefit}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-baseline gap-1.5">
            <span className="font-mono text-base font-black text-red-500" aria-hidden="true">£</span>
            <span className="font-sans text-3xl font-black tracking-tight">
              {product.price.toString().replace("£", "")}
            </span>
            <span className="sr-only">Price: {product.price}</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to={`/product/${product.id}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-editorial-border-light py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-editorial-text-muted transition-colors hover:border-white/30 hover:text-white"
              aria-label={`View details for ${product.name}`}
            >
              Details <ExternalLink className="h-3 w-3" />
            </Link>
            {/* ⚠️ THIS SAID "Add" AND DID NOT ADD TO THE CART.
                It called addToProtocol — the stack builder — so on a shop page
                the one button a customer reads as "buy this" left the basket
                empty and the badge unchanged. Verified before the change:
                clicking it produced no cart item and no badge at all. A shop's
                primary action must be the purchase. The stack builder is still
                on the tile itself, and now says what it is.
                The cart also opens on add: a silent badge in the corner is not
                enough feedback for the most important click on the page. */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1);
                setIsCartOpen(true);
              }}
              className="rounded-xl bg-red-600 py-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-500"
              aria-label={`Add ${product.name} to cart`}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ProductCardComponent);
