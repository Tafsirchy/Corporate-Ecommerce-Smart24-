'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPricingRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    businessType: '',
    verificationLevel: '',
    categoryId: '',
    discountPercent: 0,
    effectiveFrom: '',
    effectiveTo: '',
  });

  useEffect(() => {
    fetchRules();
    fetchCategories();
  }, []);

  const fetchRules = async () => {
    try {
      // Force cache eviction and fetch fresh data
      await apiClient.storage.remove('pricing-rules-list');
      const res = await apiClient.get('/pricing-rule', { id: 'pricing-rules-list' });
      setRules(res.data.data || res.data);
    } catch (err: any) {
      toast.error('Failed to fetch pricing rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories', { id: 'categories-list' });
      // Depending on API, might be res.data or res.data.items
      setCategories(Array.isArray(res.data) ? res.data : (res.data.items || []));
    } catch (err: any) {
      console.error('Failed to fetch categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        businessType: formData.businessType || undefined,
        verificationLevel: formData.verificationLevel || undefined,
        categoryId: formData.categoryId || undefined,
        discountPercent: Number(formData.discountPercent),
        effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
        effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : undefined,
      };

      if (editMode && selectedRuleId) {
        await apiClient.patch(`/pricing-rule/${selectedRuleId}`, dataToSubmit);
        toast.success('Pricing rule updated successfully');
      } else {
        await apiClient.post('/pricing-rule', dataToSubmit);
        toast.success('Pricing rule created successfully');
      }
      
      // Evict cache to ensure fresh fetch
      await apiClient.storage.remove('pricing-rules-list');
      
      closeModal();
      fetchRules();
    } catch (err: any) {
      toast.error(`Failed to ${editMode ? 'update' : 'create'} pricing rule`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await apiClient.delete(`/pricing-rule/${id}`);
      await apiClient.storage.remove('pricing-rules-list');
      toast.success('Rule deleted');
      fetchRules();
    } catch (err: any) {
      toast.error('Failed to delete rule');
    }
  };

  const openEditModal = (rule: any) => {
    setFormData({
      businessType: rule.businessType || '',
      verificationLevel: rule.verificationLevel || '',
      categoryId: rule.categoryId || '',
      discountPercent: rule.discountPercent || 0,
      effectiveFrom: rule.effectiveFrom ? new Date(rule.effectiveFrom).toISOString().slice(0, 16) : '',
      effectiveTo: rule.effectiveTo ? new Date(rule.effectiveTo).toISOString().slice(0, 16) : '',
    });
    setSelectedRuleId(rule.id);
    setEditMode(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedRuleId(null);
    setFormData({
      businessType: '',
      verificationLevel: '',
      categoryId: '',
      discountPercent: 0,
      effectiveFrom: '',
      effectiveTo: '',
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pricing Rules</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Add New Rule
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-border">
          <table className="w-full text-left">
            <thead className="bg-muted text-sm font-medium">
              <tr>
                <th className="p-4">Business Type</th>
                <th className="p-4">Verification Level</th>
                <th className="p-4">Category</th>
                <th className="p-4">Discount (%)</th>
                <th className="p-4">Effective From</th>
                <th className="p-4">Effective To</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">{rule.businessType || 'Any'}</td>
                  <td className="p-4">{rule.verificationLevel || 'Any'}</td>
                  <td className="p-4">{categories.find(c => c.id === rule.categoryId)?.name || 'All Categories'}</td>
                  <td className="p-4 font-semibold text-green-600">{rule.discountPercent}%</td>
                  <td className="p-4">{new Date(rule.effectiveFrom).toLocaleDateString()}</td>
                  <td className="p-4">{rule.effectiveTo ? new Date(rule.effectiveTo).toLocaleDateString() : 'Forever'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => openEditModal(rule)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No pricing rules found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 my-8">
            <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Pricing Rule' : 'Create Pricing Rule'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Type (Optional)</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Any</option>
                  <option value="REGISTERED_COMPANY">Registered Company</option>
                  <option value="LOCAL_SHOP">Local Shop</option>
                  <option value="STARTUP">Startup</option>
                  <option value="NGO">NGO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Verification Level (Optional)</label>
                <select
                  value={formData.verificationLevel}
                  onChange={(e) => setFormData({ ...formData, verificationLevel: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Any</option>
                  <option value="BASIC">Basic</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category (Optional)</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Discount Percent</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Effective From</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Effective To (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.effectiveTo}
                  onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {editMode ? 'Update Rule' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
