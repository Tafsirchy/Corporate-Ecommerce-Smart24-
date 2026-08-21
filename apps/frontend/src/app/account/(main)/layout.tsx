'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function MainAccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false);
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', onKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isMobileMenuOpen]);

  if (loading || !user) return null; // handled by parent layout

  const getPageTitle = () => {
    if (pathname === '/account/profile') return 'My Profile';
    if (pathname === '/account/address') return 'Address Book';
    if (pathname === '/account/payment') return 'My Payment Options';
    if (pathname === '/account/orders') return 'My Orders';
    if (pathname === '/account/returns') return 'My Returns';
    if (pathname === '/account/cancellations') return 'My Cancellations';
    if (pathname === '/account/reviews') return 'My Reviews';
    if (pathname === '/account/wishlist') return 'My Wishlist & Followed Stores';
    return 'My Account';
  };

  const navLinks = [
    { section: 'Manage My Account', href: '/account', subLinks: [
      { label: 'My Profile', href: '/account/profile' },
      { label: 'Address Book', href: '/account/address' },
      { label: 'My Payment Options', href: '/account/payment' },
    ]},
    { section: 'Loyalty and Reward', subLinks: [
      { label: 'My Membership', href: '/account/membership' },
      { label: 'Reward Marketplace', href: '/account/rewards' },
      { label: 'Points History', href: '/account/points-history' },
    ]},
    { section: 'My Orders', href: '/account/orders', subLinks: [
      { label: 'My Returns', href: '/account/returns' },
      { label: 'My Cancellations', href: '/account/cancellations' },
    ]},
    { section: 'My Reviews', href: '/account/reviews' },
    { section: 'My Wishlist & Followed Stores', href: '/account/wishlist' },
  ];

  const renderNavLinks = (isMobile: boolean = false) => {
    return (
      <div className="space-y-6">
        {navLinks.map((nav, index) => (
          <div key={index}>
            {nav.href ? (
              <Link href={nav.href} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
                <h3 className={`text-base font-semibold mb-2 cursor-pointer block py-2 ${pathname === nav.href ? 'text-primary' : 'text-foreground hover:text-primary/90'}`}>
                  {nav.section}
                </h3>
              </Link>
            ) : (
              <h3 className="text-base font-semibold text-foreground mb-2 py-2">
                {nav.section}
              </h3>
            )}
            
            {nav.subLinks && (
              <ul className="space-y-1 pl-4">
                {nav.subLinks.map((sub, i) => (
                  <li key={i}>
                    <Link 
                      href={sub.href} 
                      onClick={() => isMobile && setIsMobileMenuOpen(false)}
                      className={`block py-2 text-base ${pathname === sub.href ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary/90 active:text-primary'}`}
                    >
                      {sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 pt-16 pb-8 flex-1 md:pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-foreground">{getPageTitle()}</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold transition active:bg-red-800"
          >
            Logout
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-1/4 shrink-0">
            <div className="mb-6">
              <p className="text-muted-foreground text-base mb-1">Hello, {user.phone || (user.email ? user.email.split('@')[0] : 'User')}</p>
              <div className="inline-flex items-center gap-1 bg-success-text text-white text-sm font-semibold px-2 py-1 rounded-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Verified Account
              </div>
            </div>
            
            {renderNavLinks()}
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4 w-full">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Floating Menu Button */}
      <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 flex justify-center lg:hidden pointer-events-none">
         <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open account menu" className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-medium flex items-center gap-2 pointer-events-auto hover:bg-primary-700 transition-colors">
            <Menu className="w-5 h-5" />
            Menu
         </button>
      </div>

      {/* Mobile Bottom Sheet Menu */}
      <div role="dialog" aria-modal="true" aria-label="My Account menu" className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 transform max-h-[90vh] flex flex-col pb-[env(safe-area-inset-bottom)] ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-xl font-bold">My Account</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close account menu" className="-mr-2 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>
          <ScrollFade className="px-6 pt-6 pb-4 overflow-y-auto">
            <div className="mb-6 border-b border-border pb-4">
              <p className="text-muted-foreground text-base mb-1">Hello, {user.phone || (user.email ? user.email.split('@')[0] : 'User')}</p>
              <div className="inline-flex items-center gap-1 bg-success-text text-white text-sm font-semibold px-2 py-1 rounded-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Verified Account
              </div>
            </div>
            
            {renderNavLinks(true)}
          </ScrollFade>
        </div>
      </div>
    </>
  );
}
