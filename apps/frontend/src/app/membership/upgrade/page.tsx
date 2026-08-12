import { MembershipCard } from '@/components/MembershipCard';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function MembershipUpgradePage() {
  // Fetch memberships from the backend
  let memberships = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/memberships`, { 
      cache: 'no-store' 
    });
    if (res.ok) {
      memberships = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch memberships:", error);
  }

  memberships.sort((a: any, b: any) => a.priority - b.priority);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-zinc-950 py-12 px-4 text-center border-b border-white/10">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Select Your Business Tier</h1>
        <p className="text-zinc-400 max-w-xl mx-auto">Choose the membership level that fits your company's purchasing volume. Payments can be processed via business card, bank transfer, or standard invoice.</p>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col gap-12">
          {memberships.map((tier: any) => (
            <div key={tier.id} className="flex flex-col lg:flex-row items-center gap-8 bg-zinc-50 rounded-3xl p-6 md:p-8 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Card Visualization */}
              <div className="w-full lg:w-[400px] flex-shrink-0">
                <MembershipCard level={tier} />
              </div>

              {/* Tier Details and CTA */}
              <div className="flex-1 w-full space-y-6">
                 <div>
                   <h2 className="text-2xl font-bold text-zinc-900">{tier.name} Membership</h2>
                   <p className="text-zinc-500 font-medium">Required Business Spend: ৳{tier.requiredAmount.toLocaleString()} / Year</p>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {tier.benefits.map((benefit: string, idx: number) => (
                     <div key={idx} className="flex items-start gap-2">
                       <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                       <span className="text-sm text-zinc-700">{benefit}</span>
                     </div>
                   ))}
                 </div>

                 <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-zinc-200">
                   <Button className="h-12 px-8 rounded-full bg-zinc-900 hover:bg-black text-white font-bold w-full sm:w-auto">
                     Select {tier.name} Tier
                   </Button>
                   <Button variant="outline" className="h-12 px-8 rounded-full border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-bold w-full sm:w-auto">
                     Contact Sales
                   </Button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
