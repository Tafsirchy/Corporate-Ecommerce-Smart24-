'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HeaderNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center gap-6">
      <Link href="/about" className="text-gray-600 hover:text-black">About</Link>
      <Link href="/subscriptions" className="text-gray-600 hover:text-black">Subscriptions</Link>
      <Link href="/shop" className="text-gray-600 hover:text-black">Shop</Link>
      <Link href="/faq" className="text-gray-600 hover:text-black hidden sm:block">FAQ</Link>
      <Link href="/contact" className="text-gray-600 hover:text-black hidden sm:block">Contact</Link>
      {user ? (
        <>
          <Link href="/account" className="text-gray-600 hover:text-black">Account</Link>
          <button onClick={() => logout()} className="text-gray-600 hover:text-black font-medium">Sign Out</button>
        </>
      ) : (
        <>
          <Link href="/login" className="text-gray-600 hover:text-black font-medium">Sign In</Link>
          <Link href="/signup" className="text-gray-600 hover:text-black font-medium border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">Sign Up</Link>
        </>
      )}
      {user?.role === 'ADMIN' && (
        <Link href="/admin" className="text-indigo-600 font-medium hover:text-indigo-800 hidden md:block">Admin</Link>
      )}
      <Link href="/cart" className="text-gray-600 hover:text-black font-medium">Cart</Link>
    </nav>
  );
}
