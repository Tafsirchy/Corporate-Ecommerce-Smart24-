'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useAuth, apiClient } from './AuthContext';
import { toast } from 'react-toastify';

export interface WishlistItem {
  productId: string;
  product?: any;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (product: any) => void;
  isInWishlist: (productId: string) => boolean;
  pendingItems: Record<string, boolean>;
  isInitialized: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingItems, setPendingItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const localItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
          if (localItems.length > 0) {
            await apiClient.post('/wishlist/merge', { 
              productIds: localItems.map((i: any) => i.productId)
            });
            localStorage.removeItem('wishlist');
          }
          const res = await apiClient.get('/wishlist');
          if (res.data?.items) {
            const serverItems = res.data.items.map((i: any) => ({
              productId: i.productId,
              product: i.product
            }));
            setItems(serverItems);
          }
        } catch (e: any) {
          if (e?.response?.status !== 401) {
            console.error("Failed to load server wishlist", e);
          }
        }
      } else {
        const localItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setItems(localItems);
      }
      setIsInitialized(true);
    };

    loadWishlist();
  }, [user]);

  useEffect(() => {
    if (isInitialized && !user) {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, user, isInitialized]);

  const isInWishlist = (productId: string) => items.some(item => item.productId === productId);

  const toggleWishlist = async (product: any) => {
    if (pendingItems[product.id]) return;

    const exists = isInWishlist(product.id);
    setPendingItems(prev => ({ ...prev, [product.id]: true }));
    
    // Optimistic UI
    const previousItems = [...items];
    if (exists) {
      setItems(prev => prev.filter(i => i.productId !== product.id));
    } else {
      setItems(prev => [...prev, { productId: product.id, product }]);
    }

    if (user) {
      try {
        if (exists) {
          await apiClient.delete(`/wishlist/items/${product.id}`);
        } else {
          await apiClient.post('/wishlist/items', { productId: product.id });
          toast.success(`${product.name} saved to wishlist`);
        }
      } catch (e: any) {
        setItems(previousItems);
        toast.error(e?.response?.data?.message || 'Failed to update wishlist');
      }
    } else {
      if (!exists) {
        toast.success(`${product.name} saved to wishlist`);
      }
    }

    setPendingItems(prev => ({ ...prev, [product.id]: false }));
  };

  const value = useMemo(() => ({
    items,
    toggleWishlist,
    isInWishlist,
    pendingItems,
    isInitialized
  }), [items, pendingItems, user, isInitialized]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
