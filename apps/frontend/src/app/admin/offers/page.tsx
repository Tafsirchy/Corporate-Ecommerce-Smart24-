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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editOfferId, setEditOfferId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
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

  const resetForm = () => {
    setFormData({
      name: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minAmount: "",
      priority: "0",
      planId: "",
      isFreeDelivery: false,
      isActive: true,
    });
    setOfferType("AMOUNT_BASED");
    setEditOfferId(null);
  };

  useEffect(() => {
    if (token) {
      fetchOffers();
      fetchPlans();
    }
  }, [token, page]);

  async function fetchOffers() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        // Since we changed backend to return { data, meta }
        if (result.data && result.meta) {
          setOffers(result.data);
          setTotalPages(result.meta.totalPages);
        } else {
          // Fallback if backend returned direct array
          setOffers(result);
          setTotalPages(1);
        }
      } else {
        toast.error("Failed to fetch offers");
      }
    } catch (e) {
      toast.error("Error fetching offers");
    } finally {
      setLoading(false);
    }
  };

  async function fetchPlans() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans`);
      if (res.ok) {
        const json = await res.json();
        setPlans(json.data || json || []);
      }
    } catch (e) {}
  };

  async function handleSubmit(e: React.FormEvent) {
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

      const url = editOfferId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/offers/${editOfferId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/offers`;
        
      const res = await fetch(url, {
        method: editOfferId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editOfferId ? "Offer updated successfully" : "Offer created successfully");
        setIsModalOpen(false);
        resetForm();
        fetchOffers();
      } else {
        const err = await res.json();
        toast.error(err.message || (editOfferId ? "Failed to update offer" : "Failed to create offer"));
      }
    } catch (e) {
      toast.error(editOfferId ? "Error updating offer" : "Error creating offer");
    }
  };

  const handleEdit = (offer: any) => {
    setEditOfferId(offer.id);
    setOfferType(offer.type);
    setFormData({
      name: offer.name,
      discountType: offer.discountType,
      discountValue: offer.discountValue.toString(),
      minAmount: offer.minAmount ? offer.minAmount.toString() : "",
      priority: offer.priority ? offer.priority.toString() : "0",
      planId: offer.planId || "",
      isFreeDelivery: offer.isFreeDelivery,
      isActive: offer.isActive,
    });
    setIsModalOpen(true);
  };

  async function handleDelete(id: string) {
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

  const filteredOffers = offers.filter(offer => 
    offer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && offers.length === 0) return <div className="text-center text-muted-foreground py-8">Loading offers...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Offer Management</h1>
        <Button onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }} className="w-full sm:w-auto min-h-[44px]">Create New Offer</Button>
      </div>

      <div className="mb-6">
        <Input 
          placeholder="Search offers by name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md min-h-[44px] text-base"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted border-b">
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
              {filteredOffers.map(offer => (
                <tr key={offer.id} className="border-b">
                  <td className="p-4 font-medium">{offer.name}</td>
                  <td className="p-4">{offer.type === 'AMOUNT_BASED' ? 'Custom Package' : 'Fixed Package'}</td>
                  <td className="p-4">
                    {offer.discountValue}{offer.discountType === 'PERCENTAGE' ? '%' : ' ৳'}
                    {offer.isFreeDelivery && ' + Free Delivery'}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {offer.type === 'AMOUNT_BASED' 
                      ? `Min: ৳${offer.minAmount || 0} (Pri: ${offer.priority})`
                      : `Plan: ${offer.plan?.name || 'N/A'}`
                    }
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${offer.isActive ? 'bg-success-bg text-green-800' : 'bg-danger-bg text-red-800'}`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]" onClick={() => handleEdit(offer)}>Edit</Button>
                    <Button variant="destructive" size="sm" className="min-h-[44px] min-w-[44px]" onClick={() => handleDelete(offer.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
              {filteredOffers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">No offers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <div className="font-bold text-base text-foreground">{offer.name}</div>
                <span className={`px-2 py-1 text-xs rounded font-bold shrink-0 ${offer.isActive ? 'bg-success-bg text-green-800' : 'bg-danger-bg text-red-800'}`}>
                  {offer.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground block">Type:</span> {offer.type === 'AMOUNT_BASED' ? 'Custom Pkg' : 'Fixed Pkg'}</div>
                <div><span className="text-muted-foreground block">Discount:</span> <span className="font-bold">{offer.discountValue}{offer.discountType === 'PERCENTAGE' ? '%' : ' ৳'}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground block">Details:</span> 
                  {offer.type === 'AMOUNT_BASED' 
                    ? `Min: ৳${offer.minAmount || 0} (Pri: ${offer.priority})`
                    : `Plan: ${offer.plan?.name || 'N/A'}`
                  }
                  {offer.isFreeDelivery && <span className="block text-success-text font-medium mt-1">+ Free Delivery</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-2 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => handleEdit(offer)}>Edit</Button>
                <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => handleDelete(offer.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {filteredOffers.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No offers found.</div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t bg-muted">
            <Button
              variant="outline"
              className="min-h-[44px]"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-base font-medium">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              className="min-h-[44px]"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute top-4 right-4"><X className="w-5 h-5 text-muted-foreground" /></button>
            <h2 className="text-2xl font-bold mb-4">{editOfferId ? "Edit Offer" : "Create Offer"}</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-2">
              <Button 
                variant={offerType === "AMOUNT_BASED" ? "default" : "outline"} 
                onClick={() => setOfferType("AMOUNT_BASED")}
                className="flex-1 min-h-[44px] text-base"
              >
                Amount Based
              </Button>
              <Button 
                variant={offerType === "FIXED_PACKAGE" ? "default" : "outline"} 
                onClick={() => setOfferType("FIXED_PACKAGE")}
                className="flex-1 min-h-[44px] text-base"
              >
                Fixed Package
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-base font-medium">Offer Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="min-h-[44px] text-base mt-1" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-base font-medium">Discount Type</label>
                  <select 
                    className="w-full border rounded-md min-h-[44px] px-3 text-base mt-1"
                    value={formData.discountType} 
                    onChange={e => setFormData({...formData, discountType: e.target.value})}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="text-base font-medium">Discount Value</label>
                  <Input type="number" min="0" step="any" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} required className="min-h-[44px] text-base mt-1" />
                </div>
              </div>

              {offerType === "AMOUNT_BASED" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-medium">Minimum Amount (৳)</label>
                      <Input type="number" min="0" value={formData.minAmount} onChange={e => setFormData({...formData, minAmount: e.target.value})} className="min-h-[44px] text-base mt-1" />
                    </div>
                    <div>
                      <label className="text-base font-medium">Priority (Higher = Better)</label>
                      <Input type="number" min="0" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="min-h-[44px] text-base mt-1" />
                    </div>
                  </div>
                  <label className="flex items-center space-x-3 text-base cursor-pointer p-2 rounded hover:bg-muted min-h-[44px]">
                    <input type="checkbox" className="w-5 h-5 cursor-pointer" checked={formData.isFreeDelivery} onChange={e => setFormData({...formData, isFreeDelivery: e.target.checked})} />
                    <span>Includes Free Delivery</span>
                  </label>
                </>
              ) : (
                <div>
                  <label className="text-base font-medium">Select Fixed Plan</label>
                  <select 
                    className="w-full border rounded-md min-h-[44px] px-3 text-base mt-1"
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

              <label className="flex items-center space-x-3 text-base cursor-pointer p-2 rounded hover:bg-muted min-h-[44px]">
                <input type="checkbox" className="w-5 h-5 cursor-pointer" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                <span>Active Status</span>
              </label>

              <Button type="submit" className="w-full min-h-[44px] text-base mt-4">{editOfferId ? "Save Changes" : "Create Offer"}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
