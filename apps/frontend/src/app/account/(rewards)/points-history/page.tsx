'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function PointsHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/loyalty/transactions')
      .then(res => setTransactions(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col">
        {transactions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No transactions found.</div>
        )}
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 pr-4">
                <p className="text-sm font-semibold text-foreground">{tx.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">Bal: {tx.balance}</p>
                <div className="flex gap-2 justify-end mt-1 text-xs font-semibold">
                  {tx.earn > 0 && <span className="text-success-text">+{tx.earn} pts</span>}
                  {tx.redeem > 0 && <span className="text-destructive">-{tx.redeem} pts</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {tx.reason === 'ORDER_EARN' && <span className="text-[10px] font-semibold bg-success-bg text-green-800 px-2 py-0.5 rounded">ORDER</span>}
              {tx.reason === 'REWARD_REDEEM' && <span className="text-[10px] font-semibold bg-info-bg text-blue-800 px-2 py-0.5 rounded">REWARD</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <ScrollFade className="hidden md:block overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[500px]">
        <thead>
          <tr className="bg-muted border-b border-border">
            <th className="p-4 text-sm font-semibold text-muted-foreground">Date</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground">Description</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Earned</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Redeemed</th>
            <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">No transactions found.</td>
            </tr>
          )}
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-border hover:bg-muted">
              <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                {new Date(tx.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-sm text-foreground">
                {tx.description}
                {tx.reason === 'ORDER_EARN' && <span className="ml-2 text-xs bg-success-bg text-green-800 px-2 py-0.5 rounded">ORDER</span>}
                {tx.reason === 'REWARD_REDEEM' && <span className="ml-2 text-xs bg-info-bg text-blue-800 px-2 py-0.5 rounded">REWARD</span>}
              </td>
              <td className="p-4 text-sm font-semibold text-success-text text-right">
                {tx.earn > 0 ? `+${tx.earn}` : '-'}
              </td>
              <td className="p-4 text-sm font-semibold text-destructive text-right">
                {tx.redeem > 0 ? `-${tx.redeem}` : '-'}
              </td>
              <td className="p-4 text-sm font-bold text-foreground text-right">
                {tx.balance}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </ScrollFade>
    </div>
  );
}
