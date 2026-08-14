'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useAuth, apiClient } from '@/context/AuthContext';
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

  async function fetchReviews() {
    try {
      setLoadingData(true);
      const [pendingRes, historyRes] = await Promise.all([
        apiClient.get('/reviews/me/pending'),
        apiClient.get('/reviews/me')
      ]);
      setPendingReviews(pendingRes.data?.data ?? pendingRes.data ?? []);
      setReviewHistory(historyRes.data?.data ?? historyRes.data ?? []);
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, target: 'pending' | 'history') => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = target === 'pending' ? 'history' : 'pending';
    setActiveTab(next);
    document.getElementById(`reviews-tab-${next}`)?.focus();
  };

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <>
      {/* Main Content Area */}
      <div className="w-full">
          <h2 className="text-[22px] text-foreground font-normal mb-6">My Reviews</h2>
          
          <div className="bg-white rounded-md shadow-sm border border-border">
            {/* Tabs */}
            <div role="tablist" aria-label="Review filters" className="flex border-b border-border">
              <button
                id="reviews-tab-pending"
                role="tab"
                aria-selected={activeTab === 'pending'}
                aria-controls="reviews-panel"
                onKeyDown={(e) => handleTabKeyDown(e, 'pending')}
                className={`flex-1 py-4 text-[15px] font-medium text-center transition-colors ${
                  activeTab === 'pending'
                    ? 'text-primary/90 border-b-2 border-primary-600'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                id="reviews-tab-history"
                role="tab"
                aria-selected={activeTab === 'history'}
                aria-controls="reviews-panel"
                onKeyDown={(e) => handleTabKeyDown(e, 'history')}
                className={`flex-1 py-4 text-[15px] font-medium text-center transition-colors ${
                  activeTab === 'history'
                    ? 'text-primary/90 border-b-2 border-primary-600'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>

            <div id="reviews-panel" className="p-4">
              {loadingData ? (
                <div className="py-12 text-center text-muted-foreground">Loading reviews...</div>
              ) : activeTab === 'pending' ? (
                // Pending Reviews List
                <div className="space-y-4">
                  {pendingReviews.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">You don&apos;t have any pending reviews.</div>
                  ) : (
                    pendingReviews.map((item, index) => (
                      <div key={`${item.orderId}-${item.product.id}-${index}`} className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg hover:border-primary-100 transition">
                        <div className="w-[80px] h-[80px] flex-shrink-0 bg-muted rounded border border-border p-1">
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
                        <div className="flex-1">
                          <Link href={`/product/${item.product.slug}`} className="text-[14px] font-medium text-foreground hover:text-primary/90 line-clamp-2 mb-1">
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mb-2">Purchased on {new Date(item.orderDate).toLocaleDateString()}</p>
                          <p className="text-sm font-semibold text-foreground">৳{item.product.price}</p>
                        </div>
                        <div className="flex items-center sm:pl-4 sm:border-l border-border">
                          <Link 
                            href={`/account/reviews/write?productId=${item.product.id}`}
                            className="flex min-h-11 items-center justify-center px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-sm font-medium text-base transition w-full sm:w-auto text-center"
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
                    <div className="py-12 text-center text-muted-foreground">You haven&apos;t written any reviews yet.</div>
                  ) : (
                    reviewHistory.map((review) => (
                      <div key={review.id} className="p-4 border border-border rounded-lg">
                        <div className="flex gap-4 mb-4">
                          <div className="w-[60px] h-[60px] flex-shrink-0 bg-muted rounded border border-border p-1">
                            {review.product?.images?.[0] ? (
                              <OptimizedImage src={review.product.images[0]} alt={review.product.name} className="w-full h-full object-contain" />
                            ) : null}
                          </div>
                          <div>
                            <Link href={`/product/${review.product?.slug}`} className="text-[14px] font-medium text-foreground hover:text-primary/90 line-clamp-1">
                              {review.product?.name}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-4 rounded-md">
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-muted-foreground'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{review.comment}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto">
                              {review.images.map((img: string, idx: number) => (
                                <OptimizedImage key={idx} src={img} alt="Review" className="h-16 w-16 object-cover rounded border border-border" />
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
    </>
  );
}
