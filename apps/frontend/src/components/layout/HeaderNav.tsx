'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export default function HeaderNav({ isTransparent = false }: { isTransparent?: boolean }) {
  const { user, loading, logout, openAuthModal } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const getLinkClass = (path: string, hideOnMobile = false) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    
    let baseClass = isTransparent 
      ? "transition-all duration-200 hover:-translate-y-0.5 inline-block pb-1 border-b-2" 
      : "transition-all duration-200 hover:-translate-y-0.5 inline-block pb-1 border-b-2";
      
    if (isActive) {
      baseClass += isTransparent 
        ? " border-white text-white font-bold drop-shadow-md" 
        : " border-primary text-primary font-bold";
    } else {
      baseClass += isTransparent
        ? " border-transparent text-white/90 hover:text-white hover:border-white/50 font-medium"
        : " border-transparent text-muted-foreground hover:text-primary hover:border-primary/40 font-medium";
    }

    if (hideOnMobile) {
      baseClass += " hidden sm:block";
    }
    return baseClass;
  };

  return (
    <nav className="flex items-center gap-6">
      <Link href="/" className={getLinkClass('/')}>Home</Link>
      <Link href="/shop" className={getLinkClass('/shop')}>Shop</Link>
      <Link href="/subscriptions" className={getLinkClass('/subscriptions')}>Subscriptions</Link>
      <div className="relative group py-2">
        <Link href="/account/rewards" className={getLinkClass('/account/rewards')}>Rewards</Link>
        <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-md shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4">
          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-l border-t border-border rotate-45"></div>
          <div className="relative space-y-3 z-10 bg-white text-left">
            <Link href="/account/membership" className="block text-[14px] text-foreground hover:text-primary/90">My Membership</Link>
            <Link href="/account/rewards" className="block text-[14px] text-foreground hover:text-primary/90">Reward Marketplace</Link>
            <Link href="/account/points-history" className="block text-[14px] text-foreground hover:text-primary/90">Points History</Link>
          </div>
        </div>
      </div>
      <Link href="/about" className={getLinkClass('/about')}>About</Link>
      <div className="relative group py-2">
        <Link href="/support" className={getLinkClass('/support')}>Support</Link>
        <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-md shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4">
          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-l border-t border-border rotate-45"></div>
          <div className="relative space-y-3 z-10 bg-white text-left">
            <Link href="/support" className="block text-[14px] text-foreground hover:text-primary/90">Help Center Hub</Link>
            <Link href="/track-order" className="block text-[14px] text-foreground hover:text-primary/90">Track an Order</Link>
            <Link href="/support/contact" className="block text-[14px] text-foreground hover:text-primary/90">Contact Us</Link>
            <Link href="/support/faq" className="block text-[14px] text-foreground hover:text-primary/90">FAQs</Link>
          </div>
        </div>
      </div>
      {!mounted || loading ? (
        <div className="flex gap-4 items-center invisible pointer-events-none">
          <div className="w-16 h-5"></div>
          <div className="w-20 h-8"></div>
        </div>
      ) : user ? (
        <>
          <div className="relative group py-2">
            <Link href="/account" className={getLinkClass('/account')}>Account</Link>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-0 w-64 bg-white rounded-md shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4">
              <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-l border-t border-border rotate-45"></div>
              
              <div className="relative space-y-4 z-10 bg-white text-left">
                <div>
                  <Link href="/account" className="block text-[14px] font-semibold text-foreground hover:text-primary/90 mb-1.5">
                    Manage My Account
                  </Link>
                  <div className="pl-3 space-y-1.5">
                    <Link href="/account/profile" className="block text-[13px] text-muted-foreground hover:text-primary/90">My Profile</Link>
                    <Link href="/account/address" className="block text-[13px] text-muted-foreground hover:text-primary/90">Address Book</Link>
                    <Link href="/account/payment" className="block text-[13px] text-muted-foreground hover:text-primary/90">My Payment Options</Link>
                  </div>
                </div>

                <div>
                  <Link href="/account/orders" className="block text-[14px] font-semibold text-foreground hover:text-primary/90 mb-1.5">
                    My Orders
                  </Link>
                  <div className="pl-3 space-y-1.5">
                    <Link href="/account/returns" className="block text-[13px] text-muted-foreground hover:text-primary/90">My Returns</Link>
                    <Link href="/account/cancellations" className="block text-[13px] text-muted-foreground hover:text-primary/90">My Cancellations</Link>
                  </div>
                </div>

                <Link href="/account/reviews" className="block text-[14px] font-semibold text-foreground hover:text-primary/90">
                  My Reviews
                </Link>

                <Link href="/account/wishlist" className="block text-[14px] font-semibold text-foreground hover:text-primary/90">
                  My Wishlist & Followed Stores
                </Link>
              </div>
            </div>
          </div>
          {user.role === 'ADMIN' && (
            <Link href="/admin" className={`${isTransparent ? 'text-[#0D47A1] hover:opacity-80' : 'text-[#0D47A1] hover:opacity-80'} font-bold hidden md:block`}>Admin Portal</Link>
          )}
          {user.role === 'BUSINESS' && (
            <Link href="/business" className={`${isTransparent ? 'text-[#FF6E00] hover:opacity-80' : 'text-[#FF6E00] hover:opacity-80'} font-bold hidden md:block`}>B2B Portal</Link>
          )}
          <button onClick={() => logout()} className={`px-4 py-1.5 rounded-md font-bold transition-all duration-300 border ${isTransparent ? 'border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000] hover:text-white' : 'border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000] hover:text-white'}`}>Sign Out</button>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <button onClick={() => openAuthModal('login')} className={isTransparent ? "text-white font-bold hover:text-accent" : "text-primary font-bold hover:text-primary-700"}>Sign In</button>
          <button onClick={() => openAuthModal('signup')} className={`px-4 py-1.5 rounded-md font-medium transition-all duration-300 ${isTransparent ? 'border border-white/50 text-white hover:bg-primary-600 hover:text-white hover:border-primary-600' : 'border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'}`}>Sign Up</button>
        </div>
      )}
    </nav>
  );
}
