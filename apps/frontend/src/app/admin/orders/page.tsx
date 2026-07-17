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
              <th className="p-4 font-medium text-gray-600">Method</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-sm">
                  <Link href={`/track-order?id=${order.id}`} className="text-blue-600 hover:underline">
                    {order.id.slice(-6).toUpperCase()}
                  </Link>
                </td>
                <td className="p-4 text-gray-500">{order.user?.name || 'User'}</td>
                <td className="p-4 font-medium">৳{order.totalAmount}</td>
                <td className="p-4 text-gray-500">{order.paymentMethod}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium 
                    ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' : 
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
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
