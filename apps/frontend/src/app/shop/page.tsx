'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductCard, Product, generateMockData } from '../../components/ProductCard';
import { CategorySidebar, Category } from '../../components/CategorySidebar';
import { BrandSidebar, Brand } from '../../components/BrandSidebar';
import { FilterSidebar, FilterOption } from '../../components/FilterSidebar';
import { PriceFilter } from '../../components/PriceFilter';
import { RatingFilter } from '../../components/RatingFilter';
import { Pagination } from '../../components/Pagination';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function ShopContent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('best-match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedWarranties, setSelectedWarranties] = useState<string[]>([]);
  const [selectedBrandComps, setSelectedBrandComps] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const [dynamicOptions, setDynamicOptions] = useState({
    colors: [] as FilterOption[],
    warranties: [] as FilterOption[],
    brandComps: [] as FilterOption[],
    materials: [] as FilterOption[],
    models: [] as FilterOption[],
    services: [] as FilterOption[],
    locations: [] as FilterOption[],
  });

  useEffect(() => {
    // Fetch categories
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    axios.get(`${apiUrl}/categories`)
      .then(res => {
        const data = res.data;
        const map = new Map<string, Category>();
        const roots: Category[] = [];
        
        data.forEach((item: any) => {
          map.set(item.id, { ...item, children: [] });
        });
        
        data.forEach((item: any) => {
          if (item.parentId) {
            const parent = map.get(item.parentId);
            if (parent) {
              parent.children!.push(map.get(item.id)!);
            }
          } else {
            roots.push(map.get(item.id)!);
          }
        });
        setCategories(roots);
      })
      .catch(err => console.error(err));
      
    // Fetch brands
    axios.get(`${apiUrl}/brands`)
      .then(res => setBrands(res.data))
      .catch(err => console.error(err));

    // Fetch all products once for client-side filtering
    setLoading(true);
    axios.get(`${apiUrl}/products?limit=1000`)
      .then(res => {
        const products = res.data.data || res.data;
        setAllProducts(products);
        
        // Extract unique filter options
        const uniqueColors = new Set<string>();
        const uniqueWarranties = new Set<string>();
        const uniqueBrandComps = new Set<string>();
        const uniqueMaterials = new Set<string>();
        const uniqueModels = new Set<string>();
        const uniqueLocations = new Set<string>();
        const uniqueServices = new Set<string>();

        products.forEach((p: any) => {
          if (p.color) uniqueColors.add(p.color);
          if (p.warrantyType) uniqueWarranties.add(p.warrantyType);
          if (p.brandCompatibility) uniqueBrandComps.add(p.brandCompatibility);
          if (p.caseMaterial) uniqueMaterials.add(p.caseMaterial);
          if (p.compatibilityByModel) uniqueModels.add(p.compatibilityByModel);
          if (p.location) uniqueLocations.add(p.location);
          if (p.services && Array.isArray(p.services)) p.services.forEach((s: string) => uniqueServices.add(s));
        });

        setDynamicOptions({
          colors: Array.from(uniqueColors).map(c => ({ id: c, label: c, value: c })),
          warranties: Array.from(uniqueWarranties).map(w => ({ id: w, label: w, value: w })),
          brandComps: Array.from(uniqueBrandComps).map(b => ({ id: b, label: b, value: b })),
          materials: Array.from(uniqueMaterials).map(m => ({ id: m, label: m, value: m })),
          models: Array.from(uniqueModels).map(m => ({ id: m, label: m, value: m })),
          locations: Array.from(uniqueLocations).map(l => ({ id: l, label: l, value: l })),
          services: Array.from(uniqueServices).map(s => {
            const labels: Record<string, string> = {
              'free-shipping': 'Free Shipping',
              'cod': 'Cash On Delivery',
              'best-price': 'Best Price Guaranteed',
              'installment': 'Installment'
            };
            return { id: s, label: labels[s] || s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: s };
          })
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [categorySlug, searchQuery, sortBy, selectedBrands, minPrice, maxPrice, selectedRating, selectedColors, selectedWarranties, selectedBrandComps, selectedMaterials, selectedModels, selectedLocations]);

  // Apply filters, sorting, and pagination
  useEffect(() => {
    if (allProducts.length === 0) return;

    let filteredProducts = [...allProducts];

    // 1. Category Filter
    if (categorySlug) {
          if (categories.length > 0) {
            const getSlugs = (cats: Category[], target: string, found: boolean = false): string[] => {
              let slugs: string[] = [];
              for (const c of cats) {
                if (c.slug === target || found) {
                  slugs.push(c.slug);
                  if (c.children) {
                    slugs = slugs.concat(getSlugs(c.children, target, true));
                  }
                } else if (c.children) {
                  const childSlugs = getSlugs(c.children, target, false);
                  if (childSlugs.length > 0) {
                    slugs = slugs.concat(childSlugs);
                  }
                }
              }
              return slugs;
            };

            const validSlugs = getSlugs(categories, categorySlug);
            if (validSlugs.length > 0) {
              filteredProducts = filteredProducts.filter((p: any) => validSlugs.includes(p.category?.slug));
            } else {
              filteredProducts = filteredProducts.filter((p: any) => p.category?.slug === categorySlug);
            }
          } else {
            filteredProducts = filteredProducts.filter((p: any) => p.category?.slug === categorySlug);
          }
        }
    // 2. Search Query
    if (searchQuery) {
      filteredProducts = filteredProducts.filter((p: any) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    // 3. Brands
    if (selectedBrands.length > 0) {
      filteredProducts = filteredProducts.filter((p: any) => selectedBrands.includes(p.brand?.slug));
    }
    // 4. Price (with min > max safety validation)
    if (minPrice !== null || maxPrice !== null) {
      const actualMin = minPrice !== null && maxPrice !== null ? Math.min(minPrice, maxPrice) : (minPrice !== null ? minPrice : 0);
      const actualMax = minPrice !== null && maxPrice !== null ? Math.max(minPrice, maxPrice) : (maxPrice !== null ? maxPrice : Infinity);
      filteredProducts = filteredProducts.filter((p: any) => p.price >= actualMin && p.price <= actualMax);
    }
    // 5. Rating
    if (selectedRating !== null) {
      filteredProducts = filteredProducts.filter((p: any) => {
        return (p.rating || 0) >= selectedRating;
      });
    }
    // 6. Color
    if (selectedColors.length > 0) {
      filteredProducts = filteredProducts.filter((p: any) => p.color && selectedColors.includes(p.color));
    }
    // 7. Warranties
    if (selectedWarranties.length > 0) {
      filteredProducts = filteredProducts.filter((p: any) => p.warrantyType && selectedWarranties.includes(p.warrantyType));
    }
    // 8. Brand Compatibility
    if (selectedBrandComps.length > 0) {
      filteredProducts = filteredProducts.filter((p: any) => p.brandCompatibility && selectedBrandComps.includes(p.brandCompatibility));
    }
    // 9. Case Material
    if (selectedMaterials.length > 0) {
      filteredProducts = filteredProducts.filter((p: any) => p.caseMaterial && selectedMaterials.includes(p.caseMaterial));
    }
    // 10. Compatibility by Model
    if (selectedModels.length > 0) {
      filteredProducts = filteredProducts.filter((p: any) => p.compatibilityByModel && selectedModels.includes(p.compatibilityByModel));
    }
    // 11. Shipped From
    if (selectedLocations.length > 0) {
      filteredProducts = filteredProducts.filter((p: any) => p.location && selectedLocations.includes(p.location));
    }
    // 12. Services
    if (selectedServices.length > 0) {
      filteredProducts = filteredProducts.filter((p: any) => p.services && selectedServices.every((s: string) => p.services.includes(s)));
    }

    // Apply Sorting
    if (sortBy === 'price-asc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filteredProducts.sort((a, b) => (b.id > a.id ? 1 : -1)); // simple fallback for newest
    }

    // Apply Pagination
    setTotalPages(Math.ceil(filteredProducts.length / 16));
    const startIndex = (page - 1) * 16;
    setProducts(filteredProducts.slice(startIndex, startIndex + 16));

  }, [allProducts, categorySlug, searchQuery, page, sortBy, categories, selectedBrands, minPrice, maxPrice, selectedRating, selectedColors, selectedWarranties, selectedBrandComps, selectedMaterials, selectedModels, selectedLocations]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-[240px] shrink-0">
          <div className="mb-6">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <CategorySidebar categories={categories} />
          {brands.length > 0 && (
            <BrandSidebar 
              brands={brands} 
              selectedBrands={selectedBrands} 
              onChange={setSelectedBrands} 
            />
          )}
          {dynamicOptions.services.length > 0 && (
            <FilterSidebar 
              title="Service & Promotion" 
              options={dynamicOptions.services} 
              selectedValues={selectedServices} 
              onChange={setSelectedServices} 
            />
          )}
          <PriceFilter 
            minPrice={minPrice} 
            maxPrice={maxPrice} 
            onApply={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
          />
          <RatingFilter 
            selectedRating={selectedRating} 
            onChange={setSelectedRating} 
          />
          {dynamicOptions.colors.length > 0 && (
            <FilterSidebar 
              title="Color Family" 
              options={dynamicOptions.colors} 
              selectedValues={selectedColors} 
              onChange={setSelectedColors} 
            />
          )}
          {dynamicOptions.warranties.length > 0 && (
            <FilterSidebar 
              title="Warranty Type" 
              options={dynamicOptions.warranties} 
              selectedValues={selectedWarranties} 
              onChange={setSelectedWarranties} 
            />
          )}
          {dynamicOptions.brandComps.length > 0 && (
            <FilterSidebar 
              title="Brand Compatibility" 
              options={dynamicOptions.brandComps} 
              selectedValues={selectedBrandComps} 
              onChange={setSelectedBrandComps} 
            />
          )}
          {dynamicOptions.materials.length > 0 && (
            <FilterSidebar 
              title="Case Material" 
              options={dynamicOptions.materials} 
              selectedValues={selectedMaterials} 
              onChange={setSelectedMaterials} 
            />
          )}
          {dynamicOptions.models.length > 0 && (
            <FilterSidebar 
              title="Compatibility By Model" 
              options={dynamicOptions.models} 
              selectedValues={selectedModels} 
              onChange={setSelectedModels} 
            />
          )}
          {dynamicOptions.locations.length > 0 && (
            <FilterSidebar 
              title="Shipped From" 
              options={dynamicOptions.locations} 
              selectedValues={selectedLocations} 
              onChange={setSelectedLocations} 
            />
          )}
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {categorySlug ? categorySlug.replace(/-/g, ' ') : 'All Products'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Sort By:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="best-match">Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
              <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-md p-0.5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-800' : 'hover:bg-gray-50 text-gray-400'}`}
                  title="Grid View"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-800' : 'hover:bg-gray-50 text-gray-400'}`}
                  title="List View"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(() => {
            const activeFilters = [];
            
            selectedBrands.forEach(b => activeFilters.push({ id: `brand-${b}`, label: b, onRemove: () => setSelectedBrands(prev => prev.filter(x => x !== b)) }));
            selectedServices.forEach(s => activeFilters.push({ id: `service-${s}`, label: dynamicOptions.services.find(o => o.value === s)?.label || s, onRemove: () => setSelectedServices(prev => prev.filter(x => x !== s)) }));
            if (minPrice !== null || maxPrice !== null) {
               activeFilters.push({ id: 'price', label: `Price: ${minPrice || 0} - ${maxPrice || 'Any'}`, onRemove: () => { setMinPrice(null); setMaxPrice(null); } });
            }
            if (selectedRating !== null) {
               activeFilters.push({ id: 'rating', label: `Rating: ${selectedRating} & Up`, onRemove: () => setSelectedRating(null) });
            }
            selectedColors.forEach(c => activeFilters.push({ id: `color-${c}`, label: c, onRemove: () => setSelectedColors(prev => prev.filter(x => x !== c)) }));
            selectedWarranties.forEach(w => activeFilters.push({ id: `warranty-${w}`, label: w, onRemove: () => setSelectedWarranties(prev => prev.filter(x => x !== w)) }));
            selectedBrandComps.forEach(b => activeFilters.push({ id: `brandcomp-${b}`, label: b, onRemove: () => setSelectedBrandComps(prev => prev.filter(x => x !== b)) }));
            selectedMaterials.forEach(m => activeFilters.push({ id: `material-${m}`, label: m, onRemove: () => setSelectedMaterials(prev => prev.filter(x => x !== m)) }));
            selectedModels.forEach(m => activeFilters.push({ id: `model-${m}`, label: m, onRemove: () => setSelectedModels(prev => prev.filter(x => x !== m)) }));
            selectedLocations.forEach(l => activeFilters.push({ id: `location-${l}`, label: dynamicOptions.locations.find(o => o.value === l)?.label || l, onRemove: () => setSelectedLocations(prev => prev.filter(x => x !== l)) }));

            if (activeFilters.length === 0) return null;

            const handleClearAll = () => {
              setSelectedBrands([]);
              setSelectedServices([]);
              setMinPrice(null);
              setMaxPrice(null);
              setSelectedRating(null);
              setSelectedColors([]);
              setSelectedWarranties([]);
              setSelectedBrandComps([]);
              setSelectedMaterials([]);
              setSelectedModels([]);
              setSelectedLocations([]);
            };

            return (
              <div className="flex flex-wrap items-center gap-2 mb-6 text-[13px]">
                <span className="text-gray-600 font-medium mr-1">Filtered By:</span>
                {activeFilters.map(filter => (
                  <span key={filter.id} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1.5 rounded-full text-gray-700 shadow-sm transition-all hover:border-gray-300">
                    {filter.label}
                    <button onClick={filter.onRemove} className="text-gray-400 hover:text-red-500 focus:outline-none flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </span>
                ))}
                <button onClick={handleClearAll} className="text-primary-600 hover:text-primary-700 font-medium ml-2 uppercase text-xs tracking-wide">
                  Clear All
                </button>
              </div>
            );
          })()}

          {loading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-6"}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className={`animate-pulse bg-gray-200 rounded-xl ${viewMode === 'grid' ? 'h-80' : 'h-48'}`}></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-xl font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
