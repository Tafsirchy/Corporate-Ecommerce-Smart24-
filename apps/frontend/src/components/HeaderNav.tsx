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
      <Link href="/faq" className={getLinkClass('/faq', true)}>FAQ</Link>
      <Link href="/contact" className={getLinkClass('/contact', true)}>Contact</Link>
      {user ? (
        <>
          <Link href="/account" className={getLinkClass('/account')}>Account</Link>
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
