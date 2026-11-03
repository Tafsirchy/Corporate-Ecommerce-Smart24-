'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { apiClient } from '@/context/AuthContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  Check,
  X,
  Package,
  Building,
  Handshake,
  DollarSign,
  AlertCircle,
  Receipt,
  PlusCircle,
} from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  price: number;
}

interface SuppliedItem {
  productId?: string;
  productName: string;
  sku?: string;
  category?: string;
  price?: number;
  supplyPrice?: number;
  availability?: string;
  warranty?: string;
  imageUrl?: string;
  description?: string;
}

interface ProcurementItem {
  productId?: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  totalAmount?: number;
  purchaseDate?: string;
  invoiceNo?: string;
  notes?: string;
}

interface PartnerItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl?: string;
  industry?: string;
  tier?: string;
  description?: string;
  mouDetails?: string;
  suppliedProductIds: string[];
  suppliedItems?: SuppliedItem[];
  procuredProductIds: string[];
  procurementNote?: string;
  procuredItems?: ProcurementItem[];
  isActive: boolean;
  order: number;
  createdAt: string;
}

// High performance memoized partner supplied product row
const SuppliedItemRow = memo(function SuppliedItemRow({
  item,
  index,
  onUpdate,
  onRemove,
}: {
  item: SuppliedItem;
  index: number;
  onUpdate: (index: number, field: keyof SuppliedItem, value: any) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            Product #{index + 1}
          </span>
          {item.sku && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded font-semibold">
              SKU: {item.sku}
            </span>
          )}
          {item.availability && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                item.availability === 'In Stock'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {item.availability}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
          title="Delete Product"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Product Name */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Product Name (পণ্যের নাম) *
          </label>
          <input
            type="text"
            required
            list="partner-catalog-products"
            placeholder="Type or pick from store catalog..."
            value={item.productName}
            onChange={(e) => onUpdate(index, 'productName', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-medium"
          />
        </div>

        {/* SKU / Model */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            SKU / Model #
          </label>
          <input
            type="text"
            placeholder="e.g. WLT-CID-75X"
            value={item.sku || ''}
            onChange={(e) => onUpdate(index, 'sku', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-mono"
          />
        </div>

        {/* Category */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Category / Type
          </label>
          <input
            type="text"
            placeholder="e.g. Commercial Displays"
            value={item.category || ''}
            onChange={(e) => onUpdate(index, 'category', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          />
        </div>

        {/* Retail / Catalog Price */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Catalog Price (৳)
          </label>
          <input
            type="number"
            min="0"
            placeholder="৳ Retail Price"
            value={item.price !== undefined && item.price !== null ? item.price : ''}
            onChange={(e) =>
              onUpdate(index, 'price', e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-mono font-bold"
          />
        </div>

        {/* Partner Supply Price */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Partner Supply Price (৳)
          </label>
          <input
            type="number"
            min="0"
            placeholder="৳ Supply Rate"
            value={
              item.supplyPrice !== undefined && item.supplyPrice !== null
                ? item.supplyPrice
                : ''
            }
            onChange={(e) =>
              onUpdate(
                index,
                'supplyPrice',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-mono font-bold text-blue-700"
          />
        </div>

        {/* Availability */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Availability Status
          </label>
          <select
            value={item.availability || 'In Stock'}
            onChange={(e) => onUpdate(index, 'availability', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          >
            <option value="In Stock">In Stock</option>
            <option value="Made to Order">Made to Order</option>
            <option value="Lead Time 7-14 Days">Lead Time 7-14 Days</option>
            <option value="Pre-order">Pre-order</option>
            <option value="Discontinued">Discontinued</option>
          </select>
        </div>

        {/* Warranty */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Warranty Terms
          </label>
          <input
            type="text"
            placeholder="e.g. 3 Years Official"
            value={item.warranty || ''}
            onChange={(e) => onUpdate(index, 'warranty', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          />
        </div>

        {/* Image URL */}
        <div className="sm:col-span-6">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Product Image URL
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={item.imageUrl || ''}
            onChange={(e) => onUpdate(index, 'imageUrl', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-mono"
          />
        </div>

        {/* Description / Highlights */}
        <div className="sm:col-span-6">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Key Specifications / Highlights
          </label>
          <input
            type="text"
            placeholder="e.g. 4K UHD interactive display, OEM warranty"
            value={item.description || ''}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          />
        </div>
      </div>
    </div>
  );
});

// High performance memoized procurement row
const ProcurementRow = memo(function ProcurementRow({
  item,
  index,
  onUpdate,
  onRemove,
}: {
  item: ProcurementItem;
  index: number;
  onUpdate: (index: number, field: keyof ProcurementItem, value: any) => void;
  onRemove: (index: number) => void;
}) {
  const lineTotal = (Number(item.quantity) || 1) * (Number(item.purchasePrice) || 0);

  return (
    <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
          <Receipt className="w-3.5 h-3.5 text-primary" />
          Item #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
          title="Delete Item"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Product / Item Name with Datalist Autocomplete */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Product / Equipment Name *
          </label>
          <input
            type="text"
            required
            list="partner-catalog-products"
            placeholder="Type or pick from catalog..."
            value={item.productName}
            onChange={(e) => onUpdate(index, 'productName', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-medium"
          />
        </div>

        {/* Quantity */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Qty *
          </label>
          <input
            type="number"
            required
            min="1"
            value={item.quantity || ''}
            onChange={(e) => onUpdate(index, 'quantity', Number(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-mono font-bold"
          />
        </div>

        {/* Purchase Price at time of purchase */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Unit Price (কেনার দাম) *
          </label>
          <input
            type="number"
            required
            min="0"
            value={item.purchasePrice !== undefined ? item.purchasePrice : ''}
            onChange={(e) => onUpdate(index, 'purchasePrice', Number(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-mono font-bold text-emerald-700"
          />
        </div>

        {/* Line Total */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Line Total
          </label>
          <div className="px-2.5 py-1.5 text-xs bg-emerald-50 border border-emerald-200 rounded-lg font-mono font-bold text-emerald-900 flex items-center justify-between">
            <span>৳</span>
            <span>{lineTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Purchase Date */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Date (কেনার তারিখ)
          </label>
          <input
            type="date"
            value={item.purchaseDate || ''}
            onChange={(e) => onUpdate(index, 'purchaseDate', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          />
        </div>

        {/* Invoice / PO # */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Invoice / PO #
          </label>
          <input
            type="text"
            placeholder="e.g. PO-2024-089"
            value={item.invoiceNo || ''}
            onChange={(e) => onUpdate(index, 'invoiceNo', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-mono"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
            Batch / Contract Note
          </label>
          <input
            type="text"
            placeholder="e.g. Rollout batch 1"
            value={item.notes || ''}
            onChange={(e) => onUpdate(index, 'notes', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          />
        </div>
      </div>
    </div>
  );
});

export default function AdminPartnershipsPage() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [hasLoadedProducts, setHasLoadedProducts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formTier, setFormTier] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMouDetails, setFormMouDetails] = useState('');
  const [formSuppliedProductIds, setFormSuppliedProductIds] = useState<string[]>([]);
  const [formSuppliedItems, setFormSuppliedItems] = useState<SuppliedItem[]>([]);
  const [formProcuredItems, setFormProcuredItems] = useState<ProcurementItem[]>([]);
  const [formProcurementNote, setFormProcurementNote] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formOrder, setFormOrder] = useState(0);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);

  // Delete Confirm Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback Notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/partnerships?limit=100');
      setPartners(res.data.data || res.data || []);
    } catch (err: any) {
      console.error('Failed to load partners', err);
      showToast('Failed to load partnerships', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Lazy load products only when modal opens
  const loadProductsIfNeeded = async () => {
    if (hasLoadedProducts) return;
    try {
      const res = await apiClient.get('/products?limit=100');
      const list = res.data.data || res.data.products || res.data || [];
      setProducts(list.map((p: any) => ({ id: p.id, name: p.name, price: p.price })));
      setHasLoadedProducts(true);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleOpenAddModal = () => {
    loadProductsIfNeeded();
    setEditingPartner(null);
    setFormName('');
    setFormSlug('');
    setFormLogoUrl('');
    setFormWebsiteUrl('');
    setFormIndustry('');
    setFormTier('');
    setFormDescription('');
    setFormMouDetails('');
    setFormSuppliedProductIds([]);
    setFormSuppliedItems([]);
    setFormProcuredItems([]);
    setFormProcurementNote('');
    setFormIsActive(true);
    setFormOrder(partners.length);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (partner: PartnerItem) => {
    loadProductsIfNeeded();
    setEditingPartner(partner);
    setFormName(partner.name);
    setFormSlug(partner.slug);
    setFormLogoUrl(partner.logoUrl);
    setFormWebsiteUrl(partner.websiteUrl || '');
    setFormIndustry(partner.industry || '');
    setFormTier(partner.tier || '');
    setFormDescription(partner.description || '');
    setFormMouDetails(partner.mouDetails || '');
    setFormSuppliedProductIds(partner.suppliedProductIds || []);
    setFormSuppliedItems(partner.suppliedItems || []);
    setFormProcuredItems(partner.procuredItems || []);
    setFormProcurementNote(partner.procurementNote || '');
    setFormIsActive(partner.isActive);
    setFormOrder(partner.order || 0);
    setIsModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url || res.data.secure_url || res.data;
      setFormLogoUrl(url);
      showToast('Logo uploaded successfully');
    } catch (err: any) {
      console.error('Image upload failed', err);
      showToast('Upload failed. You can paste an image URL instead.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // === SUPPLIED PRODUCTS CRUD HANDLERS ===
  // Add empty offered product row
  const handleAddSuppliedItem = useCallback(() => {
    setFormSuppliedItems((prev) => [
      ...prev,
      {
        productId: '',
        productName: '',
        sku: '',
        category: '',
        price: undefined,
        supplyPrice: undefined,
        availability: 'In Stock',
        warranty: '1 Year Official Warranty',
        imageUrl: '',
        description: '',
      },
    ]);
  }, []);

  // Quick add from store catalog
  const handleAddFromCatalog = useCallback((productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setFormSuppliedItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        sku: '',
        category: '',
        price: prod.price,
        supplyPrice: prod.price ? Math.round(prod.price * 0.85) : undefined,
        availability: 'In Stock',
        warranty: 'Official Brand Warranty',
        imageUrl: '',
        description: '',
      },
    ]);
  }, [products]);

  // Update specific field in supplied items
  const handleUpdateSuppliedItem = useCallback(
    (index: number, field: keyof SuppliedItem, value: any) => {
      setFormSuppliedItems((prev) => {
        const updated = [...prev];
        const item = { ...updated[index], [field]: value };

        // Auto-match price and ID if typed productName matches a catalog item
        if (field === 'productName') {
          const match = products.find(
            (p) => p.name.toLowerCase() === String(value).toLowerCase().trim()
          );
          if (match) {
            item.productId = match.id;
            if (!item.price || item.price === 0) {
              item.price = match.price || 0;
            }
          }
        }

        updated[index] = item;
        return updated;
      });
    },
    [products]
  );

  // Remove offered product row
  const handleRemoveSuppliedItem = useCallback((index: number) => {
    setFormSuppliedItems((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  // === PROCURED ITEMS CRUD HANDLERS ===
  // Add empty row
  const handleAddProcuredItem = useCallback(() => {
    setFormProcuredItems((prev) => [
      ...prev,
      {
        productId: '',
        productName: '',
        quantity: 1,
        purchasePrice: 0,
        totalAmount: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        invoiceNo: '',
        notes: '',
      },
    ]);
  }, []);

  // Update specific field
  const handleUpdateProcuredItem = useCallback(
    (index: number, field: keyof ProcurementItem, value: any) => {
      setFormProcuredItems((prev) => {
        const updated = [...prev];
        const item = { ...updated[index], [field]: value };

        // Auto-match price if typed productName matches a catalog item
        if (field === 'productName') {
          const match = products.find(
            (p) => p.name.toLowerCase() === String(value).toLowerCase().trim()
          );
          if (match) {
            item.productId = match.id;
            if (!item.purchasePrice || item.purchasePrice === 0) {
              item.purchasePrice = match.price || 0;
            }
          }
        }

        const qty = Number(item.quantity) || 1;
        const price = Number(item.purchasePrice) || 0;
        item.totalAmount = qty * price;

        updated[index] = item;
        return updated;
      });
    },
    [products]
  );

  // Remove row
  const handleRemoveProcuredItem = useCallback((index: number) => {
    setFormProcuredItems((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  // Compute total procurement stats
  const { totalProcurementCost, totalProcuredUnits } = useMemo(() => {
    let cost = 0;
    let units = 0;
    for (const item of formProcuredItems) {
      const lineTotal = item.totalAmount || (item.quantity * item.purchasePrice);
      cost += Number(lineTotal) || 0;
      units += Number(item.quantity) || 0;
    }
    return { totalProcurementCost: cost, totalProcuredUnits: units };
  }, [formProcuredItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLogoUrl.trim()) {
      showToast('Partner Name and Logo URL are required', 'error');
      return;
    }

    for (const [idx, item] of formSuppliedItems.entries()) {
      if (!item.productName.trim()) {
        showToast(`Offered Product #${idx + 1} requires a Product Name`, 'error');
        return;
      }
    }

    for (const [idx, item] of formProcuredItems.entries()) {
      if (!item.productName.trim()) {
        showToast(`Procured Item #${idx + 1} requires a Product/Equipment Name`, 'error');
        return;
      }
    }

    setIsSubmitting(true);
    const procuredProductIds = formProcuredItems
      .map((item) => item.productId)
      .filter((id): id is string => Boolean(id && id.length === 24));

    // Combine any catalog product IDs from supplied items
    const suppliedProductIdsFromItems = formSuppliedItems
      .map((item) => item.productId)
      .filter((id): id is string => Boolean(id && id.length === 24));
    const combinedSuppliedProductIds = Array.from(
      new Set([...formSuppliedProductIds, ...suppliedProductIdsFromItems])
    );

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim() || undefined,
      logoUrl: formLogoUrl.trim(),
      websiteUrl: formWebsiteUrl.trim() || null,
      industry: formIndustry.trim() || null,
      tier: formTier.trim() || null,
      description: formDescription.trim() || null,
      mouDetails: formMouDetails.trim() || null,
      suppliedProductIds: combinedSuppliedProductIds,
      suppliedItems: formSuppliedItems,
      procuredProductIds,
      procuredItems: formProcuredItems,
      procurementNote: formProcurementNote.trim() || null,
      isActive: formIsActive,
      order: Number(formOrder) || 0,
    };

    try {
      if (editingPartner) {
        await apiClient.patch(`/partnerships/${editingPartner.id}`, payload);
        showToast('Partner updated successfully');
      } else {
        await apiClient.post('/partnerships', payload);
        showToast('Partner created successfully');
      }
      setIsModalOpen(false);
      loadPartners();
    } catch (err: any) {
      console.error('Failed to save partner', err);
      showToast(err.response?.data?.message || 'Failed to save partner', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (partner: PartnerItem) => {
    try {
      await apiClient.patch(`/partnerships/${partner.id}`, {
        isActive: !partner.isActive,
      });
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, isActive: !p.isActive } : p))
      );
      showToast(`Partner ${!partner.isActive ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/partnerships/${deleteId}`);
      showToast('Partner deleted successfully');
      setDeleteId(null);
      loadPartners();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete partner', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.industry && p.industry.toLowerCase().includes(search.toLowerCase())) ||
        (p.tier && p.tier.toLowerCase().includes(search.toLowerCase()));

      const matchTier = selectedTier === 'ALL' || p.tier === selectedTier;

      return matchSearch && matchTier;
    });
  }, [partners, search, selectedTier]);

  const tiers = useMemo(() => {
    const set = new Set<string>();
    partners.forEach((p) => {
      if (p.tier) set.add(p.tier);
    });
    return ['ALL', ...Array.from(set)];
  }, [partners]);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          )}
          {toastMessage.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Our Industrial Partnerships</h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-primary-50 text-primary-700 border border-primary-200">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage partner profiles, catalog products supplied by partners, and procurement purchase price records.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Partner
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search partners by name, industry, or tier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        {tiers.length > 2 && (
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
          >
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Partnership Tiers' : t}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-7 h-7 border-3 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Loading industrial partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="p-10 text-center">
            <Handshake className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-800">No Partnerships Found</h3>
            <p className="text-xs text-gray-500 mt-0.5 max-w-sm mx-auto">
              {search ? `No partners matched "${search}".` : 'Click "Add New Partner" above to register a partner.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Partner</th>
                  <th className="py-3 px-4">Tier & Industry</th>
                  <th className="py-3 px-4">Offered in Catalog</th>
                  <th className="py-3 px-4">Procured by Smart24 (ক্রয় বিবরণী)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredPartners.map((partner) => {
                  const suppliedCount = partner.suppliedItems?.length || partner.suppliedProductIds?.length || 0;
                  const procuredCount = partner.procuredItems?.length || partner.procuredProductIds?.length || 0;
                  const totalSpent = (partner.procuredItems || []).reduce(
                    (sum, item) => sum + (item.totalAmount || item.quantity * item.purchasePrice || 0),
                    0
                  );

                  return (
                    <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Logo and Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-8 rounded-lg bg-gray-50 border border-gray-200 p-0.5 flex items-center justify-center flex-shrink-0">
                            {partner.logoUrl ? (
                              <img
                                src={partner.logoUrl}
                                alt={partner.name}
                                loading="lazy"
                                className="max-h-6 max-w-8 object-contain"
                              />
                            ) : (
                              <Building className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1">
                              {partner.name}
                              {partner.websiteUrl && (
                                <a
                                  href={partner.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-black"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">
                              /partnerships/{partner.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tier & Industry */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {partner.tier ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                              {partner.tier}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">—</span>
                          )}
                          <div className="text-[11px] text-gray-500 font-medium">
                            {partner.industry || 'General Industry'}
                          </div>
                        </div>
                      </td>

                      {/* Supplied Products */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
                          <Package className="w-3.5 h-3.5 text-primary" />
                          {suppliedCount} Products
                        </span>
                      </td>

                      {/* Procured Items */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            {procuredCount} Lines Procured
                          </span>
                          {totalSpent > 0 && (
                            <div className="text-[11px] font-bold text-gray-800 font-mono">
                              ৳{totalSpent.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(partner)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                            partner.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              partner.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {partner.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/partnerships/${partner.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview public page (Admin only)"
                            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleOpenEditModal(partner)}
                            title="Edit partner & procurement records"
                            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(partner.id)}
                            title="Delete partner"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* COMPREHENSIVE ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Shared Datalist for fast autocomplete */}
          <datalist id="partner-catalog-products">
            {products.map((p) => (
              <option key={p.id} value={p.name}>
                ৳{p.price?.toLocaleString()}
              </option>
            ))}
          </datalist>

          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden my-4 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingPartner ? 'Edit Industrial Partner & Procurement' : 'Add New Industrial Partner & Procurement'}
                </h2>
                <p className="text-[11px] text-gray-500">
                  Configure partner profile, catalog offerings, and procurement purchase prices.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* SECTION A: PARTNER PROFILE */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  1. Partner Basic Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                      Partner Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Walton Hi-Tech Industries PLC"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                      Slug
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. walton-hi-tech"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                      Industry / Sector
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Electronics & Hardware Manufacturing"
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                      Partnership Tier
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Strategic OEM Partner"
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Logo URL and Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                    Logo URL *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/logo.png"
                      value={formLogoUrl}
                      onChange={(e) => setFormLogoUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                    <label className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploading ? '...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formLogoUrl && (
                    <div className="mt-1.5 flex items-center gap-2 p-1.5 bg-gray-50 rounded-lg border border-gray-200 w-fit">
                      <img
                        src={formLogoUrl}
                        alt="Preview"
                        loading="lazy"
                        className="max-h-6 max-w-12 object-contain"
                      />
                      <span className="text-[10px] text-gray-400 font-mono truncate max-w-xs">
                        {formLogoUrl}
                      </span>
                    </div>
                  )}
                </div>

                {/* Website URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.partner-website.com"
                    value={formWebsiteUrl}
                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                    Partner Overview & Capabilities
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Overview of partner, production facilities..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>

                {/* MoU Terms */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                    MoU & Agreement Terms Highlights
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key strategic clauses, warranty SLAs..."
                    value={formMouDetails}
                    onChange={(e) => setFormMouDetails(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* SECTION B: CATALOG PRODUCTS OFFERED (CRUD) */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      2. Catalog Products Offered by Partner (ওদের প্রোডাক্ট কি কি আছে)
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Add, edit, and manage products and equipment supplied by this partner with SKU, retail, and supply price.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Quick Add from Store Catalog */}
                    {products.length > 0 && (
                      <select
                        className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-gray-700 max-w-[200px] truncate"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddFromCatalog(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="" disabled>
                          + Quick Add from Catalog...
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (৳{p.price?.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={handleAddSuppliedItem}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add Partner Product
                    </button>
                  </div>
                </div>

                {formSuppliedItems.length > 0 && (
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-900 font-medium">
                        <strong>{formSuppliedItems.length}</strong> Products Offered
                      </span>
                      <span className="text-blue-300">|</span>
                      <span className="text-blue-700">
                        {formSuppliedItems.filter((i) => i.availability === 'In Stock').length} In Stock
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-600 font-medium">
                      Full CRUD Managed
                    </span>
                  </div>
                )}

                {/* Offered items list */}
                {formSuppliedItems.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-5 text-center">
                    <p className="text-xs text-gray-500">
                      No partner products added yet. Click &quot;+ Add Partner Product&quot; or pick from catalog above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formSuppliedItems.map((item, index) => (
                      <SuppliedItemRow
                        key={index}
                        item={item}
                        index={index}
                        onUpdate={handleUpdateSuppliedItem}
                        onRemove={handleRemoveSuppliedItem}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION C: PROCURED ITEMS & PURCHASE PRICE */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      3. Procured Items & Purchase Price (Smart24 Authority এখন পর্যন্ত যা যা কিনেছে ও মূল্য)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProcuredItem}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Purchased Item
                  </button>
                </div>

                {formProcuredItems.length > 0 && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 font-medium">
                        <strong>{formProcuredItems.length}</strong> Records
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600 font-medium">
                        <strong>{totalProcuredUnits}</strong> Units
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 mr-1.5">Total Value:</span>
                      <span className="font-extrabold text-emerald-700 font-mono text-sm">
                        ৳{totalProcurementCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Procured items list */}
                {formProcuredItems.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-xl p-5 text-center">
                    <p className="text-xs text-gray-500">
                      No procurement items logged yet. Click "+ Add Purchased Item" above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formProcuredItems.map((item, index) => (
                      <ProcurementRow
                        key={index}
                        item={item}
                        index={index}
                        onUpdate={handleUpdateProcuredItem}
                        onRemove={handleRemoveProcuredItem}
                      />
                    ))}
                  </div>
                )}

                {/* Overall Procurement Summary Text */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                    Procurement Lifecycle Summary Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Executive summary of overall procurement volume..."
                    value={formProcurementNote}
                    onChange={(e) => setFormProcurementNote(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-gray-800 cursor-pointer">
                    Active Partner (Visible in Admin Partnerships directory)
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 sticky bottom-0 bg-white py-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-gray-600 hover:text-black font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingPartner ? 'Save Changes' : 'Create Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-gray-100 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Delete Partner?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete this partner record? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
