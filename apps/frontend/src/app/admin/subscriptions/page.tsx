"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { token } = useAuth();

  useEffect(() => {
    fetchSubscriptions();
  }, [token]);

  const fetchSubscriptions = () => {
    if (!token) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSubscriptions(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/admin/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success("Status updated successfully");
        fetchSubscriptions();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-6">Loading subscriptions...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Subscriptions</h1>
        <Link href="/admin/subscriptions/plans">
          <Button variant="outline">Manage Fixed Plans</Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <Input 
          placeholder="Search by ID, Name or Email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <select 
          className="border rounded-md px-3 py-2 bg-white text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="PAYMENT_FAILED">Payment Failed</option>
        </select>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b">
              <th className="p-4 font-semibold text-sm">ID</th>
              <th className="p-4 font-semibold text-sm">Customer</th>
              <th className="p-4 font-semibold text-sm">Items</th>
              <th className="p-4 font-semibold text-sm">Total / Month</th>
              <th className="p-4 font-semibold text-sm">Next Delivery</th>
              <th className="p-4 font-semibold text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((sub: any) => (
              <tr key={sub.id} className="border-b hover:bg-muted">
                <td className="p-4 text-sm font-mono text-muted-foreground">{sub.id.slice(-6)}</td>
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
                  <select
                    value={sub.status}
                    onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                    className={`border rounded px-2 py-1 text-xs font-bold outline-none cursor-pointer ${
                      sub.status === 'ACTIVE' ? 'bg-success-bg text-success-text border-green-200' :
                      sub.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-danger-bg text-destructive border-red-200'
                    }`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSubscriptions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No subscriptions found matching your filters.</div>
        )}
      </div>
    </div>
  );
}
