'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function BusinessContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  async function fetchContracts() {
    try {
      const { data } = await apiClient.get('/contract/my-contracts');
      setContracts(data?.data || data);
    } catch (error) {
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a contract document');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await apiClient.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await apiClient.post('/contract', { documentUrl: uploadRes.data.url });
      
      toast.success('Contract uploaded successfully. Awaiting admin review.');
      setFile(null);
      fetchContracts();
    } catch (error) {
      toast.error('Failed to upload contract');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading contracts...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Contract Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow border border-border">
            <h2 className="text-lg font-bold mb-4">Upload New Contract</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Signed Document (PDF, Word, Image)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm border border-border rounded p-2 focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={uploading || !file}
                className="w-full bg-black text-white px-4 py-2 rounded font-medium hover:bg-secondary disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Submit Contract'}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Your Contracts</h2>
          {contracts.length === 0 ? (
            <div className="bg-white p-8 rounded shadow text-center text-muted-foreground border border-border">
              You haven't uploaded any contracts yet.
            </div>
          ) : (
            <ScrollFade className="bg-white rounded-lg shadow overflow-hidden border border-border overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valid Until</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {contracts.map((contract) => (
                    <tr key={contract.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 hover:underline">
                        <a href={contract.documentUrl} target="_blank" rel="noreferrer">View Document</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {contract.validUntil ? new Date(contract.validUntil).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${contract.status === 'ACTIVE' ? 'bg-success-bg text-success-text' : 
                            contract.status === 'EXPIRED' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-100 text-yellow-800'}`}>
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollFade>
          )}
        </div>
      </div>
    </div>
  );
}
