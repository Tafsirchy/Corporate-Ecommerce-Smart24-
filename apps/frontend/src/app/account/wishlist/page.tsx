'use client';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth, apiClient } from '../../../context/AuthContext';
import { ProductCard } from '../../../components/ProductCard';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Store, Trash2 } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { user, logout } = useAuth();
  const { items, isInitialized, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'wishlist' | 'stores'>('wishlist');
  const [followedStores, setFollowedStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleCheckoutItem = (product: any) => {
    addToCart(product, quantities[product.id] || 1);
    toggleWishlist(product); // Remove from wishlist
    router.push('/checkout');
  };

  const handleCheckoutAll = () => {
    items.forEach(item => {
      if (item.product?.stock > 0) {
        addToCart(item.product, quantities[item.productId] || 1);
        toggleWishlist(item.product); // Remove from wishlist
      }
    });
    router.push('/checkout');
  };

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  useEffect(() => {
    if (user && activeTab === 'stores') {
      fetchFollowedStores();
    }
  }, [user, activeTab]);

  const fetchFollowedStores = async () => {
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

  const unfollowStore = async (brandId: string) => {
    try {
      await apiClient.delete(`/followed-brands/${brandId}/follow`);
      setFollowedStores(followedStores.filter(store => store.brandId !== brandId));
    } catch (e) {
      console.error('Failed to unfollow store', e);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-muted-foreground mb-6">Please login to view your wishlist.</p>
        <Link href="/login" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground">My Account</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="mb-6">
            <p className="text-muted-foreground text-sm mb-1">Hello, {user.phone || (user.email ? user.email.split('@')[0] : 'User')}</p>
            <div className="inline-flex items-center gap-1 bg-success-fill text-white text-xs font-semibold px-2 py-1 rounded-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Verified Account
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Link href="/account">
                <h3 className="text-[15px] font-semibold text-foreground mb-2 hover:text-primary/90 cursor-pointer">
                  Manage My Account
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li><Link href="/account/profile" className="text-muted-foreground hover:text-primary/90 text-[14px]">My Profile</Link></li>
                <li><Link href="/account/address" className="text-muted-foreground hover:text-primary/90 text-[14px]">Address Book</Link></li>
                <li><Link href="/account/payment" className="text-muted-foreground hover:text-primary/90 text-[14px]">My Payment Options</Link></li>
              </ul>
            </div>

            <div>
              <Link href="/account/orders">
                <h3 className="text-[15px] font-semibold text-foreground mb-2 hover:text-primary/90 cursor-pointer">
                  My Orders
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li><Link href="/account/returns" className="text-muted-foreground hover:text-primary/90 text-[14px]">My Returns</Link></li>
                <li><Link href="/account/cancellations" className="text-muted-foreground hover:text-primary/90 text-[14px]">My Cancellations</Link></li>
              </ul>
            </div>

            <div>
              <Link href="/account/reviews">
                <h3 className="text-[15px] font-semibold text-foreground hover:text-primary/90 cursor-pointer">
                  My Reviews
                </h3>
              </Link>
            </div>
            <div>
              <Link href="/account/wishlist">
                <h3 className="text-[15px] font-semibold text-primary/90 hover:text-primary-700 cursor-pointer">
                  My Wishlist & Followed Stores
                </h3>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <h2 className="text-[22px] text-foreground font-normal mb-6">My Wishlist & Followed Stores</h2>
          
          <div className="bg-white rounded-md shadow-sm border border-border">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
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

            <div className="p-4">
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
                      <div className="flex justify-between items-center bg-muted p-4 rounded-lg border border-border">
                        <span className="font-medium text-foreground">{items.length} items in wishlist</span>
                        <button 
                          onClick={() => handleCheckoutAll()}
                          className="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-medium shadow-sm"
                        >
                          Checkout All Items
                        </button>
                      </div>
                      
                      {items.map((item) => (
                        <div key={item.productId} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-border hover:border-primary-100 transition">
                          <div className="w-24 h-24 bg-muted border border-border rounded overflow-hidden flex-shrink-0 relative">
                            {item.product?.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover mix-blend-multiply" />
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
                              <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${item.product?.stock > 0 ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-destructive'}`}>
                                {item.product?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                              
                              {/* Quantity Adjuster */}
                              <div className="flex items-center gap-2 bg-muted rounded border border-border ml-4">
                                <button 
                                  onClick={() => updateQty(item.productId, -1)}
                                  disabled={item.product?.stock === 0}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-muted/80 transition text-muted-foreground disabled:opacity-50"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-sm font-medium">
                                  {quantities[item.productId] || 1}
                                </span>
                                <button 
                                  onClick={() => updateQty(item.productId, 1)}
                                  disabled={item.product?.stock === 0}
                                  className="w-7 h-7 flex items-center justify-center hover:bg-muted/80 transition text-muted-foreground disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:pl-6 sm:border-l border-border">
                            <button
                              onClick={() => handleCheckoutItem(item.product)}
                              disabled={item.product?.stock === 0}
                              className="w-full sm:w-auto px-8 py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed text-center"
                            >
                              Checkout
                            </button>
                            <button
                              onClick={() => toggleWishlist(item.product)}
                              className="text-sm text-muted-foreground hover:text-destructive transition font-medium flex items-center gap-1 mt-2"
                            >
                              <Trash2 size={14} /> Remove
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
                                <img src={store.brand.logoUrl} alt={store.brand.name} className="max-w-full max-h-full object-contain" />
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
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted border border-border rounded-md hover:bg-danger-bg hover:text-destructive hover:border-red-200 transition"
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
      </div>
    </div>
  );
}
