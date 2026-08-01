import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "@/context/AuthContext";
import { StoreInitializer } from "@/components/StoreInitializer";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import StickySidebar from "@/components/StickySidebar";
import { ToastContainer } from "react-toastify";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";
import { AuthModal } from "@/components/auth/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Business Ecommerce",
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
        <NextTopLoader color="#000" showSpinner={false} />
        <AuthProvider>
          <StoreInitializer />
          <Suspense fallback={<div className="h-16 bg-white border-b border-border shadow-sm"></div>}>
            <Header />
          </Suspense>
          <StickySidebar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>

          <Footer />
          <AuthModal />
          <ToastContainer position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
