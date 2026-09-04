import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Filter, RefreshCcw } from 'lucide-react';

export interface FilterState {
  searchQuery: string;
  sortBy: string;
  price: string | null;
  categories: string[];
  goals: string[];
  productTypes: string[];
  cautionLevels: string[];
  stackRoles: string[];
}

interface ShopFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResults: number;
}

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border-b border-editorial-border pb-8 mb-8">
    <h3 className="text-meta-premium mb-6 flex items-center gap-4 opacity-60">
        <div className="w-6 h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
        {title}
    </h3>
    <div className="flex flex-wrap gap-3">
      {children}
    </div>
  </div>
);

const Chip = ({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`px-5 py-3 rounded-xl font-mono text-[0.6875rem] font-black uppercase tracking-[0.25em] transition-all duration-500 border relative overflow-hidden group/chip shadow-sm hover-glow ${
      active 
        ? 'bg-red-600 border-red-500 text-white shadow-[0_5px_15px_rgba(220,38,38,0.4)]' 
        : 'bg-editorial-bg border-editorial-border-light text-editorial-text-muted hover:text-editorial-text'
    }`}
  >
    <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-0 group-hover/chip:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-screen ${active ? 'hidden' : ''}`} />
    <span className="relative z-10 drop-shadow-sm">{label}</span>
  </button>
);

export default function ShopFilters({ isOpen, onClose, filters, setFilters, totalResults }: ShopFiltersProps) {
  const toggleArrayItem = (array: string[], item: string, key: keyof FilterState) => {
    const newArray = array.includes(item) ? array.filter(i => i !== item) : [...array, item];
    setFilters(prev => ({ ...prev, [key]: newArray }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      price: null,
      categories: [],
      goals: [],
      productTypes: [],
      cautionLevels: [],
      stackRoles: []
    }));
  };

  const priceOptions = [
    { label: "Under £15", value: "under-15" },
    { label: "Under £25", value: "under-25" },
    { label: "£25+", value: "25-plus" }
  ];

  const categoryOptions = ["Nutrients", "Recovery", "Combat", "Accessories", "Apparel"];
  
  const goalOptions = [
    "Strength", "Recovery", "Longevity", "Sleep & Calm", 
    "Hydration", "Beginner Friendly", "Combat Training", 
    "Daily Wellness", "Energy & Focus", "Mobility Support"
  ];

  const typeOptions = [
    { label: "Supplements", value: "supplement" },
    { label: "Equipment", value: "equipment" },
    { label: "Apparel", value: "apparel" },
    { label: "Accessories", value: "accessory" }
  ];

  const cautionOptions = [
    { label: "Low Caution", value: "low" },
    { label: "Medium Caution", value: "medium" },
    { label: "High Caution", value: "high" }
  ];

  const stackRoleOptions = [
    "Foundation", "Performance", "Recovery", "Hydration", 
    "Sleep", "Vitality", "Combat", "Utility", "Longevity", 
    "Calm", "Mobility"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex justify-end"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-editorial-bg/80 backdrop-blur-3xl"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="relative w-full max-w-[500px] bg-editorial-bg/95 backdrop-blur-3xl border-l border-editorial-border-light h-full overflow-hidden flex flex-col shadow-[-40px_0_100px_rgba(0,0,0,0.15)]"
          >
            {/* Header */}
            <div className="flex-none bg-editorial-bg border-b border-editorial-border p-8 flex flex-col gap-8 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-500/20 shadow-[inset_0_0_20px_rgba(220,38,38,0.1)]">
                    <Filter className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-premium font-sans text-2xl font-black mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">FILTER_MATRIX</h2>
                    <span className="text-meta-premium opacity-40">SYSTEM_INVENTORY_CONTROL</span>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  aria-label="Close Filter Settings"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-editorial-text/5 hover:bg-editorial-text/10 border border-editorial-border hover:border-red-500/50 text-editorial-text-muted hover:text-editorial-text transition-all duration-500"
                >
                  <X className="w-5 h-5 drop-shadow-md" />
                </button>
              </div>
              <div className="flex items-center justify-between bg-editorial-bg/60 p-4 rounded-[1rem] border border-editorial-border shadow-inner">
                <span className="text-meta-premium opacity-60 flex items-center gap-3">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]"></div>
                   DETECTED_UNITS: <span className="text-premium ml-1 text-base">{totalResults}</span>
                </span>
                {(filters.price || filters.categories.length > 0 || filters.goals.length > 0 || filters.productTypes.length > 0 || filters.cautionLevels.length > 0 || filters.stackRoles.length > 0) && (
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-meta-premium !text-red-500 hover:!text-red-400 transition-colors drop-shadow-sm"
                  >
                    <RefreshCcw className="w-3 h-3" /> CLEAR_MATRIX
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32">
              <FilterSection title="Price_Bracket">
                {priceOptions.map(opt => (
                  <Chip 
                    key={opt.value} 
                    label={opt.label} 
                    active={filters.price === opt.value} 
                    onClick={() => setFilters(prev => ({ ...prev, price: prev.price === opt.value ? null : opt.value }))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Category_Profile">
                {categoryOptions.map(cat => (
                  <Chip 
                    key={cat} 
                    label={cat} 
                    active={filters.categories.includes(cat)} 
                    onClick={() => toggleArrayItem(filters.categories, cat, 'categories')}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Performance_Goal">
                {goalOptions.map(goal => (
                  <Chip 
                    key={goal} 
                    label={goal} 
                    active={filters.goals.includes(goal)} 
                    onClick={() => toggleArrayItem(filters.goals, goal, 'goals')}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Product_Type">
                {typeOptions.map(opt => (
                  <Chip 
                    key={opt.value} 
                    label={opt.label} 
                    active={filters.productTypes.includes(opt.value)} 
                    onClick={() => toggleArrayItem(filters.productTypes, opt.value, 'productTypes')}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Caution_Profile">
                {cautionOptions.map(opt => (
                  <Chip 
                    key={opt.value} 
                    label={opt.label} 
                    active={filters.cautionLevels.includes(opt.value)} 
                    onClick={() => toggleArrayItem(filters.cautionLevels, opt.value, 'cautionLevels')}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Stack_Role">
                {stackRoleOptions.map(role => (
                  <Chip 
                    key={role.toLowerCase()} 
                    label={role} 
                    active={filters.stackRoles.includes(role.toLowerCase())} 
                    onClick={() => toggleArrayItem(filters.stackRoles, role.toLowerCase(), 'stackRoles')}
                  />
                ))}
              </FilterSection>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-red-600 border border-red-500 rounded-xl text-[0.75rem] font-bold uppercase tracking-[0.3em] text-white hover:bg-editorial-text hover:text-editorial-bg transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                Apply Profile
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
