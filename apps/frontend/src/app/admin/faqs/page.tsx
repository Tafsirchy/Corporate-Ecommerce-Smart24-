'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';
import { Loader2, Plus, Edit2, Trash2, Check, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  helpfulCount: number;
  notHelpfulCount: number;
}

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Faq>>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ category: '', question: '', answer: '', isActive: true, order: 0 });

  async function fetchFaqs() {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);

      const res = await apiClient.get(`/faqs/admin/all?${params.toString()}`);
      
      if (res.data && Array.isArray(res.data.data)) {
        setFaqs(res.data.data);
        setTotalPages(res.data.meta?.totalPages || 1);
      } else {
        setFaqs(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [page, searchTerm]);

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient.post('/faqs', {
        ...addForm,
        order: parseInt(addForm.order as any) || 0
      });
      setIsAdding(false);
      setAddForm({ category: '', question: '', answer: '', isActive: true, order: 0 });
      fetchFaqs();
    } catch (error) {
      alert('Failed to add FAQ');
    }
  };

  async function handleEditSubmit(id: string) {
    try {
      await apiClient.patch(`/faqs/${id}`, {
        ...editForm,
        order: parseInt(editForm.order as any) || 0
      });
      setIsEditing(null);
      fetchFaqs();
    } catch (error) {
      alert('Failed to update FAQ');
    }
  };

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await apiClient.delete(`/faqs/${id}`);
      fetchFaqs();
    } catch (error) {
      alert('Failed to delete FAQ');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary/90" /></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage FAQs</h1>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex flex-shrink-0 items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-secondary transition text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border mb-6">
          <h2 className="text-lg font-bold mb-4">Add New FAQ</h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input required type="text" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="e.g. Shipping" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order (Optional)</label>
                <input type="number" value={addForm.order} onChange={e => setAddForm({...addForm, order: Number(e.target.value)})} className="w-full border rounded p-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <input required type="text" value={addForm.question} onChange={e => setAddForm({...addForm, question: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <textarea required rows={3} value={addForm.answer} onChange={e => setAddForm({...addForm, answer: e.target.value})} className="w-full border rounded p-2 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={addForm.isActive} onChange={e => setAddForm({...addForm, isActive: e.target.checked})} id="isActive" />
              <label htmlFor="isActive" className="text-sm font-medium">Active</label>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="p-4 text-sm font-semibold text-muted-foreground w-24">Order</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground w-32">Category</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Q & A</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground w-24">Status</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {faqs.map(faq => {
                const editing = isEditing === faq.id;
                return (
                  <tr key={faq.id} className="hover:bg-muted">
                    <td className="p-4">
                      {editing ? (
                        <input type="number" value={editForm.order} onChange={e => setEditForm({...editForm, order: Number(e.target.value)})} className="w-16 border rounded p-1 text-sm" />
                      ) : (
                        faq.order
                      )}
                    </td>
                    <td className="p-4">
                      {editing ? (
                        <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full border rounded p-1 text-sm" />
                      ) : (
                        <span className="inline-block px-2 py-1 bg-muted text-xs rounded-full font-medium">{faq.category}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editing ? (
                        <div className="space-y-2">
                          <input type="text" value={editForm.question} onChange={e => setEditForm({...editForm, question: e.target.value})} className="w-full border rounded p-1 text-sm font-medium" />
                          <textarea rows={2} value={editForm.answer} onChange={e => setEditForm({...editForm, answer: e.target.value})} className="w-full border rounded p-1 text-sm" />
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-sm text-foreground">{faq.question}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{faq.answer}</p>
                          <div className="flex gap-4 mt-2 text-xs font-medium">
                            <span className="text-success-text bg-success-bg px-2 py-0.5 rounded">👍 {faq.helpfulCount || 0} Helpful</span>
                            <span className="text-destructive bg-danger-bg px-2 py-0.5 rounded">👎 {faq.notHelpfulCount || 0} Not Helpful</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {editing ? (
                        <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} />
                      ) : (
                        faq.isActive ? <span className="text-success-text text-xs font-bold">ACTIVE</span> : <span className="text-destructive text-xs font-bold">INACTIVE</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {editing ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditSubmit(faq.id)} className="p-1.5 text-success-text hover:bg-success-bg rounded"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setIsEditing(null)} className="p-1.5 text-muted-foreground hover:bg-muted rounded"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setIsEditing(faq.id); setEditForm(faq); }} className="p-1.5 text-info-text hover:bg-info-bg rounded"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(faq.id)} className="p-1.5 text-destructive hover:bg-danger-bg rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted">
            <span className="text-sm text-muted-foreground">
              Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
