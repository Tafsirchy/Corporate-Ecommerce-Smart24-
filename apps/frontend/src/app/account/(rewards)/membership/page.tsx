'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';
import Link from 'next/link';

export default function MembershipPage() {
  const [data, setData] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [meRes, levelsRes] = await Promise.all([
        apiClient.get('/loyalty/me'),
        apiClient.get('/memberships')
      ]);
      setData(meRes.data);
      setLevels(levelsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const currentLevel = data?.membership;
  
  // Find next level
  const nextLevel = levels.find(l => l.requiredAmount > (data?.lifetimeSpent || 0));
  const progressPercent = nextLevel 
    ? Math.min(100, ((data?.lifetimeSpent || 0) / nextLevel.requiredAmount) * 100)
    : 100;

  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-1">Current Tier</p>
            <h2 className="text-4xl font-extrabold mb-4 flex items-center gap-3">
              {currentLevel ? currentLevel.name : 'Basic'} Member
              {currentLevel?.badgeUrl && (
                <OptimizedImage src={currentLevel.badgeUrl} alt="Badge" className="w-8 h-8 object-contain" />
              )}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              You earn <strong className="text-white">{currentLevel?.pointMultiplier || 1}x</strong> points on every purchase.
            </p>

            {nextLevel ? (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Lifetime Spent</span>
                  <span className="font-bold">৳{data?.lifetimeSpent || 0} / ৳{nextLevel.requiredAmount}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <p className="text-xs text-muted-foreground">Spend ৳{nextLevel.requiredAmount - (data?.lifetimeSpent || 0)} more to reach <strong className="text-white">{nextLevel.name}</strong></p>
              </div>
            ) : (
              <div className="inline-block bg-primary-600/20 border border-primary-500/30 text-primary-300 px-4 py-2 rounded-lg text-sm font-semibold">
                🎉 You've reached the highest membership tier!
              </div>
            )}
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <p className="text-muted-foreground text-sm uppercase tracking-widest mb-1">Available Points</p>
              <div className="text-4xl font-bold text-[#FBBF24] mb-2">{data?.rewardPoints || 0} pts</div>
              <Link href="/account/rewards" className="text-sm font-semibold text-white hover:text-primary-300 flex items-center gap-1 transition-colors">
                Redeem Points <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-6">Tier Benefits</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map(level => {
          const isCurrent = level.id === currentLevel?.id;
          const isPast = level.priority < (currentLevel?.priority || 0);
          const isFuture = level.priority > (currentLevel?.priority || 0);
          
          return (
            <div key={level.id} className={`border rounded-xl p-6 flex flex-col ${isCurrent ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'bg-white border-border'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg text-foreground">{level.name}</h4>
                {level.badgeUrl && <OptimizedImage src={level.badgeUrl} alt="Badge" className="w-6 h-6" />}
              </div>
              
              <div className="mb-4 pb-4 border-b border-border flex-1">
                <p className="text-sm text-muted-foreground mb-1">Requirement</p>
                <p className="font-semibold text-foreground">৳{level.requiredAmount} Lifetime Spend</p>
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Benefits</p>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5">✓</span>
                    {level.pointMultiplier}x Point Earning
                  </li>
                  {level.benefits.map((benefit: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                {isCurrent && <span className="text-sm font-bold text-primary/90 block text-center">Your Current Tier</span>}
                {isPast && <span className="text-sm font-semibold text-muted-foreground block text-center">Unlocked</span>}
                {isFuture && <span className="text-sm font-semibold text-muted-foreground block text-center">Locked</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
