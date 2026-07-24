'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {pathname.includes('points-history') 
            ? 'Points History' 
            : pathname.includes('rewards') 
              ? 'Rewards Ecosystem' 
              : 'My Membership'}
        </h1>
        <Link href="/account" className="text-primary-600 hover:underline">
          &larr; Back to Account
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Aside */}
        <aside className="lg:w-1/4 w-full shrink-0">
          <div className="bg-white border rounded-xl p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Loyalty and Reward</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/account/membership" className={`block transition-colors ${pathname.includes('membership') ? 'text-primary-600 font-bold' : 'text-gray-500 hover:text-primary-600'}`}>
                  My Membership
                </Link>
              </li>
              <li>
                <Link href="/account/rewards" className={`block transition-colors ${pathname.includes('rewards') ? 'text-primary-600 font-bold' : 'text-gray-500 hover:text-primary-600'}`}>
                  Reward Marketplace
                </Link>
              </li>
              <li>
                <Link href="/account/points-history" className={`block transition-colors ${pathname.includes('points-history') ? 'text-primary-600 font-bold' : 'text-gray-500 hover:text-primary-600'}`}>
                  Points History
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:w-3/4 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
