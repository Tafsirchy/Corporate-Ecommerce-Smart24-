'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointCost: 0,
    type: 'COUPON',
    claimType: 'POINT_REDEEM',
    status: 'ACTIVE',
    minMembershipPriority: 1,
    expiryDays: 30
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  async function fetchRewards() {
    try {
      const res = await apiClient.get('/loyalty/admin/rewards');
      setRewards(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (reward?: any) => {
    if (reward) {
      setEditingId(reward.id);
      setFormData({
        title: reward.title,
        description: reward.description,
        pointCost: reward.pointCost,
        type: reward.type,
        claimType: reward.claimType,
        status: reward.status,
        minMembershipPriority: reward.minMembershipPriority,
        expiryDays: reward.expiryDays ?? 0
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        pointCost: 100,
        type: 'COUPON',
        claimType: 'POINT_REDEEM',
        status: 'ACTIVE',
        minMembershipPriority: 1,
        expiryDays: 30
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const cleanedData = {
        ...formData,
        pointCost: Number(formData.pointCost),
        minMembershipPriority: Number(formData.minMembershipPriority),
        expiryDays: Number(formData.expiryDays),
      };

      if (editingId) {
        await apiClient.put(`/loyalty/admin/rewards/${editingId}`, cleanedData);
      } else {
        await apiClient.post('/loyalty/admin/rewards', cleanedData);
      }
      handleCloseModal();
      fetchRewards();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save reward');
    }
  };

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    try {
      await apiClient.delete(`/loyalty/admin/rewards/${id}`);
      fetchRewards();
    } catch (e) {
      alert('Failed to delete reward');
    }
  };

  if (loading) return <div className="text-center text-muted-foreground py-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Loyalty Rewards</h1>
        <button onClick={() => handleOpenModal()} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-secondary transition">
          + Add Reward
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Desktop Table View */}
        <ScrollFade className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Title</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Type</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Points Cost</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Min. Priority</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewards.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No rewards found.</td>
                </tr>
              )}
              {rewards.map((reward) => (
                <tr key={reward.id} className="border-b border-gray-50 hover:bg-muted">
                  <td className="p-4 text-sm font-bold text-foreground">{reward.title}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <span className="bg-info-bg text-blue-800 px-2 py-1 rounded text-xs font-bold">{reward.type}</span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-[#FBBF24]">{reward.pointCost} pts</td>
                  <td className="p-4 text-sm text-muted-foreground">{reward.minMembershipPriority}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${reward.status === 'ACTIVE' ? 'bg-success-bg text-green-800' : 'bg-danger-bg text-red-800'}`}>
                      {reward.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground text-right space-x-3">
                    <button onClick={() => handleOpenModal(reward)} className="text-info-text hover:text-blue-800 font-semibold p-2 min-w-[44px] min-h-[44px]">Edit</button>
                    <button onClick={() => handleDelete(reward.id)} className="text-destructive hover:text-red-800 font-semibold p-2 min-w-[44px] min-h-[44px]">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollFade>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {rewards.map((reward) => (
            <div key={reward.id} className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <div className="font-bold text-base text-foreground">{reward.title}</div>
                <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${reward.status === 'ACTIVE' ? 'bg-success-bg text-green-800' : 'bg-danger-bg text-red-800'}`}>
                  {reward.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground block">Cost:</span> <span className="font-semibold text-[#FBBF24]">{reward.pointCost} pts</span></div>
                <div><span className="text-muted-foreground block">Type:</span> <span className="bg-info-bg text-blue-800 px-2 py-0.5 rounded text-xs font-bold">{reward.type}</span></div>
                <div><span className="text-muted-foreground block">Min. Priority:</span> {reward.minMembershipPriority}</div>
              </div>
              <div className="flex gap-2 mt-2 pt-4 border-t border-border">
                <button onClick={() => handleOpenModal(reward)} className="flex-1 min-h-[44px] flex items-center justify-center text-primary-600 bg-primary-50 rounded-lg text-sm font-medium transition-colors">Edit</button>
                <button onClick={() => handleDelete(reward.id)} className="flex-1 min-h-[44px] flex items-center justify-center text-destructive bg-danger-bg rounded-lg text-sm font-medium transition-colors">Delete</button>
              </div>
            </div>
          ))}
          {rewards.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No rewards found.</div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <ScrollFade className="fixed inset-0 bg-white sm:bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <ScrollFade className="bg-white sm:rounded-2xl w-full h-full sm:h-auto max-w-2xl sm:max-h-[90vh] flex flex-col shadow-2xl relative overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? 'Edit Reward' : 'Create Reward'}
              </h2>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground text-2xl leading-none">&times;</button>
            </div>
            
            <ScrollFade className="p-4 sm:p-6 overflow-y-auto flex-1 pt-2 sm:pt-4">
              <form id="reward-form" onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-0.5">Title</label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-border rounded-lg p-2.5 min-h-[44px] text-base focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. 50% Off Business Gadgets"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-0.5">Description</label>
                  <textarea 
                    required rows={2}
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-border rounded-lg p-2.5 min-h-[44px] text-base focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Provide details about the reward..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Point Cost</label>
                    <input 
                      type="number" required min="0"
                      value={formData.pointCost} onChange={e => setFormData({...formData, pointCost: parseInt(e.target.value)})}
                      className="w-full border border-border rounded-lg p-2.5 min-h-[44px] text-base focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Min Membership Priority</label>
                    <input 
                      type="number" required min="1"
                      value={formData.minMembershipPriority} onChange={e => setFormData({...formData, minMembershipPriority: parseInt(e.target.value)})}
                      className="w-full border border-border rounded-lg p-2.5 min-h-[44px] text-base focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Reward Type</label>
                    <select 
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full border border-border rounded-lg p-2.5 min-h-[44px] text-base focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="COUPON">COUPON</option>
                      <option value="TICKET">TICKET</option>
                      <option value="PRODUCT">PRODUCT</option>
                      <option value="GIFT_CARD">GIFT_CARD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full border border-border rounded-lg p-2.5 min-h-[44px] text-base focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Claim Type</label>
                    <select 
                      value={formData.claimType} onChange={e => setFormData({...formData, claimType: e.target.value})}
                      className="w-full border border-border rounded-lg p-2.5 min-h-[44px] text-base focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="POINT_REDEEM">Point Redeem</option>
                      <option value="FREE_CLAIM">Free Claim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Expiry Days (After Claim)</label>
                    <input 
                      type="number" required min="1"
                      value={formData.expiryDays} onChange={e => setFormData({...formData, expiryDays: parseInt(e.target.value)})}
                      className="w-full border border-border rounded-lg p-2.5 min-h-[44px] text-base focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              </form>
            </ScrollFade>

            <div className="p-4 sm:p-6 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 bg-muted sm:rounded-b-2xl mt-auto sm:mt-0">
              <button type="button" onClick={handleCloseModal} className="px-6 min-h-[44px] text-base rounded-lg text-foreground bg-white sm:bg-transparent border sm:border-none border-border hover:bg-gray-100 sm:hover:bg-muted/80 font-medium transition w-full sm:w-auto">
                Cancel
              </button>
              <button type="submit" form="reward-form" className="px-6 min-h-[44px] text-base rounded-lg bg-black hover:bg-secondary text-white font-medium transition shadow-sm w-full sm:w-auto">
                {editingId ? 'Save Changes' : 'Create Reward'}
              </button>
            </div>
          </ScrollFade>
        </ScrollFade>
      )}
    </div>
  );
}
