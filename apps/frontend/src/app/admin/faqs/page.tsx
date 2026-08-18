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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Faq>>({
    category: '', question: '', answer: '', isActive: true, order: 0
  });

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

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ category: '', question: '', answer: '', isActive: true, order: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (faq: Faq) => {
    setEditingId(faq.id);
    setFormData(faq);
    setIsModalOpen(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        order: parseInt(formData.order as any) || 0
      };
      
      if (editingId) {
        await apiClient.patch(`/faqs/${editingId}`, payload);
      } else {
        await apiClient.post('/faqs', payload);
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (error) {
      alert('Failed to save FAQ');
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
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
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
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] text-base"
            />
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex flex-shrink-0 items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-secondary transition min-h-[44px] text-base font-medium w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add FAQ
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white sm:bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white sm:rounded-2xl w-full h-full sm:h-auto max-w-2xl sm:max-h-[95vh] flex flex-col shadow-2xl relative overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 pt-2 sm:pt-4">
              <form id="faq-form" onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-0.5">Category</label>
                    <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded p-2 min-h-[44px] text-base focus:ring-black focus:border-black" placeholder="e.g. Shipping" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-0.5">Order (Optional)</label>
                    <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full border rounded p-2 min-h-[44px] text-base focus:ring-black focus:border-black" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-0.5">Question</label>
                  <input required type="text" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full border rounded p-2 min-h-[44px] text-base focus:ring-black focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-0.5">Answer</label>
                  <textarea required rows={3} value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} className="w-full border rounded p-2 min-h-[44px] text-base focus:ring-black focus:border-black" />
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-muted rounded min-h-[44px] cursor-pointer" onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} id="isActive" className="w-5 h-5 cursor-pointer focus:ring-black text-black" onClick={e => e.stopPropagation()} />
                  <label htmlFor="isActive" className="text-base font-medium cursor-pointer flex-1" onClick={e => e.preventDefault()}>Active Status</label>
                </div>
              </form>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 bg-muted sm:rounded-b-2xl mt-auto sm:mt-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 min-h-[44px] text-base rounded-lg text-foreground bg-white sm:bg-transparent border sm:border-none border-border hover:bg-gray-100 sm:hover:bg-muted/80 font-medium transition w-full sm:w-auto">
                Cancel
              </button>
              <button type="submit" form="faq-form" className="px-6 min-h-[44px] text-base rounded-lg bg-black hover:bg-secondary text-white font-medium transition shadow-sm w-full sm:w-auto">
                {editingId ? 'Save Changes' : 'Create FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-border">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
              {faqs.map(faq => (
                  <tr key={faq.id} className="hover:bg-muted">
                    <td className="p-4">{faq.order}</td>
                    <td className="p-4"><span className="inline-block px-2 py-1 bg-muted text-xs rounded-full font-medium">{faq.category}</span></td>
                    <td className="p-4">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{faq.question}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{faq.answer}</p>
                          <div className="flex gap-4 mt-2 text-xs font-medium">
                            <span className="text-success-text bg-success-bg px-2 py-0.5 rounded">👍 {faq.helpfulCount || 0} Helpful</span>
                            <span className="text-destructive bg-danger-bg px-2 py-0.5 rounded">👎 {faq.notHelpfulCount || 0} Not Helpful</span>
                          </div>
                        </div>
                    </td>
                    <td className="p-4">
                        {faq.isActive ? <span className="text-success-text text-xs font-bold">ACTIVE</span> : <span className="text-destructive text-xs font-bold">INACTIVE</span>}
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEdit(faq)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-info-text hover:bg-info-bg rounded"><Edit2 className="w-5 h-5" /></button>
                          <button onClick={() => handleDelete(faq.id)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive hover:bg-danger-bg rounded"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </td>
                  </tr>
                ))}
              {faqs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No FAQs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-border">
          {faqs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No FAQs found.</div>
          ) : (
            faqs.map(faq => (
                <div key={faq.id} className="p-4 flex flex-col gap-4">
                      <div className="flex justify-between items-start gap-2">
                        <span className="inline-block px-2 py-1 bg-muted text-xs rounded-full font-medium">{faq.category}</span>
                        {faq.isActive ? <span className="text-success-text text-xs font-bold bg-success-bg px-2 py-1 rounded">ACTIVE</span> : <span className="text-destructive text-xs font-bold bg-danger-bg px-2 py-1 rounded">INACTIVE</span>}
                      </div>
                      
                      <div>
                        <p className="font-bold text-base text-foreground leading-snug">{faq.question}</p>
                        <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
                      </div>
                      
                      <div className="flex gap-4 text-sm font-medium bg-muted p-2 rounded-lg">
                        <span className="text-success-text flex items-center gap-1">👍 {faq.helpfulCount || 0} Helpful</span>
                        <span className="text-destructive flex items-center gap-1">👎 {faq.notHelpfulCount || 0} Not Helpful</span>
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button onClick={() => handleOpenEdit(faq)} className="flex-1 min-h-[44px] flex items-center justify-center text-foreground border border-border rounded-lg hover:bg-muted">Edit</button>
                        <button onClick={() => handleDelete(faq.id)} className="min-w-[44px] px-4 min-h-[44px] flex items-center justify-center text-destructive border border-red-200 hover:bg-danger-bg rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                </div>
              ))
          )}
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
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
