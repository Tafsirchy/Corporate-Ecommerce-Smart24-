'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HeaderNav({ isTransparent = false }: { isTransparent?: boolean }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  const getLinkClass = (path: string, hideOnMobile = false) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    
    let baseClass = isTransparent 
      ? "hover:text-white transition-colors" 
      : "hover:text-primary-600 transition-colors";
      
    if (isActive) {
      baseClass += isTransparent 
        ? " text-white font-bold" 
        : " text-primary-600 font-bold";
    } else {
      baseClass += isTransparent
        ? " text-white/80 font-medium"
        : " text-gray-600 font-medium";
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
      <Link href="/about" className={getLinkClass('/about')}>About</Link>
      <div className="relative group py-2">
        <Link href="/support" className={getLinkClass('/support')}>Support</Link>
        <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-md shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4">
          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45"></div>
          <div className="relative space-y-3 z-10 bg-white text-left">
            <Link href="/support" className="block text-[14px] text-gray-700 hover:text-primary-600">Help Center Hub</Link>
            <Link href="/track-order" className="block text-[14px] text-gray-700 hover:text-primary-600">Track an Order</Link>
            <Link href="/support/contact" className="block text-[14px] text-gray-700 hover:text-primary-600">Contact Us</Link>
            <Link href="/support/faq" className="block text-[14px] text-gray-700 hover:text-primary-600">FAQs</Link>
          </div>
        </div>
      </div>
      {user ? (
        <>
          <div className="relative group py-2">
            <Link href="/account" className={getLinkClass('/account')}>Account</Link>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-0 w-64 bg-white rounded-md shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4">
              <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45"></div>
              
              <div className="relative space-y-4 z-10 bg-white text-left">
                <div>
                  <Link href="/account" className="block text-[14px] font-semibold text-gray-800 hover:text-primary-600 mb-1.5">
                    Manage My Account
                  </Link>
                  <div className="pl-3 space-y-1.5">
                    <Link href="/account/profile" className="block text-[13px] text-gray-500 hover:text-primary-600">My Profile</Link>
                    <Link href="/account/address" className="block text-[13px] text-gray-500 hover:text-primary-600">Address Book</Link>
                    <Link href="/account/payment" className="block text-[13px] text-gray-500 hover:text-primary-600">My Payment Options</Link>
                  </div>
                </div>

                <div>
                  <Link href="/account/orders" className="block text-[14px] font-semibold text-gray-800 hover:text-primary-600 mb-1.5">
                    My Orders
                  </Link>
                  <div className="pl-3 space-y-1.5">
                    <Link href="/account/returns" className="block text-[13px] text-gray-500 hover:text-primary-600">My Returns</Link>
                    <Link href="/account/cancellations" className="block text-[13px] text-gray-500 hover:text-primary-600">My Cancellations</Link>
                  </div>
                </div>

                <Link href="/account/reviews" className="block text-[14px] font-semibold text-gray-800 hover:text-primary-600">
                  My Reviews
                </Link>

                <Link href="/account/wishlist" className="block text-[14px] font-semibold text-gray-800 hover:text-primary-600">
                  My Wishlist & Followed Stores
                </Link>
              </div>
            </div>
          </div>
          <button onClick={() => logout()} className={isTransparent ? "text-white/80 hover:text-white font-medium" : "text-gray-600 hover:text-primary-600 font-medium"}>Sign Out</button>
        </>
      ) : (
        <>
          <Link href="/login" className={getLinkClass('/login')}>Sign In</Link>
          <Link href="/signup" className={`${isTransparent ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-primary-600"} font-medium border ${isTransparent ? 'border-white/50 hover:bg-white/10' : 'border-gray-300 hover:bg-gray-50'} px-3 py-1.5 rounded transition-colors`}>Sign Up</Link>
        </>
      )}
      {user?.role === 'ADMIN' && (
        <Link href="/admin" className={`${isTransparent ? 'text-primary-300 hover:text-primary-100' : 'text-primary-600 hover:text-primary-800'} font-medium hidden md:block`}>Admin</Link>
      )}
    </nav>
  );
}
