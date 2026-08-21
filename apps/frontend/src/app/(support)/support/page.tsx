'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Package, RefreshCcw, HelpCircle, Mail, FileText, ChevronRight } from 'lucide-react';
import { apiClient } from '@/context/AuthContext';
import { ScrollFade } from '@/components/ui/ScrollFade';

interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function SupportHubPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await apiClient.get('/faqs');
        setFaqs(res.data?.data || res.data);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      }
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = searchQuery.trim() === '' ? [] : faqs.filter(
    faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5); // show top 5

  const categories = [
    {
      title: 'Orders & Tracking',
      description: 'Track your order, change shipping details, or report missing items.',
      icon: <Package className="w-8 h-8 text-primary/90 mb-4" />,
      link: '/track-order'
    },
    {
      title: 'Returns & Refunds',
      description: 'Start a return, track refund status, and read our policies.',
      icon: <RefreshCcw className="w-8 h-8 text-primary/90 mb-4" />,
      link: '/track-return'
    },
    {
      title: 'FAQs',
      description: 'Find quick answers to common questions about our services.',
      icon: <HelpCircle className="w-8 h-8 text-primary/90 mb-4" />,
      link: '/support/faq'
    },
    {
      title: 'Policies',
      description: 'Read our privacy policy, terms of service, and more.',
      icon: <FileText className="w-8 h-8 text-primary/90 mb-4" />,
      link: '/privacy'
    },
  ];

  return (
    <div className="space-y-12 pb-24 lg:pb-0">
      {/* Hero Section */}
      <div className="bg-primary-900 text-white rounded-3xl py-16 px-6 text-center shadow-lg relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
           <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
           <div className="absolute bottom-0 right-10 w-48 h-48 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">How can we help you?</h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers (e.g., 'refunds')..."
              className="w-full bg-white pl-14 pr-6 py-4 rounded-full text-base text-foreground focus:outline-none focus:ring-4 focus:ring-primary-500/50 shadow-lg"
            />
            
            {/* Live Search Results - Desktop */}
            {searchQuery.trim() !== '' && (
              <ScrollFade className="hidden md:block absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-border overflow-hidden text-left z-50 max-h-96 overflow-y-auto">
                {filteredFaqs.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {filteredFaqs.map(faq => (
                      <li key={faq.id}>
                        <Link href={`/support/faq#faq-${faq.id}`} className="block px-6 py-4 hover:bg-muted transition-colors">
                          <p className="font-semibold text-foreground text-base">{faq.question}</p>
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{faq.answer}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    No matching answers found for "{searchQuery}".
                    <br />
                    <Link href="/support/contact" className="text-primary/90 font-medium hover:underline mt-2 inline-block">Contact Support</Link>
                  </div>
                )}
              </ScrollFade>
            )}
          </div>
        </div>
      </div>

      {/* Live Search Results - Mobile Bottom Sheet */}
      {searchQuery.trim() !== '' && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[100] bg-white rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.15)] border-t border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300 max-h-[50vh]">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2 shrink-0" />
          <div className="px-6 pb-2 shrink-0 border-b border-border flex justify-between items-center">
             <span className="font-bold text-sm text-muted-foreground">Search Results</span>
             <button onClick={() => setSearchQuery('')} className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full">Close</button>
          </div>
          <ScrollFade className="overflow-y-auto w-full text-left pb-8">
            {filteredFaqs.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredFaqs.map(faq => (
                  <li key={faq.id}>
                    <Link href={`/support/faq#faq-${faq.id}`} className="block px-6 py-4 hover:bg-muted transition-colors active:bg-primary/5">
                      <p className="font-semibold text-foreground text-base">{faq.question}</p>
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{faq.answer}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="mb-4">No matching answers found for "{searchQuery}".</p>
                <Link href="/support/contact" className="px-6 py-3 bg-primary-600 text-white rounded-full font-medium inline-block shadow-md">
                  Contact Support
                </Link>
              </div>
            )}
          </ScrollFade>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {categories.map((cat, i) => (
          <Link key={i} href={cat.link} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col items-center text-center group">
            <div className="p-4 bg-primary-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{cat.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{cat.description}</p>
          </Link>
        ))}
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Still need help?</h2>
        <p className="text-muted-foreground text-base mb-8 max-w-xl mx-auto">
          Our support team is always ready to help you with any issues or questions you might have. We aim to respond within 24 hours.
        </p>
        <Link href="/support/contact" className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">
          Contact Support <ChevronRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
}
