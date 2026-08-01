'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import Link from 'next/link';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingCart, MapPin, Check, Heart, Loader2 } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  color?: string;
  warrantyType?: string;
  brandCompatibility?: string;
  caseMaterial?: string;
  compatibilityByModel?: string;
  location?: string;
  services?: string[];
  sellerName?: string;
  discountPrice?: number;
  isFlashSale?: boolean;
}

// Helper to generate consistent mock data based on a string (ID)
export const generateMockData = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const discounts = [10, 15, 20, 25, 30, 40, 50, 60, 70];
  const discount = discounts[hash % discounts.length];
  
  const originalPrice = Math.round((100 / (100 - discount))); // Mock multiplier
  
  const ratings = [4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
  const rating = ratings[hash % ratings.length];
  
  const sold = [120, 350, '1.2K', '3.5K', '12.8K', '24K', 89, '5K'];
  const soldCount = sold[hash % sold.length];
  
  const reviews = (hash * 13) % 4500 + 15;
  
  const locations = ['Dhaka', 'Chattogram', 'Sylhet', 'Gazipur', 'Narayanganj'];
  const location = locations[hash % locations.length];

  const allColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Grey', 'Brown', 'Gold', 'Silver', 'Beige'];
  const color = allColors[hash % allColors.length];
  
  const warranties = ['No Warranty', 'Local Seller Warranty', 'Brand Warranty', 'International Manufacturer Warranty'];
  const warrantyType = warranties[hash % warranties.length];

  const brandComps = ['Apple', 'Samsung', 'Xiaomi', 'Universal', 'Other'];
  const brandCompatibility = brandComps[hash % brandComps.length];

  const materials = ['Silicone', 'Leather', 'Plastic', 'Metal', 'Glass'];
  const caseMaterial = materials[hash % materials.length];

  const models = ['iPhone 15 Pro', 'iPhone 14', 'Galaxy S24 Ultra', 'Galaxy A54', 'Universal'];
  const compatibilityByModel = models[hash % models.length];

  return {
    discount,
    rating,
    soldCount,
    reviews,
    location,
    color,
    warrantyType,
    brandCompatibility,
    caseMaterial,
    compatibilityByModel,
    isChoice: hash % 3 === 0
  };
};

export function ProductCard({ product, viewMode = 'grid' }: { product: Product, viewMode?: 'grid' | 'list' }) {
  const addToCart = useCartStore(state => state.addToCart);
  const cartPending = useCartStore(state => state.pendingItems);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);
  const wishlistPending = useWishlistStore(state => state.pendingItems);
  const { user } = useAuth();
  
  // Generate mock data for the UI since the real DB might not have these yet
  const mock = generateMockData(product.id);
  
  // Use actual discount logic if available
  const hasRealDiscount = product.discountPrice !== undefined && product.discountPrice !== null;
  const currentPrice = hasRealDiscount ? product.discountPrice! : product.price;
  const displayOriginalPrice = hasRealDiscount ? product.price : Math.round(product.price * (100 / (100 - mock.discount)));
  const displayDiscountPercent = hasRealDiscount 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) 
    : mock.discount;
  const isDiscounted = hasRealDiscount || mock.discount > 0;
  
  const isAddingToCart = cartPending[product.id];
  const isTogglingWishlist = wishlistPending[product.id];
  const inWishlist = isInWishlist(product.id);

  return (
    <div className={`group relative flex bg-white rounded-xl border border-border hover:border-primary-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden cursor-pointer h-full ${viewMode === 'list' ? 'flex-row items-stretch' : 'flex-col'}`}>
      
      {/* Product Image */}
      <Link href={`/shop/${product.slug}`} className={`block relative overflow-hidden bg-muted ${viewMode === 'list' ? 'w-48 md:w-64 shrink-0' : 'aspect-[5/4]'}`}>
        <OptimizedImage src={product.images?.[0] || 'https://placehold.co/400x320?text=No+Image'}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 mix-blend-multiply" />
        
        {/* Top Badges overlay on image */}
        {mock.isChoice && (
          <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-orange-400 to-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-0.5 shadow-sm">
            <Check size={8} strokeWidth={3} /> Choice
          </div>
        )}
        
        {/* Wishlist Button overlay on image */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (!isTogglingWishlist) toggleWishlist(product, !!user);
          }}
          disabled={isTogglingWishlist}
          aria-label="Add to wishlist"
          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/80 hover:bg-white text-muted-foreground hover:text-destructive shadow-sm backdrop-blur-sm transition-all z-10"
        >
          {isTogglingWishlist ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Heart size={14} className={inWishlist ? "fill-destructive text-destructive" : ""} />
          )}
        </button>
      </Link>
      
      {/* Product Details */}
      <div className={`p-2.5 flex flex-col flex-1 ${viewMode === 'list' ? 'p-4 sm:p-6' : ''}`}>
        
        <Link href={`/shop/${product.slug}`} className="mb-1.5 block">
          <h3 className={`${viewMode === 'list' ? 'text-base sm:text-lg mb-2' : 'text-[12px] line-clamp-2'} font-medium text-foreground leading-[1.3] group-hover:text-primary/90 transition-colors`}>
            {mock.isChoice && !product.name.startsWith('Choice') && (
              <span className="inline-block bg-primary-600 text-white text-[8px] font-bold px-1 py-0.5 rounded-[3px] mr-1 align-middle uppercase tracking-wider">
                Smart
              </span>
            )}
            {product.name}
          </h3>
        </Link>
          {viewMode === 'list' && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 hidden sm:block">
              {product.description || 'No description available.'}
            </p>
          )}

        {/* Spacer to push pricing down */}
        <div className="mt-auto">
          {/* Price, Tags & Action Row in Columns */}
          <div className="flex justify-between items-end mb-2">
            
            {/* Left Column: Price & Tags */}
            <div className="flex flex-col gap-1">
              {/* Price & Discount */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-primary/90">৳{currentPrice.toLocaleString()}</span>
                {isDiscounted && (
                  <span className="text-[9px] text-muted-foreground line-through">৳{displayOriginalPrice.toLocaleString()}</span>
                )}
              </div>
              
              {/* Tags */}
              {isDiscounted && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-destructive bg-danger-bg px-1.5 py-0.5 rounded-[4px]">
                    {displayDiscountPercent}% Off
                  </span>
                  {product.isFlashSale && (
                    <span className="text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-[4px]">
                      Flash Sale
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Action Button */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (!isAddingToCart) addToCart(product);
              }}
              disabled={isAddingToCart}
              className={`w-8 h-8 rounded-full ${isAddingToCart ? 'bg-primary-200 cursor-not-allowed text-primary-400 hover:text-primary-400' : 'bg-primary-50 hover:bg-primary-600 hover:text-white'} text-primary/90 flex items-center justify-center transition-all duration-300 shadow-sm shrink-0`}
              aria-label="Add to cart"
            >
              {isAddingToCart ? <Loader2 size={14} className="animate-spin" strokeWidth={2.5} /> : <ShoppingCart size={14} strokeWidth={2.5} />}
            </button>
          </div>

          {/* Stats Row (Sales, Rating, Location) */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-gray-50 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{mock.soldCount} sold</span>
              <span className="text-muted-foreground">|</span>
              <div className="flex items-center">
                <Star size={10} className="fill-accent text-accent mr-0.5" />
                <span>{product.rating ?? mock.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={10} />
              <span className="truncate max-w-[65px]">{product.location || mock.location}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
