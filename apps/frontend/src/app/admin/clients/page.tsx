'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Edit2, Trash2, X, Plus, ExternalLink, Search, Check, ShoppingBag } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ImageUpload } from '@/components/ui/ImageUpload';
import Link from 'next/link';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  sku?: string;
}

interface ClientItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl?: string;
  industry?: string;
  description?: string;
  productIds: string[];
  purchaseNote?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const COMMON_INDUSTRIES = [
  'IT & Software',
  'Banking & Financial Services',
  'Telecommunications',
  'Manufacturing & Industrial',
  'Healthcare & Pharmaceuticals',
  'Education & Training',
  'Retail & E-commerce',
  'Hospitality & Tourism',
  'Government & Public Sector',
  'Consulting & Professional Services',
  'Others',
];

export default function AdminClients() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isClientsLoading, setIsClientsLoading] = useState(true);

  // Filter & Search
  const [tableSearch, setTableSearch] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoImages, setLogoImages] = useState<string[]>([]);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [industry, setIndustry] = useState(COMMON_INDUSTRIES[0]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [purchaseNote, setPurchaseNote] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState<number>(0);

  // Product Picker state
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  async function fetchClients() {
    setIsClientsLoading(true);
    try {
      const res = await apiClient.get('/clients?limit=100');
      setClients(res.data.data || res.data || []);
    } catch (error: any) {
      toast.error('Failed to load clients');
    } finally {
      setIsClientsLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const res = await apiClient.get('/products?limit=100');
      setProducts(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to load products for picker', error);
    }
  }

  // Auto-generate slug on name change when creating
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setLogoImages([]);
    setLogoUrlInput('');
    setIsUrlMode(false);
    setWebsiteUrl('');
    setIndustry(COMMON_INDUSTRIES[0]);
    setCustomIndustry('');
    setDescription('');
    setPurchaseNote('');
    setSelectedProductIds([]);
    setIsActive(true);
    setOrder(clients.length);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: ClientItem) => {
    setEditingId(client.id);
    setName(client.name);
    setSlug(client.slug);
    setLogoImages(client.logoUrl ? [client.logoUrl] : []);
    setLogoUrlInput(client.logoUrl || '');
    setIsUrlMode(false);
    setWebsiteUrl(client.websiteUrl || '');

    if (COMMON_INDUSTRIES.includes(client.industry || '')) {
      setIndustry(client.industry || COMMON_INDUSTRIES[0]);
      setCustomIndustry('');
    } else {
      setIndustry('Others');
      setCustomIndustry(client.industry || '');
    }

    setDescription(client.description || '');
    setPurchaseNote(client.purchaseNote || '');
    setSelectedProductIds(client.productIds || []);
    setIsActive(client.isActive);
    setOrder(client.order ?? 0);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const finalLogoUrl = isUrlMode
      ? logoUrlInput.trim()
      : logoImages[0] || logoUrlInput.trim();

    if (!name.trim()) {
      toast.error('Client name is required');
      return;
    }
    if (!finalLogoUrl) {
      toast.error('Client logo is required');
      return;
    }

    const finalIndustry =
      industry === 'Others' ? customIndustry.trim() || 'Others' : industry;

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      logoUrl: finalLogoUrl,
      websiteUrl: websiteUrl.trim() || undefined,
      industry: finalIndustry || undefined,
      description: description.trim() || undefined,
      purchaseNote: purchaseNote.trim() || undefined,
      productIds: selectedProductIds,
      isActive,
      order: Number(order) || 0,
    };

    setIsSubmitting(true);
    try {
      if (editingId) {
        await apiClient.patch(`/clients/${editingId}`, payload);
        toast.success('Client updated successfully');
      } else {
        await apiClient.post('/clients', payload);
        toast.success('Client created successfully');
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save client');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(client: ClientItem) {
    if (!window.confirm(`Are you sure you want to delete client "${client.name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/clients/${client.id}`);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete client');
    }
  }

  // Filtered clients for table
  const filteredClients = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [clients, tableSearch]);

  // Filtered products in picker
  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [products, productSearch]);

  // Map of selected products
  const selectedProductsMap = useMemo(() => {
    const map = new Map<string, ProductItem>();
    products.forEach((p) => {
      if (selectedProductIds.includes(p.id)) {
        map.set(p.id, p);
      }
    });
    return map;
  }, [products, selectedProductIds]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Display your valued corporate clients, their logos, and showcase products they have purchased.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, industry, or description..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
          />
        </div>
        {tableSearch && (
          <button
            onClick={() => setTableSearch('')}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isClientsLoading ? (
          <div className="py-16 text-center text-gray-500 text-sm">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="py-16 text-center text-gray-500 space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
            <p className="font-medium text-gray-700">No clients found</p>
            <p className="text-xs text-gray-400">
              {tableSearch ? 'Try a different search keyword.' : 'Click "Add New Client" to create your first client.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Industry</th>
                  <th className="py-3.5 px-4">Purchased Products</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => {
                  return (
                    <tr key={client.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg border border-gray-200 bg-white p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {client.logoUrl ? (
                              <OptimizedImage
                                src={client.logoUrl}
                                alt={client.name}
                                width={48}
                                height={48}
                                className="object-contain w-full h-full"
                              />
                            ) : (
                              <div className="text-xs text-gray-400 font-bold">LOGO</div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                              {client.name}
                              <Link
                                href={`/clients/${client.slug}`}
                                target="_blank"
                                title="View public client page"
                                className="text-gray-400 hover:text-primary transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                            <span className="text-xs text-gray-400">/{client.slug}</span>
                            {client.websiteUrl && (
                              <a
                                href={client.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-xs text-blue-600 hover:underline truncate max-w-[200px]"
                              >
                                {client.websiteUrl.replace(/^https?:\/\//, '')}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          {client.industry || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {client.productIds?.length || 0} Products
                          </span>
                          {client.purchaseNote && (
                            <span
                              className="text-xs text-gray-400 truncate max-w-[200px]"
                              title={client.purchaseNote}
                            >
                              ({client.purchaseNote})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                            client.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-xs font-mono text-gray-500">
                        {client.order}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(client)}
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                            title="Edit Client"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Client Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Client / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Grameenphone Ltd."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. grameenphone-ltd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase">
                    Client Logo *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsUrlMode(!isUrlMode)}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    {isUrlMode ? 'Switch to Image Upload' : 'Switch to Image URL'}
                  </button>
                </div>

                {isUrlMode ? (
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                ) : (
                  <div>
                    <ImageUpload
                      images={logoImages}
                      setImages={setLogoImages}
                      multiple={false}
                      maxFiles={1}
                      label="Upload Client Logo"
                    />
                    {logoImages.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Logo uploaded successfully.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Industry & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {COMMON_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                  {industry === 'Others' && (
                    <input
                      type="text"
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      placeholder="Specify custom industry"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.clientwebsite.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  About Client / Brief Overview
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the client organization..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Purchase Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Purchase Note / Engagement Summary (Optional)
                </label>
                <input
                  type="text"
                  value={purchaseNote}
                  onChange={(e) => setPurchaseNote(e.target.value)}
                  placeholder="e.g. Equipped 200+ workstations with ergonomic accessories and high-speed hubs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* PRODUCTS SELECTOR: What did they purchase? */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    Products Purchased by Client ({selectedProductIds.length})
                  </label>
                  <span className="text-xs text-gray-500">
                    Select products from your catalog
                  </span>
                </div>

                {/* Selected Products Chips */}
                {selectedProductIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                    {selectedProductIds.map((id) => {
                      const prod = selectedProductsMap.get(id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full border border-gray-200"
                        >
                          {prod?.images?.[0] && (
                            <img
                              src={prod.images[0]}
                              alt=""
                              className="w-4 h-4 object-contain rounded-full"
                            />
                          )}
                          <span className="font-medium max-w-[150px] truncate">
                            {prod?.name || id}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleProductSelection(id)}
                            className="text-gray-400 hover:text-red-600 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Search & Pick from Products */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search catalog products to attach..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* Product List */}
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-400">
                        No products match your search.
                      </div>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = selectedProductIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleProductSelection(p.id)}
                            className={`flex items-center justify-between p-2 text-xs cursor-pointer hover:bg-gray-50 transition-colors ${
                              isSelected ? 'bg-primary/5 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-7 h-7 bg-gray-100 rounded border border-gray-200 p-0.5 flex-shrink-0 flex items-center justify-center">
                                {p.images?.[0] ? (
                                  <img
                                    src={p.images[0]}
                                    alt=""
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </div>
                              <div className="truncate">
                                <p className="truncate text-gray-800">{p.name}</p>
                                <p className="text-[10px] text-gray-400">
                                  ৳{p.discountPrice || p.price} {p.sku ? `• SKU: ${p.sku}` : ''}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? 'bg-black text-white border-black'
                                  : 'border-gray-300 text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Active & Order */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active (Show on public website)
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase">
                    Display Order:
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

