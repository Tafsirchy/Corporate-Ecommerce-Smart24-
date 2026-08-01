'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export function StoreInitializer() {
  const { user, loading } = useAuth();
  const loadCart = useCartStore(state => state.loadCart);
  const loadWishlist = useWishlistStore(state => state.loadWishlist);

  useEffect(() => {
    if (!loading) {
      const isAuthenticated = !!user;
      loadCart(isAuthenticated);
      loadWishlist(isAuthenticated);
    }
  }, [user, loading, loadCart, loadWishlist]);

  return null;
}
