'use client';

import { SearchX, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-page min-h-[40vh] flex items-center justify-center bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-[#003D46]/5 rounded-full flex items-center justify-center">
            <SearchX className="h-8 w-8 text-[#003D46]" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#FF9600]">
            Error 404
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-gray-900 tracking-tight">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sorry, the page you are looking for doesn&apos;t exist or may have
            been moved. Please check the URL or head back to the homepage.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#003D46] hover:bg-[#002a31] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003D46] transition-all shadow-sm"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Home className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" aria-hidden="true" />
            </span>
            Go to Homepage
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003D46] transition-all"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" aria-hidden="true" />
            </span>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
