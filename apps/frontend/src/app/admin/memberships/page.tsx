'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';
import { FiEdit2, FiTrash2, FiPlus } from 'react-ui-icons'; // Assuming some icon pack or standard HTML

export default function AdminMembershipsPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this level?')) return;
    try {
      await apiClient.delete(`/memberships/${id}`);
      fetchLevels();
    } catch (e) {
      alert('Failed to delete membership level');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Membership Tiers</h1>
        <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2">
          <span>+ Add Tier</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-600">Priority</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Required Spend</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Multiplier</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-800">{level.priority}</td>
                <td className="p-4 text-sm font-bold text-gray-900">{level.name}</td>
                <td className="p-4 text-sm text-gray-600">৳{level.requiredAmount}</td>
                <td className="p-4 text-sm text-gray-600">{level.pointMultiplier}x</td>
                <td className="p-4 text-sm text-gray-600 flex gap-3">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => handleDelete(level.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
