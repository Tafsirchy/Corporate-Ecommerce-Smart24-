'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useAuth, apiClient } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyCancellationsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchOrders();
    }
  }, [user, loading, router]);

  async function fetchOrders() {
    try {
      setLoadingOrders(true);
      const res = await apiClient.get('/orders');
      setOrders(res.data);
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');

  const filteredOrders = cancelledOrders.filter(order => {
    const searchLower = searchQuery.toLowerCase();
    let matchesSearch = true;
    if (searchQuery) {
      const idMatch = order.id.toLowerCase().includes(searchLower);
      const productMatch = order.items.some((item: any) => 
        item.product?.name?.toLowerCase().includes(searchLower)
      );
      matchesSearch = idMatch || productMatch;
    }

    return matchesSearch;
  });

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <>
      {/* Main Content Area */}
      <div className="w-full">
          <h2 className="text-[22px] text-foreground font-normal mb-6">My Cancellations</h2>
          
          <div className="bg-white rounded-md shadow-sm border border-border">
            {/* Sticky Search Bar */}
            <div className="sticky top-14 md:top-[80px] z-30 bg-muted border-b border-border p-4 rounded-t-md shadow-sm">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by Order ID or product name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 h-12 text-base border border-border rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Orders List */}
            <div className="p-4 space-y-4">
              {loadingOrders ? (
                <div className="py-12 text-center text-muted-foreground">Loading cancellations...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No cancelled orders found.</div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className="border border-border rounded-sm bg-white overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-foreground">Order ID: {order.id.substring(0, 10).toUpperCase()}</span>
                      </div>
                      <span className="bg-danger-bg text-red-800 text-[12px] px-3 py-1 rounded-full font-medium uppercase tracking-wide">
                        {order.status}
                      </span>
                    </div>

                    {/* Reason */}
                    {order.cancellationReason && (
                      <div className="px-4 py-3 bg-danger-bg text-red-800 text-sm border-b border-red-100 flex gap-2 items-start">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span><span className="font-semibold">Reason:</span> {order.cancellationReason}</span>
                      </div>
                    )}

                    {/* Items */}
                    <div className="p-4">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex gap-4 py-3 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="w-[80px] h-[80px] flex-shrink-0 bg-muted rounded overflow-hidden border border-border p-1">
                            {item.product.images && item.product.images.length > 0 ? (
                              <OptimizedImage src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-start">
                            <div>
                              <Link href={`/product/${item.product.slug}`} className="text-[14px] font-medium text-foreground hover:text-primary line-clamp-2">
                                {item.product.name}
                              </Link>
                            </div>
                          </div>
                          
                          <div className="text-right flex flex-col justify-start gap-1 w-24">
                            <span className="text-[14px] text-foreground font-medium whitespace-nowrap">৳ {item.priceAtPurchase}</span>
                            <span className="text-[13px] text-muted-foreground whitespace-nowrap">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 py-3 bg-white border-t border-border flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
                      <span className="text-[14px] font-bold text-foreground text-center sm:text-left">Total: ৳{order.totalAmount.toLocaleString()}</span>
                      <Link href={`/track-order?id=${order.id}`} className="w-full sm:w-auto justify-center flex min-h-[44px] items-center px-4 text-sm text-foreground border border-border bg-white rounded-sm hover:bg-muted transition font-medium">
                        View Order
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
    </div>
      </div>
    </>
  );
}
