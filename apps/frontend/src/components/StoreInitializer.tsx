'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export function StoreInitializer() {
  const { user, loading } = useAuth();
  const loadCart = useCartStore(state => state.loadCart);
  const loadWishlist = useWishlistStore(state => state.loadWishlist);
  const lastAuthRef = useRef<boolean | null>(null);

  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
    if (loading && !hasToken) return;

    const isAuthenticated = !!user || hasToken;
    if (lastAuthRef.current === isAuthenticated) return;
    lastAuthRef.current = isAuthenticated;

    loadCart(isAuthenticated);
    loadWishlist(isAuthenticated);
  }, [user, loading, loadCart, loadWishlist]);

  return null;
}
