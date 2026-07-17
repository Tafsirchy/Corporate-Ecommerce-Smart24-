'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductCard, Product } from '../../components/ProductCard';
import { CategorySidebar, Category } from '../../components/CategorySidebar';
import { useSearchParams } from 'next/navigation';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch categories
    axios.get('http://localhost:3001/categories')
      .then(res => {
        // Filter top-level categories
        const topLevel = res.data.filter((c: any) => c.level === 1);
        setCategories(topLevel);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    // Fetch products
    setLoading(true);
    axios.get('http://localhost:3001/products')
      .then(res => {
        let filteredProducts = res.data;
        if (categorySlug) {
          filteredProducts = filteredProducts.filter((p: any) => p.category?.slug === categorySlug);
        }
        if (searchQuery) {
          filteredProducts = filteredProducts.filter((p: any) => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setProducts(filteredProducts);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [categorySlug, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4">
          <div className="mb-6">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <CategorySidebar categories={categories} />
        </aside>

        {/* Product Grid */}
        <main className="w-full md:w-3/4">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {categorySlug ? `Shop: ${categorySlug}` : 'All Products'}
            </h1>
            <span className="text-sm text-gray-500">{products.length} Products</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-xl"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-xl font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your category filter.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
