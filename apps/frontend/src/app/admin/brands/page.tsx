'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Edit2, Trash2 } from 'lucide-react';

export default function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadMode, setIsUploadMode] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <h1 className="text-3xl font-bold mb-6">Manage Brands</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-border mb-8 max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editingId ? 'Edit Brand' : 'Add New Brand'}</h2>
          {editingId && (
            <button 
              onClick={() => {
                setEditingId(null);
                setName('');
                setDescription('');
                setLogoUrl('');
                setLogoFile(null);
              }}
              className="text-sm text-muted-foreground hover:text-black border px-3 py-1 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <label className="block text-sm font-medium text-foreground">Logo</label>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setIsUploadMode(true)}
                  className={`px-3 py-1 rounded-full transition-colors ${isUploadMode ? 'bg-black text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadMode(false)}
                  className={`px-3 py-1 rounded-full transition-colors ${!isUploadMode ? 'bg-black text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
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
                className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-black hover:file:bg-muted"
              />
            ) : (
              <input 
                key="url-input"
                type="url"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
              />
            )}
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-secondary disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (editingId ? 'Update Brand' : 'Add Brand')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="p-4 font-medium text-muted-foreground">Logo</th>
              <th className="p-4 font-medium text-muted-foreground">Name</th>
              <th className="p-4 font-medium text-muted-foreground">Slug</th>
              <th className="p-4 font-medium text-muted-foreground">Description</th>
              <th className="p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {brands.map(brand => (
              <tr key={brand.id} className="hover:bg-muted">
                <td className="p-4">
                  {brand.logoUrl ? <OptimizedImage src={brand.logoUrl} alt={brand.name} className="h-8 w-8 object-contain" /> : '-'}
                </td>
                <td className="p-4 font-medium">{brand.name}</td>
                <td className="p-4 text-muted-foreground">{brand.slug}</td>
                <td className="p-4 text-muted-foreground">{brand.description}</td>
                <td className="p-4 flex gap-3">
                  <button onClick={() => startEdit(brand)} className="text-muted-foreground hover:text-black" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(brand.id)} className="text-muted-foreground hover:text-destructive" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
