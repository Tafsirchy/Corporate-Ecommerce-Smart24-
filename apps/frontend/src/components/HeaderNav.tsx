'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HeaderNav({ isTransparent = false }: { isTransparent?: boolean }) {
  const { user, logout } = useAuth();
  
  const linkClass = isTransparent 
    ? "text-white/90 hover:text-white font-medium" 
    : "text-gray-600 hover:text-black font-medium";

  return (
    <nav className="flex items-center gap-6">
      <Link href="/" className={linkClass}>Home</Link>
      <Link href="/shop" className={linkClass}>Shop</Link>
      <Link href="/subscriptions" className={linkClass}>Subscriptions</Link>
      <Link href="/about" className={linkClass}>About</Link>
      <Link href="/faq" className={`${linkClass} hidden sm:block`}>FAQ</Link>
      <Link href="/contact" className={`${linkClass} hidden sm:block`}>Contact</Link>
      {user ? (
        <>
          <Link href="/account" className={linkClass}>Account</Link>
          <button onClick={() => logout()} className={linkClass}>Sign Out</button>
        </>
      ) : (
        <>
          <Link href="/login" className={linkClass}>Sign In</Link>
          <Link href="/signup" className={`${linkClass} border ${isTransparent ? 'border-white/50 hover:bg-white/10' : 'border-gray-300 hover:bg-gray-50'} px-3 py-1.5 rounded transition-colors`}>Sign Up</Link>
        </>
      )}
      {user?.role === 'ADMIN' && (
        <Link href="/admin" className={`${isTransparent ? 'text-primary-300 hover:text-primary-100' : 'text-primary-600 hover:text-primary-800'} font-medium hidden md:block`}>Admin</Link>
      )}
    </nav>
  );
}
