'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/context/AuthContext';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ProductCard } from '@/components/ProductCard';
import {
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Building2,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface ClientDetail {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl?: string;
  industry?: string;
  description?: string;
  purchaseNote?: string;
  products: any[];
  isActive: boolean;
  createdAt: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchClient() {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/clients/slug/${slug}`);
        setClient(res.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error('Failed to fetch client details', error);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchClient();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading client profile...</p>
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <Building2 className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Client Not Found</h1>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          The client organization you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Clients
        </Link>
      </div>
    );
  }

  const purchasedProducts = client.products || [];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/clients" className="hover:text-black transition-colors">
              Our Clients
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-semibold truncate max-w-[200px]">
              {client.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Clients
          </Link>
        </div>

        {/* Client Profile Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Client Logo */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-center flex-shrink-0 shadow-xs">
              {client.logoUrl ? (
                <OptimizedImage
                  src={client.logoUrl}
                  alt={client.name}
                  width={150}
                  height={150}
                  className="max-h-28 w-auto object-contain"
                />
              ) : (
                <Building2 className="w-12 h-12 text-gray-300" />
              )}
            </div>

            {/* Client Details */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {client.industry && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    <Building2 className="w-3 h-3" />
                    {client.industry}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Corporate Partner
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {client.name}
              </h1>

              {client.description && (
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
                  {client.description}
                </p>
              )}

              {/* Purchase Note / Partnership Summary */}
              {client.purchaseNote && (
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5 max-w-2xl text-xs sm:text-sm text-blue-900">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Procurement Summary: </span>
                    {client.purchaseNote}
                  </div>
                </div>
              )}

              {/* Links */}
              {client.websiteUrl && (
                <div className="pt-2">
                  <a
                    href={client.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    Visit Official Website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PURCHASED PRODUCTS SHOWCASE SECTION */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Products Purchased by {client.name}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore the verified items, equipment, and solutions procured by this client.
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-xs self-start sm:self-auto">
              Total {purchasedProducts.length} Product{purchasedProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {purchasedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">No Specific Items Listed</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Products purchased by this client are either under custom enterprise procurement or being updated. Explore our full catalog to discover all products.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
              >
                Browse Shop Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {purchasedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

