'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Trash2, Image as ImageIcon, Edit2, X } from 'lucide-react';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [type, setType] = useState('MAIN_CAROUSEL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

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
    setLocalPreview(null);
    setType(banner.type);
    setEditingId(banner.id);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setTitle('');
    setTargetUrl('');
    setImageUrl('');
    setLocalPreview(null);
    setType('MAIN_CAROUSEL');
    setEditingId(null);
    setIsModalOpen(false);
  };

  async function handleSubmit(e: React.FormEvent) {
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
      setLocalPreview(null);
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save banner');
    } finally {
      setIsLoading(false);
    }
  };

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await apiClient.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  async function toggleStatus(id: string, currentStatus: boolean) {
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
      <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Manage Offers & Banners</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-primary-600 text-white px-6 py-2 min-h-[44px] rounded font-medium hover:bg-primary-700 transition-colors"
        >
          Add New Banner
        </button>
      </div>
      
      {isModalOpen && (
        <ScrollFade className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative my-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Banner Title</label>
                <input 
                  type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Monsoon Magic Deal"
                  className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-primary-600 focus:border-primary-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Target Link (Optional)</label>
                <input 
                  type="text" value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
                  placeholder="e.g. /shop?category=monsoon"
                  className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-primary-600 focus:border-primary-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Banner Type</label>
                <select 
                  value={type} onChange={e => setType(e.target.value)}
                  className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-primary-600 focus:border-primary-600"
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
                    id="banner-image-upload"
                    type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading}
                    className="block w-full text-base text-muted-foreground file:mr-4 file:py-2 file:px-4 file:min-h-[44px] file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {isUploading && <span className="text-sm text-muted-foreground font-medium">Uploading to ImgBB...</span>}
                </div>
                {(localPreview || imageUrl) && (
                  <div className="mt-4 relative inline-block">
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setLocalPreview(null);
                        const fileInput = document.getElementById('banner-image-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                      title="Remove Image"
                    >
                      <X size={16} />
                    </button>
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded z-0">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                    {localPreview ? (
                      <img src={localPreview} alt="Preview" className="h-32 object-contain rounded border bg-muted p-2 relative z-0" />
                    ) : (
                      <OptimizedImage src={imageUrl} alt="Preview" className="h-32 object-contain rounded border bg-muted p-2 relative z-0" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 pt-4 flex gap-2">
                <button 
                  type="submit" disabled={isLoading || isUploading}
                  className="w-full bg-primary-600 text-white px-6 py-2 min-h-[44px] rounded font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Saving...' : (editingId ? 'Update Banner' : 'Add Banner')}
                </button>
              </div>
            </form>
          </div>
        </ScrollFade>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Desktop Table View */}
        <ScrollFade className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
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
                      <OptimizedImage src={banner.imageUrl} alt={banner.title} className="h-16 w-auto max-w-[120px] object-cover rounded border" />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{banner.title}</div>
                      {banner.targetUrl && <div className="text-sm text-muted-foreground truncate max-w-[200px]">{banner.targetUrl}</div>}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
                        {banner.type === 'SPECIAL_OFFER' ? 'Special Offer' : 'Main Carousel'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(banner.id, banner.isActive)}
                        className={`px-3 py-2 min-h-[44px] rounded-full text-sm font-semibold ${banner.isActive ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-destructive'}`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(banner)}
                          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="Edit Banner"
                          aria-label={`Edit ${banner.title}`}
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDelete(banner.id)}
                          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-destructive hover:bg-danger-bg rounded transition-colors"
                          title="Delete Banner"
                          aria-label={`Delete ${banner.title}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollFade>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {isLoadingTable ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : banners.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No banners found</div>
          ) : (
            banners.map(banner => (
              <div key={banner.id} className="p-4 flex flex-col gap-4">
                <OptimizedImage src={banner.imageUrl} alt={banner.title} className="w-full h-32 object-cover rounded-lg border bg-muted" />
                
                <div className="flex flex-col gap-1">
                  <div className="font-bold text-base text-foreground">{banner.title}</div>
                  {banner.targetUrl && <div className="text-sm text-muted-foreground break-all">{banner.targetUrl}</div>}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
                    {banner.type === 'SPECIAL_OFFER' ? 'Special Offer' : 'Main Carousel'}
                  </span>
                  
                  <button 
                    onClick={() => toggleStatus(banner.id, banner.isActive)}
                    className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-semibold ${banner.isActive ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-destructive'}`}
                  >
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 mt-2 pt-4 border-t border-border">
                  <button 
                    onClick={() => handleEdit(banner)}
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-primary-600 bg-primary-50 rounded transition-colors font-medium text-sm"
                    aria-label={`Edit ${banner.title}`}
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-destructive bg-danger-bg rounded transition-colors font-medium text-sm"
                    aria-label={`Delete ${banner.title}`}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
