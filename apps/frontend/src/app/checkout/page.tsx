'use client';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth, apiClient } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import StripePaymentWrapper from '../../components/StripePaymentWrapper';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'BKASH' | 'NAGAD' | 'ROCKET'>('STRIPE');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');

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
        paymentMethod,
        paymentTrxId: paymentMethod !== 'STRIPE' ? paymentTrxId : undefined
      });
      
      const { order, clientSecret: secret } = res.data;
      clearCart();

      if (paymentMethod === 'STRIPE' && secret) {
        setClientSecret(secret);
        setOrderId(order.id);
      } else {
        toast.success('Order placed successfully!');
        router.push(`/track-order?id=${order.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !clientSecret) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex-1">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-500">Your cart is empty.</p>
        <button onClick={() => router.push('/shop')} className="mt-4 text-primary-600 hover:underline">
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
          <h2 className="text-xl font-bold mb-4">
            {clientSecret ? 'Complete Payment' : 'Shipping Information'}
          </h2>
          
          {clientSecret ? (
            <StripePaymentWrapper clientSecret={clientSecret} orderId={orderId} />
          ) : (
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
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'STRIPE' ? 'border-black bg-gray-50' : 'hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="STRIPE"
                    checked={paymentMethod === 'STRIPE'}
                    onChange={() => setPaymentMethod('STRIPE')}
                    className="w-4 h-4 text-black focus:ring-black"
                  />
                  <div>
                    <div className="font-bold text-gray-900">Credit/Debit Card (Stripe)</div>
                    <div className="text-sm text-gray-500">Secure online payment via Stripe</div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'BKASH' ? 'border-pink-500 bg-pink-50' : 'hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="BKASH"
                    checked={paymentMethod === 'BKASH'}
                    onChange={() => setPaymentMethod('BKASH')}
                    className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900">bKash</div>
                    <div className="text-sm text-gray-500">Manual payment via bKash Personal</div>
                  </div>
                </label>
                {paymentMethod === 'BKASH' && (
                  <div className="pl-12 pr-4 pb-4">
                    <div className="p-4 bg-white border border-pink-200 rounded-md shadow-sm">
                      <p className="text-sm text-pink-800 font-medium mb-3">Please send <strong>৳{grandTotal}</strong> to our bKash Personal Number: <strong>01700000000</strong></p>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter bKash TrxID" 
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                        value={paymentTrxId}
                        onChange={(e) => setPaymentTrxId(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'NAGAD' ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="NAGAD"
                    checked={paymentMethod === 'NAGAD'}
                    onChange={() => setPaymentMethod('NAGAD')}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900">Nagad</div>
                    <div className="text-sm text-gray-500">Manual payment via Nagad Personal</div>
                  </div>
                </label>
                {paymentMethod === 'NAGAD' && (
                  <div className="pl-12 pr-4 pb-4">
                    <div className="p-4 bg-white border border-orange-200 rounded-md shadow-sm">
                      <p className="text-sm text-orange-800 font-medium mb-3">Please send <strong>৳{grandTotal}</strong> to our Nagad Personal Number: <strong>01700000000</strong></p>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter Nagad TrxID" 
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                        value={paymentTrxId}
                        onChange={(e) => setPaymentTrxId(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'ROCKET' ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="ROCKET"
                    checked={paymentMethod === 'ROCKET'}
                    onChange={() => setPaymentMethod('ROCKET')}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="font-bold text-gray-900">Rocket</div>
                    <div className="text-sm text-gray-500">Manual payment via Rocket Personal</div>
                  </div>
                </label>
                {paymentMethod === 'ROCKET' && (
                  <div className="pl-12 pr-4 pb-4">
                    <div className="p-4 bg-white border border-purple-200 rounded-md shadow-sm">
                      <p className="text-sm text-purple-800 font-medium mb-3">Please send <strong>৳{grandTotal}</strong> to our Rocket Personal Number: <strong>01700000000</strong></p>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter Rocket TrxID" 
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                        value={paymentTrxId}
                        onChange={(e) => setPaymentTrxId(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : `Place Order (৳${grandTotal})`}
              </button>
            </form>
          )}
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
