import Link from "next/link";
import { ArrowRight, Package, Truck, ShieldCheck, CreditCard } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-32 overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Corporate Supply Chain, <span className="text-indigo-600">Simplified</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Smart24 provides seamless B2B procurement, automated monthly subscriptions, and reliable delivery for all your office essentials. From pantry items to stationary, we have got your corporate needs covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/subscriptions"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                View Subscription Packages
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-gray-300 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Browse Retail Shop
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Design */}
        <div className="absolute top-0 inset-x-0 h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-3/4 h-3/4 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-3/4 h-3/4 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Why Choose Smart24</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to run your office
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-5">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tailored Packages</h3>
              <p className="text-gray-500 text-sm">Customized bundles of rice, sugar, tea, and office supplies built specifically for your headcount.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-5">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Automated Delivery</h3>
              <p className="text-gray-500 text-sm">Set your subscription once and receive reliable, on-time deliveries at the start of every month.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-green-100 text-green-600 mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Flexible Payments</h3>
              <p className="text-gray-500 text-sm">Pay seamlessly via Card, Mobile Financial Services (bKash, Nagad), or manual corporate transfer.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-orange-100 text-orange-600 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-500 text-sm">All products are sourced directly from verified manufacturers, ensuring premium quality for your team.</p>
            </div>
          </div>
        </div>
      </section>

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
                    <div className="absolute left-0 top-1 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">1</div>
                    Select a Package
                  </dt>
                  <dd className="mt-1 text-base text-gray-500">Choose from our ready-made corporate bundles or build a custom subscription tailored to your office.</dd>
                </div>
                
                <div className="relative pl-12">
                  <dt className="text-lg font-medium text-gray-900">
                    <div className="absolute left-0 top-1 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">2</div>
                    Request Quotation
                  </dt>
                  <dd className="mt-1 text-base text-gray-500">Our team will review your requirements and provide a finalized corporate quotation for your approval.</dd>
                </div>

                <div className="relative pl-12">
                  <dt className="text-lg font-medium text-gray-900">
                    <div className="absolute left-0 top-1 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">3</div>
                    Receive Monthly Deliveries
                  </dt>
                  <dd className="mt-1 text-base text-gray-500">Approve the quote, make the payment, and we will automatically deliver your supplies every month.</dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-gray-100 rounded-3xl h-96 w-full flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-inner">
                {/* Placeholder for an image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-blue-50 opacity-80"></div>
                <div className="z-10 text-center p-8">
                  <p className="text-2xl font-bold text-indigo-900 mb-2">Smart24 Dashboard</p>
                  <p className="text-indigo-700">Manage orders, subscriptions, and quotes in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
            Ready to streamline your office supplies?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of forward-thinking companies saving time and money with Smart24.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              Create Corporate Account
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 border border-white text-base font-medium rounded-full text-white hover:bg-indigo-600 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
