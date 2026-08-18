"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
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
      .then(resData => setSubscriptions(resData.data || []))
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

  if (loading) return <div className="text-center text-muted-foreground py-8">Loading subscriptions...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Manage Subscriptions</h1>
        <Link 
          href="/admin/subscriptions/plans" 
          className="w-full sm:w-auto bg-black text-white px-6 py-2 min-h-[44px] rounded font-medium hover:bg-secondary transition-colors text-center flex items-center justify-center"
        >
          Manage Fixed Plans
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input 
          type="text"
          placeholder="Search by ID, Name or Email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black"
        />
        <select 
          className="w-full sm:w-auto px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black bg-white"
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
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                      className={`border rounded p-2 min-h-[44px] text-base font-bold outline-none cursor-pointer ${
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
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {filteredSubscriptions.map((sub: any) => (
            <div key={sub.id} className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-bold text-base text-foreground">{sub.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{sub.user?.email}</p>
                </div>
                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">#{sub.id.slice(-6)}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="font-semibold mb-2">Items:</div>
                <div className="space-y-1">
                  {sub.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-muted-foreground">
                      <span>{item.product.name}</span>
                      <span className="font-medium text-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground block">Total/Mo:</span> <span className="font-bold">৳{sub.totalAmount}</span></div>
                <div><span className="text-muted-foreground block">Next Delivery:</span> {new Date(sub.nextDeliveryDate).toLocaleDateString()}</div>
              </div>
              <div className="pt-2 border-t border-border flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                <select
                  value={sub.status}
                  onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                  className={`w-full border rounded p-3 min-h-[44px] text-base font-bold outline-none cursor-pointer ${
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
              </div>
            </div>
          ))}
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No subscriptions found matching your filters.</div>
        )}
      </div>
    </div>
  );
}
