'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';

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
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
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
    </div>
  );
}
