'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../context/AuthContext';
import Link from 'next/link';

export default function MembershipPage() {
  const [data, setData] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Membership</h1>
        <Link href="/account" className="text-primary-600 hover:underline">
          &larr; Back to Account
        </Link>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Current Tier</p>
            <h2 className="text-4xl font-extrabold mb-4 flex items-center gap-3">
              {currentLevel ? currentLevel.name : 'Basic'} Member
              {currentLevel?.badgeUrl && (
                <img src={currentLevel.badgeUrl} alt="Badge" className="w-8 h-8 object-contain" />
              )}
            </h2>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10 inline-block">
              <p className="text-gray-300 text-sm mb-1">Available Points</p>
              <p className="text-3xl font-bold text-[#FBBF24]">
                {data?.rewardPoints || 0} <span className="text-lg font-normal">pts</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-gray-300 mb-2 flex justify-between">
              <span>Lifetime Spend</span>
              <span className="font-bold">৳{(data?.lifetimeSpent || 0).toLocaleString()}</span>
            </p>
            
            {nextLevel ? (
              <>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 text-right">
                  Spend ৳{(nextLevel.requiredAmount - data?.lifetimeSpent).toLocaleString()} more to reach <span className="font-bold text-white">{nextLevel.name}</span>
                </p>
              </>
            ) : (
              <div className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full mb-2"></div>
            )}
            
            {!nextLevel && (
              <p className="text-sm text-yellow-400 text-right font-semibold">
                You have reached the highest tier!
              </p>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-6">Membership Tiers</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map((level, idx) => {
          const isCurrent = currentLevel?.id === level.id;
          return (
            <div 
              key={level.id} 
              className={`p-6 rounded-xl border-2 transition-all ${isCurrent ? 'border-primary-500 shadow-md bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold">{level.name}</h4>
                {isCurrent && <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-bold">CURRENT</span>}
              </div>
              <p className="text-gray-600 font-semibold mb-2">Spend ৳{level.requiredAmount.toLocaleString()}</p>
              <p className="text-sm text-primary-600 mb-4 font-bold">{level.pointMultiplier}x Points Multiplier</p>
              <ul className="space-y-2">
                {level.benefits.map((benefit: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
