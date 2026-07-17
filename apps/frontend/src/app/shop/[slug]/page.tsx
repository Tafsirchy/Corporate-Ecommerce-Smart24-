'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would have a GET /products/slug/:slug endpoint.
    // For now, let's fetch all and filter, or assume the backend has findBySlug.
    // We didn't create a custom findBySlug endpoint in our controller, so let's fetch all and filter to simulate.
    axios.get('http://localhost:3001/products')
      .then(res => {
        const p = res.data.find((item: any) => item.slug === slug);
        setProduct(p);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-gray-200 h-96 rounded-xl"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Product Not Found</h1>
        <p className="mt-4 text-gray-500">The product you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images */}
        <div className="w-full md:w-1/2">
          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
            <img 
              src={product.images?.[0] || 'https://placehold.co/800x800?text=No+Image'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-4 mt-4">
              {product.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:border-blue-500">
                  <img src={img} alt={`${product.name} ${i+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-blue-600">৳{product.price}</p>
          
          <div className="mt-6 prose prose-blue">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <p className="text-sm text-gray-500 mb-4">
              Availability: {product.stock > 0 ? <span className="text-green-600 font-medium">In Stock ({product.stock})</span> : <span className="text-red-600 font-medium">Out of Stock</span>}
            </p>
            
            <button 
              disabled={product.stock <= 0}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
          
          {product.brand && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Brand</h3>
              <p className="text-gray-600">{product.brand.name}</p>
            </div>
          )}
          
          {product.category && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Category</h3>
              <p className="text-gray-600">{product.category.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
