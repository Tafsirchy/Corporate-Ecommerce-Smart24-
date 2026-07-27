'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';

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

  const fetchRewards = async () => {
    try {
      const res = await apiClient.get('/loyalty/admin/rewards');
      setRewards(res.data);
    } catch (e) {
      console.error(e);
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    try {
      await apiClient.delete(`/loyalty/admin/rewards/${id}`);
      fetchRewards();
    } catch (e) {
      alert('Failed to delete reward');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Rewards</h1>
        <button onClick={() => handleOpenModal()} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          + Add Reward
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Title</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Type</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Points Cost</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Min. Priority</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500">Status</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rewards.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No rewards found.</td>
              </tr>
            )}
            {rewards.map((reward) => (
              <tr key={reward.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 text-sm font-bold text-gray-900">{reward.title}</td>
                <td className="p-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">{reward.type}</span>
                </td>
                <td className="p-4 text-sm font-semibold text-[#FBBF24]">{reward.pointCost} pts</td>
                <td className="p-4 text-sm text-gray-600">{reward.minMembershipPriority}</td>
                <td className="p-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${reward.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {reward.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600 text-right space-x-3">
                  <button onClick={() => handleOpenModal(reward)} className="text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                  <button onClick={() => handleDelete(reward.id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Reward' : 'Create Reward'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="reward-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. 50% Off Corporate Gadgets"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    required rows={3}
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Provide details about the reward..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Point Cost</label>
                    <input 
                      type="number" required min="0"
                      value={formData.pointCost} onChange={e => setFormData({...formData, pointCost: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Membership Priority</label>
                    <input 
                      type="number" required min="1"
                      value={formData.minMembershipPriority} onChange={e => setFormData({...formData, minMembershipPriority: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
                    <select 
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="COUPON">COUPON</option>
                      <option value="TICKET">TICKET</option>
                      <option value="PRODUCT">PRODUCT</option>
                      <option value="GIFT_CARD">GIFT_CARD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
                    <select 
                      value={formData.claimType} onChange={e => setFormData({...formData, claimType: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="POINT_REDEEM">Point Redeem</option>
                      <option value="FREE_CLAIM">Free Claim</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Days (After Claim)</label>
                    <input 
                      type="number" required min="1"
                      value={formData.expiryDays} onChange={e => setFormData({...formData, expiryDays: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg text-gray-700 hover:bg-gray-200 font-medium transition">
                Cancel
              </button>
              <button type="submit" form="reward-form" className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition shadow-sm">
                {editingId ? 'Save Changes' : 'Create Reward'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
