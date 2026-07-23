'use client';
import { useAuth, apiClient } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyReviewsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [reviewHistory, setReviewHistory] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchReviews();
    }
  }, [user, loading, router]);

  const fetchReviews = async () => {
    try {
      setLoadingData(true);
      const [pendingRes, historyRes] = await Promise.all([
        apiClient.get('/reviews/me/pending'),
        apiClient.get('/reviews/me')
      ]);
      setPendingReviews(pendingRes.data);
      setReviewHistory(historyRes.data);
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setLoadingData(false);
    }
  };

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
                <li><Link href="/account/returns" className="text-gray-500 hover:text-primary-600 text-[14px]">My Returns</Link></li>
                <li><Link href="/account/cancellations" className="text-gray-500 hover:text-primary-600 text-[14px]">My Cancellations</Link></li>
              </ul>
            </div>

            <div>
              <Link href="/account/reviews">
                <h3 className="text-[15px] font-semibold text-primary-600 hover:text-primary-700 cursor-pointer">
                  My Reviews
                </h3>
              </Link>
            </div>
            <div>
              <Link href="/account/wishlist">
                <h3 className="text-[15px] font-semibold text-gray-800 hover:text-primary-600 cursor-pointer">
                  My Wishlist & Followed Stores
                </h3>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <h2 className="text-[22px] text-gray-800 font-normal mb-6">My Reviews</h2>
          
          <div className="bg-white rounded-md shadow-sm border border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 text-[15px] font-medium text-center transition-colors ${
                  activeTab === 'pending'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                To Review
                {pendingReviews.length > 0 && (
                  <span className="ml-2 bg-primary-100 text-primary-700 py-0.5 px-2 rounded-full text-[12px]">
                    {pendingReviews.length}
                  </span>
                )}
              </button>
              <button
                className={`flex-1 py-4 text-[15px] font-medium text-center transition-colors ${
                  activeTab === 'history'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>

            <div className="p-4">
              {loadingData ? (
                <div className="py-12 text-center text-gray-500">Loading reviews...</div>
              ) : activeTab === 'pending' ? (
                // Pending Reviews List
                <div className="space-y-4">
                  {pendingReviews.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">You don't have any pending reviews.</div>
                  ) : (
                    pendingReviews.map((item, index) => (
                      <div key={`${item.orderId}-${item.product.id}-${index}`} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-lg hover:border-primary-100 transition">
                        <div className="w-[80px] h-[80px] flex-shrink-0 bg-gray-50 rounded border border-gray-200 p-1">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Link href={`/product/${item.product.slug}`} className="text-[14px] font-medium text-gray-800 hover:text-primary-600 line-clamp-2 mb-1">
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-gray-500 mb-2">Purchased on {new Date(item.orderDate).toLocaleDateString()}</p>
                          <p className="text-sm font-semibold text-gray-900">৳{item.product.price}</p>
                        </div>
                        <div className="flex items-center sm:pl-4 sm:border-l border-gray-100">
                          <Link 
                            href={`/account/reviews/write?productId=${item.product.id}`}
                            className="whitespace-nowrap px-6 py-2 bg-[#f85606] hover:bg-[#d84b05] text-white rounded-sm font-medium text-[13px] transition w-full sm:w-auto text-center"
                          >
                            Write Review
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Review History List
                <div className="space-y-4">
                  {reviewHistory.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">You haven't written any reviews yet.</div>
                  ) : (
                    reviewHistory.map((review) => (
                      <div key={review.id} className="p-4 border border-gray-100 rounded-lg">
                        <div className="flex gap-4 mb-4">
                          <div className="w-[60px] h-[60px] flex-shrink-0 bg-gray-50 rounded border border-gray-200 p-1">
                            {review.product?.images?.[0] ? (
                              <img src={review.product.images[0]} alt={review.product.name} className="w-full h-full object-contain" />
                            ) : null}
                          </div>
                          <div>
                            <Link href={`/product/${review.product?.slug}`} className="text-[14px] font-medium text-gray-800 hover:text-primary-600 line-clamp-1">
                              {review.product?.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-1">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto">
                              {review.images.map((img: string, idx: number) => (
                                <img key={idx} src={img} alt="Review" className="h-16 w-16 object-cover rounded border border-gray-200" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
