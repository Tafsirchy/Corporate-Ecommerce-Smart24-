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

  const fetchInvoices = async () => {
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
    return <div className="p-8 text-center">Loading invoices...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Business Invoices (Net-30)</h1>

      {invoices.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-muted-foreground border border-border">
          You don't have any Net-30 invoices yet.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-border overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{inv.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 hover:underline">
                    <Link href={`/account`}>{inv.orderId.slice(-6).toUpperCase()}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    <span className={new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' ? 'text-destructive font-bold' : ''}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    ৳{inv.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${inv.status === 'PAID' ? 'bg-success-bg text-success-text' : 
                        inv.status === 'OVERDUE' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-100 text-yellow-800'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                    {inv.status !== 'PAID' && (
                      <button className="text-primary-600 hover:text-primary-800 font-bold">
                        Pay Now
                      </button>
                    )}
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/invoice/${inv.id}/export`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-800 font-medium ml-2"
                    >
                      Export PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
