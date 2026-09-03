import React, { createContext, useContext, useState } from 'react';

export interface AIState {
  sourcePage?: string;
  currentProductId?: string | number;
  currentProductName?: string;
  currentProductCategory?: string;
  currentProductSummary?: string;
  selectedProtocolItems?: any[];
  comparedProducts?: any[];
  currentStackId?: string;
  currentStackName?: string;
  knowledgeEntryId?: string;
  activeFilters?: any;
  userQuery?: string;
  pageContext?: any;
}

interface AIContextProps {
  aiContext: AIState;
  setAIContext: React.Dispatch<React.SetStateAction<AIState>>;
  clearAIContext: () => void;
  updateAIContext: (newData: Partial<AIState>) => void;
}

const AIContext = createContext<AIContextProps | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aiContext, setAIContext] = useState<AIState>({});

  const clearAIContext = React.useCallback(() => setAIContext({}), []);
  
  const updateAIContext = React.useCallback((newData: Partial<AIState>) => {
    setAIContext(prev => {
      // Small optimization to prevent unnecessary renders if data hasn't changed. Note: a shallow compare.
      const hasChanged = Object.keys(newData).some(key => prev[key as keyof AIState] !== newData[key as keyof typeof newData]);
      if (!hasChanged) return prev;
      return { ...prev, ...newData };
    });
  }, []);

  return (
    <AIContext.Provider value={{ aiContext, setAIContext, clearAIContext, updateAIContext }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
};
