'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useAuth, apiClient } from '../../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function ReturnRequestPage() {
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
  const [selectedItemId, setSelectedItemId] = useState('');

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
      setError('Please select a reason for return.');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/returns', {
        orderId,
        orderItemId: selectedItemId || undefined,
        reason,
        comments
      });
      router.push('/account/returns');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit return request.');
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
          <span className="text-foreground">Request Return</span>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted">
            <h1 className="text-2xl font-bold text-foreground">Request Return</h1>
            {order && <p className="text-sm text-muted-foreground mt-1">Order ID: {order.id}</p>}
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

            {order && (
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <h3 className="text-base font-medium text-foreground mb-4">1. Select Product to Return</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                      <input 
                        type="radio" 
                        name="product" 
                        className="mt-1"
                        checked={selectedItemId === ''}
                        onChange={() => setSelectedItemId('')}
                      />
                      <div>
                        <p className="font-medium text-foreground">Entire Order</p>
                        <p className="text-sm text-muted-foreground">Return all items in this order.</p>
                      </div>
                    </label>
                    {order.items.map((item: any) => (
                      <label key={item.id} className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                        <input 
                          type="radio" 
                          name="product" 
                          className="mt-1"
                          checked={selectedItemId === item.id}
                          onChange={() => setSelectedItemId(item.id)}
                        />
                        <div className="flex gap-4 w-full">
                          <div className="w-16 h-16 bg-muted rounded flex-shrink-0">
                            {item.product.images?.[0] && (
                              <OptimizedImage src={item.product.images[0]} className="w-full h-full object-contain mix-blend-multiply p-1" alt={item.product.name} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm line-clamp-1">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity} • ৳{item.priceAtPurchase}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-base font-medium text-foreground mb-4">2. Reason for Return</h3>
                  <select 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  >
                    <option value="" disabled>Select a reason</option>
                    <option value="DEFECTIVE">Product is defective or not working</option>
                    <option value="WRONG_ITEM">Received wrong item</option>
                    <option value="MISSING_PARTS">Missing parts or accessories</option>
                    <option value="DAMAGED">Product damaged during shipping</option>
                    <option value="NOT_AS_DESCRIBED">Product not as described on website</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="mb-8">
                  <h3 className="text-base font-medium text-foreground mb-4">3. Additional Comments (Optional)</h3>
                  <textarea 
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    placeholder="Please provide more details to help us process your return quickly."
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-4 border-t border-border pt-6">
                  <Link href="/account/orders" className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition">
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-primary-400"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
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
