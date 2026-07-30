'use client';
import { useState } from 'react';
import { useAuth, apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function BusinessVerifyPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('TRADE_LICENSE');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    try {
      await apiClient.post('/business/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded successfully');
      setFile(null);
      // Optional: redirect to dashboard after upload
      router.push('/business');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Verification</h2>
        <p className="text-gray-600 mb-8">
          Upload your business documents (Trade License, NID) to verify your account and unlock corporate pricing.
        </p>

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
            >
              <option value="TRADE_LICENSE">Trade License</option>
              <option value="NID">National ID (NID)</option>
              <option value="TIN_CERTIFICATE">TIN Certificate</option>
              <option value="BIN_CERTIFICATE">BIN Certificate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
            {file && <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>}
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Submit Document'}
          </button>
        </form>
      </div>
    </div>
  );
