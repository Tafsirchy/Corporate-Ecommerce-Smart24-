'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Trash2, Image as ImageIcon, Edit2, X } from 'lucide-react';

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState('MAIN_CAROUSEL');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setIsLoadingTable(true);
      const res = await apiClient.get('/banners');
      setBanners(res.data);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setIsLoadingTable(false);
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

  const handleEdit = (banner: any) => {
    setTitle(banner.title);
    setTargetUrl(banner.targetUrl || '');
    setImageUrl(banner.imageUrl);
    setType(banner.type);
    setEditingId(banner.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setTitle('');
    setTargetUrl('');
    setImageUrl('');
    setType('MAIN_CAROUSEL');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      return toast.error('Please upload an image first');
    }

    setIsLoading(true);
    try {
      if (editingId) {
        await apiClient.patch(`/banners/${editingId}`, {
          title,
          imageUrl,
          targetUrl: targetUrl || undefined,
          type
        });
        toast.success('Banner updated');
      } else {
        await apiClient.post('/banners', { 
          title, 
          imageUrl,
          targetUrl: targetUrl || undefined,
          isActive: true,
          type,
          order: banners.length
        });
        toast.success('Banner created');
      }
      
      handleCancelEdit();
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save banner');
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
    const previousBanners = [...banners];
    setBanners(banners.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
    
    try {
      await apiClient.patch(`/banners/${id}`, { isActive: !currentStatus });
      toast.success('Status updated');
    } catch (error) {
      setBanners(previousBanners);
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Offers & Banners</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-border mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editingId ? 'Edit Banner' : 'Add New Banner'}</h2>
          {editingId && (
            <button onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
              <X size={16} /> Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Banner Title</label>
            <input 
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Monsoon Magic Deal"
              className="w-full px-4 py-2 border rounded focus:ring-primary-600 focus:border-primary-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Target Link (Optional)</label>
            <input 
              type="text" value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
              placeholder="e.g. /shop?category=monsoon"
              className="w-full px-4 py-2 border rounded focus:ring-primary-600 focus:border-primary-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Banner Type</label>
            <select 
              value={type} onChange={e => setType(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-primary-600 focus:border-primary-600"
            >
              <option value="MAIN_CAROUSEL">Main Carousel</option>
              <option value="SPECIAL_OFFER">Special Offer (Before Business Collections)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload Banner Image
              <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                {type === 'SPECIAL_OFFER' 
                  ? 'Recommended: 1920x320 pixels (6:1 aspect ratio) to prevent cropping.'
                  : 'Recommended: 1200x400 pixels (3:1 aspect ratio) to prevent cropping.'}
              </span>
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {isUploading && <span className="text-sm text-muted-foreground font-medium">Uploading to ImgBB...</span>}
            </div>
            {imageUrl && (
              <div className="mt-4">
                <OptimizedImage src={imageUrl} alt="Preview" className="h-32 object-contain rounded border bg-muted p-2" />
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 pt-4 flex gap-2">
            <button 
              type="submit" disabled={isLoading || isUploading}
              className="bg-primary-600 text-white px-6 py-2 rounded font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : (editingId ? 'Update Banner' : 'Add Banner')}
            </button>
            {editingId && (
              <button 
                type="button" onClick={handleCancelEdit} disabled={isLoading || isUploading}
                className="bg-muted text-foreground px-6 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="p-4 font-medium text-muted-foreground">Image</th>
              <th className="p-4 font-medium text-muted-foreground">Title</th>
              <th className="p-4 font-medium text-muted-foreground">Type</th>
              <th className="p-4 font-medium text-muted-foreground">Status</th>
              <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoadingTable ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No banners found</td>
              </tr>
            ) : (
              banners.map(banner => (
                <tr key={banner.id} className="hover:bg-muted">
                  <td className="p-4">
                    <OptimizedImage src={banner.imageUrl} alt={banner.title} className="h-16 w-auto object-cover rounded border" />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-foreground">{banner.title}</div>
                    {banner.targetUrl && <div className="text-sm text-muted-foreground">{banner.targetUrl}</div>}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
                      {banner.type === 'SPECIAL_OFFER' ? 'Special Offer' : 'Main Carousel'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleStatus(banner.id, banner.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${banner.isActive ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-destructive'}`}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(banner)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="Edit Banner"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 text-destructive hover:bg-danger-bg rounded transition-colors"
                        title="Delete Banner"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
