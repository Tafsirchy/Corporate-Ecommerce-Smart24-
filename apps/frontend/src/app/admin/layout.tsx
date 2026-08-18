'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
        { name: 'Business Collections', path: '/admin/business-collections' },
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white shadow-sm flex-shrink-0 border-r border-gray-200 z-10 sticky top-[124px] h-[calc(100vh-124px)] flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-500 mt-1 truncate">{user.email}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-black text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
      <main className="flex-1 px-4 py-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Floating Menu Button */}
      <div className={`fixed right-4 z-40 flex md:hidden pointer-events-none transition-all duration-300 bottom-[calc(1.5rem+env(safe-area-inset-bottom))]`}>
         <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open admin menu" className="bg-black text-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-medium flex items-center gap-2 pointer-events-auto active:scale-95 transition-transform">
            <Menu className="w-5 h-5" />
            Menu
         </button>
      </div>

      {/* Mobile Bottom Sheet Menu */}
      <div role="dialog" aria-modal="true" aria-label="Admin Portal menu" className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 transform max-h-[90vh] flex flex-col pb-[env(safe-area-inset-bottom)] ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex justify-between items-center p-4 border-b border-border">
            <div>
              <h2 className="text-xl font-bold">Admin Panel</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close admin menu" className="-mr-2 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="px-4 py-4 overflow-y-auto">
            <nav className="space-y-6">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.path;
                      return (
                        <Link
                          key={item.name}
                          href={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            block px-4 py-3 text-base font-medium rounded-xl transition-colors
                            ${isActive 
                              ? 'bg-black text-white' 
                              : 'text-gray-700 active:bg-gray-100'
                            }
                          `}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
