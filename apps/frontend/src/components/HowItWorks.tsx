'use client';
import { Package, FileText, Truck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-50/50 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 font-semibold text-sm mb-6 border border-primary-100">
            <CheckCircle2 size={16} />
            <span>Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Automate your procurement in <span className="text-primary-600">3 easy steps</span>
          </h2>
          <p className="text-lg text-gray-600">
            Say goodbye to last-minute market runs and repetitive ordering. Smart24 allows you to put your corporate supply chain on autopilot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary-100 transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <span className="text-8xl font-black text-primary-600">1</span>
            </div>
            <div className="w-16 h-16 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Package size={28} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">Select a Package</h3>
            <p className="text-gray-600 relative z-10 leading-relaxed">
              Choose from our ready-made corporate bundles or build a custom subscription specifically tailored to your office's unique needs.
            </p>
          </div>

          {/* Step 2 */}
          <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary-100 transition-all duration-300 mt-0 md:mt-8">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <span className="text-8xl font-black text-primary-600">2</span>
            </div>
            <div className="w-16 h-16 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <FileText size={28} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">Request Quotation</h3>
            <p className="text-gray-600 relative z-10 leading-relaxed">
              Our dedicated B2B team will review your requirements and provide a finalized, competitive corporate quotation for your approval.
            </p>
          </div>

          {/* Step 3 */}
          <div className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary-100 transition-all duration-300 mt-0 md:mt-16">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
              <span className="text-8xl font-black text-primary-600">3</span>
            </div>
            <div className="w-16 h-16 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Truck size={28} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">Receive Deliveries</h3>
            <p className="text-gray-600 relative z-10 leading-relaxed">
              Approve the quote, complete the payment, and we will automatically deliver your essential supplies every month like clockwork.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Start Your Journey Today
          </Link>
        </div>
      </div>
    </section>
  );
};
