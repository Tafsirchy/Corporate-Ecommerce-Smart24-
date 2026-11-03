'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { apiClient } from '@/context/AuthContext';
import { Search, ShoppingBag, ChevronRight, Building2, ArrowRight } from 'lucide-react';

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
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');

  useEffect(() => {
    async function loadClients() {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/clients?activeOnly=true&limit=100');
        setClients(res.data.data || res.data || []);
      } catch (error) {
        console.error('Failed to load clients', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadClients();
  }, []);

  // Unique industries
  const industries = useMemo(() => {
    const list = new Set<string>();
    clients.forEach((c) => {
      if (c.industry && c.industry.trim()) {
        list.add(c.industry.trim());
      }
    });
    return ['All', ...Array.from(list)];
  }, [clients]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesIndustry =
        selectedIndustry === 'All' || c.industry === selectedIndustry;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.purchaseNote && c.purchaseNote.toLowerCase().includes(q));
      return matchesIndustry && matchesSearch;
    });
  }, [clients, selectedIndustry, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white py-8 sm:py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Our Clients</span>
          </nav>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/20 mb-2.5 backdrop-blur-sm">
            <Building2 className="w-3.5 h-3.5" />
            Corporate Client Showcase
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight">
            Our Valued Clients
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-normal max-w-2xl mx-auto">
            Proud to partner with leading corporations, institutions, and innovative organizations across Bangladesh. Explore who trusts us and discover the products and solutions they choose.
          </p>

          {/* Search Bar in Hero */}
          <div className="mt-5 max-w-xl mx-auto relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients by name, industry, or solutions..."
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
        {/* Industry Filter Pills */}
        {industries.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
            {industries.map((ind) => {
              const isSelected = selectedIndustry === ind;
              return (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {ind}
                </button>
              );
            })}
          </div>
        )}

        {/* Clients Grid */}
        <div className="mt-5">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-xs">Loading our partners...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 max-w-md mx-auto shadow-xs my-6">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-800">No Clients Found</h3>
              <p className="text-xs text-gray-500 mt-1 leading-normal">
                {searchQuery
                  ? `No clients found matching "${searchQuery}". Try a different keyword.`
                  : 'Client portfolio is currently being updated. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredClients.map((client) => {
                const productCount = client.productIds?.length || 0;

                return (
                  <Link
                    key={client.id}
                    href={`/clients/${client.slug}`}
                    className="group bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col overflow-hidden hover:-translate-y-0.5"
                  >
                    {/* Top Logo Container */}
                    <div className="h-32 bg-gradient-to-b from-gray-50/80 to-white flex items-center justify-center p-3.5 border-b border-gray-50 relative group-hover:from-primary/5 transition-colors">
                      {client.logoUrl ? (
                        <div className="relative w-28 h-18 flex items-center justify-center">
                          <OptimizedImage
                            src={client.logoUrl}
                            alt={client.name}
                            width={120}
                            height={72}
                            className="object-contain max-h-16 w-auto filter transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-400">
                          LOGO
                        </div>
                      )}

                      {/* Industry badge in top right */}
                      {client.industry && (
                        <span className="absolute top-2 right-2 text-[10px] font-semibold bg-white/90 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                          {client.industry}
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors flex items-center justify-between">
                          <span className="truncate">{client.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </h3>

                        {client.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-normal">
                            {client.description}
                          </p>
                        )}
                      </div>

                      {/* Purchased Summary Badge */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 font-medium text-[11px]">
                          <ShoppingBag className="w-3 h-3 text-primary" />
                          <span>
                            {productCount > 0
                              ? `${productCount} Solution${productCount > 1 ? 's' : ''} Purchased`
                              : 'Client Partner'}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-primary group-hover:underline">
                          View Items &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Corporate CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-5 sm:p-6 text-center relative overflow-hidden shadow-lg">
          <div className="max-w-2xl mx-auto space-y-2.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-primary-400">
              Grow With Us
            </span>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight">
              Looking for Corporate Bulk Purchases or Custom Quotations?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-normal">
              Join our network of prestigious clients. We offer customized corporate pricing, dedicated account managers, and streamlined procurement.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <Link
                href="/business"
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-100 transition-colors shadow-xs"
              >
                Explore B2B Solutions
              </Link>
              <Link
                href="/quotes"
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-medium text-xs hover:bg-white/20 transition-colors border border-white/20"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
