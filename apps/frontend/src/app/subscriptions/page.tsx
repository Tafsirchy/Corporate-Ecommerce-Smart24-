"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useAuth, apiClient } from "@/context/AuthContext";
import { X } from "lucide-react";

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [deliveryDay, setDeliveryDay] = useState<number | string>(5);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await apiClient.get('/subscriptions/plans');
        const resData = res.data?.data || res.data;
        setPlans(resData?.filter((p: any) => p.isActive) || []);
      } catch (err) {
        console.error("Failed to fetch plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribeClick = (plan: any) => {
    if (!user) {
      toast.error("Please login to subscribe");
      openAuthModal('login');
      return;
    }
    setSelectedPlan(plan);
  };

  async function handleConfirmSubscription(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;
    
    if (!deliveryAddress || !contactNumber) {
      toast.error("Delivery details are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        planId: selectedPlan.id,
        billingDay: deliveryDay,
        deliveryAddress,
        contactNumber,
        paymentMethod: 'MANUAL'
      };

      await apiClient.post('/subscriptions/fixed', payload);
      toast.success(`Successfully subscribed to ${selectedPlan.name}!`);
      setSelectedPlan(null);
      router.push("/my-account/subscriptions");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create subscription");
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 relative">
      <div className="flex flex-col md:flex-row items-center justify-between bg-primary/10 p-8 rounded-lg mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-4">Business Subscriptions</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Get your monthly supplies delivered automatically. Choose a fixed package or build your own custom package.
          </p>
          <div className="flex gap-4">
            <Link href="/subscriptions/builder">
              <Button size="lg" className="text-lg">Build Custom Package</Button>
            </Link>
            <Link href="/my-account/subscriptions">
              <Button size="lg" variant="outline" className="text-lg bg-white">My Subscriptions</Button>
            </Link>
          </div>
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
            <div key={plan.id} className="border p-6 rounded-lg shadow-sm hover:shadow-md transition bg-white flex flex-col">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4 flex-grow">{plan.description}</p>
              
              {plan.items && plan.items.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-1">Includes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {plan.items.slice(0, 3).map((item: any) => (
                      <li key={item.id}>• {item.product.name} (x{item.quantity})</li>
                    ))}
                    {plan.items.length > 3 && <li>• ...and {plan.items.length - 3} more</li>}
                  </ul>
                </div>
              )}

              {plan.offer && plan.offer.isActive ? (
                <>
                  <div className="mb-2">
                    <span className="bg-danger-bg text-destructive text-xs font-bold px-2 py-1 rounded">
                      {plan.offer.discountType === 'PERCENTAGE' 
                        ? `${plan.offer.discountValue}% OFF` 
                        : `৳${plan.offer.discountValue} OFF`}
                    </span>
                  </div>
                  <p className="text-xl text-muted-foreground line-through">৳{plan.price}</p>
                  <p className="text-3xl font-bold mb-6">
                    ৳{plan.offer.discountType === 'PERCENTAGE' 
                        ? plan.price - (plan.price * plan.offer.discountValue / 100)
                        : plan.price - plan.offer.discountValue} 
                    <span className="text-sm font-normal text-muted-foreground">/ month</span>
                  </p>
                </>
              ) : (
                <p className="text-3xl font-bold mb-6">৳{plan.price} <span className="text-sm font-normal text-muted-foreground">/ month</span></p>
              )}
              <Button className="w-full mt-auto" variant="outline" onClick={() => handleSubscribeClick(plan)}>
                Subscribe to {plan.name}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold mb-2">Subscribe to {selectedPlan.name}</h3>
            {selectedPlan.offer && selectedPlan.offer.isActive ? (
              <p className="text-muted-foreground mb-6">
                Total: ৳{
                  selectedPlan.offer.discountType === 'PERCENTAGE'
                    ? selectedPlan.price - (selectedPlan.price * selectedPlan.offer.discountValue / 100)
                    : selectedPlan.price - selectedPlan.offer.discountValue
                } / month (Discount Applied)
              </p>
            ) : (
              <p className="text-muted-foreground mb-6">Total: ৳{selectedPlan.price} / month</p>
            )}

            <form onSubmit={handleConfirmSubscription} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Delivery Day (Every Month)</label>
                <Input type="number" min={1} max={28} value={deliveryDay} onChange={(e) => setDeliveryDay(e.target.value === '' ? '' : parseInt(e.target.value))} required />
                <p className="text-xs text-muted-foreground mt-1">Select a date between 1 and 28.</p>
              </div>
              <div>
                <label className="text-sm font-medium">Delivery Address</label>
                <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="e.g. 123 Business Tower, Gulshan" required />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Number</label>
                <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="e.g. 01700000000" required />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Confirm Subscription"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
