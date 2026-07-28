'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    category: "Subscriptions & Orders",
    items: [
      {
        question: "What is a Corporate Subscription?",
        answer: "A corporate subscription allows businesses to automate their procurement. You can select a package of office essentials (like tea, coffee, sugar, and stationery) and we will automatically deliver them to your office at the start of every month."
      },
      {
        question: "How do I request a custom quotation?",
        answer: "To request a custom quotation, you can use our Subscription Builder or add items to your standard cart. During checkout, select 'Request Quotation' instead of direct payment. Our corporate sales team will review your requirements and send a finalized quote for approval."
      },
      {
        question: "Can I modify my monthly subscription?",
        answer: "Yes, you can modify your active subscription from your Account Dashboard under the 'Subscriptions' tab. Changes made before the 25th of the month will be reflected in the following month's delivery."
      },
      {
        question: "Can I cancel my subscription?",
        answer: "Absolutely. You can cancel your subscription at any time without any hidden fees. However, cancellations made after the 25th of the month will take effect the following month."
      },
      {
        question: "Is there a minimum order quantity (MOQ)?",
        answer: "For standard retail purchases, there is no strict MOQ, though a minimum order value of ৳1,000 applies for free delivery. For wholesale and custom corporate quotations, MOQs may apply depending on the product category."
      }
    ]
  },
  {
    category: "Payments & Billing",
    items: [
      {
        question: "What payment methods are supported?",
        answer: "We support direct card payments, Mobile Financial Services (bKash, Nagad, Rocket), and manual corporate bank transfers. For manual payments, you will need to upload your Transaction ID (TrxID) or deposit slip for admin verification."
      },
      {
        question: "Do you provide standard VAT/Tax invoices?",
        answer: "Yes. All corporate orders are provided with official invoices that include standard VAT (Mushak) and Tax documentation as required by Bangladesh regulations."
      },
      {
        question: "What are your payment terms for corporate clients?",
        answer: "Verified corporate clients can apply for credit terms (e.g., Net 15 or Net 30). This is subject to credit approval and a signed corporate agreement."
      }
    ]
  },
  {
    category: "Shipping & Returns",
    items: [
      {
        question: "Do you deliver outside Dhaka?",
        answer: "Currently, our automated corporate subscription deliveries are restricted to the Dhaka Metropolitan Area. However, for one-off bulk retail orders, we can arrange nationwide delivery via our logistics partners."
      },
      {
        question: "How long does standard delivery take?",
        answer: "For retail items in stock, delivery within Dhaka typically takes 24-48 hours. Corporate subscriptions are delivered on the first week of every month."
      },
      {
        question: "What is the return policy for damaged items?",
        answer: "If you receive a damaged or incorrect item, please notify our support team within 24 hours of delivery. We will arrange a replacement at no additional cost."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFaq = (categoryIndex: number, itemIndex: number) => {
    const id = `${categoryIndex}-${itemIndex}`;
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="bg-muted min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Can't find the answer you're looking for? Reach out to our <a href="/contact" className="text-primary/90 font-medium hover:underline">customer support</a> team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h3 className="text-xl font-bold text-foreground mb-6">{category.category}</h3>
              <div className="space-y-4">
                {category.items.map((faq, itemIndex) => {
                  const id = `${catIndex}-${itemIndex}`;
                  const isOpen = openIndex === id;
                  return (
                    <div 
                      key={itemIndex} 
                      className={`bg-white rounded-2xl shadow-sm border transition-colors ${isOpen ? 'border-primary-200 ring-1 ring-primary-200' : 'border-border'}`}
                    >
                      <button
                        className="w-full px-6 py-5 flex justify-between items-center focus:outline-none"
                        onClick={() => toggleFaq(catIndex, itemIndex)}
                      >
                        <span className={`font-semibold text-left pr-4 ${isOpen ? 'text-primary-900' : 'text-foreground'}`}>
                          {faq.question}
                        </span>
                        <span className="flex-shrink-0 text-muted-foreground">
                          {isOpen ? <ChevronUp className="h-5 w-5 text-primary-500" /> : <ChevronDown className="h-5 w-5" />}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5">
                          <p className="text-muted-foreground leading-relaxed text-sm">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
