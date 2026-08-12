import { apiClient } from '@/context/AuthContext';
import { MembershipCard } from '@/components/MembershipCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function MembershipPage() {
  // Fetch memberships from the backend
  let memberships = [];
  try {
    // Note: since this is a server component by default, we can use fetch directly or apiClient if it's isomorphic.
    // However, apiClient is a client-side axios instance. Let's use native fetch for Server Component:
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/memberships`, { 
      cache: 'no-store' 
    });
    if (res.ok) {
      memberships = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch memberships:", error);
  }

  // Sort memberships by priority
  memberships.sort((a: any, b: any) => a.priority - b.priority);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-zinc-950 to-zinc-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-600">
          Smart24 Elite Membership
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-8">
          Unlock wholesale enterprise pricing, priority support, and exclusive business perks. Experience the premium standard of B2B procurement.
        </p>
        <Link href="/membership/upgrade">
          <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold hover:scale-105 transition-transform border-0 rounded-full px-8 h-14">
            View Upgrade Options
          </Button>
        </Link>
      </section>

      {/* Tiers Overview Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900">Membership Tiers</h2>
          <p className="text-zinc-500 mt-2">Hover over any card to reveal exclusive benefits and requirements.</p>
        </div>
        
        {memberships.length === 0 ? (
           <div className="text-center py-20 text-zinc-500">
             No membership tiers available at the moment.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12 max-w-7xl mx-auto">
            {memberships.map((tier: any) => (
              <MembershipCard key={tier.id} level={tier} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
