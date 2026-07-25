'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className="p-8 text-center">Loading Admin Panel...</div>;
  }

  const navGroups = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Orders', path: '/admin/orders' },
      ]
    },
    {
      title: 'Home Page Settings',
      items: [
        { name: 'Banners (Slider)', path: '/admin/banners' },
        { name: 'Corporate Collections', path: '/admin/corporate-collections' },
      ]
    },
    {
      title: 'Catalog',
      items: [
        { name: 'Products', path: '/admin/products' },
        { name: 'Categories', path: '/admin/categories' },
        { name: 'Brands', path: '/admin/brands' },
        { name: 'Filters', path: '/admin/filters' },
      ]
    },
    {
      title: 'Loyalty & Subscriptions',
      items: [
        { name: 'Memberships', path: '/admin/memberships' },
        { name: 'Rewards', path: '/admin/rewards' },
        { name: 'Subscriptions', path: '/admin/subscriptions' },
        { name: 'Offer Management', path: '/admin/offers' },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Support Tickets', path: '/admin/support' },
        { name: 'FAQs', path: '/admin/faqs' },
        { name: 'Settings', path: '/admin/settings' },
        { name: 'Security', path: '/admin/security' },
      ]
    }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-sm border-r border-gray-100 flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="px-4 pb-6 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive 
                          ? 'bg-black text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
