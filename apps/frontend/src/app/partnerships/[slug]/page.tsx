'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, useAuth } from '@/context/AuthContext';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ProductCard } from '@/components/ProductCard';
import {
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Handshake,
  Package,
  DollarSign,
  Building,
  ShieldCheck,
  FileText,
  Lock,
  Layers,
  Info,
  Calendar,
  CheckCircle2,
  Receipt,
  TrendingUp,
  Tag,
  CheckCircle,
  Clock
} from 'lucide-react';

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

interface PartnerDetail {
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
  updatedAt: string;
  suppliedProducts: any[];
  procuredProducts: any[];
}

export default function PartnerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'supplied' | 'procured'>('supplied');

  // Strict Admin Role Guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchPartner() {
      if (!slug || !user || user.role !== 'ADMIN') return;
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/partnerships/slug/${slug}`);
        setPartner(res.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error('Failed to fetch partner details', error);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.role === 'ADMIN') {
      fetchPartner();
    }
  }, [slug, user]);

  // Procurement calculations
  const { totalSpent, totalUnits } = useMemo(() => {
    if (!partner?.procuredItems) return { totalSpent: 0, totalUnits: 0 };
    const spent = partner.procuredItems.reduce(
      (sum, item) => sum + (item.totalAmount || item.quantity * item.purchasePrice || 0),
      0
    );
    const units = partner.procuredItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return { totalSpent: spent, totalUnits: units };
  }, [partner]);

  // Auth Loading
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 font-sans">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Verifying administrator clearance...</p>
      </div>
    );
  }

  // Access Denied for Non-Admins
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-gray-50/50 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Admin Clearance Required
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Industrial partner agreements and procurement records are confidential and restricted to platform Administrators.
          </p>
          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-200">
            Redirecting to home in 3 seconds...
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 font-sans">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin mb-3" />
        <p className="text-gray-500 text-xs">Loading partnership profile & procurement records...</p>
      </div>
    );
  }

  if (notFound || !partner) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center font-sans">
        <Handshake className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Partner Not Found</h1>
        <p className="text-xs text-gray-500 max-w-md mb-6">
          The industrial partner record you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/partnerships"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Partnerships
        </Link>
      </div>
    );
  }

  const suppliedProducts = partner.suppliedProducts || [];
  const suppliedItems = partner.suppliedItems || [];
  const procuredProducts = partner.procuredProducts || [];
  const procuredItems = partner.procuredItems || [];
  const totalOfferedCount = suppliedItems.length > 0 ? suppliedItems.length : suppliedProducts.length;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/partnerships" className="hover:text-black transition-colors">
              Partnerships
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">{partner.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/partnerships"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Partnerships
          </Link>
        </div>

        {/* Partner Profile Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Partner Logo */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-2xl border border-gray-200 p-3 flex items-center justify-center flex-shrink-0 shadow-2xs">
              {partner.logoUrl ? (
                <OptimizedImage
                  src={partner.logoUrl}
                  alt={partner.name}
                  width={140}
                  height={100}
                  className="max-h-24 w-auto object-contain"
                />
              ) : (
                <Handshake className="w-12 h-12 text-gray-300" />
              )}
            </div>

            {/* Partner Details */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {partner.tier && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {partner.tier}
                  </span>
                )}
                {partner.industry && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    <Building className="w-3 h-3" />
                    {partner.industry}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Admin Exclusive Record
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {partner.name}
              </h1>

              {partner.description && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
                  {partner.description}
                </p>
              )}

              {/* Action and Website Links */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {partner.websiteUrl && (
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    Visit Official Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Link
                  href="/admin/partnerships"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-black underline"
                >
                  Manage in Admin Panel &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* MoU & Terms Highlights */}
          {partner.mouDetails && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-gray-900 block">
                    Partnership Agreement & MoU Terms:
                  </span>
                  <p className="text-gray-600 leading-relaxed">{partner.mouDetails}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE DUAL TABS */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('supplied')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'supplied'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Package className="w-4 h-4" />
                Catalog Products Offered ({totalOfferedCount})
              </button>
              <button
                onClick={() => setActiveTab('procured')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'procured'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Procurement History & Pricing ({procuredItems.length})
              </button>
            </div>

            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs self-start sm:self-auto font-medium">
              {activeTab === 'supplied'
                ? 'Products offered in our store catalog by this partner'
                : 'Smart24 Authority procurement history & purchase prices'}
            </span>
          </div>

          {/* TAB 1: SUPPLIED PRODUCTS (ওদের প্রোডাক্ট কি কি আছে) */}
          <div className={activeTab === 'supplied' ? 'block space-y-4' : 'hidden'}>
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    Products and equipment manufactured or supplied by <strong>{partner.name}</strong>.
                  </span>
                </div>
                <span className="text-[11px] font-semibold bg-blue-100/70 text-blue-800 px-2.5 py-0.5 rounded-full">
                  {totalOfferedCount} Products Listed
                </span>
              </div>

              {suppliedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {suppliedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Image banner or placeholder */}
                        <div className="h-44 bg-gray-50 border-b border-gray-100 relative flex items-center justify-center p-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              loading="lazy"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <Package className="w-10 h-10 text-gray-300 mx-auto mb-1.5" />
                              <span className="text-[10px] text-gray-400 font-medium">OEM Spec Product</span>
                            </div>
                          )}

                          {/* Availability badge */}
                          {item.availability && (
                            <span
                              className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                                item.availability === 'In Stock'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              {item.availability}
                            </span>
                          )}

                          {/* SKU badge */}
                          {item.sku && (
                            <span className="absolute bottom-2 left-2.5 text-[10px] font-mono px-2 py-0.5 bg-black/70 text-white rounded font-medium backdrop-blur-xs">
                              {item.sku}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2.5">
                          {item.category && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                              {item.category}
                            </span>
                          )}

                          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                            {item.productName}
                          </h3>

                          {item.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {item.warranty && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{item.warranty}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing Footer */}
                      <div className="p-4 pt-3 border-t border-gray-100 bg-gray-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-bold block">
                              Catalog Price
                            </span>
                            <span className="text-sm font-bold text-gray-900 font-mono">
                              {item.price ? `৳${item.price.toLocaleString()}` : 'Custom Quote'}
                            </span>
                          </div>

                          {item.supplyPrice !== undefined && item.supplyPrice !== null && (
                            <div className="text-right">
                              <span className="text-[10px] text-blue-600 uppercase font-bold block">
                                Partner Supply Rate
                              </span>
                              <span className="text-sm font-extrabold text-blue-700 font-mono">
                                ৳{item.supplyPrice.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {item.productId && (
                          <Link
                            href={`/products/${item.productId}`}
                            className="block w-full py-1.5 px-3 text-center bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-semibold rounded-lg transition-colors"
                          >
                            View Store Catalog Item &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : suppliedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                  {suppliedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-xs space-y-3">
                  <Package className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-base font-bold text-gray-800">No Catalog Products Listed</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    No active products or catalog equipment have been registered for this partner yet. You can add them from the Admin Partnerships portal.
                  </p>
                  <Link
                    href="/admin/partnerships"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-xs"
                  >
                    Add Products in Admin &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* TAB 2: PROCURED PRODUCTS & AUDIT TABLE (Smart24 Authority এখন পর্যন্ত যা যা কিনেছে ও মূল্য) */}
          <div className={activeTab === 'procured' ? 'block space-y-6' : 'hidden'}>
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* High-level KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-gray-400 block tracking-wider">
                      Total Procured Value (মোট ক্রয়মূল্য)
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 font-mono">
                      ৳{totalSpent.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-gray-400 block tracking-wider">
                      Total Units Procured (মোট পণ্য সংখ্যা)
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 font-mono">
                      {totalUnits.toLocaleString()} Units
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-gray-400 block tracking-wider">
                      Procurement Records (চালান ও ব্যাচ সংখ্যা)
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 font-mono">
                      {procuredItems.length} Batches
                    </span>
                  </div>
                </div>
              </div>

              {/* Procurement Summary Note Card */}
              {partner.procurementNote && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
                  <TrendingUp className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-emerald-950 text-sm">
                      Smart24 Procurement Lifecycle Summary
                    </h4>
                    <p className="text-emerald-800 leading-relaxed font-medium">
                      {partner.procurementNote}
                    </p>
                  </div>
                </div>
              )}

              {/* DETAILED PROCUREMENT AUDIT TABLE */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden space-y-3">
                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      Detailed Procurement & Purchase Pricing Audit (ক্রয় বিবরণী ও মূল্য)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Itemized breakdown of products and equipment purchased by Smart24 authority from this partner.
                    </p>
                  </div>
                  <Link
                    href="/admin/partnerships"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    Manage in Admin &rarr;
                  </Link>
                </div>

                {procuredItems.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <Receipt className="w-10 h-10 text-gray-300 mx-auto" />
                    <h4 className="text-sm font-bold text-gray-700">No Itemized Records Logged</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Specific procurement items or invoice records have not been added yet. Add them from the Admin Partnerships portal.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="py-3 px-4">Item / Equipment Name</th>
                          <th className="py-3 px-4">Date (কেনার তারিখ)</th>
                          <th className="py-3 px-4">Invoice / PO #</th>
                          <th className="py-3 px-4 text-center">Qty (পরিমাণ)</th>
                          <th className="py-3 px-4 text-right">Unit Price (কেনার সময় দাম)</th>
                          <th className="py-3 px-4 text-right">Total Cost (মোট মূল্য)</th>
                          <th className="py-3 px-4">Batch / Rollout Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {procuredItems.map((item, idx) => {
                          const lineTotal = item.totalAmount || item.quantity * item.purchasePrice;

                          return (
                            <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                              {/* Product Name */}
                              <td className="py-3 px-4 font-semibold text-gray-900">
                                <div>
                                  {item.productName}
                                  {item.productId && (
                                    <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                                      ID: {item.productId.slice(-6)}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Purchase Date */}
                              <td className="py-3 px-4 text-gray-500 whitespace-nowrap font-mono text-xs">
                                {item.purchaseDate || '—'}
                              </td>

                              {/* Invoice / PO */}
                              <td className="py-3 px-4">
                                {item.invoiceNo ? (
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-mono text-xs font-semibold border border-gray-200">
                                    {item.invoiceNo}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic text-xs">—</span>
                                )}
                              </td>

                              {/* Qty */}
                              <td className="py-3 px-4 text-center font-bold text-gray-900 font-mono">
                                {item.quantity}
                              </td>

                              {/* Unit Purchase Price */}
                              <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                                ৳{item.purchasePrice.toLocaleString()}
                              </td>

                              {/* Total Cost */}
                              <td className="py-3 px-4 text-right font-mono font-extrabold text-gray-900">
                                ৳{lineTotal.toLocaleString()}
                              </td>

                              {/* Notes */}
                              <td className="py-3 px-4 text-gray-500 text-xs max-w-xs">
                                {item.notes || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* Footer Sum Row */}
                      <tfoot className="bg-gray-50/80 border-t-2 border-gray-200 font-bold text-xs">
                        <tr>
                          <td colSpan={3} className="py-3 px-4 text-gray-900 uppercase tracking-wider text-[11px]">
                            Grand Total (মোট ক্রয়)
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-sm text-gray-900">
                            {totalUnits.toLocaleString()} Units
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500 text-[11px]">
                            Total Value:
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm font-extrabold text-emerald-700">
                            ৳{totalSpent.toLocaleString()}
                          </td>
                          <td className="py-3 px-4"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Linked Product Cards Grid (If any catalog products were procured) */}
              {procuredProducts.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    Catalog Mapped Product Cards ({procuredProducts.length} items)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                    {procuredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
