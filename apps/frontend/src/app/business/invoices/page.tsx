'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function BusinessInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      const { data } = await apiClient.get('/invoice/my-invoices');
      setInvoices(data?.data || data);
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-8 mb-20 md:mb-0">
        <h1 className="text-2xl font-bold mb-6">Business Invoices (Net-30)</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-border flex flex-col gap-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="flex gap-3 mt-2 pt-4 border-t border-gray-100">
                <div className="h-11 bg-gray-200 rounded w-full"></div>
                <div className="h-11 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 mb-20 md:mb-0">
      <h1 className="text-2xl font-bold mb-6">Business Invoices (Net-30)</h1>

      {invoices.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-muted-foreground border border-border">
          You don't have any Net-30 invoices yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white p-5 rounded-lg shadow-sm border border-border flex flex-col gap-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Invoice</span>
                  <p className="font-bold text-gray-900 text-lg leading-none">#{inv.id.slice(-6).toUpperCase()}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full 
                  ${inv.status === 'PAID' ? 'bg-success-bg text-success-text' : 
                    inv.status === 'OVERDUE' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-100 text-yellow-800'}`}>
                  {inv.status}
                </span>
              </div>

              {/* Order ID */}
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Order ID</span>
                <Link href={`/account`} className="text-primary-600 hover:text-primary-700 hover:underline font-medium">
                  {inv.orderId.slice(-6).toUpperCase()}
                </Link>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Date</span>
                  <span className="text-sm font-medium">{new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-1">Due Date</span>
                  <span className={`text-sm font-medium ${new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' ? 'text-destructive font-bold' : ''}`}>
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-muted-foreground block text-xs mb-1">Amount</span>
                  <span className="font-bold text-gray-900 text-lg">৳{inv.amount.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 mt-1">
                {inv.status !== 'PAID' && (
                  <button className="flex-1 flex justify-center items-center bg-primary-600 text-white min-h-[44px] px-4 rounded-md shadow-sm text-sm font-medium active:scale-95 transition-transform hover:bg-primary-700">
                    Pay Now
                  </button>
                )}
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/invoice/${inv.id}/export`}
                  target="_blank"
                  className="flex-1 flex justify-center items-center border border-gray-300 bg-white text-gray-700 min-h-[44px] px-4 rounded-md shadow-sm text-sm font-medium active:scale-95 transition-transform hover:bg-gray-50"
                >
                  Export PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
