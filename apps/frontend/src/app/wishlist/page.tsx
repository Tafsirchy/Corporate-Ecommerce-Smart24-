'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState } from 'react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const items = useWishlistStore(state => state.items);
  const isInitialized = useWishlistStore(state => state.isInitialized);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const addToCart = useCartStore(state => state.addToCart);
  const { user } = useAuth();
  const router = useRouter();

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleCheckoutItem = (product: any) => {
    addToCart(product, quantities[product.id] || 1);
    toggleWishlist(product, !!user); // Remove from wishlist
    router.push('/checkout');
  };

  const handleCheckoutAll = () => {
    items.forEach(item => {
      if ((item.product?.stock ?? 0) > 0) {
        addToCart(item.product, quantities[item.productId] || 1);
        toggleWishlist(item.product, !!user); // Remove from wishlist
      }
    });
    router.push('/checkout');
  };

  const updateQty = (id: string, delta: number, max: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.min(Math.max(1, (prev[id] || 1) + delta), max)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      
      {!isInitialized ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden h-32 animate-pulse flex">
              <div className="bg-muted/80 h-full w-32"></div>
              <div className="p-4 flex-1 space-y-3">
                <div className="h-4 bg-muted/80 rounded w-1/3"></div>
                <div className="h-4 bg-muted/80 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-border">
          <p className="text-xl text-muted-foreground mb-6">Your wishlist is empty.</p>
          <Link href="/shop" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-muted p-4 rounded-lg border border-border">
            <span className="font-medium text-foreground text-center sm:text-left">{items.length} items in wishlist</span>
            <button 
              onClick={() => handleCheckoutAll()}
              className="w-full sm:w-auto flex min-h-[44px] items-center justify-center px-5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-medium shadow-sm text-base"
            >
              Checkout All Items
            </button>
          </div>
          
          {items.map((item) => (
            <div key={item.productId} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-border hover:border-primary-100 transition">
              <div className="w-24 h-24 bg-muted border border-border rounded overflow-hidden flex-shrink-0 relative">
                {item.product?.images?.[0] ? (
                  <OptimizedImage src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover mix-blend-multiply" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                )}
                <Link href={`/shop/${item.product?.slug}`} className="absolute inset-0 z-10 block"></Link>
              </div>
              
              <div className="flex-1 w-full flex flex-col justify-between py-1 h-full min-w-0">
                <div>
                  <Link href={`/shop/${item.product?.slug}`} className="text-lg font-medium text-foreground hover:text-primary/90 line-clamp-1">
                    {item.product?.name}
                  </Link>
                  {item.product?.category && (
                    <p className="text-sm text-muted-foreground mt-1">{item.product.category.name}</p>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-start gap-6">
                  <span className="text-xl font-bold text-primary/90">৳{item.product?.price?.toLocaleString() || 0}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${(item.product?.stock ?? 0) > 0 ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-destructive'}`}>
                    {(item.product?.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                  
                  {/* Quantity Adjuster */}
                  <div className="flex items-center gap-2 bg-muted rounded border border-border ml-4">
                    <button 
                      onClick={() => updateQty(item.productId, -1, item.product?.stock ?? 1)}
                      disabled={(item.product?.stock ?? 0) === 0 || (quantities[item.productId] || 1) <= 1}
                      className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center hover:bg-muted/80 transition text-muted-foreground disabled:opacity-50 text-lg md:text-base"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-base md:text-sm font-medium">
                      {quantities[item.productId] || 1}
                    </span>
                    <button 
                      onClick={() => updateQty(item.productId, 1, item.product?.stock ?? 1)}
                      disabled={(item.product?.stock ?? 0) === 0 || (quantities[item.productId] || 1) >= (item.product?.stock ?? 0)}
                      className="w-11 h-11 md:w-8 md:h-8 flex items-center justify-center hover:bg-muted/80 transition text-muted-foreground disabled:opacity-50 text-lg md:text-base"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:pl-6 sm:border-l border-border">
                <button
                  onClick={() => handleCheckoutItem(item.product)}
                  disabled={(item.product?.stock ?? 0) === 0}
                  className="w-full sm:w-auto px-8 flex min-h-[44px] items-center justify-center bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                  Checkout
                </button>
                <button
                  onClick={() => toggleWishlist(item.product, !!user)}
                  className="text-sm text-muted-foreground hover:text-destructive transition font-medium flex items-center gap-1 mt-2 p-2 -m-2"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
