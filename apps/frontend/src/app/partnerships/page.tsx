'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { apiClient, useAuth } from '@/context/AuthContext';
import {
  Search,
  Handshake,
  Building,
  Package,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Lock
} from 'lucide-react';

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
  procuredProductIds: string[];
  procurementNote?: string;
  isActive: boolean;
  order: number;
}

export default function PartnershipsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');

  // Role Protection: Only ADMIN role can access
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      // Non-admins cannot view this page
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadPartners() {
      if (!user || user.role !== 'ADMIN') return;
      setIsLoading(true);
      try {
        const res = await apiClient.get('/partnerships?activeOnly=true&limit=100');
        setPartners(res.data.data || res.data || []);
      } catch (error) {
        console.error('Failed to load partnerships', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.role === 'ADMIN') {
      loadPartners();
    }
  }, [user]);

  // Unique tiers
  const tiers = useMemo(() => {
    const list = new Set<string>();
    partners.forEach((p) => {
      if (p.tier && p.tier.trim()) {
        list.add(p.tier.trim());
      }
    });
    return ['All', ...Array.from(list)];
  }, [partners]);

  // Filter partners
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchesTier =
        selectedTier === 'All' || p.tier === selectedTier;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.industry && p.industry.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.mouDetails && p.mouDetails.toLowerCase().includes(q));
      return matchesTier && matchesSearch;
    });
  }, [partners, selectedTier, searchQuery]);

  // If Auth is loading
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Verifying administrator clearance...</p>
      </div>
    );
  }

  // Access Denied Screen for non-admins
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-gray-50/50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Restricted Access
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            The Industrial Partnerships directory contains confidential supplier contracts, catalog agreements, and procurement history. This section is strictly reserved for verified Administrators.
          </p>
          <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-200">
            Redirecting to home page in 3 seconds...
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

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white py-8 sm:py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Our Partnerships</span>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm">
              <Handshake className="w-3.5 h-3.5" />
              Industrial Partnerships Hub
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Confidential View
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">
            Strategic Industrial Partnerships
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-normal max-w-2xl mx-auto">
            Explore trusted manufacturing collaborators, technology suppliers, and corporate distributors. Inspect catalog offerings provided by partners along with procurement history records.
          </p>

          {/* Search Bar in Hero */}
          <div className="mt-5 max-w-xl mx-auto relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search partners by name, industry, or agreement terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 text-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-6">
        {/* Tier Filter Pills */}
        {tiers.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
            {tiers.map((t) => {
              const isSelected = selectedTier === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTier(t)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}

        {/* Partners Grid */}
        <div className="mt-5">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-xs">Loading partnership portfolios...</p>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 max-w-md mx-auto shadow-xs my-6">
              <Handshake className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-800">No Partners Found</h3>
              <p className="text-xs text-gray-500 mt-1 leading-normal">
                {searchQuery
                  ? `No partners found matching "${searchQuery}". Try a different keyword.`
                  : 'No active partnerships registered in database.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPartners.map((partner) => {
                const suppliedCount = partner.suppliedProductIds?.length || 0;
                const procuredCount = partner.procuredProductIds?.length || 0;

                return (
                  <Link
                    key={partner.id}
                    href={`/partnerships/${partner.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col overflow-hidden hover:-translate-y-0.5"
                  >
                    {/* Top Logo Container */}
                    <div className="h-36 bg-gradient-to-b from-gray-50/80 to-white flex items-center justify-center p-4 border-b border-gray-50 relative group-hover:from-primary/5 transition-colors">
                      {partner.logoUrl ? (
                        <div className="relative w-32 h-20 flex items-center justify-center">
                          <OptimizedImage
                            src={partner.logoUrl}
                            alt={partner.name}
                            width={130}
                            height={80}
                            className="object-contain max-h-18 w-auto filter transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-400">
                          LOGO
                        </div>
                      )}

                      {/* Tier badge in top right */}
                      {partner.tier && (
                        <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold bg-white/95 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                          {partner.tier}
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {partner.industry && (
                          <span className="text-[11px] font-medium text-gray-400 block mb-1">
                            {partner.industry}
                          </span>
                        )}
                        <h3 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors flex items-center justify-between">
                          <span className="truncate">{partner.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </h3>

                        {partner.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-normal">
                            {partner.description}
                          </p>
                        )}
                      </div>

                      {/* Stats & Highlights Row */}
                      <div className="pt-2.5 border-t border-gray-100 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-gray-50 p-2 rounded-xl flex items-center gap-1.5 text-gray-700">
                            <Package className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="truncate font-semibold">
                              {suppliedCount} Offered
                            </span>
                          </div>
                          <div className="bg-emerald-50/70 border border-emerald-100 p-2 rounded-xl flex items-center gap-1.5 text-emerald-800">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate font-semibold">
                              {procuredCount} Procured
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-[11px] text-gray-400">
                            Partnership Agreement
                          </span>
                          <span className="text-[11px] font-semibold text-primary group-hover:underline">
                            View Details &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Quick Action Banner */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Partnership Administration</h3>
              <p className="text-xs text-gray-500">
                Need to link new catalog products, log procurement quantities, or adjust MoU terms?
              </p>
            </div>
          </div>
          <Link
            href="/admin/partnerships"
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs whitespace-nowrap"
          >
            Open Admin Partnership CRUD &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

