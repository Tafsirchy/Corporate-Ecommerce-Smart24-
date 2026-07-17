import Link from 'next/link';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group relative block overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-lg border border-gray-100">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
          alt={product.name}
          className="object-cover w-full h-full transition duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition">
          {product.name}
        </h3>
        <p className="mt-2 text-xl font-bold text-gray-900">৳{product.price}</p>
        <button className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
          View Details
        </button>
      </div>
    </Link>
  );
}
