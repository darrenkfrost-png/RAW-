import { Atmosphere } from '../components/common/Atmosphere';
import { motion, AnimatePresence } from "motion/react";
import { Link, useParams } from "react-router-dom";
import { Product } from "../types";
import { allProducts } from "../data/products";
import React, { useState, useMemo, useEffect } from "react";
import ProductCard from "../components/common/ProductCard";
import { ProductCardSkeleton } from "../components/common/Skeleton";
import ProductQuickView from "../components/ProductQuickView";
import Breadcrumb from "../components/Breadcrumb";
import { Search, Filter, Zap, LayoutGrid, Bot } from "lucide-react";
import ShopFilters, { FilterState } from "../components/ShopFilters";
import { useUI } from "../context/UIContext";

export default function Shop() {
  const { slug } = useParams();
  
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    sortBy: "featured",
    price: null,
    categories: slug ? [slug.replace("-", " ")] : [],
    goals: [],
    productTypes: [],
    cautionLevels: [],
    stackRoles: []
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial telemetry scan
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (slug) {
      setFilters(prev => ({ 
        ...prev, 
        categories: [slug.replace("-", " ")] 
      }));
    } else {
       setFilters(prev => ({ 
        ...prev, 
        categories: [] 
      }));
    }
  }, [slug]);

  const matchGoals = (product: Product, goals: string[]) => {
    if (goals.length === 0) return true;
    
    const productGoals = (product.goalTags || []).map(g => g.toLowerCase());
    
    for (const goal of goals) {
      const gl = goal.toLowerCase();
      if (gl === "strength" && productGoals.some(g => g.includes("build muscle") || g.includes("strength"))) return true;
      if (gl === "recovery" && productGoals.some(g => g.includes("recover"))) return true;
      if (gl === "longevity" && productGoals.some(g => g.includes("longevity"))) return true;
      if (gl === "sleep & calm" && productGoals.some(g => g.includes("sleep") || g.includes("calm"))) return true;
      if (gl === "hydration" && productGoals.some(g => g.includes("hydration"))) return true;
      if (gl === "beginner friendly" && productGoals.some(g => g.includes("beginner"))) return true;
      if (gl === "combat training" && productGoals.some(g => g.includes("combat"))) return true;
      if (gl === "daily wellness" && productGoals.some(g => g.includes("wellness"))) return true;
      if (gl === "energy & focus" && productGoals.some(g => g.includes("energy") || g.includes("focus"))) return true;
      if (gl === "mobility support" && productGoals.some(g => g.includes("mobility") || g.includes("joint"))) return true;
    }
    return false;
  }

  const matchPrice = (product: Product, price: string | null) => {
    if (!price) return true;
    const val = parseFloat(product.price.replace(/[^0-9.]/g,''));
    if (price === "under-15") return val < 15;
    if (price === "under-25") return val < 25;
    if (price === "25-plus") return val >= 25;
    return true;
  }

  const matchSearch = (product: Product, search: string) => {
    if (!search) return true;
    const query = search.toLowerCase();
    const searchString = `
      ${product.name} 
      ${product.category} 
      ${product.id} 
      ${product.shortBenefit || ''} 
      ${product.overview || ''} 
      ${product.whatItDoes || ''} 
      ${(product.goalTags || []).join(" ")} 
      ${(product.protocolTags || []).join(" ")} 
      ${product.stackRole || ''} 
      ${product.productType || ''}
    `.toLowerCase();
    return searchString.includes(query);
  }

  const filteredProducts: Product[] = useMemo(() => {
    let products = allProducts.filter(p => 
      matchSearch(p, filters.searchQuery) &&
      (filters.categories.length === 0 || filters.categories.some(c => c.toLowerCase() === p.category.toLowerCase())) &&
      matchPrice(p, filters.price) &&
      matchGoals(p, filters.goals) &&
      (filters.productTypes.length === 0 || filters.productTypes.includes(p.productType || '')) &&
      (filters.cautionLevels.length === 0 || filters.cautionLevels.includes(p.cautionLevel || '')) &&
      (filters.stackRoles.length === 0 || filters.stackRoles.includes(p.stackRole || ''))
    );

    switch (filters.sortBy) {
        case "price-low": return products.sort((a,b) => parseFloat(a.price.replace(/[^0-9.]/g,'')) - parseFloat(b.price.replace(/[^0-9.]/g,'')));
        case "price-high": return products.sort((a,b) => parseFloat(b.price.replace(/[^0-9.]/g,'')) - parseFloat(a.price.replace(/[^0-9.]/g,'')));
        case "name": return products.sort((a,b) => a.name.localeCompare(b.name));
        case "category": return products.sort((a,b) => a.category.localeCompare(b.category));
        case "id": return products.sort((a,b) => a.id - b.id);
        case "beginner": return products.sort((a,b) => {
           const aBeg = (a.goalTags || []).some(g => g.toLowerCase().includes("beginner")) ? 1 : 0;
           const bBeg = (b.goalTags || []).some(g => g.toLowerCase().includes("beginner")) ? 1 : 0;
           return bBeg - aBeg;
        });
        case "stack-role": return products.sort((a,b) => (a.stackRole || '').localeCompare(b.stackRole || ''));
        case "caution": return products.sort((a,b) => (a.cautionLevel || '').localeCompare(b.cautionLevel || ''));
        case "featured": 
        default: return products;
    }
  }, [filters]);

  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: "Home", href: "/" },
    { label: "Archive", href: "/shop" }
  ];
  if (slug) {
    breadcrumbItems.push({ label: slug.replace("-", " ").toUpperCase() });
  }

  const activeFilterCount = (filters.price ? 1 : 0) + 
                            filters.categories.length + 
                            filters.goals.length + 
                            filters.productTypes.length + 
                            filters.cautionLevels.length + 
                            filters.stackRoles.length;

  return (
    <div className="section-container pt-32 xl:pt-48 pb-32 min-h-svh relative overflow-hidden">
      {/* Cinematic Glitch and Atmospheric Elements */}
      <Atmosphere glowOpacity={0.05} gridMode="dots" intensity="high" />
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-red-900/10 blur-[250px] pointer-events-none rounded-full mix-blend-screen" />
      <motion.div 
        animate={{ opacity: [0, 0.05, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent mix-blend-color-dodge pointer-events-none"
      />
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
         <motion.div 
           animate={{ y: ["-10vh", "110vh"] }}
           transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
           className="w-full h-[1px] bg-red-500 shadow-[0_0_15px_#ef4444]"
         />
      </div>

      <Breadcrumb items={breadcrumbItems} />
      
      <ShopFilters 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={filters}
        setFilters={setFilters}
        totalResults={filteredProducts.length}
      />

      <div className="flex flex-col xl:flex-row justify-between items-end mb-20 gap-12 border-b border-editorial-border pb-16 relative z-10 transition-all">
        <div className="space-y-6 flex-1 w-full xl:w-auto">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
            className="flex items-center gap-5"
          >
             <div className="flex gap-2">
                {[1, 2, 3].map(i => <div key={i} className={`w-2 h-5 bg-gradient-to-b from-editorial-accent to-red-950 shadow-sm ${i===3 ? 'animate-pulse' : ''}`} />)}
             </div>
             <span className="font-mono text-[10px] xl:text-[11px] tracking-[0.4em] text-editorial-accent font-black uppercase">
               SYSTEM_INVENTORY // REGISTRY_04
             </span>
          </motion.div>
          <motion.h1 
            initial={{ scale: 1.05, opacity: 0, filter: "blur(10px)", y: 20 }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans font-black text-7xl md:text-9xl xl:text-[160px] uppercase tracking-[-0.05em] leading-[0.8] mb-10 drop-shadow-[0_40px_100px_rgba(0,0,0,0.15)] text-premium relative"
          >
            {slug ? slug.replace("-", " ") : "The Archive"}
            <span className="absolute -inset-2 blur-3xl opacity-20 bg-gradient-to-r from-red-600/30 to-transparent pointer-events-none" />
          </motion.h1>
          <div className="flex flex-wrap items-center gap-10">
             <div className="h-[2px] w-20 md:w-48 bg-gradient-to-r from-red-600 via-red-950 to-transparent shadow-[0_0_15px_rgba(220,38,38,0.3)]" />
             <p className="text-meta-premium flex items-center gap-5">
                 <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_15px_currentColor]"></span>
                 REGISTRY_NODES: <strong className="text-editorial-text bg-editorial-text/5 px-6 py-3 rounded-2xl border border-editorial-border-light shadow-depth-1">{filteredProducts.length}</strong>
             </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-6 w-full xl:w-auto relative z-20">
            {/* Search Box - Refined */}
            <div className="relative group/search w-full lg:w-[520px]">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600 group-focus-within/search:text-red-500 transition-all duration-500 drop-shadow-sm" />
                <input 
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({...prev, searchQuery: e.target.value}))}
                    aria-label="Search parameters"
                    placeholder="INITIATE_PARAMETER_SCAN..."
                    className="w-full bg-editorial-bg backdrop-blur-3xl text-editorial-text placeholder-zinc-700 border border-editorial-border rounded-[1.5rem] py-6 pl-16 pr-8 text-[13px] font-black uppercase tracking-[0.4em] outline-none focus:border-red-500/50 transition-all duration-[600ms] shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] focus:shadow-[0_0_40px_rgba(220,38,38,0.15)] font-mono"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-500">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </div>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap gap-5">
               {/* Controls Bar */}
               <button 
                 onClick={() => setIsFilterOpen(true)}
                 aria-expanded={isFilterOpen}
                 aria-label="Toggle structural filters"
                 className={`flex-1 lg:flex-none flex items-center justify-center gap-6 p-6 px-10 border rounded-[1.5rem] transition-all duration-[600ms] group/filter relative overflow-hidden ${activeFilterCount > 0 ? 'border-red-500 text-editorial-text shadow-[0_0_30px_rgba(220,38,38,0.3)] bg-red-950/20' : 'border-editorial-border text-zinc-600 hover:text-editorial-text hover:border-editorial-border-light bg-editorial-bg'}`}
               >
                 <Filter className="w-5 h-5 drop-shadow-[0_2px_4px_currentColor]" />
                 <span className="text-[12px] font-mono uppercase tracking-[0.4em] font-black">
                   CRITERIA {activeFilterCount > 0 && `// ${activeFilterCount}`}
                 </span>
               </button>

               <div className="flex-1 lg:flex-none flex justify-between items-center bg-editorial-bg/90 backdrop-blur-3xl p-5 px-6 border border-editorial-border rounded-full shadow-inner transition-all duration-[600ms] hover:border-editorial-border-light group/sort relative">
                   <div className="flex items-center gap-4 absolute left-6 pointer-events-none">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_#dc2626]"></div>
                      <span className="text-[11px] font-mono text-editorial-text-muted uppercase tracking-[0.3em] font-black group-hover/sort:text-editorial-text transition-colors duration-500">SORT:</span>
                   </div>
                   <div className="flex-1 w-full relative">
                     <select 
                       value={filters.sortBy} 
                       onChange={(e) => setFilters(prev => ({...prev, sortBy: e.target.value}))} 
                       aria-label="Sort product registry"
                       className="bg-transparent text-[11px] font-mono font-black text-editorial-text py-1 pl-28 pr-6 w-full outline-none cursor-pointer hover:text-red-500 transition-colors duration-500 tracking-[0.2em] uppercase appearance-none focus:ring-0 drop-shadow-sm z-10 relative"
                     >
                           <option value="featured" className="bg-editorial-bg text-editorial-text py-2">FEATURED</option>
                           <option value="price-low" className="bg-editorial-bg text-editorial-text py-2">PRICE: LOW TO HIGH</option>
                           <option value="price-high" className="bg-editorial-bg text-editorial-text py-2">PRICE: HIGH TO LOW</option>
                           <option value="category" className="bg-editorial-bg text-editorial-text py-2">CATEGORY</option>
                           <option value="id" className="bg-editorial-bg text-editorial-text py-2">ASSET_ID</option>
                           <option value="beginner" className="bg-editorial-bg text-editorial-text py-2">BEGINNER</option>
                           <option value="stack-role" className="bg-editorial-bg text-editorial-text py-2">STACK ROLE</option>
                           <option value="caution" className="bg-editorial-bg text-editorial-text py-2">CAUTION LEVEL</option>
                     </select>
                   </div>
               </div>
            </div>
        </div>
      </div>
          
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6 relative z-10"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={`skeleton-${i}`} />
            ))
          ) : (
            filteredProducts.map((product, idx) => (
              <ProductCard 
                  key={product.id} 
                  product={product} 
                  idx={idx} 
                  onQuickView={setQuickViewProduct} 
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
      
      {filteredProducts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="py-24 xl:py-48 text-center max-w-4xl mx-auto border border-editorial-border-light mt-12 bg-editorial-surface/50 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden px-10 shadow-depth-2"
        >
          {/* Subtle Scanline Effect */}
          <Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-editorial-surface border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg group hover:border-red-500/50 transition-colors">
                <LayoutGrid className="w-8 h-8 text-editorial-accent group-hover:scale-110 transition-transform" />
            </div>
            
            <h3 className="font-sans text-5xl xl:text-7xl font-black uppercase tracking-tight text-editorial-text mb-6">
                <span className="block text-editorial-accent mb-2 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">SYSTEM_NULL</span>
                <span className="block text-xl md:text-3xl font-light text-zinc-600">NO_MATCHING_UNITS</span>
            </h3>
            
            <p className="text-editorial-text-muted font-mono text-[11px] xl:text-[12px] uppercase tracking-[0.4em] font-medium max-w-lg mx-auto leading-relaxed mb-16">
              Our registry failed to find any assets matching your current filtering parameters. Adjust your scan criteria, clear the protocol, or consult the Intelligence Advisor for assistance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => setFilters({
                  searchQuery: "", sortBy: "featured", price: null, categories: [], goals: [], productTypes: [], cautionLevels: [], stackRoles: []
                })} 
                className="button-premium"
              >
                Reset_Protocol
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <ProductQuickView product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
