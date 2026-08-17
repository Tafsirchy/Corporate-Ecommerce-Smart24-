'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FileText, Loader2, Calendar, DollarSign, Package } from 'lucide-react';

export default function PendingRfqsPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const res = await apiClient.get('/rfq/my-rfqs');
      setRfqs(res.data?.data || res.data || []);
    } catch (error: any) {
      toast.error('Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWING': return 'bg-blue-100 text-blue-800';
      case 'QUOTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'ACCEPTED': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 md:py-8 mb-20 md:mb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending RFQs</h2>
          <p className="text-gray-500 text-sm mt-1">Track the status of your submitted quote requests.</p>
        </div>
        <Link 
          href="/business/rfq" 
          className="hidden md:inline-flex bg-[#FF6E00] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#e66300] transition-colors active:scale-95 items-center justify-center"
        >
          New Request
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6E00]" />
        </div>
      ) : rfqs.length === 0 ? (
        <div className="bg-white p-6 md:p-12 rounded-lg shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs Found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm md:text-base">
            You haven't submitted any Request For Quotation yet. Submit your requirements to get custom pricing.
          </p>
          <Link 
            href="/business/rfq" 
            className="inline-flex items-center justify-center bg-[#FF6E00] text-white px-6 py-3.5 md:py-2.5 rounded-md font-medium hover:bg-[#e66300] transition-colors min-h-[44px] w-full sm:w-auto active:scale-95"
          >
            Create New RFQ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">RFQ #{rfq.id.substring(rfq.id.length - 6).toUpperCase()}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> 
                    Submitted on: {new Date(rfq.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {rfq.expectedBudget && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>Budget: <strong>৳{rfq.expectedBudget.toLocaleString()}</strong></span>
                    </div>
                  )}
                  {rfq.expectedDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Expected: <strong>{new Date(rfq.expectedDate).toLocaleDateString()}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-50 pt-4 mt-2">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Requested Items ({rfq.productItems?.length || 0})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rfq.productItems?.slice(0, 4).map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm border border-gray-100 flex justify-between items-center">
                      <span className="font-medium text-gray-700 truncate mr-2" title={item.productName}>{item.productName}</span>
                      <span className="bg-gray-200 text-gray-700 py-0.5 px-2 rounded font-semibold text-xs whitespace-nowrap">Qty: {item.quantity}</span>
                    </div>
                  ))}
                  {rfq.productItems?.length > 4 && (
                    <div className="bg-gray-50 p-3 rounded-md text-sm border border-gray-100 flex items-center justify-center text-gray-500 font-medium">
                      + {rfq.productItems.length - 4} more items
                    </div>
                  )}
                </div>
              </div>
              
              {rfq.adminNotes && (
                <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-800">
                    <strong>Admin Note:</strong> {rfq.adminNotes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      {!loading && rfqs.length > 0 && (
        <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 z-40 flex md:hidden pointer-events-none">
          <Link 
            href="/business/rfq" 
            className="bg-[#FF6E00] text-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-medium flex items-center gap-2 pointer-events-auto active:scale-95 transition-transform"
          >
            <span>+ New RFQ</span>
          </Link>
        </div>
      )}
    </div>
  );
}
