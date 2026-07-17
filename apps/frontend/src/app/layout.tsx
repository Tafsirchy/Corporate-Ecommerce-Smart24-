import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ToastContainer } from "react-toastify";
import HeaderNav from "../components/HeaderNav";

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
            <ToastContainer position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
