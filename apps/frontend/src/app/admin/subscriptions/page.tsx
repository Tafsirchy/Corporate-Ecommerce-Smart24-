"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSubscriptions(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-6">Loading subscriptions...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Subscriptions</h1>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 font-semibold text-sm">ID</th>
              <th className="p-4 font-semibold text-sm">Customer</th>
              <th className="p-4 font-semibold text-sm">Items</th>
              <th className="p-4 font-semibold text-sm">Total / Month</th>
              <th className="p-4 font-semibold text-sm">Next Delivery</th>
              <th className="p-4 font-semibold text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub: any) => (
              <tr key={sub.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm font-mono text-gray-500">{sub.id.slice(-6)}</td>
                <td className="p-4 text-sm">
                  <p className="font-medium">{sub.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{sub.user?.email}</p>
                </td>
                <td className="p-4 text-sm">
                  {sub.items.map((item: any) => (
                    <div key={item.id}>{item.product.name} (x{item.quantity})</div>
                  ))}
                </td>
                <td className="p-4 text-sm font-medium">৳{sub.totalAmount}</td>
                <td className="p-4 text-sm">
                  {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    sub.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscriptions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No subscriptions found.</div>
        )}
      </div>
    </div>
  );
}
