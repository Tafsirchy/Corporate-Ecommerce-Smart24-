'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, Heart, X, Loader2 } from 'lucide-react';
import HeaderNav from '@/components/layout/HeaderNav';
import { CategoryDropdown } from '@/components/CategoryDropdown';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { apiClient } from '@/context/AuthContext';

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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHome = pathname === '/';

  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
      if (window.scrollY > 50 && !isHovered) {
        setIsVisible(false);
      }
    }, 1000);
  }, [isHovered]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (!isHovered && window.scrollY > 50) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1200);
    } else {
      setIsVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isHovered]);

  const isTransparent = isHome && !isScrolled && !isHovered;

  return (
    <>
      {!isHome && <div className="h-[105px] w-full" />} 
      <header 
        className="fixed top-0 left-0 right-0 z-50 flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Search Bar */}
        <div className={`w-full py-3 relative z-20 transition-all duration-300 ${
          isTransparent 
            ? 'bg-transparent border-transparent' 
            : 'bg-white/90 backdrop-blur-md border-b border-border shadow-sm'
        }`}>
          <div className="container mx-auto px-4 flex items-center justify-center gap-4">
            <div className="flex items-center w-full max-w-2xl gap-3">
              
              {/* Search Container */}
              <div ref={searchContainerRef} className="relative flex-1">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    id="search-input"
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for any product and similar products..." 
                    className="w-full pl-10 pr-24 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white rounded"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button type="button" onClick={clearSearch} className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-muted-foreground transition">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors rounded-sm">
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
                              className={`flex items-center gap-3 p-3 transition border-b border-gray-50 last:border-0 ${
                                index === selectedIndex ? 'bg-primary-50' : 'hover:bg-muted'
                              }`}
                            >
                              <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                {product.images?.[0] ? (
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
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
                <Link href="/wishlist" className={`${isTransparent ? 'text-white hover:text-white/80' : 'text-foreground hover:text-primary/90'} transition-colors flex-shrink-0 relative`}>
                  <Heart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className={`${isTransparent ? 'text-white hover:text-white/80' : 'text-foreground hover:text-primary/90'} transition-colors flex-shrink-0 relative`}>
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <div 
          className={`w-full absolute left-0 right-0 z-10 transition-all duration-300 ease-in-out ${
            isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          } ${
            isTransparent
              ? 'bg-transparent'
              : 'bg-white/90 backdrop-blur-md shadow-sm'
          }`}
          style={{ top: '100%' }}
        >
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center">
                <img src="/asset/Logo.png" alt="Smart24" className={`h-16 w-auto object-contain scale-[1.35] origin-left ${isTransparent ? 'brightness-0 invert' : ''}`} />
              </a>
              {!isHome && <CategoryDropdown isTransparent={isTransparent} />}
            </div>
            <HeaderNav isTransparent={isTransparent} />
          </div>
        </div>
      </header>
    </>
  );
}
