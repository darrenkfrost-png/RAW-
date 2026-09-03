import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useAIContext } from '../context/AIContext';

const MODULE_METADATA: Record<string, Partial<{ title: string; description: string; category: string; availableActions: string[] }>> = {
  '/': {
    title: 'Knowledge Core Dashboard',
    description: 'The main dashboard overview showing quick actions, telemetry, and system status.',
    category: 'Dashboard',
    availableActions: ['scan_system', 'open_advisor', 'view_diagnostics']
  },
  '/shop': {
    title: 'Raw Equipment & Nutrition',
    description: 'Browse all available products, equipment, and supplements.',
    category: 'Shopping',
    availableActions: ['view_product', 'add_to_cart', 'filter_products']
  },
  '/gallery': {
    title: 'Product Gallery',
    description: 'Visual gallery of all equipment and supplements.',
    category: 'Media',
    availableActions: ['view_product_details', 'open_quick_view']
  },
  '/protocol-builder': {
    title: 'Protocol Builder',
    description: 'Create customized biological and physical protocols.',
    category: 'Tools',
    availableActions: ['add_item_to_protocol', 'save_protocol', 'view_protocol_summary']
  },
  '/performance-system': {
    title: 'Performance System',
    description: 'Overview of the cohesive performance protocols and system structure.',
    category: 'Information',
    availableActions: ['read_documentation', 'view_protocols']
  },
  // Add other known routes generically
};

export const PageContextBridge: React.FC = () => {
  const location = useLocation();
  const { 
    isWallpaperMode, isAIChatOpen, focusedProduct, activeReaderItem,
    isGlobalSettingsOpen, isWallpaperSettingsOpen
  } = useUI();
  const { updateAIContext } = useAIContext();

  const currentModule = useMemo(() => {
    // Attempt matched metadata
    let path = location.pathname;
    // Normalize path for lookup
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    // Match product detail
    if (path.startsWith('/product/')) {
      return {
        title: 'Product Details',
        description: `Detailed view for product ID: ${path.split('/')[2]}`,
        category: 'Shopping',
        availableActions: ['add_to_cart', 'compare_product', 'read_ingredients']
      };
    }
    
    const meta = MODULE_METADATA[path];
    if (meta) return meta;

    // Fallback
    return {
      title: path === '/' ? 'Home' : path.slice(1).replace('-', ' ').toUpperCase(),
      description: 'User is viewing this application area.',
      category: 'General',
      availableActions: []
    };
  }, [location.pathname]);

  useEffect(() => {
    // Construct the context snapshot
    const pageContext = {
      route: location.pathname,
      moduleTitle: currentModule.title,
      moduleDescription: currentModule.description,
      moduleCategory: currentModule.category,
      availableActions: currentModule.availableActions || [],
      wallpaperModeActive: isWallpaperMode,
      aiChatOpen: isAIChatOpen,
      focusedProduct: focusedProduct ? focusedProduct.name : null,
      activeReaderItem: activeReaderItem ? activeReaderItem.title || activeReaderItem.name : null,
      settingsActive: isGlobalSettingsOpen || isWallpaperSettingsOpen,
      timestamp: new Date().toISOString()
    };

    updateAIContext({ pageContext });
  }, [
    currentModule, 
    location.pathname, 
    isWallpaperMode, 
    isAIChatOpen, 
    focusedProduct, 
    activeReaderItem, 
    isGlobalSettingsOpen, 
    isWallpaperSettingsOpen,
    updateAIContext
  ]);

  // This is a logic-only bridge component
  return null;
};

export default PageContextBridge;