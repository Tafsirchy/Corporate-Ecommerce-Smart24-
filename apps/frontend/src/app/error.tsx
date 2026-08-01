'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if we had one
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100 text-center">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
            Oops! Something went wrong.
          </h2>
          <p className="mt-3 text-base text-gray-500">
            We're having trouble loading this page. This could be due to a temporary network issue or a technical glitch.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={() => reset()}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#003D46] hover:bg-[#002a31] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003D46] transition-all shadow-sm"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <RefreshCcw className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" aria-hidden="true" />
            </span>
            Try Again
          </button>
          
          <Link
            href="/"
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003D46] transition-all"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Home className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" aria-hidden="true" />
            </span>
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
