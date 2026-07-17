'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}/payment-status`, { paymentStatus: newStatus });
      toast.success('Payment status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Order ID</th>
              <th className="p-4 font-medium text-gray-600">Customer</th>
              <th className="p-4 font-medium text-gray-600">Total</th>
              <th className="p-4 font-medium text-gray-600">Payment</th>
              <th className="p-4 font-medium text-gray-600">Order Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-sm">
                  <Link href={`/track-order?id=${order.id}`} className="text-primary-600 hover:underline">
                    {order.id.slice(-6).toUpperCase()}
                  </Link>
                </td>
                <td className="p-4 text-gray-500">{order.user?.name || 'User'}</td>
                <td className="p-4 font-medium">৳{order.totalAmount}</td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                    {order.paymentTrxId && <span className="text-xs text-gray-500 font-mono">TrxID: {order.paymentTrxId}</span>}
                    <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-medium 
                      ${order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        order.paymentStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium 
                    ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' : 
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 w-full bg-gray-50"
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
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
