'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HeaderNav() {
  const { user } = useAuth();

  return (
    <nav className="flex items-center gap-6">
      <Link href="/shop" className="text-gray-600 hover:text-black">Shop</Link>
      <Link href="/account" className="text-gray-600 hover:text-black">Account</Link>
      {user?.role === 'ADMIN' && (
        <Link href="/admin" className="text-indigo-600 font-medium hover:text-indigo-800">Admin Panel</Link>
      )}
      <Link href="/cart" className="text-gray-600 hover:text-black font-medium">Cart</Link>
    </nav>
  );
}
