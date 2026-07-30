'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Edit2, Trash2 } from 'lucide-react';

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
  
  // Generic attributes state: { [filterKey]: value }
  const [productAttributes, setProductAttributes] = useState<Record<string, any>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get(`/products?page=${page}&limit=10`);
      setProducts(res.data.data || res.data);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchInitialData = async () => {
    try {
      const [catsRes, brandsRes, filtersRes] = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/brands'),
        apiClient.get('/filters/admin/all')
      ]);
      setCategories(catsRes.data);
      setBrands(brandsRes.data);
      setFilterDefs(filtersRes.data);
    } catch (error) {
      toast.error('Failed to load initial data. Form might not work correctly.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages([...images, res.data.url]);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        name, 
        description, 
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        categoryId,
        brandId: brandId || undefined,
        images,
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
      setProductAttributes({});
      
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter the definitions by selected category
  const activeFilters = filterDefs.filter(f => 
    f.status === 'ACTIVE' && 
    (!f.categoryIds || f.categoryIds.length === 0 || f.categoryIds.includes(categoryId))
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategoryId(product.categoryId);
    setBrandId(product.brandId || '');
    setImages(product.images || []);
    
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-border mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          {editingId && (
            <button 
              onClick={() => {
                setEditingId(null);
                setName(''); setDescription(''); setPrice(''); setStock('');
                setCategoryId(''); setBrandId(''); setImages([]); setProductAttributes({});
              }}
              className="text-sm text-muted-foreground hover:text-black border px-3 py-1 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input 
              type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Category</label>
            <select 
              required value={categoryId} onChange={e => {
                setCategoryId(e.target.value);
                setProductAttributes({}); // Reset attributes on category change
              }}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Brand (Optional)</label>
            <select 
              value={brandId} onChange={e => setBrandId(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            >
              <option value="">Select Brand</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">Price (৳)</label>
              <input 
                type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
              <input 
                type="number" required min="0" value={stock} onChange={e => setStock(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea 
              rows={3} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            />
          </div>

          {/* Dynamic Category-Scoped Attributes */}
          {categoryId && activeFilters.length > 0 && (
            <div className="bg-muted p-4 rounded-lg border border-border md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="md:col-span-2 text-sm font-bold text-foreground uppercase tracking-wider mb-2 border-b pb-2">Category Attributes</h3>
              
              {activeFilters.map(filter => {
                if (filter.type === 'RADIO' || filter.type === 'SWATCH') {
                  return (
                    <div key={filter.id}>
                      <label className="block text-sm font-medium text-foreground mb-1">{filter.label}</label>
                      <select 
                        value={productAttributes[filter.key] || ''} 
                        onChange={e => handleAttributeChange(filter.key, e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black bg-white"
                      >
                        <option value="">Select {filter.label}</option>
                        {filter.values?.map((v: any) => <option key={v.value} value={v.value}>{v.label}</option>)}
                      </select>
                    </div>
                  );
                } else if (filter.type === 'CHECKBOX') {
                  return (
                    <div key={filter.id} className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">{filter.label}</label>
                      <div className="flex flex-wrap gap-3">
                        {filter.values?.map((v: any) => (
                          <label key={v.value} className="flex items-center gap-1.5 text-sm cursor-pointer bg-white px-3 py-1.5 border rounded shadow-sm hover:border-black">
                            <input 
                              type="checkbox" 
                              checked={(productAttributes[filter.key] || []).includes(v.value)}
                              onChange={e => handleCheckboxChange(filter.key, v.value, e.target.checked)}
                              className="rounded text-black focus:ring-black"
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
                      <label className="block text-sm font-medium text-foreground mb-1">{filter.label} ({filter.rangeConfig?.unit || ''})</label>
                      <input 
                        type="number"
                        min={filter.rangeConfig?.min}
                        max={filter.rangeConfig?.max}
                        step={filter.rangeConfig?.step}
                        value={productAttributes[filter.key] || ''}
                        onChange={e => handleAttributeChange(filter.key, e.target.value)}
                        className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black bg-white"
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
            <label className="block text-sm font-medium text-foreground mb-1">Product Images (Upload to ImgBB)</label>
            <div className="flex items-center gap-4">
              <input 
                type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-black hover:file:bg-muted"
              />
              {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 mt-4">
                {images.map((img, i) => (
                  <OptimizedImage key={i} src={img} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                ))}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 pt-4">
            <button 
              type="submit" disabled={isLoading || isUploading}
              className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-secondary disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="p-4 font-medium text-muted-foreground">Image</th>
              <th className="p-4 font-medium text-muted-foreground">Name</th>
              <th className="p-4 font-medium text-muted-foreground">Price</th>
              <th className="p-4 font-medium text-muted-foreground">Stock</th>
              <th className="p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(prod => (
              <tr key={prod.id} className="hover:bg-muted">
                <td className="p-4">
                  {prod.images?.[0] ? <OptimizedImage src={prod.images[0]} alt={prod.name} className="h-10 w-10 object-cover rounded" /> : '-'}
                </td>
                <td className="p-4 font-medium">{prod.name}</td>
                <td className="p-4 text-muted-foreground">৳{prod.price}</td>
                <td className="p-4 text-muted-foreground">{prod.stock}</td>
                <td className="p-4 flex gap-3">
                  <button onClick={() => startEdit(prod)} className="text-muted-foreground hover:text-black" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(prod.id)} className="text-muted-foreground hover:text-destructive" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-border gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-muted-foreground">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
