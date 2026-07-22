import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import Header from "../components/Header";
import StickySidebar from "../components/StickySidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Corporate Ecommerce",
  description: "B2B and B2C Ecommerce Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <StickySidebar />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
              <footer className="bg-primary-900 text-white mt-auto py-12">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Smart24</h3>
                    <p className="text-primary-100/70">Your trusted corporate supply chain partner in Bangladesh.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4 text-primary-50">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-primary-100/70">
                      <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                      <li><Link href="/shop" className="hover:text-white transition-colors">Retail Shop</Link></li>
                      <li><Link href="/subscriptions" className="hover:text-white transition-colors">Subscriptions</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4 text-primary-50">Support</h4>
                    <ul className="space-y-2 text-sm text-primary-100/70">
                      <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                      <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                      <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4 text-primary-50">Legal</h4>
                    <ul className="space-y-2 text-sm text-primary-100/70">
                      <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                      <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="container mx-auto px-4 mt-8 pt-8 border-t border-primary-800 text-sm text-primary-100/50 text-center">
                  © {new Date().getFullYear()} Smart24. All rights reserved.
                </div>
              </footer>
              <ToastContainer position="bottom-right" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
