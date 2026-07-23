import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="relative bg-primary-800 pb-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-primary-800 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative container mx-auto py-24 px-4 sm:py-32 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">About Smart24</h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-primary-100">
            Transforming corporate procurement in Bangladesh through technology, transparency, and reliable supply chains.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-32">
        <div className="container mx-auto px-4 mb-24">
          <div className="rounded-2xl bg-white shadow-xl px-6 py-12 sm:px-12 lg:px-16 text-gray-700">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg leading-8 mb-8">
              At Smart24, we recognized a major bottleneck in how corporations and businesses in Bangladesh manage their daily supplies. Between negotiating with vendors, tracking deliveries, and managing invoices, procurement teams lose countless hours on repetitive tasks. Our mission is to automate this process.
            </p>
            
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6 mt-12">What We Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
              <div>
                <h3 className="font-semibold text-gray-900 text-xl mb-2">B2B Subscriptions</h3>
                <p>We provide tailored, automated monthly subscriptions for office pantries, stationary, and cleaning supplies. Set your requirements once, and let us handle the rest.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-xl mb-2">Retail Marketplace</h3>
                <p>Need something specific urgently? Our retail marketplace offers a wide array of office products for one-off purchases with fast delivery.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6 mt-12">Our Values</h2>
            <ul className="list-disc pl-6 space-y-4 text-lg">
              <li><strong>Reliability:</strong> We deliver on time, every time, ensuring your office never runs out of essentials.</li>
              <li><strong>Quality:</strong> We source directly from trusted brands and manufacturers.</li>
              <li><strong>Transparency:</strong> Clear pricing, automated quotations, and comprehensive invoices for your accounts team.</li>
            </ul>

            <div className="mt-16 text-center border-t border-gray-100 pt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to upgrade your procurement?</h3>
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
              >
                Join Smart24 Today
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
