'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "What is a Corporate Subscription?",
    answer: "A corporate subscription allows businesses to automate their procurement. You can select a package of office essentials (like tea, coffee, sugar, and stationery) and we will automatically deliver them to your office at the start of every month."
  },
  {
    question: "How do I request a custom quotation?",
    answer: "To request a custom quotation, you can use our Subscription Builder or add items to your standard cart. During checkout, select 'Request Quotation' instead of direct payment. Our corporate sales team will review your requirements and send a finalized quote for approval."
  },
  {
    question: "What payment methods are supported?",
    answer: "We support direct card payments, Mobile Financial Services (bKash, Nagad, Rocket), and manual corporate bank transfers. For manual payments, you will need to upload your Transaction ID (TrxID) or deposit slip for admin verification."
  },
  {
    question: "Can I modify my monthly subscription?",
    answer: "Yes, you can modify your active subscription from your Account Dashboard under the 'Subscriptions' tab. Changes made before the 25th of the month will be reflected in the following month's delivery."
  },
  {
    question: "Do you deliver outside Dhaka?",
    answer: "Currently, our automated corporate subscription deliveries are restricted to the Dhaka Metropolitan Area. However, for one-off bulk retail orders, we can arrange nationwide delivery via our logistics partners."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-gray-500">
            Can't find the answer you're looking for? Reach out to our <a href="/contact" className="text-indigo-600 font-medium hover:underline">customer support</a> team.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl shadow-sm border transition-colors ${openIndex === index ? 'border-indigo-200 ring-1 ring-indigo-200' : 'border-gray-100'}`}
            >
              <button
                className="w-full px-6 py-5 flex justify-between items-center focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className={`font-semibold text-left ${openIndex === index ? 'text-indigo-900' : 'text-gray-900'}`}>
                  {faq.question}
                </span>
                <span className="ml-4 flex-shrink-0 text-gray-400">
                  {openIndex === index ? <ChevronUp className="h-5 w-5 text-indigo-500" /> : <ChevronDown className="h-5 w-5" />}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
