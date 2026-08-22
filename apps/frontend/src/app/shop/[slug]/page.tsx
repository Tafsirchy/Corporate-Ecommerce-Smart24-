'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateMockData, Product } from '../../../components/ProductCard';
import { Star, MapPin, Truck, ShieldCheck, MessageSquare, Info, ChevronRight, Plus, Minus, Image as ImageIcon, Trash2, Edit2 } from 'lucide-react';
import { useAuth, apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { ScrollFade } from '@/components/ui/ScrollFade';
import { useCartStore } from '@/store/useCartStore';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, token, openAuthModal } = useAuth();
  const { addToCart } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', imageUrl: '' });
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Stock alert states
  const [alertEmail, setAlertEmail] = useState('');
  const [subscribingAlert, setSubscribingAlert] = useState(false);
  const [isAlertSubscribed, setIsAlertSubscribed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);


  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const fetchProductAndReviews = () => {
    axios.get(`${apiUrl}/products/slug/${slug}`)
      .then(res => {
        const p = res.data;
        setProduct(p);
        if (p && p.images && p.images.length > 0 && !activeImage) {
          setActiveImage(p.images[0]);
        }
        
        // Fetch reviews if product exists
        if (p) {
          apiClient.get(`/reviews/product/${p.id}`)
            .then(reviewRes => setReviews(reviewRes.data?.data || []))
            .catch(err => console.error("Failed to fetch reviews", err));
        }
      })
      .catch(err => {
        console.error(err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProductAndReviews();
    
    // Set desktop state for responsive accordions
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slug, apiUrl]);

  useEffect(() => {
    if (user && user.email) {
      setAlertEmail(user.email);
    }
  }, [user]);

  async function handleSubscribeAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!alertEmail) return;
    setSubscribingAlert(true);
    try {
      await apiClient.post(`/products/${product?.id}/alert`, { email: alertEmail });
      toast.success("You will be notified when this product is back in stock!");
      setIsAlertSubscribed(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to subscribe to alerts");
    } finally {
      setSubscribingAlert(false);
    }
  };

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review");
      openAuthModal('login');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const imageUrls: string[] = reviewForm.imageUrl ? [reviewForm.imageUrl] : [];
      if (editingReviewId) {
        // Edit mode
        const payload: any = { 
          rating: reviewForm.rating, 
          comment: reviewForm.comment 
        };
        if (imageUrls.length > 0) {
          payload.images = imageUrls; // overwrite or append based on your logic, we overwrite for simplicity
        }
        
        const res = await apiClient.patch(`/reviews/${editingReviewId}`, payload);
        setReviews(reviews.map(r => r.id === editingReviewId ? res.data : r));
        toast.success("Review updated successfully");
        setEditingReviewId(null);
      } else {
        // Create mode
        const payload = {
          productId: product?.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          images: imageUrls
        };
        const res = await apiClient.post('/reviews', payload);
        setReviews([res.data, ...reviews]);
        toast.success("Review submitted successfully");
      }
      
      // Fetch updated product stats
      fetchProductAndReviews();
      
      // Reset form
      setReviewForm({ rating: 5, comment: '', imageUrl: '' });
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  async function handleDeleteReview(id: string) {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await apiClient.delete(`/reviews/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
      toast.success("Review deleted");
      fetchProductAndReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const startEdit = (review: any) => {
    setEditingReviewId(review.id);
    setReviewForm({ 
      rating: review.rating, 
      comment: review.comment, 
      imageUrl: review.images?.[0] || '' 
    });
    // scroll to form
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[40%] bg-muted/80 h-[500px] rounded-xl"></div>
          <div className="w-full lg:w-[35%] space-y-4">
            <div className="h-10 bg-muted/80 rounded w-3/4"></div>
            <div className="h-6 bg-muted/80 rounded w-1/4"></div>
            <div className="h-32 bg-muted/80 rounded"></div>
          </div>
          <div className="w-full lg:w-[25%] bg-muted/80 h-[400px] rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-foreground">Product Not Found</h1>
        <p className="mt-4 text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="mt-6 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Fallbacks
  const mockData = generateMockData(product.id);
  const avgRating = product.rating || mockData.rating;
  const totalReviews = product.reviewCount || mockData.reviews;
  
  const location = product.location || mockData.location;
  const warrantyType = product.warrantyType || mockData.warrantyType;
  const color = product.color || mockData.color;
  const brandCompatibility = product.brandCompatibility || mockData.brandCompatibility;
  const caseMaterial = product.caseMaterial || mockData.caseMaterial;
  const compatibilityByModel = product.compatibilityByModel || mockData.compatibilityByModel;
  const sellerName = product.sellerName || 'Smart24 Official';
  const hasFreeShipping = product.services?.includes('free-shipping') || false;
  const hasCOD = product.services?.includes('cod') || true;
  
  const returnPolicy = (product as any).returnPolicy || '7 Days Return';
  
  const originalPrice = Math.round(product.price * 1.25);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  // B2B Pricing Logic
  let displayPrice = product.price;
  let b2bDiscount = 0;
  let b2bTier = '';

  if (user?.role === 'BUSINESS' && user.businessProfile) {
    b2bTier = user.businessProfile.membershipTier;
    if (b2bTier === 'SILVER') b2bDiscount = 5;
    if (b2bTier === 'GOLD') b2bDiscount = 10;
    if (b2bTier === 'PLATINUM') b2bDiscount = 15;
    if (b2bTier === 'DIAMOND') b2bDiscount = 20;

    if (b2bDiscount > 0) {
      displayPrice = product.price * (1 - b2bDiscount / 100);
    }
  }

  const handleQtyChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') setQuantity(q => q + 1);
    if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      setIsBuyingNow(true);
      await addToCart(product, quantity);
      router.push('/checkout');
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="bg-muted min-h-screen pb-12">
      <div className="container mx-auto px-4 pt-4 pb-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-muted-foreground mb-4 gap-2">
          <Link href="/" className="hover:text-primary/90">Home</Link>
          <ChevronRight size={14} />
          <Link href="/shop" className="hover:text-primary/90">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-foreground truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </div>

        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Column 1: Image Gallery (40%) */}
          <div className="w-[calc(100%+2rem)] -mx-4 lg:mx-0 lg:w-[40%] bg-white p-0 lg:p-4 rounded-none lg:rounded-xl shadow-none lg:shadow-sm border-none lg:border lg:border-border flex flex-col">
            {/* Mobile swipeable, Desktop static */}
            <ScrollFade className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide lg:block w-full">
              {/* Desktop Active Image */}
              <div className="hidden lg:block aspect-square rounded-lg overflow-hidden border border-border mb-4 bg-muted relative group cursor-crosshair w-full">
                <OptimizedImage src={activeImage || 'https://placehold.co/800x800?text=No+Image'} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              </div>
              
              {/* Mobile All Images Swipeable */}
              <div className="flex lg:hidden w-max">
                {product.images && product.images.length > 0 ? (
                  product.images.map((img: string, i: number) => (
                    <div key={`mob-${i}`} className="aspect-square w-[100vw] shrink-0 snap-center relative bg-muted border-b border-border">
                      <OptimizedImage src={img} alt={`${product.name} ${i+1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="aspect-square w-[100vw] shrink-0 snap-center relative bg-muted border-b border-border">
                    <OptimizedImage src={'https://placehold.co/800x800?text=No+Image'} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </ScrollFade>
            
            {/* Desktop Thumbnails */}
            {product.images && product.images.length > 1 && (
              <ScrollFade className="hidden lg:flex gap-3 overflow-x-auto pb-2 scrollbar-hide mt-4 lg:mt-0">
                {product.images.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${activeImage === img ? 'border-primary-500' : 'border-transparent hover:border-border'}`}
                  >
                    <OptimizedImage src={img} alt={`${product.name} ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </ScrollFade>
            )}
          </div>

          {/* Column 2: Core Info (35%) */}
          <div className="w-full lg:w-[35%] bg-white p-6 rounded-xl shadow-sm border border-border flex flex-col">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">{product.name}</h1>
            
            <div className="flex items-center gap-4 mt-3 pb-4 border-b border-border">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={16} fill="currentColor" />
                <span className="text-sm font-medium text-foreground ml-1">{avgRating.toFixed(1)}</span>
              </div>
              <span 
                className="text-sm text-primary/90 hover:underline cursor-pointer"
                onClick={() => { setActiveTab('reviews'); document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                {totalReviews} Ratings
              </span>
            </div>

            <div className="py-4 border-b border-border">
              <div className="flex flex-col gap-1">
                {b2bDiscount > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-primary/90">৳{displayPrice.toLocaleString()}</span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">B2B {b2bTier}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground line-through">৳{product.price.toLocaleString()}</span>
                      <span className="text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded">-{b2bDiscount}% Business Discount</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-bold text-primary/90">৳{product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground line-through">৳{originalPrice.toLocaleString()}</span>
                      <span className="text-xs font-semibold text-foreground bg-muted px-2 py-0.5 rounded">-{discountPercent}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="py-4 space-y-4 flex-1">
              {color && (
                <div>
                  <h3 className="text-sm text-muted-foreground mb-2">Color Family: <span className="text-foreground font-medium">{color}</span></h3>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded border-2 border-primary-500 p-0.5">
                      <div className="w-full h-full rounded-sm" style={{ backgroundColor: color.toLowerCase() === 'white' ? '#f3f4f6' : (color.toLowerCase() === 'black' ? '#111827' : color.toLowerCase()) }}></div>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-md">
                    <button onClick={() => handleQtyChange('dec')} className="p-3 hover:bg-muted text-muted-foreground transition-colors">
                      <Minus size={16} />
                    </button>
                    <input 
                      type="text" 
                      value={quantity} 
                      readOnly 
                      className="w-12 text-center text-sm font-medium border-x border-border py-2 focus:outline-none"
                    />
                    <button onClick={() => handleQtyChange('inc')} className="p-3 hover:bg-muted text-muted-foreground transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">Only {(product as any).stock ?? 50} items left</span>
                </div>
              </div>
            </div>

            {/* Mobile Sticky CTA Container / Desktop Inline CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:static lg:p-0 lg:border-none lg:z-auto lg:pb-0">
              {((product as any).stock ?? 50) > 0 ? (
                <div className="flex gap-3">
                  <button 
                    onClick={handleBuyNow} 
                    disabled={isBuyingNow}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-3 px-4 rounded-lg shadow-sm shadow-primary-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    {isBuyingNow && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isBuyingNow ? 'Processing...' : 'Buy Now'}
                  </button>
                  <button onClick={handleAddToCart} className="flex-1 bg-accent/10 text-primary/90 border border-primary-200 hover:bg-orange-100 font-medium py-3 px-4 rounded-lg transition-all active:scale-[0.98]">
                    Add to Cart
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-danger-bg text-destructive px-4 py-3 rounded-lg text-sm font-medium border border-red-100">
                    Currently Out of Stock
                  </div>
                  {isAlertSubscribed ? (
                    <div className="bg-success-bg text-success-text px-4 py-3 rounded-lg text-sm font-medium border border-green-100">
                      We'll email you when it's back in stock!
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribeAlert} className="flex gap-2">
                      <input 
                        type="email" 
                        required
                        placeholder="Enter email for restock alert"
                        value={alertEmail}
                        onChange={e => setAlertEmail(e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button 
                        type="submit" 
                        disabled={subscribingAlert}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-70"
                      >
                        {subscribingAlert ? 'Subscribing...' : 'Notify Me'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Delivery & Service (25%) */}
          <div className="w-full lg:w-[25%] space-y-4">
            <details className="bg-white rounded-xl shadow-sm border border-border group" open={isDesktop ? true : undefined}>
              <summary className="text-sm font-medium text-foreground p-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden flex justify-between items-center lg:cursor-auto">
                Delivery Options
                <span className="lg:hidden transition-transform duration-300 group-open:rotate-180">
                  <ChevronRight size={16} className="rotate-90" />
                </span>
              </summary>
              <div className="px-4 pb-4 pt-1 lg:pt-0">
                <div className="flex gap-3 mb-4">
                  <MapPin size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground line-clamp-2">Dhaka, Dhaka North, Banani Road No. 12 - 19</p>
                    <button className="text-xs text-primary/90 font-medium mt-1">Change</button>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <Truck size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-foreground">Standard Delivery</p>
                        <p className="text-xs text-muted-foreground mt-0.5">3 - 5 days</p>
                      </div>
                      <span className="text-sm font-medium text-foreground">{hasFreeShipping ? 'Free' : '৳55'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-3 border-t border-gray-50">
                  <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground">৳</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{hasCOD ? 'Cash on Delivery Available' : 'Cash on Delivery Not Available'}</p>
                  </div>
                </div>
              </div>
            </details>

            <details className="bg-white rounded-xl shadow-sm border border-border group" open={isDesktop ? true : undefined}>
              <summary className="text-sm font-medium text-foreground p-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden flex justify-between items-center lg:cursor-auto">
                Return & Warranty
                <span className="lg:hidden transition-transform duration-300 group-open:rotate-180">
                  <ChevronRight size={16} className="rotate-90" />
                </span>
              </summary>
              <div className="px-4 pb-4 pt-1 lg:pt-0">
                <div className="flex gap-3 mb-4">
                  <ShieldCheck size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{returnPolicy}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Change of mind is not applicable</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Info size={20} className="text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{warrantyType}</p>
                  </div>
                </div>
              </div>
            </details>

            <details className="bg-white rounded-xl shadow-sm border border-border group" open={isDesktop ? true : undefined}>
              <summary className="text-sm font-medium text-foreground p-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden flex justify-between items-center lg:cursor-auto">
                Sold by
                <span className="lg:hidden transition-transform duration-300 group-open:rotate-180">
                  <ChevronRight size={16} className="rotate-90" />
                </span>
              </summary>
              <div className="px-4 pb-4 pt-1 lg:pt-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-medium text-foreground">{sellerName}</h3>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-primary/90 bg-accent/10 px-2 py-1 rounded">
                    <MessageSquare size={12} />
                    Chat
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Positive Seller Ratings</p>
                    <p className="text-lg font-medium text-foreground">92%</p>
                  </div>
                  <div className="border-x border-border">
                    <p className="text-xs text-muted-foreground mb-1">Ship on Time</p>
                    <p className="text-lg font-medium text-foreground">98%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Chat Response</p>
                    <p className="text-lg font-medium text-foreground">100%</p>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Bottom Section: Details & Reviews */}
        <div id="reviews-section" className="mt-6 bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="border-b border-border">
            <nav className="flex px-4" aria-label="Tabs">
              <button 
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'details' ? 'text-primary/90 border-b-2 border-primary-600' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Product Details
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'text-primary/90 border-b-2 border-primary-600' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Ratings & Reviews ({totalReviews})
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'details' ? (
              <>
                <h2 className="text-lg font-medium text-foreground mb-4">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                  <div className="flex gap-4">
                    <span className="w-1/3 text-sm text-muted-foreground">Brand</span>
                    <span className="w-2/3 text-sm text-foreground font-medium">{(product as any).brand?.name || brandCompatibility}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-1/3 text-sm text-muted-foreground">Case Material</span>
                    <span className="w-2/3 text-sm text-foreground font-medium">{caseMaterial}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-1/3 text-sm text-muted-foreground">Compatibility by Model</span>
                    <span className="w-2/3 text-sm text-foreground font-medium">{compatibilityByModel}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-1/3 text-sm text-muted-foreground">Shipped From</span>
                    <span className="w-2/3 text-sm text-foreground font-medium">{location}</span>
                  </div>
                </div>

                <h2 className="text-lg font-medium text-foreground mb-4 pt-6 border-t border-border">Description</h2>
                <div className="prose prose-sm sm:prose-base prose-primary max-w-none text-foreground">
                  <p>{product.description}</p>
                  <p>This premium product offers outstanding features, crafted with high-quality materials to ensure durability and performance. It seamlessly integrates into your daily life, providing a superior user experience.</p>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-foreground mb-6">Customer Reviews</h2>
                
                {/* Aggregate Rating */}
                <div className="flex items-center gap-8 mb-8 pb-8 border-b border-border">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                    <div className="flex text-yellow-400 justify-center my-2">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={20} fill={i <= Math.round(avgRating) ? "currentColor" : "none"} stroke={i <= Math.round(avgRating) ? "none" : "currentColor"} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{totalReviews} Ratings</p>
                  </div>
                </div>

                {/* Write a Review Form */}
                <div id="review-form" className="mb-10 bg-muted p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
                  </h3>
                  
                  {!user ? (
                    <div className="text-center py-6 bg-white rounded-lg border border-border">
                      <p className="text-muted-foreground mb-4">You must be logged in to leave a review.</p>
                      <button onClick={() => openAuthModal('login')} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">
                        Sign In to Review
                      </button>
                    </div>
                  ) : reviews.some(r => r.userId === user?.id) && !editingReviewId ? (
                    <div className="text-center py-6 bg-white rounded-lg border border-border">
                      <p className="text-muted-foreground">You have already reviewed this product.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Your Rating</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button 
                              type="button" 
                              key={star} 
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className={`p-1 transition-colors ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-300'}`}
                            >
                              <Star size={28} fill="currentColor" stroke="none" />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Your Review</label>
                        <textarea 
                          required
                          rows={4}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          placeholder="Tell others what you think about this product..."
                        ></textarea>
                      </div>
                      
                      <div className="md:col-span-2">
                        <ImageUpload 
                          images={reviewForm.imageUrl ? [reviewForm.imageUrl] : []}
                          setImages={(imgs) => setReviewForm({ ...reviewForm, imageUrl: imgs[0] || '' })}
                          multiple={false}
                          label="Add Photo (Optional)"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        {editingReviewId && (
                          <button 
                            type="button"
                            onClick={() => { setEditingReviewId(null); setReviewForm({ rating: 5, comment: '', imageUrl: '' }); }}
                            className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          type="submit" 
                          disabled={submittingReview}
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {submittingReview ? 'Submitting...' : (editingReviewId ? 'Update Review' : 'Submit Review')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-50 pb-6">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex text-yellow-400">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={14} fill={i <= review.rating ? "currentColor" : "none"} stroke={i <= review.rating ? "none" : "currentColor"} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-muted-foreground mb-2">
                            by {review.user?.name || 'User'} 
                            {review.verifiedPurchase && <span className="text-success-text text-xs font-medium ml-2">✓ Verified Purchase</span>}
                          </p>
                          
                          {/* Edit / Delete Options (Only for the author) */}
                          {user && user.id === review.userId && (
                            <div className="flex gap-3">
                              <button onClick={() => startEdit(review)} className="text-muted-foreground hover:text-primary/90 transition-colors" title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteReview(review.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-foreground text-sm whitespace-pre-wrap">{review.comment}</p>
                        
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((img: string, idx: number) => (
                              <OptimizedImage key={idx} src={img} alt="Review attachment" className="w-20 h-20 object-cover rounded-md border border-border" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
