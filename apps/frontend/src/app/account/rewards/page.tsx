'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../context/AuthContext';
import Link from 'next/link';

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'MY_REWARDS'>('MARKETPLACE');
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [myRewards, setMyRewards] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [availableRes, myRes, meRes] = await Promise.all([
        apiClient.get('/loyalty/rewards/available'),
        apiClient.get('/loyalty/rewards/me'),
        apiClient.get('/loyalty/me')
      ]);
      setAvailableRewards(availableRes.data);
      setMyRewards(myRes.data);
      setPoints(meRes.data.rewardPoints);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (rewardId: string) => {
    try {
      await apiClient.post(`/loyalty/rewards/${rewardId}/claim`);
      alert('Reward claimed successfully!');
      fetchData(); // Refresh data
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to claim reward');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards Ecosystem</h1>
          <p className="text-gray-600">Your Balance: <span className="font-bold text-[#FBBF24] text-xl">{points} pts</span></p>
        </div>
        <Link href="/account" className="text-primary-600 hover:underline">
          &larr; Back to Account
        </Link>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'MARKETPLACE' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('MARKETPLACE')}
        >
          Reward Marketplace
        </button>
        <button
          className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'MY_REWARDS' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('MY_REWARDS')}
        >
          My Claimed Rewards
        </button>
      </div>

      {activeTab === 'MARKETPLACE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRewards.length === 0 && <p className="text-gray-500 col-span-full">No rewards available for your tier yet.</p>}
          {availableRewards.map(reward => (
            <div key={reward.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="bg-gradient-to-r from-primary-500 to-indigo-600 p-4 text-white text-center">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-full mb-2 inline-block">
                  {reward.type}
                </span>
                <h3 className="text-xl font-bold">{reward.title}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-gray-600 text-sm mb-4 flex-1">{reward.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="font-bold text-lg text-gray-800">{reward.pointCost} pts</span>
                  <button 
                    onClick={() => handleClaim(reward.id)}
                    disabled={points < reward.pointCost}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      points >= reward.pointCost 
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {points >= reward.pointCost ? 'Redeem' : 'Need more pts'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'MY_REWARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRewards.length === 0 && <p className="text-gray-500 col-span-full">You haven't claimed any rewards yet.</p>}
          {myRewards.map(ur => (
            <div key={ur.id} className="bg-white border border-gray-200 rounded-xl p-6 relative overflow-hidden">
              {ur.status === 'USED' && (
                <div className="absolute top-4 right-4 bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded">USED</div>
              )}
              {ur.status === 'EXPIRED' && (
                <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">EXPIRED</div>
              )}
              {ur.status === 'AVAILABLE' && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">ACTIVE</div>
              )}
              
              <h3 className="font-bold text-lg text-gray-900 mb-1">{ur.reward.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{ur.reward.description}</p>
              
              {ur.code && (
                <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300 text-center mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Code</p>
                  <p className="font-mono font-bold text-lg tracking-widest text-primary-700">{ur.code}</p>
                </div>
              )}
              
              <div className="text-xs text-gray-400 mt-auto">
                Claimed on: {new Date(ur.claimedAt).toLocaleDateString()}
                {ur.expiresAt && <><br/>Expires on: {new Date(ur.expiresAt).toLocaleDateString()}</>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
