import React, { createContext, useContext, useState, useEffect } from "react";
import { allProducts } from "../data/products";

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * ⚠️ THE RESEARCH LIST DID NOT SURVIVE A PAGE LOAD.
 *
 * It lived in React state and nowhere else, so a reload, a shared link, or a
 * tap on the browser's back button emptied it. That was always poor; now it is
 * worse, because the list is no longer a basket that leads to a till on this
 * site. It is the shortlist a visitor builds while reading, carries to the
 * official store, and buys from there. Losing it between those two steps loses
 * the whole purpose of the page.
 *
 * ⚠️ IT STORES IDS AND QUANTITIES, NEVER NAMES OR PRICES.
 *
 * A price written into a browser months ago would come back as though it were
 * today's, and the visitor would carry a number to the real shop that the real
 * shop does not agree with. So only the id and the quantity are kept, and
 * every detail is resolved from the live catalogue on the way back in. A
 * product that has since been withdrawn simply does not return.
 */
const KEY = "raw_research_list";

type StoredLine = { id: number; quantity: number };

const readStored = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const lines: StoredLine[] = JSON.parse(raw);
    if (!Array.isArray(lines)) return [];
    return lines
      .map(({ id, quantity }) => {
        const product = allProducts.find((p: any) => p.id === id);
        if (!product) return null; // withdrawn since it was saved
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: Math.max(1, Math.min(99, Number(quantity) || 1)),
        } as CartItem;
      })
      .filter(Boolean) as CartItem[];
  } catch {
    return []; // private mode, quota, or something else wrote nonsense here
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStored);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const lines: StoredLine[] = items.map(({ id, quantity }) => ({ id, quantity }));
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* Storage refused (private mode, full). The list still works for this
         visit; it just will not be here next time. Nothing to tell the
         visitor about, and nothing worth throwing for. */
    }
  }, [items]);

  const addToCart = (product: any, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const cartTotal = items.reduce((total, item) => {
    const price = parseFloat(String(item.price).replace("£", ""));
    return total + (Number.isFinite(price) ? price * item.quantity : 0);
  }, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
