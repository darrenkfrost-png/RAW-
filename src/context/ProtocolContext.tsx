import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';

interface ProtocolContextType {
  protocolItems: Product[];
  addToProtocol: (product: Product) => void;
  removeFromProtocol: (productId: number) => void;
  clearProtocol: () => void;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

export const ProtocolProvider = ({ children }: { children: React.ReactNode }) => {
  const [protocolItems, setProtocolItems] = useState<Product[]>([]);

  /* ⚠️ FUNCTIONAL UPDATES, ON PURPOSE. The previous version spread the
     protocolItems captured at render time, so four addToProtocol calls in
     one click handler kept only the LAST product: each call started from the
     same stale array. Every stack page and the builder hit this. */
  const addToProtocol = (product: Product) => {
    setProtocolItems(prev => prev.some(p => p.id === product.id) ? prev : [...prev, product]);
  };

  const removeFromProtocol = (productId: number) => {
    setProtocolItems(prev => prev.filter(p => p.id !== productId));
  };

  const clearProtocol = () => setProtocolItems([]);

  return (
    <ProtocolContext.Provider value={{ protocolItems, addToProtocol, removeFromProtocol, clearProtocol }}>
      {children}
    </ProtocolContext.Provider>
  );
};

export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (!context) throw new Error('useProtocol must be used within a ProtocolProvider');
  return context;
};
