'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">
            {pathname.includes('points-history') 
              ? 'Points History' 
              : pathname.includes('rewards') 
                ? 'Rewards Ecosystem' 
                : 'My Membership'}
          </h1>
          <Link href="/account" className="text-primary/90 hover:underline">
            &larr; Back to Account
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-1/4 shrink-0">
            <div className="bg-white border rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-foreground mb-4">Loyalty and Reward</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/account/membership" className={`block transition-colors ${pathname.includes('membership') ? 'text-primary/90 font-bold' : 'text-muted-foreground hover:text-primary/90'}`}>
                    My Membership
                  </Link>
                </li>
                <li>
                  <Link href="/account/rewards" className={`block transition-colors ${pathname.includes('rewards') ? 'text-primary/90 font-bold' : 'text-muted-foreground hover:text-primary/90'}`}>
                    Reward Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/account/points-history" className={`block transition-colors ${pathname.includes('points-history') ? 'text-primary/90 font-bold' : 'text-muted-foreground hover:text-primary/90'}`}>
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

      {/* Mobile Floating Menu Button */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center lg:hidden pointer-events-none">
         <button onClick={() => setIsMobileMenuOpen(true)} className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-medium flex items-center gap-2 pointer-events-auto">
            <Menu className="w-5 h-5" />
            Menu
         </button>
      </div>

      {/* Mobile Bottom Sheet Menu */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 transform max-h-[85vh] flex flex-col ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-xl font-bold">Loyalty and Reward</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>
          <ScrollFade className="p-6 overflow-y-auto">
            <ul className="space-y-4 text-lg">
              <li>
                <Link onClick={() => setIsMobileMenuOpen(false)} href="/account/membership" className={`block transition-colors ${pathname.includes('membership') ? 'text-primary/90 font-bold' : 'text-muted-foreground hover:text-primary/90'}`}>
                  My Membership
                </Link>
              </li>
              <li>
                <Link onClick={() => setIsMobileMenuOpen(false)} href="/account/rewards" className={`block transition-colors ${pathname.includes('rewards') ? 'text-primary/90 font-bold' : 'text-muted-foreground hover:text-primary/90'}`}>
                  Reward Marketplace
                </Link>
              </li>
              <li>
                <Link onClick={() => setIsMobileMenuOpen(false)} href="/account/points-history" className={`block transition-colors ${pathname.includes('points-history') ? 'text-primary/90 font-bold' : 'text-muted-foreground hover:text-primary/90'}`}>
                  Points History
                </Link>
              </li>
            </ul>
          </ScrollFade>
        </div>
      </div>
    </>
  );
}
