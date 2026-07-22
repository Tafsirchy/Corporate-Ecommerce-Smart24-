'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingCart, Heart } from 'lucide-react';
import HeaderNav from './HeaderNav';
import { CategoryDropdown } from './CategoryDropdown';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

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
    }, 1500); // Hide after 1.5 seconds of no scrolling
  }, [isHovered]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleScroll]);

  // Handle visibility based on hover state if we are scrolled down
  useEffect(() => {
    if (!isHovered && window.scrollY > 50) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    } else {
      setIsVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isHovered]);

  const isTransparent = isHome && !isScrolled && !isHovered;

  return (
    <>
      {/* Spacer to prevent layout shift when header becomes fixed, omitted on Home for transparent overlay */}
      {!isHome && <div className="h-[105px] w-full" />} 
      <header 
        className="fixed top-0 left-0 right-0 z-50 flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Search Bar */}
        <div className={`w-full py-1.5 relative z-20 transition-all duration-300 ${
          isTransparent 
            ? 'bg-transparent border-transparent' 
            : 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm'
        }`}>
          <div className="container mx-auto px-4 flex items-center justify-center gap-4">
            <div className="flex items-center w-full max-w-2xl gap-3">
              <form action="/search" className="relative flex-1 flex items-center shadow-sm">
                <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  name="q"
                  placeholder="Search for any product and similar products..." 
                  className="w-full pl-10 pr-24 py-2 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white rounded"
                />
                <button type="submit" className="absolute right-1 px-3 py-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors rounded-sm">
                  Search
                </button>
              </form>
              <div className="flex items-center gap-4 ml-2">
                <Link href="/wishlist" className={`${isTransparent ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-primary-600'} transition-colors flex-shrink-0 relative`}>
                  <Heart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className={`${isTransparent ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-primary-600'} transition-colors flex-shrink-0 relative`}>
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

        {/* Navbar - Hides on scroll */}
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
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <a href="/" className={`text-xl font-bold tracking-tight ${isTransparent ? 'text-white' : 'text-gray-900'}`}>Smart24</a>
              {pathname === '/shop' && <CategoryDropdown isTransparent={isTransparent} />}
            </div>
            <HeaderNav isTransparent={isTransparent} />
          </div>
        </div>
      </header>
    </>
  );
}
