'use client';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth, apiClient } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import StripePaymentWrapper from '../../components/StripePaymentWrapper';
import { CreditCard, Smartphone, Banknote, Rocket, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postCode, setPostCode] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'COD'>('COD');
  const [paymentCategory, setPaymentCategory] = useState<'COD' | 'ONLINE'>('COD');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('');
  const [selectedSavedPayment, setSelectedSavedPayment] = useState<string>('NEW'); // 'NEW' or saved payment id
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Fetch saved payment methods on mount
  useEffect(() => {
    if (user) {
      apiClient.get('/payment-options')
        .then(res => setSavedPaymentMethods(res.data))
        .catch(err => console.error('Failed to fetch payment options', err));
    }
  }, [user]);

  // Delivery charge logic
  const deliveryCharge = 100;
  const grandTotal = cartTotal - discountAmount + deliveryCharge;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    try {
      const res = await apiClient.post('/orders/validate-promo', {
        promoCode,
        cartTotal
      });
      if (res.data.valid) {
        setDiscountAmount(res.data.discountAmount);
        setAppliedPromo(promoCode);
        toast.success('Promo code applied successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid promo code');
      setDiscountAmount(0);
      setAppliedPromo('');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo('');
    setDiscountAmount(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && (!guestEmail || !guestName)) {
      toast.error('Please provide your name and email to proceed as a guest, or login.');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const shippingAddress = `${address}, ${city}, ${postCode}`;
      
      const payload: any = {
        shippingAddress,
        contactNumber,
        saveAddress: user ? saveAddress : undefined,
        paymentMethod,
        promoCode: appliedPromo || undefined,
        guestEmail: !user ? guestEmail : undefined,
        guestName: !user ? guestName : undefined,
      };

      if (paymentMethod !== 'STRIPE') {
        payload.paymentTrxId = paymentTrxId;
        payload.paymentAccountNumber = paymentAccountNumber;
      }

      const res = await apiClient.post('/orders', payload);

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

  const renderManualPaymentFields = (providerName: string, providerEnum: string, instructions: string) => {
    if (paymentMethod !== providerEnum) return null;

    const availableOptions = savedPaymentMethods.filter(opt => opt.provider === providerEnum);

    return (
      <div className="mb-4 animate-in fade-in slide-in-from-top-2">
        <div className="p-4 bg-white border rounded-md shadow-sm border-border">
          <p className="text-sm font-medium mb-4">{instructions}</p>

          <div className="space-y-4">
            {availableOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select your account</label>
                <div className="space-y-2">
                  {availableOptions.map(opt => (
                    <label key={opt.id} className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${selectedSavedPayment === opt.id ? 'border-primary-500 bg-primary-50' : 'hover:bg-muted'}`}>
                      <input
                        type="radio"
                        name={`savedPayment_${providerEnum}`}
                        checked={selectedSavedPayment === opt.id}
                        onChange={() => {
                          setSelectedSavedPayment(opt.id);
                          setPaymentAccountNumber(opt.accountNumber);
                        }}
                        className="text-primary/90 focus:ring-primary-500"
                      />
                      <span className="font-medium text-foreground">{opt.accountNumber}</span>
                    </label>
                  ))}
                  <label className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${selectedSavedPayment === 'NEW' ? 'border-primary-500 bg-primary-50' : 'hover:bg-muted'}`}>
                    <input
                      type="radio"
                      name={`savedPayment_${providerEnum}`}
                      checked={selectedSavedPayment === 'NEW'}
                      onChange={() => {
                        setSelectedSavedPayment('NEW');
                        setPaymentAccountNumber('');
                      }}
                      className="text-primary/90 focus:ring-primary-500"
                    />
                    <span className="font-medium text-foreground">Use a different {providerName} number</span>
                  </label>
                </div>
              </div>
            )}

            {(selectedSavedPayment === 'NEW' || availableOptions.length === 0) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Your {providerName} Account Number</label>
                <input
                  type="text"
                  required
                  placeholder={`Enter your ${providerName} number`}
                  className="w-full px-4 py-2 border border-border rounded focus:ring-primary-500 focus:border-primary-500"
                  value={paymentAccountNumber}
                  onChange={(e) => setPaymentAccountNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">This will be automatically saved for future checkouts.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Transaction ID (TrxID)</label>
              <input
                type="text"
                required
                placeholder={`Enter ${providerName} TrxID`}
                className="w-full px-4 py-2 border border-border rounded focus:ring-primary-500 focus:border-primary-500"
                value={paymentTrxId}
                onChange={(e) => setPaymentTrxId(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (items.length === 0 && !clientSecret) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex-1">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-muted-foreground">Your cart is empty.</p>
        <button onClick={() => router.push('/shop')} className="mt-4 text-primary/90 hover:underline">
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
              {!user && (
                <div className="bg-info-bg p-4 rounded-lg border border-blue-100 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">Guest Checkout</h3>
                  <p className="text-sm text-blue-700 mb-4">You are checking out as a guest. <button type="button" onClick={() => router.push('/login?redirect=/checkout')} className="underline font-semibold">Login</button> to use saved addresses, apply coupons, and earn reward points.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        className="w-full px-4 py-2 border border-blue-200 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-blue-200 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Contact Number</label>
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
                <label className="block text-sm font-medium text-foreground mb-1">Street Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
                  placeholder="House, Road, Area"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
                    placeholder="e.g. Dhaka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Post Code</label>
                  <input
                    type="text"
                    required
                    value={postCode}
                    onChange={e => setPostCode(e.target.value)}
                    className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
                    placeholder="e.g. 1200"
                  />
                </div>
              </div>

              {user && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-4 h-4 text-black focus:ring-black rounded border-border"
                  />
                  <label htmlFor="saveAddress" className="text-sm text-foreground">
                    Save this address for next time
                  </label>
                </div>
              )}

              <h2 className="text-xl font-bold mt-8 mb-4">Payment Method</h2>
              <div className="space-y-4">
                {/* Cash on Delivery */}
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentCategory === 'COD' ? 'border-green-500 bg-success-bg' : 'hover:bg-muted'}`}>
                  <input
                    type="radio"
                    name="paymentCategory"
                    value="COD"
                    checked={paymentCategory === 'COD'}
                    onChange={() => {
                      setPaymentCategory('COD');
                      setPaymentMethod('COD');
                    }}
                    className="w-4 h-4 text-success-text focus:ring-green-500"
                  />
                  <div>
                    <div className="font-bold text-foreground">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">Pay with cash upon delivery</div>
                  </div>
                </label>

                {/* Pay Online */}
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentCategory === 'ONLINE' ? 'border-primary-500 bg-primary-50' : 'hover:bg-muted'}`}>
                  <input
                    type="radio"
                    name="paymentCategory"
                    value="ONLINE"
                    checked={paymentCategory === 'ONLINE'}
                    onChange={() => {
                      setPaymentCategory('ONLINE');
                      if (paymentMethod === 'COD') setPaymentMethod('STRIPE');
                    }}
                    className="w-4 h-4 text-primary/90 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-bold text-foreground">Pay Online</div>
                    <div className="text-sm text-muted-foreground">Credit/Debit Card, bKash, Nagad, Rocket</div>
                  </div>
                </label>

                {/* Online Payment Options (Nested) */}
                {paymentCategory === 'ONLINE' && (
                  <div className="pl-4 sm:pl-8 mt-4 border-l-2 border-border">
                    <p className="text-sm text-muted-foreground mb-3">Select your preferred online method:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      
                      {/* Card (Stripe) */}
                      <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'STRIPE' ? 'border-black bg-muted ring-1 ring-black' : 'border-border hover:border-black hover:bg-muted'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="STRIPE"
                          checked={paymentMethod === 'STRIPE'}
                          onChange={() => {
                            setPaymentMethod('STRIPE');
                            setPaymentAccountNumber('');
                            setPaymentTrxId('');
                          }}
                          className="sr-only"
                        />
                        <CreditCard size={28} className={`mb-2 ${paymentMethod === 'STRIPE' ? 'text-black' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-bold ${paymentMethod === 'STRIPE' ? 'text-black' : 'text-muted-foreground'}`}>Card</span>
                        {paymentMethod === 'STRIPE' && <CheckCircle2 size={16} className="absolute top-2 right-2 text-black" />}
                      </label>

                      {/* bKash */}
                      <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all relative ${paymentMethod === 'BKASH' ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-500' : 'border-border hover:border-pink-500 hover:bg-pink-50'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="BKASH"
                          checked={paymentMethod === 'BKASH'}
                          onChange={() => {
                            setPaymentMethod('BKASH');
                            setPaymentTrxId('');
                            setSelectedSavedPayment('NEW');
                            setPaymentAccountNumber('');
                          }}
                          className="sr-only"
                        />
                        <img src="/asset/bkash.png" alt="bKash" className="h-8 object-contain mb-1" />
                        <span className={`text-xs font-bold ${paymentMethod === 'BKASH' ? 'text-pink-600' : 'text-muted-foreground'}`}>bKash</span>
                        {paymentMethod === 'BKASH' && <CheckCircle2 size={16} className="absolute top-2 right-2 text-pink-600" />}
                      </label>

                      {/* Nagad */}
                      <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all relative ${paymentMethod === 'NAGAD' ? 'border-orange-500 bg-accent/10 ring-1 ring-orange-500' : 'border-border hover:border-orange-500 hover:bg-accent/10'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="NAGAD"
                          checked={paymentMethod === 'NAGAD'}
                          onChange={() => {
                            setPaymentMethod('NAGAD');
                            setPaymentTrxId('');
                            setSelectedSavedPayment('NEW');
                            setPaymentAccountNumber('');
                          }}
                          className="sr-only"
                        />
                        <img src="/asset/nagad.png" alt="Nagad" className="h-8 object-contain mb-1" />
                        <span className={`text-xs font-bold ${paymentMethod === 'NAGAD' ? 'text-orange-600' : 'text-muted-foreground'}`}>Nagad</span>
                        {paymentMethod === 'NAGAD' && <CheckCircle2 size={16} className="absolute top-2 right-2 text-orange-600" />}
                      </label>

                      {/* Rocket */}
                      <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all relative ${paymentMethod === 'ROCKET' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-border hover:border-purple-500 hover:bg-purple-50'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="ROCKET"
                          checked={paymentMethod === 'ROCKET'}
                          onChange={() => {
                            setPaymentMethod('ROCKET');
                            setPaymentTrxId('');
                            setSelectedSavedPayment('NEW');
                            setPaymentAccountNumber('');
                          }}
                          className="sr-only"
                        />
                        <img src="/asset/rocket.png" alt="Rocket" className="h-8 object-contain mb-1" />
                        <span className={`text-xs font-bold ${paymentMethod === 'ROCKET' ? 'text-purple-600' : 'text-muted-foreground'}`}>Rocket</span>
                        {paymentMethod === 'ROCKET' && <CheckCircle2 size={16} className="absolute top-2 right-2 text-purple-600" />}
                      </label>
                      
                    </div>

                    <div className="mt-4">
                      {paymentMethod === 'STRIPE' && (
                        <div className="p-4 border rounded-xl bg-muted border-border mb-4 animate-in fade-in slide-in-from-top-2">
                          <p className="text-sm font-medium text-foreground mb-3">Supported Cards</p>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-border">
                              <span className="text-blue-800 font-extrabold italic text-sm w-10 text-center">VISA</span>
                              <span className="text-xs font-bold text-foreground">Visa</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-border">
                              <img src="/asset/mastercard.svg" alt="MasterCard" className="h-5 w-10 object-contain" />
                              <span className="text-xs font-bold text-foreground">MasterCard</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-border">
                              <img src="/asset/amex.svg" alt="American Express" className="h-5 w-10 object-contain" />
                              <span className="text-xs font-bold text-foreground">Amex</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {renderManualPaymentFields('bKash', 'BKASH', `Please send ৳${grandTotal} to our bKash Personal Number: 01700000000`)}
                      {renderManualPaymentFields('Nagad', 'NAGAD', `Please send ৳${grandTotal} to our Nagad Personal Number: 01700000000`)}
                      {renderManualPaymentFields('Rocket', 'ROCKET', `Please send ৳${grandTotal} to our Rocket Personal Number: 01700000000`)}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-black text-white py-3 rounded-lg font-medium hover:bg-secondary disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : `Place Order (৳${grandTotal})`}
              </button>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-muted p-6 rounded-lg shadow border border-border h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between items-start text-sm">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-white border rounded flex items-center justify-center overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Img</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{item.product?.name}</div>
                    <div className="text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                </div>
                <div className="font-medium">৳{(item.product?.price || 0) * item.quantity}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 pb-4">
            <h3 className="text-sm font-bold text-foreground mb-2">Have a coupon or reward ticket?</h3>
            {!appliedPromo ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={user ? "Enter code" : "Login to use promo codes"}
                  className="w-full px-3 py-2 border rounded text-sm focus:ring-black focus:border-black uppercase disabled:bg-muted disabled:cursor-not-allowed"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={isApplyingPromo || !user}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo || !promoCode.trim() || !user}
                  className="px-4 py-2 bg-black text-white rounded text-sm font-medium hover:bg-secondary disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-success-bg border border-green-200 rounded text-sm">
                <div>
                  <span className="font-bold text-success-text">{appliedPromo}</span> applied
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-destructive hover:underline text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>৳{cartTotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-success-text font-medium">
                <span>Discount</span>
                <span>-৳{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Charge</span>
              <span>৳{deliveryCharge}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border mt-2">
              <span>Total</span>
              <span>৳{grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
