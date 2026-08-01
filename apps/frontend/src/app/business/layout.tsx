'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    { name: 'Request for Quote (RFQ)', href: '/business/rfq' },
    { name: 'Bulk Orders', href: '/business/bulk-order' },
    { name: 'Invoices', href: '/business/invoices' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-white shadow-sm flex-shrink-0">
        <div className="h-full flex flex-col">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900">Business Portal</h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700' 
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
      </div>

      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
