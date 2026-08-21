'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function SupportLayout({ children }: { children: React.ReactNode }) {
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

  // Determine title based on pathname
  let pageTitle = 'Help Center Hub';
  if (pathname.includes('/support/faq')) {
    pageTitle = 'FAQs';
  } else if (pathname.includes('/support/contact')) {
    pageTitle = 'Contact Us';
  } else if (pathname.includes('/track-order')) {
    pageTitle = 'Track an Order';
  }

  const navLinks = [
    { href: '/support', label: 'Help Center Hub' },
    { href: '/track-order', label: 'Track an Order' },
    { href: '/support/contact', label: 'Contact Us' },
    { href: '/support/faq', label: 'FAQs' }
  ];

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground">
            {pageTitle}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-1/4 shrink-0">
            <div className="bg-white border rounded-xl p-6 sticky top-24 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">Support & Help</h3>
              <ul className="space-y-3">
                {navLinks.map((link) => {
                  // For the main /support link, it should only be active if pathname is exactly /support
                  const isActive = link.href === '/support' 
                    ? pathname === '/support' 
                    : pathname.includes(link.href);
                    
                  return (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className={`block transition-colors ${isActive ? 'text-primary/90 font-bold' : 'text-muted-foreground hover:text-primary/90'}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
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
         <button onClick={() => setIsMobileMenuOpen(true)} className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-medium flex items-center gap-2 pointer-events-auto hover:bg-primary-700 transition-colors">
            <Menu className="w-5 h-5" />
            Menu
         </button>
      </div>

      {/* Mobile Bottom Sheet Menu */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 transform max-h-[85vh] flex flex-col ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-xl font-bold">Support & Help</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>
          <ScrollFade className="p-6 overflow-y-auto">
            <ul className="space-y-4 text-lg">
              {navLinks.map((link) => {
                const isActive = link.href === '/support' 
                  ? pathname === '/support' 
                  : pathname.includes(link.href);
                  
                return (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block transition-colors ${isActive ? 'text-primary/90 font-bold' : 'text-muted-foreground hover:text-primary/90'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </ScrollFade>
        </div>
      </div>
    </>
  );
}
