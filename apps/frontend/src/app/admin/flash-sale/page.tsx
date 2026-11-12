'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Save, Search, Zap } from 'lucide-react';
import {
  DEFAULT_FLASH_SALE_CONFIG,
  FlashSaleConfig,
  parseSettingJson,
} from '@/lib/home-settings';

function toLocalDatetimeInput(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export default function AdminFlashSalePage() {
  const [config, setConfig] = useState<FlashSaleConfig>(DEFAULT_FLASH_SALE_CONFIG);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [settingRes, prodRes] = await Promise.all([
        apiClient.get('/settings/home_flash_sale').catch(() => ({ data: null })),
        apiClient.get('/products?limit=100'),
      ]);
      setConfig(parseSettingJson(settingRes.data?.value, DEFAULT_FLASH_SALE_CONFIG));
      setProducts(prodRes.data?.data || []);
    } catch {
      toast.error('Failed to load Flash Sale data');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.post('/settings/home_flash_sale', {
        value: JSON.stringify(config),
      });
      toast.success('Flash Sale settings saved');
    } catch {
      toast.error('Failed to save Flash Sale settings');
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleProductFlashSale(product: any) {
    const nextVal = !product.isFlashSale;
    try {
      await apiClient.patch(`/products/${product.id}`, { isFlashSale: nextVal });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isFlashSale: nextVal } : p))
      );
      toast.success(
        `${product.name} ${nextVal ? 'added to' : 'removed from'} Flash Sale`
      );
    } catch {
      toast.error('Failed to update product');
    }
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Flash Sale settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Flash Sale Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure the Flash Sale section title, live countdown end time, visibility, and featured products.
        </p>
      </div>

      {/* Campaign Settings */}
      <form
        onSubmit={handleSaveConfig}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-900">Campaign Settings</h2>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={config.isActive}
              onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
            />
            Active on Home Page
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Flash Sale"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Countdown Ends At (Local Time)
            </label>
            <input
              type="datetime-local"
              value={toLocalDatetimeInput(config.endsAt)}
              onChange={(e) =>
                setConfig({
                  ...config,
                  endsAt: e.target.value ? new Date(e.target.value).toISOString() : '',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Campaign'}
          </button>
        </div>
      </form>

      {/* Flash Sale Products */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">
            Flash Sale Products ({products.filter((p) => p.isFlashSale).length} selected)
          </h2>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px] overflow-y-auto border border-gray-100 rounded-lg">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                <th className="p-3">Product</th>
                <th className="p-3">Price</th>
                <th className="p-3 text-right">Flash Sale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{product.name}</td>
                  <td className="p-3 text-gray-600">
                    ৳{product.discountPrice || product.price}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleProductFlashSale(product)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        product.isFlashSale
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Zap size={12} />
                      {product.isFlashSale ? 'In Flash Sale' : 'Add to Flash Sale'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

