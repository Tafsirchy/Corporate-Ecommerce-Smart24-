"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/my-subscriptions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSubscriptions(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSubscriptions(subscriptions.map((s: any) => s.id === id ? { ...s, status } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="p-6">Please login to view subscriptions.</div>;
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">My Subscriptions</h1>
      
      {subscriptions.length === 0 ? (
        <p>You have no active subscriptions.</p>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((sub: any) => (
            <div key={sub.id} className="border p-6 rounded-lg bg-white shadow-sm flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Subscription #{sub.id.slice(-6)}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Status: <span className={`font-bold ${sub.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>{sub.status}</span>
                </p>
                <div className="space-y-1 mb-4">
                  {sub.items.map((item: any) => (
                    <p key={item.id} className="text-sm">• {item.product.name} x {item.quantity}</p>
                  ))}
                </div>
                <p className="font-bold">Total: ৳{sub.totalAmount} / month</p>
              </div>
              <div className="flex flex-col space-y-2 justify-center">
                <div className="text-sm bg-gray-50 p-3 rounded mb-4">
                  <p><strong>Next Delivery:</strong> {new Date(sub.nextDeliveryDate).toLocaleDateString()}</p>
                  <p><strong>Billing Day:</strong> {sub.billingDay}th of the month</p>
                </div>
                {sub.status === 'ACTIVE' ? (
                  <Button variant="outline" className="text-yellow-600 border-yellow-600" onClick={() => updateStatus(sub.id, 'PAUSED')}>Pause Subscription</Button>
                ) : (
                  <Button variant="outline" className="text-green-600 border-green-600" onClick={() => updateStatus(sub.id, 'ACTIVE')}>Resume Subscription</Button>
                )}
                <Button variant="destructive" onClick={() => updateStatus(sub.id, 'CANCELLED')}>Cancel Subscription</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
