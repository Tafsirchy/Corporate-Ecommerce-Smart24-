'use client';
import { useAuth, apiClient } from '../../../context/AuthContext';
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

  const fetchReturns = async () => {
    try {
      setLoadingReturns(true);
      const res = await apiClient.get('/returns/me');
      setReturns(res.data);
    } catch (e) {
      console.error('Failed to load returns', e);
    } finally {
      setLoadingReturns(false);
    }
  };

  const filteredReturns = returns.filter(ret => {
    let matchesTab = true;
    if (activeTab !== 'All') matchesTab = ret.status === activeTab;
    
    const searchLower = searchQuery.toLowerCase();
    let matchesSearch = true;
    if (searchQuery) {
      const idMatch = ret.id.toLowerCase().includes(searchLower);
      const orderIdMatch = ret.orderId.toLowerCase().includes(searchLower);
      const productMatch = ret.orderItem?.product?.name?.toLowerCase().includes(searchLower);
      matchesSearch = idMatch || orderIdMatch || productMatch;
    }

    return matchesTab && matchesSearch;
  });

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
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
            <p className="text-gray-600 text-sm mb-1">Hello, {user.phone || (user.email ? user.email.split('@')[0] : 'User')}</p>
            <div className="inline-flex items-center gap-1 bg-[#4CAF50] text-white text-xs font-semibold px-2 py-1 rounded-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Verified Account
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Link href="/account">
                <h3 className="text-[15px] font-semibold text-gray-800 mb-2 hover:text-primary-600 cursor-pointer">
                  Manage My Account
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li><Link href="/account/profile" className="text-gray-500 hover:text-primary-600 text-[14px]">My Profile</Link></li>
                <li><Link href="/account/address" className="text-gray-500 hover:text-primary-600 text-[14px]">Address Book</Link></li>
                <li><Link href="/account/payment" className="text-gray-500 hover:text-primary-600 text-[14px]">My Payment Options</Link></li>
              </ul>
            </div>

            <div>
              <Link href="/account/orders">
                <h3 className="text-[15px] font-semibold text-gray-800 mb-2 hover:text-primary-600 cursor-pointer">
                  My Orders
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li><Link href="/account/returns" className="text-primary-600 font-medium text-[14px]">My Returns</Link></li>
                <li><Link href="/account/cancellations" className="text-gray-500 hover:text-primary-600 text-[14px]">My Cancellations</Link></li>
              </ul>
            </div>

            <div><h3 className="text-[15px] font-semibold text-gray-800 hover:text-primary-600 cursor-pointer"><Link href="/account/reviews">My Reviews</Link></h3></div>
            <div><h3 className="text-[15px] font-semibold text-gray-800 hover:text-primary-600 cursor-pointer"><Link href="/wishlist">My Wishlist & Followed Stores</Link></h3></div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <h2 className="text-[22px] text-gray-800 font-normal mb-6">My Returns</h2>
          
          <div className="bg-white rounded-md shadow-sm border border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                 let countText = tab;
                 if (tab === 'PENDING' && activeTab === tab) {
                    const count = returns.filter(r => r.status === 'PENDING').length;
                    countText = `${tab}(${count})`;
                 }
                 
                 return (
                  <button
                    key={tab}
                    className={`px-6 py-4 text-[15px] font-medium whitespace-nowrap transition ${activeTab === tab ? 'text-[#1a9cb7] border-b-2 border-[#1a9cb7]' : 'text-gray-600 hover:text-gray-900'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {countText}
                  </button>
                 );
              })}
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by Return ID, Order ID or product name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-gray-400 sm:text-[14px]"
                />
              </div>
            </div>

            {/* Returns List */}
            <div className="p-4 space-y-4">
              {loadingReturns ? (
                <div className="py-12 text-center text-gray-500">Loading returns...</div>
              ) : filteredReturns.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No returns found.</div>
              ) : (
                filteredReturns.map(ret => (
                  <div key={ret.id} className="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-gray-800">Return ID: {ret.id.substring(0, 10)}</span>
                      </div>
                      <span className={`text-[12px] px-3 py-1 rounded-full font-medium uppercase tracking-wide ${
                        ret.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        ret.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        ret.status === 'REFUNDED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {ret.status}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="p-4">
                      {ret.orderItem ? (
                        <div className="flex gap-4 py-3">
                          <div className="w-[80px] h-[80px] flex-shrink-0 bg-gray-50 rounded overflow-hidden border border-gray-200 p-1">
                            {ret.orderItem.product.images && ret.orderItem.product.images.length > 0 ? (
                              <img src={ret.orderItem.product.images[0]} alt={ret.orderItem.product.name} className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-start">
                            <div>
                              <Link href={`/product/${ret.orderItem.product.slug}`} className="text-[14px] font-medium text-gray-800 hover:text-[#1a9cb7] line-clamp-2">
                                {ret.orderItem.product.name}
                              </Link>
                              <p className="text-[12px] text-gray-500 mt-1">Reason: {ret.reason}</p>
                              {ret.comments && <p className="text-[12px] text-gray-400 mt-1 italic">"{ret.comments}"</p>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[14px] text-gray-800">
                          <p>Return for full order: {ret.orderId}</p>
                          <p className="text-[12px] text-gray-500 mt-1">Reason: {ret.reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 items-center">
                      <span className="mr-auto text-[13px] text-gray-500">Order ID: {ret.orderId.substring(0, 10)}</span>
                      {ret.refundAmount && (
                        <span className="text-[14px] font-bold text-gray-900 mr-4">Refund: ৳{ret.refundAmount.toLocaleString()}</span>
                      )}
                      <Link href={`/track-return?id=${ret.id}`} className="px-5 py-1.5 text-[13px] text-white bg-[#1a9cb7] rounded-sm hover:bg-[#1588a0] transition font-medium shadow-sm">
                        Track Return
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
