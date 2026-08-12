'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronUp, Flame, LayoutGrid, User } from 'lucide-react';

export default function StickySidebar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.05)] rounded-l-lg border border-r-0 border-border overflow-hidden transition-all duration-300">
      
      {/* Scroll to Top */}
      <button 
        onClick={scrollToTop}
        className="p-3 text-muted-foreground hover:text-primary/90 hover:bg-muted flex flex-col items-center justify-center border-b border-border group transition-colors"
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
      </button>

      {/* Flash Sale / Hot Deals */}
      <Link 
        href="/#flash-sale"
        className="p-3 text-muted-foreground hover:text-accent hover:bg-accent/10 flex flex-col items-center justify-center border-b border-border transition-colors"
        title="Flash Sale"
      >
        <Flame size={22} />
      </Link>

      {/* Categories */}
      <Link 
        href="/#categories"
        className="p-3 text-muted-foreground hover:text-info-text hover:bg-info-bg flex flex-col items-center justify-center border-b border-border transition-colors"
        title="Categories"
      >
        <LayoutGrid size={22} />
      </Link>

      {/* Account / Profile Icon */}
      <Link 
        href="/account"
        className="p-3 text-muted-foreground hover:text-primary/90 hover:bg-primary/10 flex flex-col items-center justify-center transition-colors"
        title="Account"
      >
        <User size={22} />
      </Link>

    </div>
  );
}
