import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ToastContainer } from "react-toastify";
import HeaderNav from "../components/HeaderNav";
import Link from "next/link";

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
            <header className="bg-white shadow-sm sticky top-0 z-10">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <a href="/" className="text-xl font-bold text-gray-900">Smart24</a>
                <HeaderNav />
              </div>
            </header>
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <footer className="bg-gray-900 text-white mt-auto py-12">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Smart24</h3>
                  <p className="text-gray-400">Your trusted corporate supply chain partner in Bangladesh.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-200">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                    <li><Link href="/shop" className="hover:text-white">Retail Shop</Link></li>
                    <li><Link href="/subscriptions" className="hover:text-white">Subscriptions</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-200">Support</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                    <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                    <li><Link href="/track-order" className="hover:text-white">Track Order</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-200">Legal</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                  </ul>
                </div>
              </div>
              <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-sm text-gray-400 text-center">
                © {new Date().getFullYear()} Smart24. All rights reserved.
              </div>
            </footer>
            <ToastContainer position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
