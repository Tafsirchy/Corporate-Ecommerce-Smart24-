"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useAuth, apiClient } from "@/context/AuthContext";

import { Suspense } from "react";

function RequestQuoteForm() {
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [quantity, setQuantity] = useState(50);
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [instructions, setInstructions] = useState("");
  
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  
  const { user, loading, openAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      toast.info("Please login to request a quote.");
      openAuthModal('login');
    }
  }, [user, router, productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        companyName,
        contactNumber,
        contactEmail,
        quantity,
        deliveryLocation,
        deadline,
        instructions,
        productId
      };

      await apiClient.post("/quotations", payload);
      toast.success("Quote requested successfully! We will contact you soon.");
      router.push("/my-account/quotes");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 max-w-2xl mt-10">
      <h1 className="text-3xl font-bold mb-2">Request a Business Quote</h1>
      <p className="text-muted-foreground mb-8">
        Fill out the form below to request special pricing for bulk orders or custom business packages.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Company Name</label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Contact Number</label>
            <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Contact Email</label>
          <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Estimated Quantity</label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} required />
          </div>
          <div>
            <label className="text-sm font-medium">Required By (Deadline)</label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Delivery Location</label>
          <Input value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm font-medium">Special Instructions / Requirements</label>
          <textarea 
            className="w-full border rounded-md p-2 h-24 mt-1" 
            value={instructions} 
            onChange={(e) => setInstructions(e.target.value)}
          ></textarea>
        </div>

        <Button type="submit" className="w-full" size="lg">Submit Quote Request</Button>
      </form>
    </div>
  );
}

export default function RequestQuotePage() {
  return (
    <Suspense fallback={<div className="container py-10">Loading...</div>}>
      <RequestQuoteForm />
    </Suspense>
  );
}
