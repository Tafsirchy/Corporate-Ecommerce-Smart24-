'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/context/AuthContext';

export default function PointsHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/loyalty/transactions')
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
            <th className="p-4 text-sm font-semibold text-gray-600">Description</th>
            <th className="p-4 text-sm font-semibold text-gray-600 text-right">Earned</th>
            <th className="p-4 text-sm font-semibold text-gray-600 text-right">Redeemed</th>
            <th className="p-4 text-sm font-semibold text-gray-600 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500">No transactions found.</td>
            </tr>
          )}
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                {new Date(tx.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-sm text-gray-800">
                {tx.description}
                {tx.reason === 'ORDER_EARN' && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">ORDER</span>}
                {tx.reason === 'REWARD_REDEEM' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">REWARD</span>}
              </td>
              <td className="p-4 text-sm font-semibold text-green-600 text-right">
                {tx.earn > 0 ? `+${tx.earn}` : '-'}
              </td>
              <td className="p-4 text-sm font-semibold text-red-600 text-right">
                {tx.redeem > 0 ? `-${tx.redeem}` : '-'}
              </td>
              <td className="p-4 text-sm font-bold text-gray-900 text-right">
                {tx.balance}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
