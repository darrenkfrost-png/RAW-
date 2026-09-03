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

  const addToProtocol = (product: Product) => {
    if (!protocolItems.find(p => p.id === product.id)) {
      setProtocolItems([...protocolItems, product]);
    }
  };

  const removeFromProtocol = (productId: number) => {
    setProtocolItems(protocolItems.filter(p => p.id !== productId));
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
