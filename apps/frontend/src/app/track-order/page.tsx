'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (e) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
      <h1 className="text-3xl font-bold mb-8">Track Order</h1>
      
      {!id ? (
        <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); const val = (e.target as any).orderId.value; if(val) window.location.href = `/track-order?id=${val}` }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
            <input 
              name="orderId"
              type="text" 
              required
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black mb-4"
              placeholder="Enter your order ID"
            />
            <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
              Track
            </button>
          </form>
        </div>
      ) : loading ? (
        <div className="text-center py-12">Loading order details...</div>
      ) : order ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">Order #{order.id.substring(0, 8).toUpperCase()}</h2>
              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          
          <div className="p-6">
            <h3 className="font-bold mb-4">Items Ordered</h3>
            <div className="space-y-4 mb-8">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{item.product?.name || 'Product ' + item.productId}</div>
                    <div className="text-sm text-gray-500">Qty: {item.quantity} x ৳{item.priceAtPurchase}</div>
                  </div>
                  <div className="font-bold">৳{item.quantity * item.priceAtPurchase}</div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
              <div>
                <h3 className="font-bold mb-2">Shipping Details</h3>
                <p className="text-gray-600 text-sm whitespace-pre-line">{order.shippingAddress}</p>
                <p className="text-gray-600 text-sm mt-2">Contact: {order.contactNumber}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>৳{order.totalAmount - order.deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Delivery</span>
                  <span>৳{order.deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>৳{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-red-500 bg-red-50 rounded">
          Order not found or you do not have permission to view it.
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/shop" className="text-blue-600 hover:underline">
          &larr; Back to Shop
        </Link>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-center">Loading tracking information...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
