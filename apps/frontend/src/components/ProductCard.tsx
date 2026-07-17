'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-lg border border-gray-100 h-full">
      <Link href={`/shop/${product.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
          alt={product.name}
          className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
        />
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-xl font-bold text-gray-900 mb-4 mt-auto">৳{product.price}</p>
        
        <div className="flex gap-2">
          <Link href={`/shop/${product.slug}`} className="flex-1 text-center rounded-md border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-50">
            Details
          </Link>
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
