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

  const fetchOffers = async () => {
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

  const filteredOffers = offers.filter(offer => 
    offer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && offers.length === 0) return <p className="p-8">Loading offers...</p>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Offer Management</h1>
        <Button onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}>Create New Offer</Button>
      </div>

      <div className="mb-6">
        <Input 
          placeholder="Search offers by name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
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
            {filteredOffers.map(offer => (
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
                <td className="p-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(offer)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(offer.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {filteredOffers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">No offers found.</td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm font-medium">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
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
            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute top-4 right-4"><X className="w-5 h-5 text-gray-400" /></button>
            <h2 className="text-2xl font-bold mb-4">{editOfferId ? "Edit Offer" : "Create Offer"}</h2>
            
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

              <Button type="submit" className="w-full">{editOfferId ? "Save Changes" : "Create Offer"}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
