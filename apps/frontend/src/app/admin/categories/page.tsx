'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Edit2, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, [page]);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await apiClient.get(`/categories?page=${page}&limit=10`);
      setCategories(res.data.data || res.data);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  async function fetchAllCategories() {
    try {
      const res = await apiClient.get('/categories');
      setAllCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch all categories for dropdown');
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name,
        parentId: parentId || undefined,
        isActive
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
      setIsActive(true);
      fetchCategories();
      fetchAllCategories();
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
    setIsActive(cat.isActive ?? true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
      fetchAllCategories();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-border mb-8 max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
          {editingId && (
            <button 
              onClick={() => {
                setEditingId(null);
                setName('');
                setParentId('');
                setIsActive(true);
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
            <label className="block text-sm font-medium text-foreground mb-1">Parent Category (Optional)</label>
            <select 
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black bg-white"
            >
              <option value="">None (Top Level)</option>
              {allCategories.map(c => <option key={c.id} value={c.id} disabled={editingId === c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-foreground">
              Active (Visible on UI)
            </label>
          </div>
          <button 
            type="submit"  
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-secondary disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (editingId ? 'Update Category' : 'Add Category')}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="p-4 font-medium text-muted-foreground">Name</th>
              <th className="p-4 font-medium text-muted-foreground">Slug</th>
              <th className="p-4 font-medium text-muted-foreground">Level</th>
              <th className="p-4 font-medium text-muted-foreground">Parent</th>
              <th className="p-4 font-medium text-muted-foreground">Status</th>
              <th className="p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => {
              const parentName = allCategories.find(c => c.id === cat.parentId)?.name || '-';
              return (
                <tr key={cat.id} className="hover:bg-muted">
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4 text-muted-foreground">{cat.slug}</td>
                  <td className="p-4 text-muted-foreground">{cat.level}</td>
                  <td className="p-4 text-muted-foreground">{parentName}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-3">
                    <button onClick={() => startEdit(cat)} className="text-muted-foreground hover:text-black" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-border gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-muted-foreground">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
