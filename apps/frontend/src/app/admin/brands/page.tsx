'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Edit2, Trash2, X } from 'lucide-react';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadMode, setIsUploadMode] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    try {
      const res = await apiClient.get('/brands?limit=100');
      setBrands(res.data.data || res.data);
    } catch (error) {
      toast.error('Failed to fetch brands');
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      let finalLogoUrl = logoUrl;
      
      if (isUploadMode && logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const uploadRes = await apiClient.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalLogoUrl = uploadRes.data.url;
      }

      const payload = {
        name,
        description,
        logoUrl: finalLogoUrl || undefined
      };

      if (editingId) {
        await apiClient.patch(`/brands/${editingId}`, payload);
        toast.success('Brand updated');
        setEditingId(null);
      } else {
        await apiClient.post('/brands', payload);
        toast.success('Brand created');
      }
      
      setName('');
      setDescription('');
      setLogoUrl('');
      setLogoFile(null);
      setIsModalOpen(false);
      fetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save brand');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (brand: any) => {
    setEditingId(brand.id);
    setName(brand.name);
    setDescription(brand.description || '');
    setLogoUrl(brand.logoUrl || '');
    setLogoFile(null);
    setIsUploadMode(false); // Default to URL mode when editing to show existing URL
    setIsModalOpen(true);
  };

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      await apiClient.delete(`/brands/${id}`);
      toast.success('Brand deleted');
      fetchBrands();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Manage Brands</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setName('');
            setDescription('');
            setLogoUrl('');
            setLogoFile(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-black text-white px-6 py-2 min-h-[44px] rounded font-medium hover:bg-secondary transition-colors"
        >
          Add New Brand
        </button>
      </div>
      
      {isModalOpen && (
        <ScrollFade className="fixed inset-0 bg-white sm:bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <ScrollFade className="bg-white sm:rounded-xl shadow-2xl p-4 w-full h-full sm:h-auto sm:max-h-[95vh] max-w-xl relative overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-border">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Brand' : 'Add New Brand'}</h2>
              <button 
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setDescription('');
                  setLogoUrl('');
                  setLogoFile(null);
                  setIsModalOpen(false);
                }} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <label className="block text-sm font-medium text-foreground">Logo</label>
              <div className="flex items-center gap-2 text-base">
                <button
                  type="button"
                  onClick={() => setIsUploadMode(true)}
                  className={`px-4 py-2 min-h-[44px] rounded-full transition-colors ${isUploadMode ? 'bg-black text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadMode(false)}
                  className={`px-4 py-2 min-h-[44px] rounded-full transition-colors ${!isUploadMode ? 'bg-black text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  Image URL
                </button>
              </div>
            </div>
            
            {isUploadMode ? (
              <input
                key="file-input"
                type="file"
                accept="image/*"
                onChange={e => setLogoFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 text-base min-h-[44px] border rounded focus:ring-black focus:border-black file:mr-4 file:py-2 file:px-4 file:min-h-[44px] file:rounded-full file:border-0 file:font-semibold file:bg-muted file:text-black hover:file:bg-muted"
              />
            ) : (
              <input 
                key="url-input"
                type="url"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black"
              />
            )}
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 min-h-[44px] text-base rounded font-medium hover:bg-secondary disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (editingId ? 'Update Brand' : 'Add Brand')}
          </button>
        </form>
      </ScrollFade>
    </ScrollFade>
    )}

    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Desktop Table View */}
        <ScrollFade className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="p-4 font-medium text-muted-foreground">Logo</th>
                <th className="p-4 font-medium text-muted-foreground">Name</th>
                <th className="p-4 font-medium text-muted-foreground">Slug</th>
                <th className="p-4 font-medium text-muted-foreground">Description</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {brands.map(brand => (
                <tr key={brand.id} className="hover:bg-muted">
                  <td className="p-4">
                    {brand.logoUrl ? <OptimizedImage src={brand.logoUrl} alt={brand.name} width={40} height={40} containerClassName="h-10 w-10 shrink-0 bg-white border rounded" className="object-contain p-1" /> : '-'}
                  </td>
                  <td className="p-4 font-medium">{brand.name}</td>
                  <td className="p-4 text-muted-foreground">{brand.slug}</td>
                  <td className="p-4 text-muted-foreground">{brand.description}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => startEdit(brand)} 
                        className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded transition-colors" 
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(brand.id)} 
                        className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-destructive hover:bg-danger-bg rounded transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollFade>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {brands.map(brand => (
            <div key={brand.id} className="p-4 flex flex-col gap-4">
              <div className="flex gap-4">
                {brand.logoUrl ? (
                  <OptimizedImage src={brand.logoUrl} alt={brand.name} width={64} height={64} containerClassName="h-16 w-16 shrink-0 bg-white border rounded-lg" className="object-contain p-2" />
                ) : (
                  <div className="h-16 w-16 bg-muted border rounded-lg shrink-0 flex items-center justify-center text-xs text-muted-foreground">No Logo</div>
                )}
                
                <div className="flex flex-col gap-1 flex-1">
                  <div className="font-bold text-base text-foreground">{brand.name}</div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Slug:</span> {brand.slug}
                  </div>
                  {brand.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2">{brand.description}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-2 pt-4 border-t border-border">
                <button 
                  onClick={() => startEdit(brand)} 
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-primary-600 bg-primary-50 rounded-lg transition-colors font-medium text-sm"
                  aria-label={`Edit ${brand.name}`}
                >
                  <Edit2 size={18} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(brand.id)} 
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-destructive bg-danger-bg rounded-lg transition-colors font-medium text-sm"
                  aria-label={`Delete ${brand.name}`}
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          ))}
          {brands.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No brands found</div>
          )}
        </div>
      </div>
    </div>
  );
}
