'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import Image from 'next/image';


import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, Heart, X, Loader2, Menu } from 'lucide-react';
import HeaderNav from '@/components/layout/HeaderNav';
import { CategoryDropdown } from '@/components/CategoryDropdown';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { apiClient, useAuth } from '@/context/AuthContext';
import { ScrollFade } from '@/components/ui/ScrollFade';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Header() {
  const { user, openAuthModal, logout } = useAuth();
  const pathname = usePathname();
  const isWishlistActive = pathname === '/wishlist' || pathname === '/account/wishlist';
  const isCartActive = pathname === '/cart';
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHome = pathname === '/';

  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalItems = useCartStore(state => state.totalItems());
  const wishlistItems = useWishlistStore(state => state.items);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Sync URL query to input when navigating
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation within dropdown
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedSearchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchFocused || liveResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < liveResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedProduct = liveResults[selectedIndex];
      setIsSearchFocused(false);
      router.push(`/shop/${selectedProduct.slug}`);
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  // Fetch live suggestions
  useEffect(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
      setLiveResults([]);
      return;
    }

    const fetchLiveResults = async () => {
      setIsSearching(true);
      try {
        const res = await apiClient.get(`/products/search?q=${encodeURIComponent(debouncedSearchQuery.trim())}&limit=5`);
        setLiveResults(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch live search results:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchLiveResults();
  }, [debouncedSearchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setLiveResults([]);
    document.getElementById('search-input')?.focus();
  };
  // --- End Search State ---

  const handleScroll = useCallback(() => {
    setIsVisible(true);
    setIsScrolled(window.scrollY > 10);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (window.scrollY > 50 && !isHovered && !isSearchFocused) {
        setIsVisible(false);
      }
    }, 1000);
  }, [isHovered, isSearchFocused]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (!isHovered && !isSearchFocused && window.scrollY > 50) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1200);
    } else {
      setIsVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isHovered, isSearchFocused]);

  const isTransparent = isHome && !isScrolled && !isHovered && !isSearchFocused;

  return (
    <>
      {!isHome && <div className="h-[116px] md:h-[124px] w-full shrink-0" />}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex flex-col transition-colors duration-300 ${
          isMobileMenuOpen ? 'bg-white' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Mobile Top Bar (Logo + Hamburger) - Hidden on MD */}
        <div className={`relative z-30 w-full flex md:hidden items-center justify-between px-4 py-2 transition-colors ${
          (isTransparent && !isMobileMenuOpen) ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md border-b border-border'
        }`}>
          <Link href="/" className="flex items-center">
             <Image src="/asset/Logo.png" alt="Smart24" width={150} height={50} priority unoptimized={true} className={`h-10 w-auto object-contain origin-left ${(isTransparent && !isMobileMenuOpen) ? 'brightness-0 invert' : ''}`} />
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className={`-mr-2 flex h-11 w-11 items-center justify-center ${(isTransparent && !isMobileMenuOpen) ? 'text-white' : 'text-foreground'}`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Search Bar */}
        <div className={`w-full py-2 z-20 transition-all duration-300 ease-in-out ${(isTransparent && !isMobileMenuOpen)
            ? 'bg-transparent border-transparent'
            : 'bg-white/90 backdrop-blur-md border-b border-border shadow-sm'
          } absolute top-full left-0 right-0 md:relative md:top-auto md:translate-y-0 md:opacity-100 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className="container mx-auto px-4 flex items-center justify-center gap-4">
            <div className="flex items-center w-full max-w-2xl gap-3">

              {/* Search Container */}
              <div ref={searchContainerRef} className="relative flex-1">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-sm">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${(isTransparent && !isMobileMenuOpen) ? 'text-white/80' : 'text-muted-foreground'}`} />
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for any product and similar products..."
                    className={`h-11 w-full pl-10 pr-24 text-base border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all rounded ${
                      (isTransparent && !isMobileMenuOpen)
                        ? 'bg-transparent border-white/40 text-white placeholder:text-white/80'
                        : 'bg-white border-border text-foreground'
                    }`}
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button type="button" onClick={clearSearch} aria-label="Clear search" className={`absolute right-24 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center transition ${
                      (isTransparent && !isMobileMenuOpen) ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-foreground'
                    }`}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 items-center px-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors rounded-sm">
                    Search
                  </button>
                </form>

                {/* Live Suggestions Dropdown */}
                {isSearchFocused && searchQuery.trim().length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-border overflow-hidden z-50">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span>Searching...</span>
                      </div>
                    ) : liveResults.length > 0 ? (
                      <ul>
                        {liveResults.map((product, index) => (
                          <li key={product.id}>
                            <Link
                              href={`/shop/${product.slug}`}
                              onClick={() => setIsSearchFocused(false)}
                              className={`flex items-center gap-3 p-3 transition border-b border-gray-50 last:border-0 ${index === selectedIndex ? 'bg-primary-50' : 'hover:bg-muted'
                                }`}
                            >
                              <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                {product.images?.[0] ? (
                                  <OptimizedImage src={product.images[0]} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">No img</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{product.category?.name || 'Uncategorized'}</p>
                              </div>
                              <div className="text-primary/90 font-semibold text-sm">
                                ৳{product.price.toLocaleString()}
                              </div>
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                            onClick={() => setIsSearchFocused(false)}
                            className="block text-center py-2 text-sm text-primary/90 font-medium hover:bg-primary/10 transition bg-muted"
                          >
                            View all results for "{searchQuery}"
                          </Link>
                        </li>
                      </ul>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>No products found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 ml-2">
                <Link href="/wishlist" aria-label={`Wishlist (${wishlistItems.length} items)`} className={`${isTransparent ? 'text-white hover:text-white/80' : (isWishlistActive ? 'text-primary' : 'text-foreground hover:text-primary/90')} transition-colors flex-shrink-0 relative flex h-11 w-11 items-center justify-center`}>
                  <Heart className={`w-5 h-5 ${isWishlistActive ? 'fill-current' : ''}`} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link href="/cart" aria-label={`Cart (${totalItems} items)`} className={`${isTransparent ? 'text-white hover:text-white/80' : (isCartActive ? 'text-primary' : 'text-foreground hover:text-primary/90')} transition-colors flex-shrink-0 relative flex h-11 w-11 items-center justify-center`}>
                  <ShoppingCart className={`w-5 h-5 ${isCartActive ? 'fill-current' : ''}`} />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navbar Row */}
        <div
          className={`hidden md:flex w-full absolute left-0 right-0 z-10 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            } ${isTransparent
              ? 'bg-transparent'
              : 'bg-white/90 backdrop-blur-md shadow-sm'
            }`}
          style={{ top: '100%' }}
        >
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-8 py-1">
              <a href="/" className="flex items-center">
                <Image src="/asset/Logo.png" alt="Smart24" width={200} height={80} priority unoptimized={true} className={`h-11 w-auto object-contain origin-left ${isTransparent ? 'brightness-0 invert' : ''}`} />
              </a>
              {!isHome && <CategoryDropdown isTransparent={isTransparent} />}
            </div>
            <HeaderNav isTransparent={isTransparent} />
          </div>
        </div>

        {/* Mobile Full-Screen Menu Drawer */}
        {isMobileMenuOpen && (
          <ScrollFade id="mobile-menu" aria-label="Mobile navigation" className="absolute top-full left-0 right-0 h-screen bg-white z-40 overflow-y-auto pb-[env(safe-area-inset-bottom)] md:hidden border-t border-border">
             <div className="flex flex-col px-4 py-6 gap-6 min-h-[calc(100vh-140px)] pb-12">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium border-b border-border/40 py-2.5 flex items-center">Home</Link>
                <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium border-b border-border/40 py-2.5 flex items-center">Shop</Link>
                <Link href="/subscriptions" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium border-b border-border/40 py-2.5 flex items-center">Subscriptions</Link>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium border-b border-border/40 py-2.5 flex items-center">About Us</Link>
                
                <details className="group border-b border-border/40 pb-3">
                  <summary className="text-lg font-medium flex justify-between items-center cursor-pointer list-none py-2 [&::-webkit-details-marker]:hidden">
                    Rewards
                    <span className="transition group-open:rotate-180">▾</span>
                  </summary>
                  <div className="flex flex-col gap-3 mt-4 pl-4 border-l-2 border-primary/20">
                    <Link href="/account/membership" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">My Membership</Link>
                    <Link href="/account/rewards" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">Reward Marketplace</Link>
                    <Link href="/account/points-history" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">Points History</Link>
                  </div>
                </details>

                <details className="group border-b border-border/40 pb-3">
                  <summary className="text-lg font-medium flex justify-between items-center cursor-pointer list-none py-2 [&::-webkit-details-marker]:hidden">
                    Support
                    <span className="transition group-open:rotate-180">▾</span>
                  </summary>
                  <div className="flex flex-col gap-3 mt-4 pl-4 border-l-2 border-primary/20">
                    <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">Help Center Hub</Link>
                    <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">Track an Order</Link>
                    <Link href="/support/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">Contact Us</Link>
                    <Link href="/support/faq" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">FAQs</Link>
                  </div>
                </details>

                {user && (
                  <details className="group border-b border-border/40 pb-3">
                    <summary className="text-lg font-medium flex justify-between items-center cursor-pointer list-none py-2 [&::-webkit-details-marker]:hidden">
                      Account
                      <span className="transition group-open:rotate-180">▾</span>
                    </summary>
                    <div className="flex flex-col gap-3 mt-4 pl-4 border-l-2 border-primary/20">
                      <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">Manage My Account</Link>
                      <Link href="/account/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">My Profile</Link>
                      <Link href="/account/address" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">Address Book</Link>
                      <Link href="/account/payment" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">My Payment Options</Link>
                      <Link href="/account/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">My Orders</Link>
                      <Link href="/account/returns" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">My Returns</Link>
                      <Link href="/account/cancellations" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">My Cancellations</Link>
                      <Link href="/account/reviews" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">My Reviews</Link>
                      <Link href="/account/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-base text-muted-foreground hover:text-primary flex items-center min-h-11">My Wishlist & Followed Stores</Link>
                    </div>
                  </details>
                )}
                
                <div className="mt-auto pt-6 flex flex-col gap-3">
                  {user ? (
                    <>
                      {user.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-center font-bold text-lg hover:bg-black transition-colors shadow-sm">
                          Go to Admin Portal
                        </Link>
                      )}
                      {user.role === 'BUSINESS' && (
                        <Link href="/business" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3.5 bg-[#FF6E00] text-white rounded-xl text-center font-bold text-lg hover:opacity-90 transition-opacity shadow-sm">
                          Go to B2B Portal
                        </Link>
                      )}
                      <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3.5 bg-primary-600 text-white rounded-xl text-center font-bold text-lg hover:bg-primary-700 transition-colors shadow-sm">
                        Go to My Account Dashboard
                      </Link>
                      <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="w-full py-3.5 border-2 border-red-100 text-red-600 bg-red-50 rounded-xl text-center font-bold text-lg hover:bg-red-100 transition-colors shadow-sm">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => { setIsMobileMenuOpen(false); openAuthModal('login'); }} className="w-full py-3.5 border-2 border-primary-600 text-primary-600 rounded-xl text-center font-bold text-lg hover:bg-primary-50 transition-colors">
                        Sign In
                      </button>
                      <button onClick={() => { setIsMobileMenuOpen(false); openAuthModal('signup'); }} className="w-full py-3.5 bg-primary-600 text-white rounded-xl text-center font-bold text-lg hover:bg-primary-700 transition-colors shadow-sm">
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
             </div>
          </ScrollFade>
        )}
      </header>
    </>
  );
}
