'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Package, RefreshCcw, HelpCircle, Mail, FileText, ChevronRight, MessageCircle } from 'lucide-react';
import { apiClient } from '@/context/AuthContext';

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
    <div className="min-h-screen bg-muted pb-20 relative">
      {/* Hero Section */}
      <div className="bg-primary-900 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How can we help you?</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers (e.g., 'refunds', 'shipping times')..."
              className="w-full bg-white pl-14 pr-6 py-4 rounded-full text-lg text-foreground focus:outline-none focus:ring-4 focus:ring-primary-500/50 shadow-lg"
            />
            
            {/* Live Search Results */}
            {searchQuery.trim() !== '' && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-border overflow-hidden text-left z-50 max-h-[40vh] md:max-h-96 overflow-y-auto">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <Link key={i} href={cat.link} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-border flex flex-col items-center text-center group">
              <div className="p-4 bg-primary-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{cat.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-4 mt-24 text-center">
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-border">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Still need help?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Our support team is always ready to help you with any issues or questions you might have. We aim to respond within 24 hours.
          </p>
          <Link href="/support/contact" className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg">
            Contact Support <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Floating Action Button */}
      <Link href="/support/contact" className="fixed bottom-8 right-8 w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-primary-700 transition-colors hover:scale-110 z-50">
        <MessageCircle className="w-6 h-6" />
      </Link>
    </div>
  );
}
