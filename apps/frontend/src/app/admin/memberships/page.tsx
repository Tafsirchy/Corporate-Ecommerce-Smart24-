'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';

export default function AdminMembershipsPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    requiredAmount: 0,
    pointMultiplier: 1.0,
    priority: 1,
    benefits: [''],
    badgeUrl: ''
  });
  const [isUploadMode, setIsUploadMode] = useState(true);
  const [badgeFile, setBadgeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const res = await apiClient.get('/memberships');
      setLevels(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (level?: any) => {
    if (level) {
      setEditingId(level.id);
      setFormData({
        name: level.name,
        requiredAmount: level.requiredAmount,
        pointMultiplier: level.pointMultiplier,
        priority: level.priority,
        benefits: level.benefits.length > 0 ? [...level.benefits] : [''],
        badgeUrl: level.badgeUrl || ''
      });
      setBadgeFile(null);
      setIsUploadMode(false);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        requiredAmount: 0,
        pointMultiplier: 1.0,
        priority: levels.length + 1,
        benefits: [''],
        badgeUrl: ''
      });
      setBadgeFile(null);
      setIsUploadMode(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleAddBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ''] });
  };

  const handleRemoveBenefit = (index: number) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits.length ? newBenefits : [''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalBadgeUrl = formData.badgeUrl;
      
      // Upload file first if in upload mode
      if (isUploadMode && badgeFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', badgeFile);
        const uploadRes = await apiClient.post('/upload/image', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalBadgeUrl = uploadRes.data.url;
      }

      // clean empty benefits
      const cleanedData = {
        ...formData,
        badgeUrl: finalBadgeUrl || undefined,
        requiredAmount: Number(formData.requiredAmount),
        pointMultiplier: Number(formData.pointMultiplier),
        priority: Number(formData.priority),
        benefits: formData.benefits.filter(b => b.trim() !== '')
      };

      if (editingId) {
        await apiClient.put(`/memberships/${editingId}`, cleanedData);
      } else {
        await apiClient.post('/memberships', cleanedData);
      }
      handleCloseModal();
      fetchLevels();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save membership level');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this level? Users on this level might be affected.')) return;
    try {
      await apiClient.delete(`/memberships/${id}`);
      fetchLevels();
    } catch (e) {
      alert('Failed to delete membership level');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Membership Tiers</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-secondary transition flex items-center gap-2"
        >
          <span>+ Add Tier</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Priority</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Name</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Req. Spend</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Multiplier</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id} className="border-b border-gray-50 hover:bg-muted">
                <td className="p-4 text-sm text-foreground">{level.priority}</td>
                <td className="p-4 text-sm font-bold text-foreground flex items-center gap-2">
                  {level.badgeUrl && <img src={level.badgeUrl} alt="Badge" className="w-6 h-6 object-contain" />}
                  {level.name}
                </td>
                <td className="p-4 text-sm text-muted-foreground">৳{level.requiredAmount.toLocaleString()}</td>
                <td className="p-4 text-sm text-muted-foreground">{level.pointMultiplier}x</td>
                <td className="p-4 text-sm text-muted-foreground text-right space-x-3">
                  <button onClick={() => handleOpenModal(level)} className="text-info-text hover:text-blue-800 font-semibold">Edit</button>
                  <button onClick={() => handleDelete(level.id)} className="text-destructive hover:text-red-800 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
            {levels.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No membership tiers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? 'Edit Membership Tier' : 'Create Membership Tier'}
              </h2>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-muted-foreground text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="membership-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Tier Name</label>
                    <input 
                      type="text" required
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="e.g. Gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Priority (Higher = Better)</label>
                    <input 
                      type="number" required min="1"
                      value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
                      className="w-full border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Required Spend (৳)</label>
                    <input 
                      type="number" required min="0"
                      value={formData.requiredAmount} onChange={e => setFormData({...formData, requiredAmount: parseInt(e.target.value)})}
                      className="w-full border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Point Multiplier</label>
                    <input 
                      type="number" required step="0.1" min="1"
                      value={formData.pointMultiplier} onChange={e => setFormData({...formData, pointMultiplier: parseFloat(e.target.value)})}
                      className="w-full border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium text-foreground">Badge Icon</label>
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
                      key="badge-file-input"
                      type="file"
                      accept="image/*"
                      onChange={e => setBadgeFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-black hover:file:bg-muted"
                    />
                  ) : (
                    <input 
                      key="badge-url-input"
                      type="url"
                      value={formData.badgeUrl}
                      onChange={e => setFormData({...formData, badgeUrl: e.target.value})}
                      placeholder="https://example.com/badge.png"
                      className="w-full border border-border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 mt-4">
                    <label className="block text-sm font-medium text-foreground">Benefits</label>
                    <button type="button" onClick={handleAddBenefit} className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded">
                      + Add Benefit
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={benefit} 
                          onChange={e => handleBenefitChange(index, e.target.value)}
                          className="flex-1 border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="e.g. Free Shipping"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveBenefit(index)}
                          className="px-3 text-muted-foreground hover:text-destructive bg-muted border border-border rounded-lg"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted rounded-b-2xl">
              <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg text-foreground hover:bg-muted/80 font-medium transition">
                Cancel
              </button>
              <button type="submit" form="membership-form" className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition shadow-sm">
                {editingId ? 'Save Changes' : 'Create Tier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
