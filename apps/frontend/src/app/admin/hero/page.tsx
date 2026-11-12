'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface HeroContentItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  categoryUrl: string;
  order: number;
  isActive: boolean;
}

export default function AdminHeroPage() {
  const [items, setItems] = useState<HeroContentItem[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryUrl, setCategoryUrl] = useState('/shop');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setIsLoadingTable(true);
      const res = await apiClient.get('/hero-contents');
      setItems(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load hero contents');
    } finally {
      setIsLoadingTable(false);
    }
  }

  function resetForm() {
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setCategoryUrl('/shop');
    setOrder(items.length);
    setIsActive(true);
    setEditingId(null);
    setIsModalOpen(false);
  }

  function handleEdit(item: HeroContentItem) {
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setImageUrl(item.imageUrl);
    setCategoryUrl(item.categoryUrl);
    setOrder(item.order ?? 0);
    setIsActive(item.isActive);
    setEditingId(item.id);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      toast.error('Please upload or provide an image URL');
      return;
    }

    setIsSaving(true);
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      imageUrl,
      categoryUrl: categoryUrl.trim() || '/shop',
      order: Number(order) || 0,
      isActive,
    };

    try {
      if (editingId) {
        await apiClient.patch(`/hero-contents/${editingId}`, payload);
        toast.success('Hero slide updated');
      } else {
        await apiClient.post('/hero-contents', payload);
        toast.success('Hero slide created');
      }
      resetForm();
      fetchItems();
    } catch {
      toast.error('Failed to save hero slide');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this hero slide?')) return;
    try {
      await apiClient.delete(`/hero-contents/${id}`);
      toast.success('Hero slide deleted');
      fetchItems();
    } catch {
      toast.error('Failed to delete hero slide');
    }
  }

  async function handleToggleActive(item: HeroContentItem) {
    try {
      await apiClient.patch(`/hero-contents/${item.id}`, { isActive: !item.isActive });
      toast.success(`Hero slide ${!item.isActive ? 'activated' : 'deactivated'}`);
      fetchItems();
    } catch {
      toast.error('Failed to update status');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Section</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the interactive hero bento slides shown at the top of the home page.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setOrder(items.length);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          Add Hero Slide
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoadingTable ? (
          <div className="p-8 text-center text-gray-500">Loading hero slides...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hero slides yet. Click &ldquo;Add Hero Slide&rdquo; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Title &amp; Subtitle</th>
                  <th className="p-4">Target URL</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="relative w-24 h-14 rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                        <OptimizedImage src={item.imageUrl} alt={item.title} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.subtitle}</div>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-xs">{item.categoryUrl}</td>
                    <td className="p-4 text-gray-700">{item.order}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Hero Slide' : 'Add Hero Slide'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g. Business Pantry Essentials"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle *</label>
                <textarea
                  required
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Short description shown on the active slide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image *</label>
                <ImageUpload
                  images={imageUrl ? [imageUrl] : []}
                  setImages={(urls) => setImageUrl(urls[0] || '')}
                  label="Upload Hero Image"
                />
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  placeholder="Or paste image URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target URL *</label>
                  <input
                    type="text"
                    required
                    value={categoryUrl}
                    onChange={(e) => setCategoryUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="/shop/pantry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Active on Home Page
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

