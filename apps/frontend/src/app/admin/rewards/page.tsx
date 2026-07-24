'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await apiClient.get('/rewards/items');
      setRewards(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;
    try {
      await apiClient.delete(`/rewards/items/${id}`);
      fetchRewards();
    } catch (e) {
      alert('Failed to delete reward');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reward Marketplace Items</h1>
        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          + Add Reward
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-600">Title</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Type</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Points Cost</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Min. Priority</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
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
                <td className="p-4 text-sm text-gray-600 flex gap-3">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => handleDelete(reward.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
