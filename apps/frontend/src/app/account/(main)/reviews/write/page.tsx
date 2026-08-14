'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useAuth, apiClient } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';

export default function WriteReviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && productId) {
      fetchProduct();
    }
  }, [user, loading, router, productId]);

  async function fetchProduct() {
    try {
      setLoadingProduct(true);
      const res = await apiClient.get(`/products/${productId}`);
      setProduct(res.data);
    } catch (e) {
      setError('Product not found.');
    } finally {
      setLoadingProduct(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a review comment.');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/reviews', {
        productId,
        rating,
        comment,
        images: [] // You can add image upload logic here later if needed
      });
      router.push('/account/reviews?tab=history');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingProduct) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <div className="bg-muted min-h-screen pb-12">
      <div className="container mx-auto px-4 pt-4 pb-8">
        <div className="flex items-center text-sm text-muted-foreground mb-6 gap-2">
          <Link href="/account" className="hover:text-primary/90">Account</Link>
          <ChevronRight size={14} />
          <Link href="/account/reviews" className="hover:text-primary/90">My Reviews</Link>
          <ChevronRight size={14} />
          <span className="text-foreground">Write a Review</span>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-muted">
            <h1 className="text-xl font-bold text-foreground">Write a Review</h1>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-danger-bg text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {!product && !error && (
              <div className="text-center text-muted-foreground py-8">
                Product details not found.
              </div>
            )}

            {product && !error && (
              <form onSubmit={handleSubmit}>
                <div className="flex gap-4 mb-8 bg-muted p-4 rounded-lg border border-border">
                  <div className="w-16 h-16 bg-white rounded border flex-shrink-0 p-1">
                    {product.images?.[0] && (
                      <OptimizedImage src={product.images[0]} className="w-full h-full object-contain" alt={product.name} />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-medium text-foreground text-[15px]">{product.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Share your experience with this product.</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Overall Rating</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Add a written review</h3>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="What did you like or dislike? What should other shoppers know?"
                    className="w-full p-4 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-y"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-4 border-t border-border pt-6">
                  <Link href="/account/reviews" className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition font-medium">
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-8 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition disabled:bg-opacity-50 font-medium shadow-sm"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
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
