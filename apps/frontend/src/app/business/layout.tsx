'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        setTimeout(() => openAuthModal('login'), 100);
      } else if (user.role !== 'BUSINESS') {
        router.push('/account'); // redirect normal buyers to their account dashboard
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'BUSINESS') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const navigation = [
    { name: 'Overview', href: '/business' },
    { name: 'Profile & Verification', href: '/business/verify' },
    { name: 'Pending RFQs', href: '/business/pending-rfqs' },
    { name: 'Request for Quote (RFQ)', href: '/business/rfq' },
    { name: 'Bulk Orders', href: '/business/bulk-order' },
    { name: 'Invoices', href: '/business/invoices' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white shadow-sm flex-shrink-0 border-r border-gray-200 z-10 sticky top-[124px] h-[calc(100vh-124px)] flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Business Portal</h2>
          <p className="text-sm text-gray-500 mt-1 truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-[#FF6E00]/10 text-[#FF6E00]' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <ScrollFade className="flex-1 px-4 py-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </ScrollFade>

      {/* Mobile Floating Menu Button */}
      <div className={`fixed right-4 z-40 flex md:hidden pointer-events-none transition-all duration-300 ${
        ['/business/rfq', '/business/verify', '/business/bulk-order'].includes(pathname)
          ? 'bottom-[calc(6rem+env(safe-area-inset-bottom))]'
          : 'bottom-[calc(1.5rem+env(safe-area-inset-bottom))]'
      }`}>
         <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open portal menu" className="bg-[#FF6E00] text-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-medium flex items-center gap-2 pointer-events-auto active:scale-95 transition-transform">
            <Menu className="w-5 h-5" />
            Menu
         </button>
      </div>

      {/* Mobile Bottom Sheet Menu */}
      <div role="dialog" aria-modal="true" aria-label="Business Portal menu" className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 transform max-h-[90vh] flex flex-col pb-[env(safe-area-inset-bottom)] ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex justify-between items-center p-4 border-b border-border">
            <div>
              <h2 className="text-xl font-bold">Business Portal</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close portal menu" className="-mr-2 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>
          <ScrollFade className="px-4 py-4 overflow-y-auto">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-colors
                      ${isActive 
                        ? 'bg-[#FF6E00]/10 text-[#FF6E00]' 
                        : 'text-gray-700 active:bg-gray-100'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollFade>
        </div>
      </div>
    </div>
  );
}
