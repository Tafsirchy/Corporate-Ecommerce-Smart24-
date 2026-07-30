'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminRfqPage() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const { data } = await apiClient.get('/rfq/all');
      setRfqs(data);
    } catch (error) {
      toast.error('Failed to fetch RFQs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    setProcessing(id);
    try {
      await apiClient.patch(`/rfq/${id}/status`, { status, adminNotes: notes });
      toast.success(`RFQ status updated to ${status}`);
      fetchRfqs(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update RFQ status');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div>Loading RFQs...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">RFQ Management</h1>
      
      {rfqs.length === 0 ? (
        <div className="bg-white p-6 rounded-lg border shadow-sm text-center text-gray-500">
          No RFQs available.
        </div>
      ) : (
        <div className="space-y-6">
          {rfqs.map((rfq) => (
            <div key={rfq.id} className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Business: {rfq.businessProfile?.businessName}
                  </h3>
                  <p className="text-sm text-gray-600">Submitted: {new Date(rfq.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    Expected Date: {rfq.expectedDate ? new Date(rfq.expectedDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    Expected Budget: ৳{rfq.expectedBudget || 'N/A'}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${rfq.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' : 
                      rfq.status === 'QUOTED' ? 'bg-blue-100 text-blue-800' :
                      rfq.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {rfq.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">SLA Deadline: {new Date(rfq.slaDeadline).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Requested Items:</h4>
                <div className="bg-gray-50 rounded-md p-4">
                  <ul className="space-y-2">
                    {rfq.productItems?.map((item: any, i: number) => (
                      <li key={i} className="text-sm">
                        <span className="font-semibold">{item.quantity}x</span> {item.productName} 
                        {item.specs && <span className="text-gray-500 ml-2">({item.specs})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {rfq.specFileUrl && (
                <div className="mb-4">
                  <a href={rfq.specFileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">
                    View Attached Specification File
                  </a>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
                {rfq.status === 'SUBMITTED' && (
                  <>
                    <button
                      disabled={processing === rfq.id}
                      onClick={() => handleUpdateStatus(rfq.id, 'QUOTED', 'Quote has been sent to your email.')}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark as QUOTED
                    </button>
                    <button
                      disabled={processing === rfq.id}
                      onClick={() => handleUpdateStatus(rfq.id, 'REJECTED', 'We cannot fulfill this request at the moment.')}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject Request
                    </button>
                  </>
                )}
                
                {rfq.adminNotes && (
                  <div className="w-full mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Admin Notes:</strong> {rfq.adminNotes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
