"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offerType, setOfferType] = useState<"AMOUNT_BASED" | "FIXED_PACKAGE">("AMOUNT_BASED");
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minAmount: "",
    priority: "0",
    planId: "",
    isFreeDelivery: false,
    isActive: true,
  });

  useEffect(() => {
    if (token) {
      fetchOffers();
      fetchPlans();
    }
  }, [token]);

  const fetchOffers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setOffers(await res.json());
    } catch (e) {}
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans`);
      if (res.ok) setPlans(await res.json());
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        type: offerType,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        isActive: formData.isActive,
      };

      if (offerType === "AMOUNT_BASED") {
        payload.minAmount = formData.minAmount ? parseFloat(formData.minAmount) : null;
        payload.priority = parseInt(formData.priority);
        payload.isFreeDelivery = formData.isFreeDelivery;
      } else {
        payload.planId = formData.planId;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Offer created successfully");
        setIsModalOpen(false);
        fetchOffers();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to create offer");
      }
    } catch (e) {
      toast.error("Error creating offer");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Offer deleted");
        fetchOffers();
      }
    } catch (e) {}
  };

  if (!user || user.role !== "ADMIN") return <p className="p-8">Access Denied</p>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Offer Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create New Offer</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Discount</th>
              <th className="p-4 font-semibold">Details</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(offer => (
              <tr key={offer.id} className="border-b">
                <td className="p-4">{offer.name}</td>
                <td className="p-4">{offer.type === 'AMOUNT_BASED' ? 'Custom Package' : 'Fixed Package'}</td>
                <td className="p-4">
                  {offer.discountValue}{offer.discountType === 'PERCENTAGE' ? '%' : ' ৳'}
                  {offer.isFreeDelivery && ' + Free Delivery'}
                </td>
                <td className="p-4 text-gray-500">
                  {offer.type === 'AMOUNT_BASED' 
                    ? `Min: ৳${offer.minAmount || 0} (Pri: ${offer.priority})`
                    : `Plan: ${offer.plan?.name || 'N/A'}`
                  }
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(offer.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No offers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4"><X className="w-5 h-5 text-gray-400" /></button>
            <h2 className="text-2xl font-bold mb-4">Create Offer</h2>
            
            <div className="flex gap-4 mb-6">
              <Button 
                variant={offerType === "AMOUNT_BASED" ? "default" : "outline"} 
                onClick={() => setOfferType("AMOUNT_BASED")}
                className="flex-1"
              >
                Amount Based
              </Button>
              <Button 
                variant={offerType === "FIXED_PACKAGE" ? "default" : "outline"} 
                onClick={() => setOfferType("FIXED_PACKAGE")}
                className="flex-1"
              >
                Fixed Package
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Offer Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Discount Type</label>
                  <select 
                    className="w-full border rounded-md h-10 px-3 text-sm"
                    value={formData.discountType} 
                    onChange={e => setFormData({...formData, discountType: e.target.value})}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Discount Value</label>
                  <Input type="number" min="0" step="any" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} required />
                </div>
              </div>

              {offerType === "AMOUNT_BASED" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Minimum Amount (৳)</label>
                      <Input type="number" min="0" value={formData.minAmount} onChange={e => setFormData({...formData, minAmount: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority (Higher = Better)</label>
                      <Input type="number" min="0" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} />
                    </div>
                  </div>
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" checked={formData.isFreeDelivery} onChange={e => setFormData({...formData, isFreeDelivery: e.target.checked})} />
                    <span>Includes Free Delivery</span>
                  </label>
                </>
              ) : (
                <div>
                  <label className="text-sm font-medium">Select Fixed Plan</label>
                  <select 
                    className="w-full border rounded-md h-10 px-3 text-sm"
                    value={formData.planId} 
                    onChange={e => setFormData({...formData, planId: e.target.value})}
                    required
                  >
                    <option value="">-- Select a Plan --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                    ))}
                  </select>
                </div>
              )}

              <label className="flex items-center space-x-2 text-sm">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                <span>Active</span>
              </label>

              <Button type="submit" className="w-full">Create</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
