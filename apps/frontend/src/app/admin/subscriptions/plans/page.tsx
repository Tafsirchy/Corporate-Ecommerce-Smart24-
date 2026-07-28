"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import Link from "next/link";
import { X, Plus } from "lucide-react";

export default function AdminSubscriptionPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { token } = useAuth();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  
  // Product Search State
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected Items for Plan
  const [selectedItems, setSelectedItems] = useState<{product: any, quantity: number}[]>([]);

  useEffect(() => {
    fetchPlans();
    fetchProducts();
  }, [token]);

  const fetchPlans = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans`);
      if (res.ok) setPlans(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=100`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || json.products || (Array.isArray(json) ? json : []));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = (product: any) => {
    if (selectedItems.find(i => i.product.id === product.id)) return;
    setSelectedItems([...selectedItems, { product, quantity: 1 }]);
    setSearchTerm("");
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: newQ > 0 ? newQ : 1 };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(i => i.product.id !== productId));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        items: selectedItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans`;
        
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingId ? "Plan updated successfully" : "Plan created successfully");
        setIsModalOpen(false);
        fetchPlans();
        resetForm();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to save plan");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setName(plan.name);
    setDescription(plan.description || "");
    setPrice(plan.price.toString());
    setSelectedItems(
      (plan.items || []).map((item: any) => ({
        product: item.product,
        quantity: item.quantity
      }))
    );
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/plans/${id}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (res.ok) {
        toast.success("Plan status updated");
        fetchPlans();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setSelectedItems([]);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage fixed subscription packages</p>
        </div>
        <div className="space-x-4">
          <Link href="/admin/subscriptions">
            <Button variant="outline">Back to Subscriptions</Button>
          </Link>
          <Button onClick={openCreateModal}>Create New Plan</Button>
        </div>
      </div>

      {loading ? (
        <p>Loading plans...</p>
      ) : plans.length === 0 ? (
        <div className="text-center p-8 bg-white rounded shadow text-muted-foreground">No plans found. Create one above.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: any) => (
            <div key={plan.id} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${plan.isActive ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-destructive'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 flex-grow">{plan.description}</p>
              
              <div className="mb-4 bg-muted p-3 rounded">
                <p className="text-xs font-semibold mb-2">Included Items:</p>
                {plan.items && plan.items.length > 0 ? (
                  <ul className="text-xs space-y-1">
                    {plan.items.map((item: any) => (
                      <li key={item.id}>• {item.product?.name || "Unknown Product"} (x{item.quantity})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No items specified</p>
                )}
              </div>

              <div className="text-xl font-bold border-t pt-4">
                ৳{plan.price} <span className="text-sm font-normal text-muted-foreground">/ month</span>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                  Edit
                </Button>
                <Button 
                  variant={plan.isActive ? "destructive" : "default"} 
                  size="sm" 
                  onClick={() => handleToggleActive(plan.id, plan.isActive)}
                >
                  {plan.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6">{editingId ? "Edit Plan" : "Create New Fixed Plan"}</h2>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Plan Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Office Basics" />
                </div>
                <div>
                  <label className="text-sm font-medium">Monthly Price (৳)</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="e.g. 5000" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Briefly describe what's included..." />
              </div>

              <div className="border-t pt-4 mt-4">
                <label className="text-sm font-medium mb-2 block">Included Products</label>
                
                {selectedItems.length > 0 && (
                  <div className="space-y-2 mb-4 bg-muted p-4 rounded border">
                    {selectedItems.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                        <span className="text-sm truncate w-1/2">{item.product.name}</span>
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.product.id, -1)}>-</Button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <Button type="button" variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.product.id, 1)}>+</Button>
                          <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(item.product.id)}><X className="w-4 h-4"/></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Input 
                  placeholder="Search products to add..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                
                {searchTerm && (
                  <div className="bg-white border rounded shadow-md max-h-40 overflow-y-auto">
                    {filteredProducts.slice(0, 10).map((product: any) => (
                      <div 
                        key={product.id} 
                        className="p-2 hover:bg-muted cursor-pointer text-sm flex justify-between items-center"
                        onClick={() => handleAddItem(product)}
                      >
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground">৳{product.price}</span>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground">No products found</div>
                    )}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full mt-6">Save Plan</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
