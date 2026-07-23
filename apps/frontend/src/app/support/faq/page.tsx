'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { apiClient } from '@/context/AuthContext';
import Link from 'next/link';

interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check hash for deep linking
    const hash = window.location.hash;
    if (hash && hash.startsWith('#faq-')) {
      const id = hash.replace('#faq-', '');
      setOpenId(id);
      setTimeout(() => {
        const element = document.getElementById(`faq-${id}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }

    const fetchFaqs = async () => {
      try {
        const res = await apiClient.get('/faqs');
        setFaqs(res.data);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  const handleFeedback = async (id: string, isHelpful: boolean) => {
    if (feedbackGiven.has(id)) return;
    try {
      await apiClient.post(`/faqs/${id}/feedback`, { isHelpful });
      setFeedbackGiven(prev => new Set(prev).add(id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find quick answers to common questions about our services.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4">No FAQs available at the moment.</p>
            <Link href="/support/contact" className="text-primary-600 font-medium hover:underline">
              Contact Support
            </Link>
          </div>
        ) : (
          <>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary-900 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div 
                  key={faq.id} 
                  id={`faq-${faq.id}`}
                  className={`bg-white border rounded-2xl transition-all duration-200 ${
                    openId === faq.id ? 'border-primary-200 shadow-md ring-1 ring-primary-100' : 'border-gray-100 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => {
                      toggleFaq(faq.id);
                      if (openId !== faq.id) {
                        window.history.replaceState(null, '', `#faq-${faq.id}`);
                      } else {
                        window.history.replaceState(null, '', window.location.pathname);
                      }
                    }}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${openId === faq.id ? 'rotate-180 text-primary-600' : ''}`} />
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                      openId === faq.id ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-gray-600 leading-relaxed pt-2 border-t border-gray-50 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-4 text-sm">
                      <span className="text-gray-500">Was this helpful?</span>
                      {feedbackGiven.has(faq.id) ? (
                        <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded">Thank you for your feedback!</span>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => handleFeedback(faq.id, true)} className="px-3 py-1 bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded transition-colors text-gray-700">Yes</button>
                          <button onClick={() => handleFeedback(faq.id, false)} className="px-3 py-1 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded transition-colors text-gray-700">No</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Still need help */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <Link href="/support/contact" className="inline-block px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
