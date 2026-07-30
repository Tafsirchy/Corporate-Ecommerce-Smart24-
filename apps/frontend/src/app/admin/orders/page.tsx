'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Pagination } from '@/components/Pagination';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (pageNum: number) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/orders?page=${pageNum}&limit=20`);
      if (res.data.data) {
        setOrders(res.data.data);
        setMeta(res.data.meta);
      } else {
        // Fallback for older format if necessary
        setOrders(res.data);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const previousOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status updated');
    } catch (error) {
      setOrders(previousOrders);
      toast.error('Failed to update status');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    const previousOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newStatus } : o));

    try {
      await apiClient.patch(`/orders/${orderId}/payment-status`, { paymentStatus: newStatus });
      toast.success('Payment status updated');
    } catch (error) {
      setOrders(previousOrders);
      toast.error('Failed to update payment status');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="p-4 font-medium text-muted-foreground">Order ID</th>
              <th className="p-4 font-medium text-muted-foreground">Customer</th>
              <th className="p-4 font-medium text-muted-foreground">Total</th>
              <th className="p-4 font-medium text-muted-foreground">Payment</th>
              <th className="p-4 font-medium text-muted-foreground">Order Status</th>
              <th className="p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No orders found</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-muted">
                  <td className="p-4 font-mono text-sm">
                    <Link href={`/track-order?id=${order.id}`} className="text-primary/90 hover:underline">
                      {order.id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">{order.user?.name || order.guestName || 'Guest'}</td>
                  <td className="p-4 font-medium">৳{order.totalAmount}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-foreground">{order.paymentMethod}</span>
                      {order.paymentTrxId && <span className="text-xs text-muted-foreground font-mono">TrxID: {order.paymentTrxId}</span>}
                      <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-medium 
                        ${order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          order.paymentStatus === 'VERIFIED' ? 'bg-success-bg text-green-800' : 
                          'bg-danger-bg text-red-800'}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium 
                      ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'PROCESSING' ? 'bg-info-bg text-blue-800' : 
                        order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' : 
                        order.status === 'DELIVERED' ? 'bg-success-bg text-green-800' : 
                        'bg-danger-bg text-red-800'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1 w-full bg-muted"
                      >
                        <option value="PENDING">Set: PENDING</option>
                        <option value="PROCESSING">Set: PROCESSING</option>
                        <option value="SHIPPED">Set: SHIPPED</option>
                        <option value="DELIVERED">Set: DELIVERED</option>
                        <option value="CANCELLED">Set: CANCELLED</option>
                      </select>
                      
                      <select 
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        className="text-xs border border-blue-200 text-blue-800 bg-primary-50 rounded px-2 py-1 w-full"
                      >
                        <option value="PENDING">Pay: PENDING</option>
                        <option value="VERIFIED">Pay: VERIFIED</option>
                        <option value="FAILED">Pay: FAILED</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={meta.totalPages} 
        onPageChange={setPage} 
      />
    </div>
  );
}
