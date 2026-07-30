'use client';
import { useState } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function BulkOrderPage() {
  const router = useRouter();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please upload a CSV file');
      return;
    }

    setProcessing(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const { data } = await apiClient.post('/bulk-order/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValidationResult(data);
      if (data.invalidItems && data.invalidItems.length > 0) {
        toast.warning('Some items in your CSV could not be validated.');
      } else {
        toast.success('All items validated successfully.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process bulk order');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddToCart = async () => {
    if (!validationResult || validationResult.invalidItems?.length > 0) {
      // In MVP, we might require perfect validation, or just add the valid ones
      toast.info('Only valid items will be added to cart');
    }

    setProcessing(true);
    try {
      await apiClient.post('/cart/bulk', { items: validationResult.validItems });
      toast.success('Items added to cart successfully');
      router.push('/cart');
    } catch (error: any) {
      toast.error('Failed to add items to cart');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Order Builder</h2>
        <p className="text-gray-600 mb-8">
          Upload a CSV file with two columns: <strong>SKU</strong> and <strong>Quantity</strong>.
          We'll validate the products and build your cart automatically.
        </p>

        {!validationResult ? (
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M14 2h20l10 10v32a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="csv-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>Select a CSV file</span>
                      <input id="csv-upload" name="csv-upload" type="file" className="sr-only" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              </div>
              {csvFile && <p className="mt-2 text-sm text-gray-600">Selected file: {csvFile.name}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={processing || !csvFile}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
              >
                {processing ? 'Processing...' : 'Validate CSV'}
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 border rounded-md">
              <h4 className="text-sm font-semibold mb-2">Example CSV Format:</h4>
              <pre className="text-xs text-gray-600 bg-white p-2 border rounded">
                SKU,Quantity<br />
                PAPER-A4-01,500<br />
                PEN-BLUE-05,1000<br />
                INK-HP-21,50
              </pre>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Validation Results</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 border border-green-200 rounded-md">
                <p className="text-sm font-medium text-green-800">Valid Items</p>
                <p className="text-2xl font-bold text-green-900">{validationResult.validItems?.length || 0}</p>
              </div>
              <div className="bg-red-50 p-4 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800">Invalid / Not Found</p>
                <p className="text-2xl font-bold text-red-900">{validationResult.invalidItems?.length || 0}</p>
              </div>
            </div>

            {validationResult.invalidItems?.length > 0 && (
              <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-md">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">The following SKUs were invalid or out of stock:</h4>
                <ul className="list-disc pl-5 text-sm text-yellow-700">
                  {validationResult.invalidItems.map((item: any, i: number) => (
                    <li key={i}>{item.sku} (Row: {item.row}, Reason: {item.reason})</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => { setValidationResult(null); setCsvFile(null); }}
                className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Upload Different File
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={processing || validationResult.validItems?.length === 0}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"
              >
                {processing ? 'Adding...' : 'Add Valid Items to Cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
