'use client';
import { Package, FileText, Truck } from 'lucide-react';
import Link from 'next/link';

export const HowItWorks = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Automate your procurement in <span className="text-primary-600">3 easy steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Say goodbye to last-minute market runs and repetitive ordering. Smart24 allows you to put your business supply chain on autopilot.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] border-t-2 border-dashed border-primary-200 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="group flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-6 shadow-sm border-4 border-white transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white relative">
                <Package size={32} strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-primary-700 font-bold border border-primary-100 flex items-center justify-center shadow-sm text-sm">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Select a Package</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose from our ready-made business bundles or build a custom subscription tailored to your office.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-6 shadow-sm border-4 border-white transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white relative">
                <FileText size={32} strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-primary-700 font-bold border border-primary-100 flex items-center justify-center shadow-sm text-sm">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Request Quotation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our B2B team will review your requirements and provide a competitive business quotation for your approval.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-6 shadow-sm border-4 border-white transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white relative">
                <Truck size={32} strokeWidth={1.5} />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-primary-700 font-bold border border-primary-100 flex items-center justify-center shadow-sm text-sm">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Receive Deliveries</h3>
              <p className="text-muted-foreground leading-relaxed">
                Approve the quote, complete payment, and we will deliver your essential supplies every month like clockwork.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full text-white bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Start Your Journey Today
          </Link>
        </div>
      </div>
    </section>
  );
};
