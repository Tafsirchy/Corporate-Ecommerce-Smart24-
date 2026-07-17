'use client';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth, apiClient } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MANUAL' | 'STRIPE'>('MANUAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery charge logic
  const deliveryCharge = 100;
  const grandTotal = cartTotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to place an order');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/orders', {
        shippingAddress,
        contactNumber,
        paymentMethod
      });
      toast.success('Order placed successfully!');
      clearCart();
      router.push(`/track-order?id=${res.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex-1">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-500">Your cart is empty.</p>
        <button onClick={() => router.push('/shop')} className="mt-4 text-blue-600 hover:underline">
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex-1">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input 
                type="text" 
                required
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
                placeholder="e.g. +8801700000000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Shipping Address</label>
              <textarea 
                required
                rows={3}
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
                placeholder="House, Road, Area, City"
              />
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Payment Method</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="MANUAL"
                  checked={paymentMethod === 'MANUAL'}
                  onChange={() => setPaymentMethod('MANUAL')}
                />
                <div>
                  <div className="font-medium">Manual Payment (bKash/Nagad/Rocket)</div>
                  <div className="text-sm text-gray-500">Pay via mobile banking</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="STRIPE"
                  checked={paymentMethod === 'STRIPE'}
                  onChange={() => setPaymentMethod('STRIPE')}
                />
                <div>
                  <div className="font-medium">Credit/Debit Card (Stripe)</div>
                  <div className="text-sm text-gray-500">Secure online payment</div>
                </div>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-6 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : `Place Order (৳${grandTotal})`}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between items-start text-sm">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-white border rounded flex items-center justify-center overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400">Img</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{item.product?.name}</div>
                    <div className="text-gray-500">Qty: {item.quantity}</div>
                  </div>
                </div>
                <div className="font-medium">৳{(item.product?.price || 0) * item.quantity}</div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>৳{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span>৳{deliveryCharge}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
              <span>Total</span>
              <span>৳{grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
