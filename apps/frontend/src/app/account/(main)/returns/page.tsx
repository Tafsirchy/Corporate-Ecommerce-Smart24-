'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useAuth, apiClient } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyReturnsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All', 'PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchReturns();
    }
  }, [user, loading, router]);

  async function fetchReturns() {
    try {
      setLoadingReturns(true);
      const res = await apiClient.get('/returns/me');
      if (res.data.data) {
        setReturns(res.data.data);
      } else {
        setReturns(res.data);
      }
    } catch (e) {
      console.error('Failed to load returns', e);
    } finally {
      setLoadingReturns(false);
    }
  };

  const filteredReturns = returns.filter(ret => {
    let matchesTab = true;
    if (activeTab !== 'All') matchesTab = ret.status === activeTab;
    
    const searchLower = searchQuery.trim().toLowerCase();
    let matchesSearch = true;
    if (searchLower) {
      const idMatch = ret.id ? String(ret.id).toLowerCase().includes(searchLower) : false;
      const orderIdMatch = ret.orderId ? String(ret.orderId).toLowerCase().includes(searchLower) : false;
      const productMatch = ret.orderItem?.product?.name ? String(ret.orderItem.product.name).toLowerCase().includes(searchLower) : false;
      matchesSearch = idMatch || orderIdMatch || productMatch;
    }

    return matchesTab && matchesSearch;
  });

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <>
      {/* Main Content Area */}
      <div className="w-full">
        <h2 className="text-[22px] text-foreground font-normal mb-6">My Returns</h2>
        
        <div className="bg-white rounded-md shadow-sm border border-border">
          {/* Tabs */}
          <div role="tablist" aria-label="Return filters" className="flex border-b border-border px-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, tabIndex) => {
                let countText = tab;
                if (tab !== 'All') {
                  const count = returns.filter(r => r.status === tab).length;
                  if (count > 0) countText = `${tab} (${count})`;
                }
                
                return (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls="return-list"
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                    e.preventDefault();
                    const next = e.key === 'ArrowRight'
                      ? (tabIndex + 1) % tabs.length
                      : (tabIndex - 1 + tabs.length) % tabs.length;
                    setActiveTab(tabs[next]);
                    document.getElementById(`tab-${tabs[next]}`)?.focus();
                  }}
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
                placeholder="Search by Return ID, Order ID or product name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 h-12 text-base border border-border rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Returns List */}
          <div id="return-list" className="p-4 space-y-4">
            {loadingReturns ? (
              <div className="py-12 text-center text-muted-foreground">Loading returns...</div>
            ) : filteredReturns.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No returns found.</div>
            ) : (
              filteredReturns.map(ret => (
                <div key={ret.id} className="border border-border rounded-sm bg-white overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[14px] text-foreground">Return ID: {ret.id ? String(ret.id).substring(0, 10) : 'N/A'}</span>
                    </div>
                    <span className={`text-[12px] px-3 py-1 rounded-full font-medium uppercase tracking-wide ${
                      ret.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      ret.status === 'APPROVED' ? 'bg-info-bg text-blue-800' :
                      ret.status === 'REFUNDED' ? 'bg-success-bg text-green-800' :
                      'bg-danger-bg text-red-800'
                    }`}>
                      {ret.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="p-4">
                    {ret.orderItem ? (
                      <div className="flex gap-4 py-3">
                        <div className="w-[80px] h-[80px] flex-shrink-0 bg-muted rounded overflow-hidden border border-border p-1">
                          {ret.orderItem?.product?.images && ret.orderItem.product.images.length > 0 ? (
                            <OptimizedImage src={ret.orderItem.product.images[0]} alt={ret.orderItem.product.name || 'Product'} className="w-full h-full object-contain" />
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
                            <Link href={`/product/${ret.orderItem.product.slug}`} className="text-[14px] font-medium text-foreground hover:text-primary line-clamp-2">
                              {ret.orderItem.product.name}
                            </Link>
                            <p className="text-[12px] text-muted-foreground mt-1">Reason: {ret.reason}</p>
                            {ret.comments && <p className="text-[12px] text-muted-foreground mt-1 italic">&ldquo;{ret.comments}&rdquo;</p>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[14px] text-foreground">
                        <p>Return for full order: {ret.orderId}</p>
                        <p className="text-[12px] text-muted-foreground mt-1">Reason: {ret.reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="px-4 py-3 bg-muted border-t border-border flex flex-wrap justify-end gap-2 items-center">
                    <span className="mr-auto text-[13px] text-muted-foreground">Order ID: {ret.orderId ? String(ret.orderId).substring(0, 10) : 'N/A'}</span>
                    {ret.refundAmount && (
                      <span className="text-[14px] font-bold text-foreground mr-4">Refund: ৳{ret.refundAmount.toLocaleString()}</span>
                    )}
                    <Link href={`/track-return?id=${ret.id}`} className="flex min-h-11 items-center px-4 text-base text-white bg-primary rounded-sm hover:bg-primary/90 transition font-medium shadow-sm">
                      Track Return
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
