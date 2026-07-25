'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAuth, apiClient } from './AuthContext';
import { toast } from 'react-toastify';

export interface CartItem {
  productId: string;
  quantity: number;
  product?: any;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  cartTotal: number;
  pendingItems: Record<string, boolean>;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingItems, setPendingItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadCart = async () => {
      try {
        // If there are local items left from old code, merge them
        const localItems = JSON.parse(localStorage.getItem('cart') || '[]');
        if (localItems.length > 0) {
          if (user) {
            await apiClient.post('/cart/merge', { 
              items: localItems.map((i: any) => ({ productId: i.productId, quantity: i.quantity }))
            });
            localStorage.removeItem('cart');
          }
        }
        
        const res = await apiClient.get('/cart');
        if (res.data?.items) {
          const serverItems = res.data.items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            product: i.product
          }));
          setItems(serverItems);
        }
      } catch (e: any) {
        if (e?.response?.status !== 401) {
          console.error("Failed to load server cart", e);
        }
      }
      setIsInitialized(true);
    };

    loadCart();
  }, [user]);

  const addToCart = async (product: any, quantity = 1) => {
    if (pendingItems[product.id]) return;

    setPendingItems(prev => ({ ...prev, [product.id]: true }));
    const existingIndex = items.findIndex(i => i.productId === product.id);
    const currentQty = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const newQty = currentQty + quantity;

    const previousItems = [...items];
    setItems(prev => {
      const newItems = [...prev];
      if (existingIndex >= 0) {
        newItems[existingIndex].quantity = newQty;
      } else {
        newItems.push({ productId: product.id, quantity: newQty, product });
      }
      return newItems;
    });

    try {
      await apiClient.post('/cart/items', { productId: product.id, quantity: newQty });
      toast.success(`${product.name} added to cart`);
    } catch (e: any) {
      setItems(previousItems);
      toast.error(e?.response?.data?.message || 'Failed to add to cart');
    }

    setPendingItems(prev => ({ ...prev, [product.id]: false }));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    
    const previousItems = [...items];
    setItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));

    try {
      await apiClient.post('/cart/items', { productId, quantity });
    } catch (e: any) {
      setItems(previousItems);
      toast.error(e?.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (productId: string) => {
    const previousItems = [...items];
    setItems(prev => prev.filter(item => item.productId !== productId));

    try {
      await apiClient.delete(`/cart/items/${productId}`);
    } catch (e: any) {
      setItems(previousItems);
      toast.error(e?.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const value = useMemo(() => ({
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    cartTotal,
    pendingItems,
    isInitialized
  }), [items, totalItems, cartTotal, pendingItems, user, isInitialized]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
