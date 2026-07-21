'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, apiClient } from './AuthContext';
import { toast } from 'react-toastify';

export interface CartItem {
  productId: string;
  quantity: number;
  product?: any; // To store populated details like name, price, images
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart on mount or auth change
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          // If we had local items, merge them first
          const localItems = JSON.parse(localStorage.getItem('cart') || '[]');
          if (localItems.length > 0) {
            await apiClient.post('/cart/merge', { 
              items: localItems.map((i: any) => ({ productId: i.productId, quantity: i.quantity }))
            });
            localStorage.removeItem('cart');
          }
          // Fetch server cart
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
      } else {
        // Load local cart
        const localItems = JSON.parse(localStorage.getItem('cart') || '[]');
        setItems(localItems);
      }
      setIsInitialized(true);
    };

    loadCart();
  }, [user]);

  // Save to local storage when unauthenticated and items change
  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, user, isInitialized]);

  const addToCart = async (product: any, quantity = 1) => {
    const existingIndex = items.findIndex(i => i.productId === product.id);
    const currentQty = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const newQty = currentQty + quantity;

    if (user) {
      try {
        await apiClient.post('/cart/items', { productId: product.id, quantity: newQty });
        toast.success(`${product.name} added to cart`);
      } catch (e) {
        toast.error('Failed to add to cart');
        return;
      }
    } else {
      toast.success(`${product.name} added to cart`);
    }

    setItems(prev => {
      const newItems = [...prev];
      if (existingIndex >= 0) {
        newItems[existingIndex].quantity = newQty;
      } else {
        newItems.push({ productId: product.id, quantity: newQty, product });
      }
      return newItems;
    });
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    
    if (user) {
      try {
        await apiClient.post('/cart/items', { productId, quantity });
      } catch (e) {
        toast.error('Failed to update quantity');
        return;
      }
    }

    setItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
      try {
        await apiClient.delete(`/cart/items/${productId}`);
      } catch (e) {
        toast.error('Failed to remove item');
        return;
      }
    }

    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    if (!user) localStorage.removeItem('cart');
    // Note: server cart clearing is usually handled by order placement
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, cartTotal }}>
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
