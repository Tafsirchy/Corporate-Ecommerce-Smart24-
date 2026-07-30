'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useAuth, apiClient } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pagination } from '@/components/Pagination';

export default function MyOrdersPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  const tabs = ['All', 'To Pay', 'To ship', 'To Receive', 'To Review'];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchOrders(page);
    }
  }, [user, loading, router, page]);

  const fetchOrders = async (pageNum: number) => {
    try {
      setLoadingOrders(true);
      const res = await apiClient.get(`/orders?page=${pageNum}&limit=10`);
      if (res.data.data) {
        setOrders(res.data.data);
        setMeta(res.data.meta);
      } else {
        setOrders(res.data);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Basic status mapping for tabs
    let matchesTab = true;
    if (activeTab === 'To Pay') matchesTab = order.paymentStatus === 'PENDING' || order.status === 'PENDING';
    if (activeTab === 'To ship') matchesTab = order.status === 'CONFIRMED';
    if (activeTab === 'To Receive') matchesTab = order.status === 'SHIPPED';
    if (activeTab === 'To Review') matchesTab = order.status === 'DELIVERED';
    
    // Search filtering
    const searchLower = searchQuery.toLowerCase();
    let matchesSearch = true;
    if (searchQuery) {
      const idMatch = order.id.toLowerCase().includes(searchLower);
      const productMatch = order.items.some((item: any) => item.product?.name?.toLowerCase().includes(searchLower));
      matchesSearch = idMatch || productMatch; // Add seller name later if we support multi-vendor
    }

    return matchesTab && matchesSearch;
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
                <h3 className="text-[15px] font-semibold text-primary/90 mb-2 hover:text-primary-700 cursor-pointer">
                  My Orders
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li><Link href="/account/returns" className="text-muted-foreground hover:text-primary/90 text-[14px]">My Returns</Link></li>
                <li><Link href="/account/cancellations" className="text-muted-foreground hover:text-primary/90 text-[14px]">My Cancellations</Link></li>
              </ul>
            </div>

            <div><h3 className="text-[15px] font-semibold text-foreground hover:text-primary/90 cursor-pointer"><Link href="/account/reviews">My Reviews</Link></h3></div>
            <div><h3 className="text-[15px] font-semibold text-foreground hover:text-primary/90 cursor-pointer"><Link href="/account/wishlist">My Wishlist & Followed Stores</Link></h3></div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <h2 className="text-[22px] text-foreground font-normal mb-6">My Orders</h2>
          
          <div className="bg-white rounded-md shadow-sm border border-border">
            {/* Tabs */}
            <div className="flex border-b border-border px-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                 let countText = tab;
                 if (tab === 'To Review' && activeTab === tab) {
                    const count = orders.filter(o => o.status === 'DELIVERED').length;
                    countText = `${tab}(${count})`;
                 }
                 
                 return (
                  <button
                    key={tab}
                    className={`px-6 py-4 text-[15px] font-medium whitespace-nowrap transition ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {countText}
                  </button>
                 );
              })}
            </div>

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
                  placeholder="Search by seller name, order ID or product name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-border sm:text-[14px]"
                />
              </div>
            </div>

            {/* Orders List */}
            <div className="p-4 space-y-4">
              {loadingOrders ? (
                <div className="py-12 text-center text-muted-foreground">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No orders found.</div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order.id} className="border border-border rounded-sm bg-white overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-purple-800 rounded-full flex items-center justify-center text-white text-[9px] font-bold tracking-tighter">
                          S24
                        </div>
                        <span className="font-semibold text-[14px] text-foreground">Smart24 Official</span>
                      </div>
                      <span className="bg-muted text-muted-foreground text-[12px] px-3 py-1 rounded-full font-medium uppercase tracking-wide">
                        {order.status === 'PENDING' ? 'Pending' : order.status === 'CONFIRMED' ? 'Confirmed' : order.status === 'SHIPPED' ? 'Shipped' : order.status === 'DELIVERED' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>

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
                              <p className="text-[12px] text-muted-foreground mt-1">Scent: Fresh</p>
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
                      <span className="mr-auto text-[13px] text-muted-foreground">Order ID: {order.id.substring(0, 10)}</span>
                      <Link href={`/track-order?id=${order.id}`} className="px-5 py-1.5 text-[13px] text-foreground border border-border bg-white rounded-sm hover:bg-muted transition font-medium">
                        View Order
                      </Link>
                      {order.status === 'PENDING' && (
                        <Link href={`/account/cancellations/request?orderId=${order.id}`} className="px-5 py-1.5 text-[13px] text-destructive border border-red-600 bg-white rounded-sm hover:bg-danger-bg transition font-medium">
                          Cancel Order
                        </Link>
                      )}
                      {order.status === 'DELIVERED' && (
                        <>
                          <Link href={`/account/returns/request?orderId=${order.id}`} className="px-5 py-1.5 text-[13px] text-primary border border-primary bg-white rounded-sm hover:bg-[#e6f4f7] transition font-medium">
                            Return Order
                          </Link>
                          <Link href="/account/reviews" className="px-5 py-1.5 text-[13px] text-white bg-accent border border-[#f85606] rounded-sm hover:bg-accent/90 transition font-medium">
                            Write a Review
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="pb-8">
              <Pagination 
                currentPage={page} 
                totalPages={meta.totalPages} 
                onPageChange={setPage} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
