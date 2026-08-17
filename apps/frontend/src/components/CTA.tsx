'use client';
import Link from 'next/link';
import { ShieldCheck, Truck, HeadphonesIcon, ArrowRight } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-primary-600 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          {/* Subtle Decorative Blobs */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Reliability You Can Trust for Your Business
            </h2>
            <p className="text-lg md:text-xl text-primary-50 max-w-2xl mx-auto">
              At Smart24, we ensure 99.9% uptime, secure transactions, and guaranteed on-time delivery so you can focus on growing your business without supply chain interruptions.
            </p>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:bg-white group-hover:text-primary-600 transition-all duration-300">
                <ShieldCheck size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Transactions</h3>
              <p className="text-primary-50/90 leading-relaxed">
                Enterprise-grade security protecting your business data and payments.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:bg-white group-hover:text-primary-600 transition-all duration-300">
                <Truck size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Guaranteed Delivery</h3>
              <p className="text-primary-50/90 leading-relaxed">
                Verified suppliers and optimized logistics ensure your supplies arrive on time.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:bg-white group-hover:text-primary-600 transition-all duration-300">
                <HeadphonesIcon size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">24/7 Support</h3>
              <p className="text-primary-50/90 leading-relaxed">
                Dedicated account managers available around the clock for your procurement needs.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-primary-700 bg-white hover:bg-primary-50 active:scale-95 transition-all duration-300 shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 gap-2 group"
            >
              Create Your Business Account Today
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
