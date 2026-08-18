'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Pagination } from '@/components/Pagination';
import { Trash2 } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  async function fetchOrders(pageNum: number) {
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

  async function handleStatusChange(orderId: string, newStatus: string) {
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

  async function handlePaymentStatusChange(orderId: string, newStatus: string) {
    const previousOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newStatus } : o));

    try {
      await apiClient.patch(`/orders/${orderId}/payment-status`, { paymentStatus: newStatus });
      toast.success('Payment status updated');
    } catch (error) {
      setOrders(previousOrders);
      setOrders(previousOrders);
      toast.error('Failed to update payment status');
    }
  };

  async function handleDelete(orderId: string) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await apiClient.delete(`/orders/${orderId}`);
      toast.success('Order deleted successfully');
      fetchOrders(page);
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
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
                          className="text-sm border rounded px-3 py-2 min-h-[44px] w-full bg-muted"
                        >
                          <option value="PENDING">Set: PENDING</option>
                          <option value="PROCESSING">Set: PROCESSING</option>
                          <option value="SHIPPED">Set: SHIPPED</option>
                          <option value="DELIVERED">Set: DELIVERED</option>
                          <option value="CANCELLED">Set: CANCELLED</option>
                        </select>
                        
                        <div className="flex items-center gap-2">
                          <select 
                            value={order.paymentStatus}
                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                            className="text-sm border border-blue-200 text-blue-800 bg-primary-50 rounded px-3 py-2 min-h-[44px] w-full flex-1"
                          >
                            <option value="PENDING">Pay: PENDING</option>
                            <option value="VERIFIED">Pay: VERIFIED</option>
                            <option value="FAILED">Pay: FAILED</option>
                          </select>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive hover:bg-danger-bg border border-red-200 rounded-lg transition-colors flex-shrink-0"
                            title="Delete Order"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No orders found</div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-sm">
                      <Link href={`/track-order?id=${order.id}`} className="text-primary/90 font-bold hover:underline flex items-center min-h-[44px] -ml-2 px-2">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.user?.name || order.guestName || 'Guest'}
                    </div>
                  </div>
                  <div className="font-bold text-base mt-3">
                    ৳{order.totalAmount}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium 
                      ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'PROCESSING' ? 'bg-info-bg text-blue-800' : 
                        order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' : 
                        order.status === 'DELIVERED' ? 'bg-success-bg text-green-800' : 
                        'bg-danger-bg text-red-800'}`}
                  >
                    {order.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium 
                    ${order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      order.paymentStatus === 'VERIFIED' ? 'bg-success-bg text-green-800' : 
                      'bg-danger-bg text-red-800'}`}
                  >
                    Pay: {order.paymentStatus}
                  </span>
                </div>

                <div className="flex flex-col gap-3 mt-1 pt-4 border-t border-border">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="text-base border rounded px-3 py-2 min-h-[44px] w-full bg-muted"
                  >
                    <option value="PENDING">Set: PENDING</option>
                    <option value="PROCESSING">Set: PROCESSING</option>
                    <option value="SHIPPED">Set: SHIPPED</option>
                    <option value="DELIVERED">Set: DELIVERED</option>
                    <option value="CANCELLED">Set: CANCELLED</option>
                  </select>
                  
                  <div className="flex items-center gap-2">
                    <select 
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                      className="text-base border border-blue-200 text-blue-800 bg-primary-50 rounded px-3 py-2 min-h-[44px] w-full flex-1"
                    >
                      <option value="PENDING">Pay: PENDING</option>
                      <option value="VERIFIED">Pay: VERIFIED</option>
                      <option value="FAILED">Pay: FAILED</option>
                    </select>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-destructive hover:bg-danger-bg border border-red-200 rounded-lg transition-colors flex-shrink-0"
                      title="Delete Order"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={meta.totalPages} 
        onPageChange={setPage} 
      />
    </div>
  );
}
