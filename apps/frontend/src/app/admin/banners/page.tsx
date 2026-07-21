'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Trash2, Image as ImageIcon } from 'lucide-react';

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await apiClient.get('/banners');
      setBanners(res.data);
    } catch (error) {
      toast.error('Failed to fetch banners');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(res.data.url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      return toast.error('Please upload an image first');
    }

    setIsLoading(true);
    try {
      await apiClient.post('/banners', { 
        title, 
        imageUrl,
        targetUrl: targetUrl || undefined,
        isActive: true,
        order: banners.length
      });
      toast.success('Banner created');
      
      // Reset form
      setTitle('');
      setTargetUrl('');
      setImageUrl('');
      
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await apiClient.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/banners/${id}`, { isActive: !currentStatus });
      toast.success('Status updated');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Offers & Banners</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Banner</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
            <input 
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Monsoon Magic Deal"
              className="w-full px-4 py-2 border rounded focus:ring-primary-600 focus:border-primary-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Link (Optional)</label>
            <input 
              type="text" value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
              placeholder="e.g. /shop?category=monsoon"
              className="w-full px-4 py-2 border rounded focus:ring-primary-600 focus:border-primary-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Banner Image (Landscape Recommended)</label>
            <div className="flex items-center gap-4">
              <input 
                type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {isUploading && <span className="text-sm text-gray-500 font-medium">Uploading to ImgBB...</span>}
            </div>
            {imageUrl && (
              <div className="mt-4">
                <img src={imageUrl} alt="Preview" className="h-32 object-contain rounded border bg-gray-50 p-2" />
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 pt-4">
            <button 
              type="submit" disabled={isLoading || isUploading}
              className="bg-primary-600 text-white px-6 py-2 rounded font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : 'Add Banner'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Image</th>
              <th className="p-4 font-medium text-gray-600">Title</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banners.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No banners found</td>
              </tr>
            ) : (
              banners.map(banner => (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <img src={banner.imageUrl} alt={banner.title} className="h-16 w-auto object-cover rounded border" />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{banner.title}</div>
                    {banner.targetUrl && <div className="text-sm text-gray-500">{banner.targetUrl}</div>}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(banner.id, banner.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
