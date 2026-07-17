'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HeaderNav() {
  const { user } = useAuth();

  return (
    <nav className="flex items-center gap-6">
      <Link href="/about" className="text-gray-600 hover:text-black">About</Link>
      <Link href="/subscriptions" className="text-gray-600 hover:text-black">Subscriptions</Link>
      <Link href="/shop" className="text-gray-600 hover:text-black">Shop</Link>
      <Link href="/faq" className="text-gray-600 hover:text-black hidden sm:block">FAQ</Link>
      <Link href="/contact" className="text-gray-600 hover:text-black hidden sm:block">Contact</Link>
      <Link href="/account" className="text-gray-600 hover:text-black">Account</Link>
      {user?.role === 'ADMIN' && (
        <Link href="/admin" className="text-indigo-600 font-medium hover:text-indigo-800 hidden md:block">Admin</Link>
      )}
      <Link href="/cart" className="text-gray-600 hover:text-black font-medium">Cart</Link>
    </nav>
  );
}
