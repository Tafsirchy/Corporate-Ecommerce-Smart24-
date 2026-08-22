'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Edit2, Trash2, X, Search } from 'lucide-react';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

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
      setIsModalOpen(false);
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
    setIsModalOpen(true);
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

  const getCategoryPath = (categoryId: string) => {
    const path = [];
    let currentId = categoryId;
    while (currentId) {
      const cat = allCategories.find(c => c.id === currentId);
      if (cat) {
        path.unshift(cat.name);
        currentId = cat.parentId;
      } else {
        break;
      }
    }
    return path.join(' > ');
  };

  const displayedCategories = searchTerm 
    ? allCategories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.slug.toLowerCase().includes(searchTerm.toLowerCase()))
    : categories;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 min-h-[44px] border rounded focus:ring-black focus:border-black"
            />
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setName('');
              setParentId('');
              setIsActive(true);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-black text-white px-6 py-2 min-h-[44px] rounded font-medium hover:bg-secondary transition-colors"
          >
            Add New Category
          </button>
        </div>
      </div>
      
      {isModalOpen && (
        <ScrollFade className="fixed inset-0 bg-white sm:bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <ScrollFade className="bg-white sm:rounded-xl shadow-2xl p-4 w-full h-full sm:h-auto sm:max-h-[95vh] max-w-xl relative overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-border">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
              <button 
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setParentId('');
                  setIsActive(true);
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
            <label className="block text-sm font-medium text-foreground mb-1">Parent Category (Optional)</label>
            <select 
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black bg-white"
            >
              <option value="">None (Top Level)</option>
              {allCategories.map(c => <option key={c.id} value={c.id} disabled={editingId === c.id}>{getCategoryPath(c.id)}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer min-h-[44px] w-max">
            <input 
              type="checkbox" 
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-5 h-5 text-black focus:ring-black border-gray-300 rounded"
            />
            <span className="text-base font-medium text-foreground">
              Active (Visible on UI)
            </span>
          </label>
          <button 
            type="submit"  
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 min-h-[44px] text-base rounded font-medium hover:bg-secondary disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (editingId ? 'Update Category' : 'Add Category')}
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
                <th className="p-4 font-medium text-muted-foreground">Name & Path</th>
                <th className="p-4 font-medium text-muted-foreground">Slug</th>
                <th className="p-4 font-medium text-muted-foreground">Level</th>
                <th className="p-4 font-medium text-muted-foreground">Parent</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedCategories.map(cat => {
                const parentName = allCategories.find(c => c.id === cat.parentId)?.name || '-';
                return (
                  <tr key={cat.id} className="hover:bg-muted">
                    <td className="p-4">
                      <div className="font-medium">{cat.name}</div>
                      {cat.parentId && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {getCategoryPath(cat.id)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{cat.slug}</td>
                    <td className="p-4 text-muted-foreground">{cat.level}</td>
                    <td className="p-4 text-muted-foreground">{parentName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {cat.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => startEdit(cat)} 
                          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded transition-colors" 
                          title="Edit"
                          aria-label={`Edit ${cat.name}`}
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)} 
                          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-destructive hover:bg-danger-bg rounded transition-colors" 
                          title="Delete"
                          aria-label={`Delete ${cat.name}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollFade>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {displayedCategories.map(cat => {
            const parentName = allCategories.find(c => c.id === cat.parentId)?.name || '-';
            return (
              <div key={cat.id} className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-bold text-base text-foreground">{cat.name}</div>
                      {cat.parentId && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {getCategoryPath(cat.id)}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                    <div><span className="font-medium text-foreground">Slug:</span> {cat.slug}</div>
                    <div><span className="font-medium text-foreground">Level:</span> {cat.level}</div>
                    <div className="col-span-2"><span className="font-medium text-foreground">Parent:</span> {parentName}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-2 pt-4 border-t border-border">
                  <button 
                    onClick={() => startEdit(cat)} 
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-primary-600 bg-primary-50 rounded-lg transition-colors font-medium text-sm"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Edit2 size={18} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)} 
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-destructive bg-danger-bg rounded-lg transition-colors font-medium text-sm"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
          {displayedCategories.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No categories found</div>
          )}
        </div>
        
        {/* Pagination */}
        {!searchTerm && totalPages > 1 && (
          <div className="flex justify-center items-center p-4 border-t border-border gap-4">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 min-h-[44px] min-w-[80px] font-medium border rounded hover:bg-muted disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-base font-medium text-muted-foreground">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 min-h-[44px] min-w-[80px] font-medium border rounded hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
