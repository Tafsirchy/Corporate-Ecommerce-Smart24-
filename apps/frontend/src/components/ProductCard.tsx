'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, MapPin, Check } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

// Helper to generate consistent mock data based on a string (ID)
const generateMockData = (id: string) => {
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
  
  return {
    discount,
    rating,
    soldCount,
    reviews,
    location,
    isChoice: hash % 3 === 0
  };
};

export function ProductCard({ product, viewMode = 'grid' }: { product: Product, viewMode?: 'grid' | 'list' }) {
  const { addToCart } = useCart();
  
  // Generate mock data for the UI since the real DB might not have these yet
  const mock = generateMockData(product.id);
  const originalPrice = Math.round(product.price * (100 / (100 - mock.discount)));

  return (
    <div className={`group relative flex bg-white rounded-xl border border-gray-100 hover:border-primary-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden cursor-pointer h-full ${viewMode === 'list' ? 'flex-row items-stretch' : 'flex-col'}`}>
      
      {/* Product Image */}
      <Link href={`/shop/${product.slug}`} className={`block relative overflow-hidden bg-[#f8f9fa] ${viewMode === 'list' ? 'w-48 md:w-64 shrink-0' : 'aspect-[5/4]'}`}>
        <img
          src={product.images?.[0] || 'https://placehold.co/400x320?text=No+Image'}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
        />
        
        {/* Top Badges overlay on image */}
        {mock.isChoice && (
          <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-orange-400 to-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-0.5 shadow-sm">
            <Check size={8} strokeWidth={3} /> Choice
          </div>
        )}
      </Link>
      
      {/* Product Details */}
      <div className={`p-2.5 flex flex-col flex-1 ${viewMode === 'list' ? 'p-4 sm:p-6' : ''}`}>
        
        <Link href={`/shop/${product.slug}`} className="mb-1.5 block">
          <h3 className={`${viewMode === 'list' ? 'text-base sm:text-lg mb-2' : 'text-[12px] line-clamp-2'} font-medium text-gray-800 leading-[1.3] group-hover:text-primary-600 transition-colors`}>
            {mock.isChoice && !product.name.startsWith('Choice') && (
              <span className="inline-block bg-primary-600 text-white text-[8px] font-bold px-1 py-0.5 rounded-[3px] mr-1 align-middle uppercase tracking-wider">
                Smart
              </span>
            )}
            {product.name}
          </h3>
        </Link>
          {viewMode === 'list' && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 hidden sm:block">
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
                <span className="text-base font-extrabold text-primary-600">৳{product.price.toLocaleString()}</span>
                {mock.discount > 0 && (
                  <span className="text-[9px] text-gray-400 line-through">৳{originalPrice.toLocaleString()}</span>
                )}
              </div>
              
              {/* Tags */}
              {mock.discount > 0 && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-[4px]">
                    {mock.discount}% Off
                  </span>
                  <span className="text-[10px] font-medium text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-[4px]">
                    Coins save ৳ 5
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Action Button */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-300 shadow-sm shrink-0"
              aria-label="Add to cart"
            >
              <ShoppingCart size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Stats Row (Sales, Rating, Location) */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-50 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-700">{mock.soldCount} sold</span>
              <span className="text-gray-300">|</span>
              <div className="flex items-center">
                <Star size={10} className="fill-amber-400 text-amber-400 mr-0.5" />
                <span>{mock.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin size={10} />
              <span className="truncate max-w-[65px]">{mock.location}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
