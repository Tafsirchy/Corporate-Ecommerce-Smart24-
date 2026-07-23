'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { ClipboardList, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

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
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProgressBar = (status: string) => {
    if (status === 'CANCELLED') {
      return (
        <div className="flex items-center justify-center text-red-600 my-8 p-6 bg-red-50 rounded-lg border border-red-100">
          <XCircle size={32} className="mr-3" />
          <div>
            <h3 className="font-bold text-lg">Order Cancelled</h3>
            <p className="text-sm">This order has been cancelled.</p>
          </div>
        </div>
      );
    }

    const steps = [
      { id: 'PENDING', label: 'Order Placed', icon: ClipboardList },
      { id: 'PROCESSING', label: 'Processing', icon: Package },
      { id: 'SHIPPED', label: 'Shipped', icon: Truck },
      { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === status);
    // fallback if status isn't matched
    const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
    
    return (
      <div className="my-10 px-4">
        <div className="relative">
          {/* Progress bar background line */}
          <div className="absolute left-6 right-6 top-5 transform -translate-y-1/2 h-1 bg-gray-200 z-0" />
          {/* Progress bar active line */}
          <div 
            className="absolute left-6 top-5 transform -translate-y-1/2 h-1 bg-black transition-all duration-700 ease-in-out z-0" 
            style={{ width: `calc(${(activeIndex / (steps.length - 1)) * 100}% - 3rem)` }} 
          />
          
          <div className="relative flex justify-between z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= activeIndex;
              return (
                <div key={step.id} className="flex flex-col items-center group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-white ${isCompleted ? 'border-black text-black shadow-md shadow-black/10 scale-110' : 'border-gray-300 text-gray-300'}`}>
                    <Icon size={18} strokeWidth={isCompleted ? 2.5 : 2} />
                  </div>
                  <span className={`mt-3 text-xs sm:text-sm font-bold transition-colors duration-300 ${isCompleted ? 'text-black' : 'text-gray-400'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-bold mb-8">Track Order</h1>
      
      {!id ? (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md mx-auto">
          <div className="text-center mb-6">
            <Package size={48} className="mx-auto text-black mb-4" />
            <h2 className="text-xl font-bold">Track Your Delivery</h2>
            <p className="text-gray-500 text-sm mt-2">Enter your Order ID below to check the current status of your shipment.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); const val = (e.target as any).orderId.value; if(val) window.location.href = `/track-order?id=${val}` }}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Order ID</label>
            <input 
              name="orderId"
              type="text" 
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black mb-6 transition-all"
              placeholder="e.g. 64b7d8..."
            />
            <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              Track Order
            </button>
          </form>
        </div>
      ) : loading ? (
        <div className="text-center py-16 flex flex-col items-center">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mb-4"></div>
           <p className="text-gray-500 font-medium">Loading tracking information...</p>
        </div>
      ) : order ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-bold text-xl">Order #{order.id.substring(0, 8).toUpperCase()}</h2>
              <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          
          <div className="px-6 py-2">
            {renderProgressBar(order.status)}
          </div>
          
          <div className="p-6 border-t border-gray-100">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Package size={20} /> Items Ordered</h3>
            <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{item.product?.name || 'Product ' + item.productId}</div>
                      <div className="text-sm text-gray-500 mt-1">Qty: {item.quantity} x ৳{item.priceAtPurchase}</div>
                    </div>
                  </div>
                  <div className="font-bold text-lg">৳{item.quantity * item.priceAtPurchase}</div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h3 className="font-bold mb-3 flex items-center gap-2">Shipping Details</h3>
                <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{order.shippingAddress}</p>
                <p className="text-gray-700 text-sm mt-3 pt-3 border-t border-gray-200"><span className="font-semibold">Contact:</span> {order.contactNumber}</p>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h3 className="font-bold mb-3 flex items-center gap-2">Payment Summary</h3>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-semibold ${order.paymentStatus === 'VERIFIED' ? 'text-green-600' : 'text-yellow-600'}`}>{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between text-sm mb-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳{order.totalAmount - order.deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">৳{order.deliveryCharge}</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-3 border-t border-gray-200 mt-3 text-black">
                  <span>Total</span>
                  <span>৳{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-red-500 bg-red-50 rounded-xl border border-red-100 max-w-lg mx-auto">
          <XCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-700">We couldn't find an order with this ID or you do not have permission to view it.</p>
        </div>
      )}
      
      <div className="mt-10 text-center">
        <Link href="/shop" className="inline-flex items-center gap-2 text-black hover:text-gray-600 font-bold transition-colors">
          &larr; Back to Shop
        </Link>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center flex flex-col items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mb-4"></div>Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
