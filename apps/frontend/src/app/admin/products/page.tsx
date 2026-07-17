'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      setProducts(res.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchCategoriesAndBrands = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        apiClient.get('/categories'),
        apiClient.get('/brands')
      ]);
      setCategories(catsRes.data);
      setBrands(brandsRes.data);
    } catch (error) {}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post('/products', { 
        name, 
        description, 
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        categoryId,
        brandId: brandId || undefined,
        images
      });
      toast.success('Product created');
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategoryId('');
      setBrandId('');
      setImages([]);
      
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              required value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand (Optional)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳)</label>
              <input 
                type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input 
                type="number" required min="0" value={stock} onChange={e => setStock(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows={3} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images (Upload to ImgBB)</label>
            <div className="flex items-center gap-4">
              <input 
                type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-black hover:file:bg-gray-100"
              />
              {isUploading && <span className="text-sm text-gray-500">Uploading...</span>}
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 mt-4">
                {images.map((img, i) => (
                  <img key={i} src={img} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                ))}
              </div>
            )}
          </div>
          
          <div className="md:col-span-2 pt-4">
            <button 
              type="submit" disabled={isLoading || isUploading}
              className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Image</th>
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Price</th>
              <th className="p-4 font-medium text-gray-600">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(prod => (
              <tr key={prod.id} className="hover:bg-gray-50">
                <td className="p-4">
                  {prod.images?.[0] ? <img src={prod.images[0]} alt={prod.name} className="h-10 w-10 object-cover rounded" /> : '-'}
                </td>
                <td className="p-4 font-medium">{prod.name}</td>
                <td className="p-4 text-gray-500">৳{prod.price}</td>
                <td className="p-4 text-gray-500">{prod.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
