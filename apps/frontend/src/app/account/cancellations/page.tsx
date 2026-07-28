'use client';
import { useAuth, apiClient } from '../../../context/AuthContext';
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

  const fetchOrders = async () => {
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
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground">My Account</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="mb-6">
            <p className="text-muted-foreground text-sm mb-1">Hello, {user.phone || (user.email ? user.email.split('@')[0] : 'User')}</p>
            <div className="inline-flex items-center gap-1 bg-success-fill text-white text-xs font-semibold px-2 py-1 rounded-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Verified Account
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Link href="/account">
                <h3 className="text-[15px] font-semibold text-foreground mb-2 hover:text-primary/90 cursor-pointer">
                  Manage My Account
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li><Link href="/account/profile" className="text-muted-foreground hover:text-primary/90 text-[14px]">My Profile</Link></li>
                <li><Link href="/account/address" className="text-muted-foreground hover:text-primary/90 text-[14px]">Address Book</Link></li>
                <li><Link href="/account/payment" className="text-muted-foreground hover:text-primary/90 text-[14px]">My Payment Options</Link></li>
              </ul>
            </div>

            <div>
              <Link href="/account/orders">
                <h3 className="text-[15px] font-semibold text-foreground mb-2 hover:text-primary/90 cursor-pointer">
                  My Orders
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li><Link href="/account/returns" className="text-muted-foreground hover:text-primary/90 text-[14px]">My Returns</Link></li>
                <li><Link href="/account/cancellations" className="text-primary/90 font-medium text-[14px]">My Cancellations</Link></li>
              </ul>
            </div>

            <div><h3 className="text-[15px] font-semibold text-foreground hover:text-primary/90 cursor-pointer"><Link href="/account/reviews">My Reviews</Link></h3></div>
            <div><h3 className="text-[15px] font-semibold text-foreground hover:text-primary/90 cursor-pointer"><Link href="/account/wishlist">My Wishlist & Followed Stores</Link></h3></div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <h2 className="text-[22px] text-foreground font-normal mb-6">My Cancellations</h2>
          
          <div className="bg-white rounded-md shadow-sm border border-border">
            {/* Search Bar */}
            <div className="p-4 bg-muted border-b border-border">
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
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-border sm:text-[14px]"
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
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" />
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
                    <div className="px-4 py-3 bg-muted border-t border-border flex justify-end gap-3 items-center">
                      <span className="mr-auto text-[14px] font-bold text-foreground">Total: ৳{order.totalAmount.toLocaleString()}</span>
                      <Link href={`/track-order?id=${order.id}`} className="px-5 py-1.5 text-[13px] text-foreground border border-border bg-white rounded-sm hover:bg-muted transition font-medium">
                        View Order
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
