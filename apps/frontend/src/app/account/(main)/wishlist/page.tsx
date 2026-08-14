'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuth, apiClient } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Store, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { user, logout, openAuthModal } = useAuth();
  const items = useWishlistStore(state => state.items);
  const isInitialized = useWishlistStore(state => state.isInitialized);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const addToCart = useCartStore(state => state.addToCart);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'wishlist' | 'stores'>('wishlist');
  const [followedStores, setFollowedStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);

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

  useEffect(() => {
    if (user && activeTab === 'stores') {
      fetchFollowedStores();
    }
  }, [user, activeTab]);

  async function fetchFollowedStores() {
    try {
      setLoadingStores(true);
      const res = await apiClient.get('/followed-brands/me');
      setFollowedStores(res.data);
    } catch (e) {
      console.error('Failed to fetch followed stores', e);
    } finally {
      setLoadingStores(false);
    }
  };

  async function unfollowStore(brandId: string) {
    try {
      await apiClient.delete(`/followed-brands/${brandId}/follow`);
      setFollowedStores(followedStores.filter(store => store.brandId !== brandId));
    } catch (e) {
      console.error('Failed to unfollow store', e);
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, target: 'wishlist' | 'stores') => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = target === 'wishlist' ? 'stores' : 'wishlist';
    setActiveTab(next);
    document.getElementById(`wishlist-tab-${next}`)?.focus();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-muted-foreground mb-6">Please login to view your wishlist.</p>
        <button onClick={() => openAuthModal('login')} className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">
          Sign In to Wishlist
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Main Content Area */}
      <div className="w-full">
          <h2 className="text-[22px] text-foreground font-normal mb-6">My Wishlist & Followed Stores</h2>
          
          <div className="bg-white rounded-md shadow-sm border border-border">
            {/* Tabs */}
            <div role="tablist" aria-label="Wishlist filters" className="flex border-b border-border">
              <button
                id="wishlist-tab-wishlist"
                role="tab"
                aria-selected={activeTab === 'wishlist'}
                aria-controls="wishlist-panel"
                onKeyDown={(e) => handleTabKeyDown(e, 'wishlist')}
                className={`flex-1 py-4 text-[15px] font-medium text-center transition-colors ${
                  activeTab === 'wishlist'
                    ? 'text-primary/90 border-b-2 border-primary-600'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setActiveTab('wishlist')}
              >
                My Wishlist
                {items.length > 0 && (
                  <span className="ml-2 bg-primary-100 text-primary-700 py-0.5 px-2 rounded-full text-[12px]">
                    {items.length}
                  </span>
                )}
              </button>
              <button
                id="wishlist-tab-stores"
                role="tab"
                aria-selected={activeTab === 'stores'}
                aria-controls="wishlist-panel"
                onKeyDown={(e) => handleTabKeyDown(e, 'stores')}
                className={`flex-1 py-4 text-[15px] font-medium text-center transition-colors ${
                  activeTab === 'stores'
                    ? 'text-primary/90 border-b-2 border-primary-600'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setActiveTab('stores')}
              >
                Followed Stores
              </button>
            </div>

            <div id="wishlist-panel" className="p-4">
              {activeTab === 'wishlist' ? (
                // Wishlist Tab Content
                <div>
                  {!isInitialized ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-muted rounded-xl shadow-sm border border-border overflow-hidden h-[360px] animate-pulse">
                          <div className="bg-muted/80 h-48 w-full"></div>
                          <div className="p-4 space-y-3">
                            <div className="h-4 bg-muted/80 rounded w-3/4"></div>
                            <div className="h-4 bg-muted/80 rounded w-1/2"></div>
                            <div className="h-8 bg-muted/80 rounded mt-4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-lg text-muted-foreground mb-6">Your wishlist is empty.</p>
                      <Link href="/shop" className="px-6 py-2.5 bg-primary-600 text-white rounded hover:bg-primary-700 transition font-medium">
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-2 bg-muted p-4 rounded-lg border border-border">
                        <span className="font-medium text-foreground">{items.length} items in wishlist</span>
                        <button 
                          onClick={() => handleCheckoutAll()}
                          className="flex min-h-11 items-center px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-medium text-base shadow-sm"
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
                              <Link href={`/shop/${item.product?.slug}`} className="text-base font-medium text-foreground hover:text-primary/90 line-clamp-1">
                                {item.product?.name}
                              </Link>
                              {item.product?.category && (
                                <p className="text-sm text-muted-foreground mt-1">{item.product.category.name}</p>
                              )}
                            </div>
                            <div className="mt-2 flex items-center justify-start gap-6">
                              <span className="text-xl font-bold text-primary/90">৳{item.product?.price?.toLocaleString() || 0}</span>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${(item.product?.stock ?? 0) > 0 ? 'bg-success-bg text-success-text' : 'bg-destructive-bg text-destructive-text'}`}>
                                {(item.product?.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                              
                              {/* Quantity Adjuster */}
                              <div className="flex items-center gap-2 bg-muted rounded border border-border ml-4">
                                <button 
                                  onClick={() => updateQty(item.productId, -1, item.product?.stock ?? 1)}
                                  disabled={(item.product?.stock ?? 0) === 0 || (quantities[item.productId] || 1) <= 1}
                                  aria-label="Decrease quantity"
                                  className="w-11 h-11 flex items-center justify-center hover:bg-muted/80 transition text-muted-foreground disabled:opacity-50"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-base font-medium">
                                  {quantities[item.productId] || 1}
                                </span>
                                <button 
                                  onClick={() => updateQty(item.productId, 1, item.product?.stock ?? 1)}
                                  disabled={(item.product?.stock ?? 0) === 0 || (quantities[item.productId] || 1) >= (item.product?.stock ?? 0)}
                                  aria-label="Increase quantity"
                                  className="w-11 h-11 flex items-center justify-center hover:bg-muted/80 transition text-muted-foreground disabled:opacity-50"
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
                              className="flex min-h-11 w-full items-center justify-center px-8 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed text-center sm:w-auto"
                            >
                              Checkout
                            </button>
                            <button
                              onClick={() => toggleWishlist(item.product, !!user)}
                              className="flex min-h-11 items-center justify-center gap-1 px-3 text-base text-muted-foreground hover:text-destructive transition font-medium"
                            >
                              <Trash2 size={16} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Followed Stores Tab Content
                <div>
                  {loadingStores ? (
                    <div className="py-12 text-center text-muted-foreground">Loading your followed stores...</div>
                  ) : followedStores.length === 0 ? (
                    <div className="text-center py-12">
                      <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground mb-6">You are not following any stores yet.</p>
                      <Link href="/shop" className="px-6 py-2.5 bg-primary-600 text-white rounded hover:bg-primary-700 transition font-medium">
                        Explore Brands
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {followedStores.map((store) => (
                        <div key={store.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary-100 transition">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-muted rounded-full border border-border p-2 flex items-center justify-center flex-shrink-0">
                              {store.brand.logoUrl ? (
                                <OptimizedImage src={store.brand.logoUrl} alt={store.brand.name} className="max-w-full max-h-full object-contain" />
                              ) : (
                                <Store className="w-8 h-8 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <Link href={`/brands/${store.brand.slug}`} className="text-lg font-medium text-foreground hover:text-primary/90 transition">
                                {store.brand.name}
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">Followed since {new Date(store.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => unfollowStore(store.brandId)}
                            className="flex min-h-11 items-center gap-2 px-4 text-base font-medium text-foreground bg-muted border border-border rounded-md hover:bg-danger-bg hover:text-destructive hover:border-red-200 transition"
                          >
                            <Trash2 size={16} />
                            <span>Unfollow</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
    </div>
      </div>
    </>
  );
}
