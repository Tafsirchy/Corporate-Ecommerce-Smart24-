'use client';
import Link from 'next/link';
import { ShieldCheck, Truck, HeadphonesIcon } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="py-16 bg-muted border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Reliability You Can Trust for Your Business
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            At Smart24, we ensure 99.9% uptime, secure transactions, and guaranteed on-time delivery so you can focus on growing your business without supply chain interruptions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-card p-8 shadow-sm border border-border flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Secure Transactions</h3>
            <p className="text-muted-foreground">Enterprise-grade security protecting your business data and payments.</p>
          </div>
          
          <div className="bg-card p-8 shadow-sm border border-border flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Truck size={32} />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Guaranteed Delivery</h3>
            <p className="text-muted-foreground">Verified suppliers and optimized logistics ensure your supplies arrive on time.</p>
          </div>
          
          <div className="bg-card p-8 shadow-sm border border-border flex flex-col items-center text-center transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <HeadphonesIcon size={32} />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">24/7 Support</h3>
            <p className="text-muted-foreground">Dedicated account managers available around the clock for your procurement needs.</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link 
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-accent-foreground bg-accent hover:bg-accent/90 transition-colors shadow-lg"
          >
            Create Your Business Account Today
          </Link>
        </div>
      </div>
    </section>
  );
};
