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
      ? "hover:text-white transition-colors" 
      : "hover:text-primary/90 transition-colors";
      
    if (isActive) {
      baseClass += isTransparent 
        ? " text-white font-bold" 
        : " text-primary/90 font-bold";
    } else {
      baseClass += isTransparent
        ? " text-white/80 font-medium"
        : " text-muted-foreground font-medium";
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
          <button onClick={() => logout()} className={isTransparent ? "text-red-400 hover:text-red-300 font-medium" : "text-red-500 hover:text-red-600 font-bold"}>Sign Out</button>
          {user.role === 'ADMIN' && (
            <Link href="/admin" className={`${isTransparent ? 'text-[#FF2056] hover:opacity-80' : 'text-[#FF2056] hover:opacity-80'} font-bold hidden md:block`}>Admin Portal</Link>
          )}
          {user.role === 'BUSINESS' && (
            <Link href="/business" className={`${isTransparent ? 'text-[#FF6E00] hover:opacity-80' : 'text-[#FF6E00] hover:opacity-80'} font-bold hidden md:block`}>B2B Portal</Link>
          )}
        </>
      ) : (
        <>
          <button onClick={() => openAuthModal('login')} className={isTransparent ? "text-white/80 hover:text-white font-medium" : "text-muted-foreground hover:text-primary/90 font-medium"}>Sign In</button>
          <button onClick={() => openAuthModal('signup')} className={`${isTransparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-primary/90"} font-medium border ${isTransparent ? 'border-white/50 hover:bg-white/10' : 'border-border hover:bg-muted'} px-3 py-1.5 rounded transition-colors`}>Sign Up</button>
        </>
      )}
    </nav>
  );
}
