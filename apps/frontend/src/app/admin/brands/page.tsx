'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await apiClient.get('/brands');
      setBrands(res.data);
    } catch (error) {
      toast.error('Failed to fetch brands');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post('/brands', { name, description, logo });
      toast.success('Brand created');
      setName('');
      setDescription('');
      setLogo('');
      fetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create brand');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Brands</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-xl">
        <h2 className="text-xl font-bold mb-4">Add New Brand</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
            <input 
              type="url"
              value={logo}
              onChange={e => setLogo(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Add Brand'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Logo</th>
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Slug</th>
              <th className="p-4 font-medium text-gray-600">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brands.map(brand => (
              <tr key={brand.id} className="hover:bg-gray-50">
                <td className="p-4">
                  {brand.logo ? <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-contain" /> : '-'}
                </td>
                <td className="p-4 font-medium">{brand.name}</td>
                <td className="p-4 text-gray-500">{brand.slug}</td>
                <td className="p-4 text-gray-500">{brand.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
