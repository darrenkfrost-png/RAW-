import React, { createContext, useContext, useState } from "react";

interface CompareContextType {
  selectedItems: any[];
  toggleProduct: (product: any) => void;
  removeProduct: (id: number) => void;
  clearComparison: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const toggleProduct = (product: any) => {
    if (selectedItems.find(p => p.id === product.id)) {
      setSelectedItems(prev => prev.filter(p => p.id !== product.id));
    } else if (selectedItems.length < 3) {
      setSelectedItems(prev => [...prev, product]);
    }
  };

  const removeProduct = (id: number) => {
    setSelectedItems(prev => prev.filter(p => p.id !== id));
  };

  const clearComparison = () => {
    setSelectedItems([]);
  };

  return (
    <CompareContext.Provider value={{ selectedItems, toggleProduct, removeProduct, clearComparison }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
