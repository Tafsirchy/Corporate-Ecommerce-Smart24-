'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Edit2, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name,
        parentId: parentId || undefined
      };

      if (editingId) {
        await apiClient.patch(`/categories/${editingId}`, payload);
        toast.success('Category updated');
        setEditingId(null);
      } else {
        await apiClient.post('/categories', payload);
        toast.success('Category created');
      }
      
      setName('');
      setParentId('');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setParentId(cat.parentId || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
          {editingId && (
            <button 
              onClick={() => {
                setEditingId(null);
                setName('');
                setParentId('');
              }}
              className="text-sm text-gray-500 hover:text-black border px-3 py-1 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category (Optional)</label>
            <select 
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black bg-white"
            >
              <option value="">None (Top Level)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} disabled={editingId === cat.id}>
                  {cat.name} {cat.level ? `(Level ${cat.level})` : ''}
                </option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (editingId ? 'Update Category' : 'Add Category')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Slug</th>
              <th className="p-4 font-medium text-gray-600">Level</th>
              <th className="p-4 font-medium text-gray-600">Parent</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => {
              const parentName = categories.find(c => c.id === cat.parentId)?.name || '-';
              return (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4 text-gray-500">{cat.slug}</td>
                  <td className="p-4 text-gray-500">{cat.level}</td>
                  <td className="p-4 text-gray-500">{parentName}</td>
                  <td className="p-4 flex gap-3">
                    <button onClick={() => startEdit(cat)} className="text-gray-400 hover:text-black" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-500" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
