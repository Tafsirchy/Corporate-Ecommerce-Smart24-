'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

// Helper component for Debounced Quantity Input
function QuantityAdjuster({ 
  productId, 
  initialQuantity, 
  maxStock,
  onUpdate 
}: { 
  productId: string, 
  initialQuantity: number, 
  maxStock?: number,
  onUpdate: (id: string, qty: number) => void 
}) {
  const [qty, setQty] = useState(initialQuantity);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state if context changes externally
  useEffect(() => {
    setQty(initialQuantity);
  }, [initialQuantity]);

  const changeQty = (newQty: number) => {
    let finalQty = Math.max(1, newQty);
    if (maxStock !== undefined) {
      finalQty = Math.min(finalQty, maxStock);
    }
    setQty(finalQty);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onUpdate(productId, finalQty);
    }, 500);
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={() => changeQty(qty - 1)}
        disabled={qty <= 1}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
      >
        -
      </button>
      <span className="w-8 text-center">{qty}</span>
      <button 
        onClick={() => changeQty(qty + 1)}
        disabled={maxStock !== undefined && qty >= maxStock}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}

export default function CartPage() {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const cartTotal = useCartStore(state => state.cartTotal());
  const isInitialized = useCartStore(state => state.isInitialized);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);
  const { user } = useAuth();

  const handleSaveForLater = useCallback(async (item: any) => {
    if (!isInWishlist(item.productId)) {
      toggleWishlist(item.product, !!user);
    }
    removeFromCart(item.productId);
  }, [toggleWishlist, isInWishlist, removeFromCart]);

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {!isInitialized ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="bg-white p-4 rounded-lg shadow animate-pulse flex gap-4 h-32">
              <div className="w-24 h-24 bg-muted/80 rounded"></div>
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-4 bg-muted/80 rounded w-1/3"></div>
                <div className="h-3 bg-muted/80 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-border">
          <p className="text-xl text-muted-foreground mb-6">Your cart is empty.</p>
          <Link href="/shop" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-border">
                <div className="w-24 h-24 bg-muted border border-border rounded overflow-hidden flex-shrink-0 relative group">
                  {item.product?.images?.[0] ? (
                    <OptimizedImage src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover mix-blend-multiply" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                  )}
                  <Link href={`/shop/${item.product?.slug}`} className="absolute inset-0 z-10 block"></Link>
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1 h-full">
                  <div>
                    <Link href={`/shop/${item.product?.slug}`} className="hover:text-primary/90">
                      <h3 className="font-semibold text-base line-clamp-2">{item.product?.name || 'Loading...'}</h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mt-1">৳{(item.product?.price || 0).toLocaleString()}</p>
                  </div>
                  
                  <div className="mt-3">
                    <QuantityAdjuster 
                      productId={item.productId} 
                      initialQuantity={item.quantity} 
                      maxStock={item.product?.stock}
                      onUpdate={updateQuantity} 
                    />
                  </div>
                </div>
                
                <div className="text-right flex flex-col justify-between items-end h-full py-1 min-w-[80px]">
                  <p className="font-bold text-lg text-primary/90">৳{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                  
                  <div className="flex flex-col items-end gap-1 mt-auto">
                    <button 
                      onClick={() => handleSaveForLater(item)}
                      className="text-muted-foreground text-xs font-medium hover:text-primary/90 transition"
                    >
                      Save for later
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="text-destructive text-xs font-medium hover:underline transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-border h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">৳{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-sm text-muted-foreground">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary/90">৳{cartTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout"
              className="w-full block text-center bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition shadow-sm"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
