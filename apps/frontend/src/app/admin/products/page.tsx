'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Edit2, Trash2, X, Search, Filter } from 'lucide-react';
import { ScrollFade } from '@/components/ui/ScrollFade';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [filterDefs, setFilterDefs] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  
  // Generic attributes state: { [filterKey]: value }
  const [productAttributes, setProductAttributes] = useState<Record<string, any>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
    fetchProducts();
  }, [page, searchQuery, filterCategoryId]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchProducts() {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      if (searchQuery) queryParams.append('search', searchQuery);
      if (filterCategoryId) queryParams.append('categoryId', filterCategoryId);

      const res = await apiClient.get(`/products/admin?${queryParams.toString()}`);
      setProducts(res.data.data || res.data);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  async function fetchInitialData() {
    try {
      const [catsRes, brandsRes, filtersRes] = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/brands'),
        apiClient.get('/filters/admin/all')
      ]);
      const cats = catsRes.data?.data || catsRes.data || [];
      const uniqueCats = Array.from(new Map(cats.map((c: any) => [c.name, c])).values());
      const sortedCats = [...uniqueCats].sort((a: any, b: any) => a.name.localeCompare(b.name));
      setCategories(sortedCats);
      
      const fetchedBrands = brandsRes.data?.data || brandsRes.data || [];
      const uniqueBrands = Array.from(new Map(fetchedBrands.map((b: any) => [b.name, b])).values());
      const sortedBrands = [...uniqueBrands].sort((a: any, b: any) => a.name.localeCompare(b.name));
      setBrands(sortedBrands);
      
      setFilterDefs(filtersRes.data?.data || filtersRes.data);
    } catch (error) {
      toast.error('Failed to load initial data. Form might not work correctly.');
    }
  };

  // Removed handleImageUpload in favor of ImageUpload component

  const handleAttributeChange = (key: string, value: any) => {
    setProductAttributes(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key: string, value: string, checked: boolean) => {
    setProductAttributes(prev => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      if (checked) {
        return { ...prev, [key]: [...current, value] };
      } else {
        return { ...prev, [key]: current.filter((v: string) => v !== value) };
      }
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsedPrice = parseFloat(price);
    const parsedStock = stock !== '' ? parseInt(stock, 10) : 0;

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    setIsLoading(true);
    
    // Convert productAttributes object to array of ProductAttribute
    const attributesPayload: any[] = [];
    Object.entries(productAttributes).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          attributesPayload.push({ filterKey: key, value: v, source: 'manual', confidence: 1.0 });
        });
      } else if (value) {
        attributesPayload.push({ filterKey: key, value, source: 'manual', confidence: 1.0 });
      }
    });

    try {
      const payload = { 
        name: name.trim(), 
        description: description.trim(), 
        price: parsedPrice,
        stock: parsedStock,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        images,
        isActive,
        attributes: attributesPayload
      };

      if (editingId) {
        await apiClient.patch(`/products/${editingId}`, payload);
        toast.success('Product updated');
        setEditingId(null);
      } else {
        await apiClient.post('/products', payload);
        toast.success('Product created');
      }
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategoryId('');
      setBrandId('');
      setImages([]);
      setIsActive(true);
      setProductAttributes({});
      setIsModalOpen(false);
      
      fetchProducts();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || 'Failed to save product'));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter the definitions by selected category
  const activeFilters = filterDefs.filter(f => 
    f.status === 'ACTIVE' && 
    (!f.categoryIds || f.categoryIds.length === 0 || f.categoryIds.includes(categoryId))
  );

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      toast.success('Product deleted');
      setSelectedIds(prev => prev.filter(item => item !== id));
      fetchProducts();
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.info('Product was already deleted or not found. Refreshing list...');
        setSelectedIds(prev => prev.filter(item => item !== id));
        fetchProducts();
      } else {
        toast.error(error?.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const allVisibleSelected = products.length > 0 && products.every(p => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(prev => prev.filter(id => !products.some(p => p.id === id)));
    } else {
      const visibleIds = products.map(p => p.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected product(s)?`)) {
      return;
    }
    setIsBulkDeleting(true);
    try {
      const res = await apiClient.post('/products/bulk-delete', { ids: selectedIds });
      toast.success(res.data?.message || `${selectedIds.length} product(s) deleted`);
      setSelectedIds([]);
      fetchProducts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete selected products');
    } finally {
      setIsBulkDeleting(false);
    }
  }

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategoryId(product.categoryId);
    setBrandId(product.brandId || '');
    setImages(product.images || []);
    setIsActive(product.isActive ?? true);
    
    // Parse attributes
    const attrs: Record<string, any> = {};
    if (product.attributes) {
      product.attributes.forEach((attr: any) => {
        const def = filterDefs.find(f => f.key === attr.filterKey);
        if (def && def.type === 'CHECKBOX') {
          if (!attrs[attr.filterKey]) attrs[attr.filterKey] = [];
          attrs[attr.filterKey].push(attr.value);
        } else {
          attrs[attr.filterKey] = attr.value;
        }
      });
    }
    setProductAttributes(attrs);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setName(''); setDescription(''); setPrice(''); setStock('');
            setCategoryId(''); setBrandId(''); setImages([]); setProductAttributes({}); setIsActive(true);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-black text-white px-6 py-2 min-h-[44px] rounded font-medium hover:bg-secondary transition-colors"
        >
          Add New Product
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-border mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-2">
          <Filter size={18} className="text-muted-foreground hidden md:block" />
          <SearchableSelect
            className="w-full md:w-64"
            placeholder="All Categories"
            value={filterCategoryId}
            onChange={(val) => {
              setFilterCategoryId(val);
              setPage(1);
            }}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
          />
        </div>
      </div>
      
      {isModalOpen && (
        <ScrollFade className="fixed inset-0 bg-white sm:bg-black/50 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <ScrollFade className="bg-white sm:rounded-xl shadow-2xl p-4 w-full h-full sm:h-auto sm:max-h-[95vh] max-w-4xl relative overflow-y-auto">
            <div className="flex justify-between items-center mb-2 sticky top-0 bg-white z-10 pb-2 border-b border-border">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button 
                onClick={() => {
                  setEditingId(null);
                  setName(''); setDescription(''); setPrice(''); setStock('');
                  setCategoryId(''); setBrandId(''); setImages([]); setProductAttributes({}); setIsActive(true);
                  setIsModalOpen(false);
                }} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0">
              <div>
                <label className="block text-sm font-medium text-foreground mb-0.5">Name</label>
                <input 
              type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-0.5">Category</label>
            <SearchableSelect
              placeholder="Select Category"
              value={categoryId}
              onChange={(val) => {
                setCategoryId(val);
                setProductAttributes({}); // Reset attributes on category change
              }}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-0.5">Brand (Optional)</label>
            <SearchableSelect
              placeholder="Select Brand"
              value={brandId}
              onChange={(val) => setBrandId(val)}
              options={brands.map(b => ({ value: b.id, label: b.name }))}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-0.5">Price (৳)</label>
              <input 
                type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-0.5">Stock</label>
              <input 
                type="number" required min="0" value={stock} onChange={e => setStock(e.target.value)}
                className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-0.5">Description</label>
            <textarea 
              rows={3} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer w-max min-h-[44px]">
              <input 
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded text-black focus:ring-black w-5 h-5"
              />
              <span className="text-base font-medium text-foreground">Product is Active</span>
            </label>
          </div>

          {/* Dynamic Category-Scoped Attributes */}
          {categoryId && activeFilters.length > 0 && (
            <div className="bg-muted p-2 rounded-lg border border-border md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <h3 className="md:col-span-2 text-xs font-bold text-foreground uppercase tracking-wider mb-0 border-b pb-1">Category Attributes</h3>
              
              {activeFilters.map(filter => {
                if (filter.type === 'RADIO' || filter.type === 'SWATCH') {
                  return (
                    <div key={filter.id}>
                      <label className="block text-sm font-medium text-foreground mb-0.5">{filter.label}</label>
                      <select 
                        value={productAttributes[filter.key] || ''} 
                        onChange={e => handleAttributeChange(filter.key, e.target.value)}
                        className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black bg-white"
                      >
                        <option value="">Select {filter.label}</option>
                        {filter.values?.map((v: any) => <option key={v.value} value={v.value}>{v.label}</option>)}
                      </select>
                    </div>
                  );
                } else if (filter.type === 'CHECKBOX') {
                  return (
                    <div key={filter.id} className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">{filter.label}</label>
                      <div className="flex flex-wrap gap-2">
                        {filter.values?.map((v: any) => (
                          <label key={v.value} className="flex items-center gap-2 text-base cursor-pointer bg-white px-4 py-2 min-h-[44px] border rounded shadow-sm hover:border-black">
                            <input 
                              type="checkbox" 
                              checked={(productAttributes[filter.key] || []).includes(v.value)}
                              onChange={e => handleCheckboxChange(filter.key, v.value, e.target.checked)}
                              className="rounded text-black focus:ring-black w-5 h-5"
                            />
                            {filter.type === 'SWATCH' && v.colorHex && (
                              <span className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: v.colorHex }}></span>
                            )}
                            {v.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                } else if (filter.type === 'RANGE') {
                  return (
                    <div key={filter.id}>
                      <label className="block text-sm font-medium text-foreground mb-0.5">{filter.label} ({filter.rangeConfig?.unit || ''})</label>
                      <input 
                        type="number"
                        min={filter.rangeConfig?.min}
                        max={filter.rangeConfig?.max}
                        step={filter.rangeConfig?.step}
                        value={productAttributes[filter.key] || ''}
                        onChange={e => handleAttributeChange(filter.key, e.target.value)}
                        className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black bg-white"
                        placeholder="Enter value"
                      />
                    </div>
                  );
                }
                return null;
              })}
              
              {/* Add custom inline attribute functionality can be added here */}
            </div>
          )}

          <div className="md:col-span-2">
            <ImageUpload 
              images={images}
              setImages={setImages}
              multiple={true}
              label="Product Images"
            />
          </div>
          
          <div className="md:col-span-2 pt-2">
            <button 
              type="submit" disabled={isLoading || isUploading}
              className="bg-black text-white px-6 py-2 min-h-[44px] text-base rounded font-medium hover:bg-secondary disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </ScrollFade>
    </ScrollFade>
  )}

      {selectedIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-amber-600 text-white">
              {selectedIds.length} selected
            </span>
            <span className="text-sm text-amber-900 font-medium">
              {selectedIds.length === 1 ? '1 product' : `${selectedIds.length} products`} ready for bulk action
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="flex-1 sm:flex-initial px-4 py-2 min-h-[40px] text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Selection
            </button>
            <button
              type="button"
              disabled={isBulkDeleting}
              onClick={handleBulkDelete}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 min-h-[40px] text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              <Trash2 size={16} />
              {isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Desktop Table View */}
        <ScrollFade className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all visible products"
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  />
                </th>
                <th className="p-4 font-medium text-muted-foreground">Image</th>
                <th className="p-4 font-medium text-muted-foreground">Name</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground">Price</th>
                <th className="p-4 font-medium text-muted-foreground">Stock</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(prod => {
                const isSelected = selectedIds.includes(prod.id);
                return (
                <tr key={prod.id} className={`transition-colors ${isSelected ? 'bg-amber-50/60' : 'hover:bg-muted'}`}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(prod.id)}
                      aria-label={`Select ${prod.name}`}
                      className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                    {prod.images?.[0] ? <OptimizedImage src={prod.images[0]} alt={prod.name} width={40} height={40} containerClassName="h-10 w-10 shrink-0 rounded" className="object-cover rounded" /> : '-'}
                  </td>
                  <td className="p-4 font-medium">{prod.name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 text-xs rounded-full font-medium ${prod.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {prod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">৳{prod.price}</td>
                  <td className="p-4 text-muted-foreground">{prod.stock}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => startEdit(prod)} 
                        className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded transition-colors" 
                        title="Edit"
                        aria-label={`Edit ${prod.name}`}
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prod.id)} 
                        className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-destructive hover:bg-danger-bg rounded transition-colors" 
                        title="Delete"
                        aria-label={`Delete ${prod.name}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollFade>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {products.length > 0 && (
            <div className="p-4 bg-muted/60 flex items-center justify-between border-b border-border">
              <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                />
                Select All ({products.length})
              </label>
              {selectedIds.length > 0 && (
                <span className="text-xs font-semibold text-amber-700">{selectedIds.length} selected</span>
              )}
            </div>
          )}
          {products.map(prod => {
            const isSelected = selectedIds.includes(prod.id);
            return (
            <div key={prod.id} className={`p-4 flex flex-col gap-4 transition-colors ${isSelected ? 'bg-amber-50/60' : ''}`}>
              <div className="flex gap-3 items-start">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(prod.id)}
                  aria-label={`Select ${prod.name}`}
                  className="w-5 h-5 mt-1 rounded border-gray-300 text-black focus:ring-black shrink-0"
                />
                {prod.images?.[0] ? (
                  <OptimizedImage src={prod.images[0]} alt={prod.name} width={80} height={80} containerClassName="h-20 w-20 shrink-0 rounded-lg border bg-muted" className="object-cover rounded-lg" />
                ) : (
                  <div className="h-20 w-20 bg-muted border rounded-lg shrink-0 flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                )}
                
                <div className="flex flex-col gap-1 flex-1">
                  <div className="font-bold text-base text-foreground">{prod.name}</div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">৳{prod.price}</span> • Stock: {prod.stock}
                  </div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${prod.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {prod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-2 pt-4 border-t border-border">
                <button 
                  onClick={() => startEdit(prod)} 
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-primary-600 bg-primary-50 rounded-lg transition-colors font-medium text-sm"
                  aria-label={`Edit ${prod.name}`}
                >
                  <Edit2 size={18} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(prod.id)} 
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-destructive bg-danger-bg rounded-lg transition-colors font-medium text-sm"
                  aria-label={`Delete ${prod.name}`}
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
            );
          })}
          {products.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No products found</div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center p-4 border-t border-border gap-4">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 min-h-[44px] min-w-[80px] font-medium border rounded hover:bg-muted disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-base font-medium text-muted-foreground">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 min-h-[44px] min-w-[80px] font-medium border rounded hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
