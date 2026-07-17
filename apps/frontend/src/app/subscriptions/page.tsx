"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans`);
        if (res.ok) {
          const data = await res.json();
          setPlans(data.filter((p: any) => p.isActive));
        }
      } catch (err) {
        console.error("Failed to fetch plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-5xl mt-10">
      <div className="flex flex-col md:flex-row items-center justify-between bg-primary/10 p-8 rounded-lg mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-4">Corporate Subscriptions</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Get your monthly supplies delivered automatically. Choose a fixed package or build your own custom package.
          </p>
          <Link href="/subscriptions/builder">
            <Button size="lg" className="text-lg">Build Custom Package</Button>
          </Link>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Fixed Packages</h2>
      {loading ? (
        <p>Loading plans...</p>
      ) : plans.length === 0 ? (
        <p>No fixed plans available at the moment. Try building a custom package!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan: any) => (
            <div key={plan.id} className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4 h-12">{plan.description}</p>
              <p className="text-3xl font-bold mb-6">৳{plan.price} <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
              <Button className="w-full" variant="outline" onClick={() => alert('Fixed plan subscription coming soon! Please use Custom Builder for now.')}>
                Subscribe to {plan.name}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
