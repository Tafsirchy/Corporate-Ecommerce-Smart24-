'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'MY_REWARDS'>('MARKETPLACE');
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [myRewards, setMyRewards] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [availableRes, myRes, meRes] = await Promise.all([
        apiClient.get('/loyalty/rewards/available'),
        apiClient.get('/loyalty/my-rewards'),
        apiClient.get('/loyalty/me')
      ]);
      setAvailableRewards(availableRes.data);
      setMyRewards(myRes.data.data || []);
      setPoints(meRes.data.rewardPoints);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  async function handleClaim(rewardId: string) {
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
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <p className="text-muted-foreground">Your Balance: <span className="font-bold text-[#FBBF24] text-xl">{points} pts</span></p>
        </div>
      </div>
      
      <ScrollFade className="flex space-x-4 border-b border-border mb-6 overflow-x-auto w-full whitespace-nowrap scrollbar-hide">
        <button
          className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'MARKETPLACE' ? 'border-b-2 border-primary-600 text-primary/90' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('MARKETPLACE')}
        >
          Reward Marketplace
        </button>
        <button
          className={`py-2 px-4 font-semibold transition-colors ${activeTab === 'MY_REWARDS' ? 'border-b-2 border-primary-600 text-primary/90' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('MY_REWARDS')}
        >
          My Claimed Rewards
        </button>
      </ScrollFade>

      {activeTab === 'MARKETPLACE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRewards.length === 0 && <p className="text-muted-foreground col-span-full">No rewards available for your tier yet.</p>}
          {availableRewards.map(reward => (
            <div key={reward.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="bg-gradient-to-r from-primary-500 to-indigo-600 p-4 text-white text-center">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-full mb-2 inline-block">
                  {reward.type}
                </span>
                <h3 className="text-xl font-bold">{reward.title}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-muted-foreground text-sm mb-4 flex-1">{reward.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <span className="font-bold text-lg text-foreground">{reward.pointCost} pts</span>
                  <button 
                    onClick={() => handleClaim(reward.id)}
                    disabled={points < reward.pointCost}
                    className={`px-4 py-3 rounded-lg font-semibold transition-colors ${
                      points >= reward.pointCost 
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-muted/80 text-muted-foreground cursor-not-allowed'
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
          {myRewards.length === 0 && <p className="text-muted-foreground col-span-full">You haven't claimed any rewards yet.</p>}
          {myRewards.map(ur => (
            <div key={ur.id} className="bg-white border border-border rounded-xl p-6 relative overflow-hidden">
              {ur.status === 'USED' && (
                <div className="absolute top-4 right-4 bg-muted/80 text-muted-foreground text-xs font-bold px-2 py-1 rounded">USED</div>
              )}
              {ur.status === 'EXPIRED' && (
                <div className="absolute top-4 right-4 bg-danger-bg text-destructive text-xs font-bold px-2 py-1 rounded">EXPIRED</div>
              )}
              {ur.status === 'AVAILABLE' && (
                <div className="absolute top-4 right-4 bg-success-bg text-success-text text-xs font-bold px-2 py-1 rounded">ACTIVE</div>
              )}
              
              <h3 className="font-bold text-lg text-foreground mb-1">{ur.reward.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{ur.reward.description}</p>
              
              {ur.code && (
                <div className="bg-muted p-3 rounded-lg border border-dashed border-border text-center mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Code</p>
                  <p className="font-mono font-bold text-lg tracking-widest text-primary-700">{ur.code}</p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground mt-auto">
                Claimed on: {new Date(ur.claimedAt).toLocaleDateString()}
                {ur.expiresAt && <><br/>Expires on: {new Date(ur.expiresAt).toLocaleDateString()}</>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
