'use client';
import { useState } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function RFQPage() {
  const router = useRouter();
  
  const [items, setItems] = useState([{ productName: '', quantity: 1, specs: '' }]);
  const [expectedBudget, setExpectedBudget] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [specFile, setSpecFile] = useState<File | null>(null);

  const handleAddItem = () => {
    setItems([...items, { productName: '', quantity: 1, specs: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleChangeItem = (index: number, field: string, value: any) => {
    const newItems = [...items] as any;
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(item => !item.productName || item.quantity < 1)) {
      toast.error('Please fill out all product details correctly.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('productItems', JSON.stringify(items));
      if (expectedBudget) formData.append('expectedBudget', expectedBudget);
      if (expectedDate) formData.append('expectedDate', expectedDate);
      if (specFile) formData.append('specFile', specFile);

      await apiClient.post('/rfq', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success('RFQ Submitted successfully. We will get back to you shortly.');
      router.push('/business');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request For Quotation (RFQ)</h2>
        <p className="text-gray-600 mb-8">
          Submit your bulk or custom requirements, and our team will provide a tailored quote within our 24-hour SLA.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Products Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Requested Items</h3>
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 items-start p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name / SKU</label>
                  <input
                    type="text"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
                    value={item.productName}
                    onChange={(e) => handleChangeItem(index, 'productName', e.target.value)}
                    placeholder="e.g. A4 Paper Rim (Brand X)"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
                    value={item.quantity}
                    onChange={(e) => handleChangeItem(index, 'quantity', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specific Requirements</label>
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
                    value={item.specs}
                    onChange={(e) => handleChangeItem(index, 'specs', e.target.value)}
                    placeholder="Color, Size, etc."
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="mt-6 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              + Add another item
            </button>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Budget (Total)</label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">৳</span>
                </div>
                <input
                  type="number"
                  className="block w-full rounded-md border-gray-300 pl-7 focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 border"
                  placeholder="0.00"
                  value={expectedBudget}
                  onChange={(e) => setExpectedBudget(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
              <input
                type="date"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Specifications (Optional)</label>
            <input
              type="file"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              onChange={(e) => setSpecFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto flex justify-center py-2 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit RFQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
