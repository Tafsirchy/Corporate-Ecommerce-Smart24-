'use client';
import { useAuth, apiClient } from '../../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function CancellationRequestPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && orderId) {
      fetchOrder();
    }
  }, [user, loading, router, orderId]);

  const fetchOrder = async () => {
    try {
      setLoadingOrder(true);
      const res = await apiClient.get(`/orders/${orderId}`);
      if (res.data.status !== 'PENDING') {
        setError('Only pending orders can be cancelled. This order is ' + res.data.status);
      }
      setOrder(res.data);
    } catch (e) {
      setError('Order not found or you do not have permission to view it.');
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reason) {
      setError('Please select a reason for cancellation.');
      return;
    }

    const fullReason = comments ? `${reason} - ${comments}` : reason;

    try {
      setSubmitting(true);
      await apiClient.patch(`/orders/${orderId}/cancel`, {
        reason: fullReason,
      });
      router.push('/account/cancellations');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit cancellation request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingOrder) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <div className="bg-muted min-h-screen pb-12">
      <div className="container mx-auto px-4 pt-4 pb-8">
        <div className="flex items-center text-sm text-muted-foreground mb-6 gap-2">
          <Link href="/account" className="hover:text-primary/90">Account</Link>
          <ChevronRight size={14} />
          <Link href="/account/orders" className="hover:text-primary/90">Orders</Link>
          <ChevronRight size={14} />
          <span className="text-foreground">Cancel Order</span>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cancel Order</h1>
              {order && <p className="text-sm text-muted-foreground mt-1">Order ID: {order.id.substring(0, 10).toUpperCase()}</p>}
            </div>
            {order && (
              <span className="bg-yellow-100 text-yellow-800 text-[12px] px-3 py-1 rounded-full font-medium uppercase tracking-wide">
                {order.status}
              </span>
            )}
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-danger-bg text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {!order && !error && (
              <div className="text-center text-muted-foreground py-8">
                Loading order details...
              </div>
            )}

            {order && order.status === 'PENDING' && !error && (
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <h3 className="text-base font-medium text-foreground mb-4">1. Order Items</h3>
                  <div className="bg-muted p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-4">The following items will be cancelled:</p>
                    <div className="space-y-4">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-12 h-12 bg-white rounded border flex-shrink-0">
                            {item.product.images?.[0] && (
                              <img src={item.product.images[0]} className="w-full h-full object-contain p-1" alt={item.product.name} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm line-clamp-1">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity} • ৳{item.priceAtPurchase}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-base font-medium text-foreground mb-4">2. Reason for Cancellation</h3>
                  <select 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  >
                    <option value="" disabled>Select a reason</option>
                    <option value="CHANGE_OF_MIND">Change of mind</option>
                    <option value="ORDERED_WRONG_ITEM">Ordered wrong item</option>
                    <option value="FOUND_BETTER_PRICE">Found a better price elsewhere</option>
                    <option value="SHIPPING_TOO_LONG">Shipping takes too long</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="mb-8">
                  <h3 className="text-base font-medium text-foreground mb-4">3. Additional Comments (Optional)</h3>
                  <textarea 
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    placeholder="Please provide more details to help us improve."
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-4 border-t border-border pt-6">
                  <Link href="/account/orders" className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition">
                    Keep Order
                  </Link>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-red-400 font-medium shadow-sm"
                  >
                    {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
