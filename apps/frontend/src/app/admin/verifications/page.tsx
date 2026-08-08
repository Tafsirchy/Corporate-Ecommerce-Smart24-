'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const { data } = await apiClient.get('/business/verifications');
      setVerifications(data.data || data);
    } catch (error) {
      toast.error('Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessing(id);
    try {
      await apiClient.patch(`/business/${id}/verification`, { status });
      toast.success(`Business ${status.toLowerCase()} successfully`);
      fetchVerifications(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div>Loading verifications...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">KYC Verification Queue</h1>
      
      {verifications.length === 0 ? (
        <div className="bg-white p-6 rounded-lg border shadow-sm text-center text-gray-500">
          No pending verifications at the moment.
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((profile) => (
            <div key={profile.id} className="bg-white p-6 rounded-lg border shadow-sm flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{profile.businessName}</h3>
                <p className="text-sm text-gray-600">Type: {profile.businessType}</p>
                <p className="text-sm text-gray-600">Owner: {profile.ownerName}</p>
                <p className="text-sm text-gray-600">Address: {profile.address}</p>
                <p className="text-sm text-gray-500 mt-2">Email: {profile.user?.email}</p>
                <p className="text-sm text-gray-500">Phone: {profile.user?.phone}</p>
              </div>
              
              <div className="flex-1 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Documents:</h4>
                {profile.documents?.length > 0 ? (
                  <div className="space-y-2">
                    {profile.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium">{doc.documentType}</span>
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-primary-600 text-sm hover:underline"
                        >
                          View Document
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded.</p>
                )}
              </div>

              <div className="flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-200">
                <button
                  disabled={processing === profile.id}
                  onClick={() => handleUpdateStatus(profile.id, 'APPROVED')}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={processing === profile.id}
                  onClick={() => handleUpdateStatus(profile.id, 'REJECTED')}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
