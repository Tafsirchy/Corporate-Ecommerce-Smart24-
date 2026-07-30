'use client';
import { useAuth, apiClient } from '../../context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await apiClient.get('/rfq/my-rfqs');
        setRfqs(data);
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-blue-900">Welcome to the Smart24 B2B Portal</h2>
          <p className="text-blue-700 mt-1">
            Access business pricing, submit RFQs, and build bulk orders easily.
          </p>
        </div>
        <Link 
          href="/business/rfq" 
          className="whitespace-nowrap px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          New Quote Request
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Pending RFQs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '-' : pendingRfqsCount}
          </p>
          <div className="mt-4">
            <Link href="/business/rfq" className="text-primary-600 text-sm font-medium hover:underline">
              View all requests &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Verification Status</h3>
          <p className="text-lg font-bold text-gray-900 mt-2">
            Pending Approval
          </p>
          <div className="mt-4">
            <Link href="/business/verify" className="text-primary-600 text-sm font-medium hover:underline">
              Upload Documents &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Bulk Orders</h3>
          <p className="text-gray-600 text-sm mt-2">
            Upload CSV/Excel to quickly build your cart.
          </p>
          <div className="mt-4">
            <Link href="/business/bulk-order" className="text-primary-600 text-sm font-medium hover:underline">
              Start Builder &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
