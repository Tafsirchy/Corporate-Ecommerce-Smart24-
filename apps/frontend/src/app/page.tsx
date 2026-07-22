import Link from "next/link";
import { ArrowRight, Package, Truck, ShieldCheck, CreditCard } from "lucide-react";
import { HeroBentoAccordion, HeroAd } from "@/components/HeroBentoAccordion";
import { WhyChooseUsMarquee } from "@/components/WhyChooseUsMarquee";
import { OfferSlider } from "@/components/OfferSlider";
import { SpecialOfferBanner } from "@/components/SpecialOfferBanner";
import { PremiumBentoCategories } from "@/components/PremiumBentoCategories";

const DUMMY_ADS: HeroAd[] = [
  {
    id: "1",
    title: "Corporate Pantry Essentials",
    subtitle: "Stock up on premium coffee, tea, and snacks for your team.",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop",
    categoryUrl: "/shop/pantry"
  },
  {
    id: "2",
    title: "Office Electronics",
    subtitle: "Upgrade your workstations with top-tier monitors and accessories.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    categoryUrl: "/shop/electronics"
  },
  {
    id: "3",
    title: "Stationery Packages",
    subtitle: "Never run out of pens, paper, or sticky notes again.",
    imageUrl: "https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?q=80&w=1935&auto=format&fit=crop",
    categoryUrl: "/shop/stationery"
  },
  {
    id: "4",
    title: "Office Furniture",
    subtitle: "Ergonomic chairs and desks for maximum productivity.",
    imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop",
    categoryUrl: "/shop/furniture"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="bg-gray-50 border-b border-gray-100">
        <HeroBentoAccordion ads={DUMMY_ADS} />
      </div>

      {/* Features Section */}
      <WhyChooseUsMarquee />

      {/* Offer Slider */}
      <OfferSlider />

      {/* Special Offer Banner before Corporate Collections */}
      <SpecialOfferBanner />

      {/* Premium Categories Bento Box */}
      <PremiumBentoCategories />

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                Automate your procurement in 3 easy steps
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Say goodbye to last-minute market runs and repetitive ordering. Smart24 allows you to put your corporate supply chain on autopilot.
              </p>
              
              <dl className="space-y-6">
                <div className="relative pl-12">
                  <dt className="text-lg font-medium text-gray-900">
                    <div className="absolute left-0 top-1 w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 text-white font-bold text-sm">1</div>
                    Select a Package
                  </dt>
                  <dd className="mt-1 text-base text-gray-500">Choose from our ready-made corporate bundles or build a custom subscription tailored to your office.</dd>
                </div>
                
                <div className="relative pl-12">
                  <dt className="text-lg font-medium text-gray-900">
                    <div className="absolute left-0 top-1 w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 text-white font-bold text-sm">2</div>
                    Request Quotation
                  </dt>
                  <dd className="mt-1 text-base text-gray-500">Our team will review your requirements and provide a finalized corporate quotation for your approval.</dd>
                </div>

                <div className="relative pl-12">
                  <dt className="text-lg font-medium text-gray-900">
                    <div className="absolute left-0 top-1 w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 text-white font-bold text-sm">3</div>
                    Receive Monthly Deliveries
                  </dt>
                  <dd className="mt-1 text-base text-gray-500">Approve the quote, make the payment, and we will automatically deliver your supplies every month.</dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-gray-100 rounded-3xl h-96 w-full flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner">
                {/* Placeholder for an image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-blue-50 opacity-80"></div>
                <div className="z-10 text-center p-8">
                  <p className="text-2xl font-bold text-primary-900 mb-2">Smart24 Dashboard</p>
                  <p className="text-primary-700">Manage orders, subscriptions, and quotes in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
            Ready to streamline your office supplies?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of forward-thinking companies saving time and money with Smart24.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-primary-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              Create Corporate Account
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-white text-base font-medium rounded-full text-white hover:bg-primary-600 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
