'use client';
import { useAuth, apiClient } from '../../context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data } = await apiClient.get('/rfq/my-rfqs');
        setRfqs(data?.data || data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === 'BUSINESS') {
      fetchDashboardData();
    }
  }, [user]);

  const pendingRfqsCount = rfqs.filter((r) => r.status === 'SUBMITTED').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="bg-[#FF6E00]/10 border border-[#FF6E00]/30 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Welcome to the Smart24 B2B Portal</h2>
          <p className="text-[#FF6E00] mt-1 font-medium">
            Access business pricing, submit RFQs, and build bulk orders easily.
          </p>
        </div>
        <Link 
          href="/business/rfq" 
          className="whitespace-nowrap px-4 py-3 min-h-[44px] flex items-center justify-center bg-[#FF6E00] text-white rounded-md font-medium active:scale-95 transition-all w-full sm:w-auto"
        >
          New Quote Request
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/business/pending-rfqs" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 block active:scale-[0.98] transition-transform">
          <h3 className="text-gray-500 text-sm font-medium">Pending RFQs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '-' : pendingRfqsCount}
          </p>
          <div className="mt-4">
            <span className="text-[#FF6E00] text-sm font-medium">
              View all requests &rarr;
            </span>
          </div>
        </Link>

        <Link href="/business/verify" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 block active:scale-[0.98] transition-transform">
          <h3 className="text-gray-500 text-sm font-medium">Verification Status</h3>
          <p className="text-lg font-bold text-gray-900 mt-2">
            Pending Approval
          </p>
          <div className="mt-4">
            <span className="text-[#FF6E00] text-sm font-medium">
              Upload Documents &rarr;
            </span>
          </div>
        </Link>

        <Link href="/business/bulk-order" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 block active:scale-[0.98] transition-transform">
          <h3 className="text-gray-500 text-sm font-medium">Bulk Orders</h3>
          <p className="text-gray-600 text-sm mt-2">
            Upload CSV/Excel to quickly build your cart.
          </p>
          <div className="mt-4">
            <span className="text-[#FF6E00] text-sm font-medium">
              Start Builder &rarr;
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
