import { OptimizedImage } from '@/components/ui/OptimizedImage';
import Image from 'next/image';
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white mt-auto py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Image src="/asset/LogoWithSlogan.png" alt="Smart24" width={300} height={100} unoptimized={true} className="h-24 w-auto object-contain" />
          <p className="text-primary-100/70 leading-relaxed text-sm">Your trusted business supply chain partner in Bangladesh, providing seamless B2B procurement and retail solutions.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-primary-50">Retail Shop</h4>
          <ul className="space-y-2 text-sm text-primary-100/70">
            <li><Link href="/shop" className="hover:text-white transition-colors">Browse Products</Link></li>
            <li><Link href="/flash-sale" className="hover:text-white transition-colors">Flash Sales</Link></li>
            <li><Link href="/subscriptions" className="hover:text-white transition-colors">Subscriptions</Link></li>
            <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-primary-50">B2B Solutions</h4>
          <ul className="space-y-2 text-sm text-primary-100/70">
            <li><Link href="/business" className="hover:text-white transition-colors">Business Dashboard</Link></li>
            <li><Link href="/business/bulk-order" className="hover:text-white transition-colors">Bulk Upload</Link></li>
            <li><Link href="/business/rfq" className="hover:text-white transition-colors">Request for Quote</Link></li>
            <li><Link href="/business/verify" className="hover:text-white transition-colors">Become a Partner</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-primary-50">Support & Legal</h4>
          <ul className="space-y-2 text-sm text-primary-100/70">
            <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-primary-800 text-sm text-primary-100/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>© {new Date().getFullYear()} Smart24. All rights reserved.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4.01c-1 .49-1.98.68-3 .99-1.12-1.25-2.74-2-4.5-2-3.87 0-7 3.13-7 7 0 .55.06 1.09.16 1.62-4.14-.21-7.81-2.19-10.26-5.22-.6.99-.94 2.14-.94 3.39 0 2.43 1.24 4.57 3.12 5.83-.87-.03-1.69-.27-2.4-.66v.09c0 2.57 1.83 4.71 4.25 5.19-.57.16-1.18.24-1.8.24-.44 0-.87-.04-1.29-.12.67 2.1 2.64 3.63 4.96 3.67-1.82 1.42-4.11 2.27-6.58 2.27-.55 0-1.09-.03-1.62-.09 2.35 1.5 5.14 2.38 8.1 2.38 9.72 0 15.03-8.05 15.03-15.03 0-.23 0-.46-.02-.69 1.03-.74 1.93-1.67 2.64-2.73z"></path></svg>
          </a>
          <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
