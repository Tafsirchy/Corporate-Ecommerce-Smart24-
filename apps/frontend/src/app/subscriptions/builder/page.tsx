"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export default function CustomPackageBuilder() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number; product: any }[]>([]);
  const [deliveryDay, setDeliveryDay] = useState<number | string>(5);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data.data?.data || data.data || data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const addItem = (product: any) => {
    if (selectedItems.find(i => i.productId === product.id)) return;
    setSelectedItems([...selectedItems, { productId: product.id, quantity: 1, product }]);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems(selectedItems.map(i => i.productId === productId ? { ...i, quantity } : i));
  };

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(i => i.productId !== productId));
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to create a subscription");
      router.push("/login?redirect=/subscriptions/builder");
      return;
    }
    if (selectedItems.length < 2) {
      toast.error("Please select at least 2 items for a custom package");
      return;
    }
    if (!deliveryAddress || !contactNumber) {
      toast.error("Delivery details are required");
      return;
    }

    try {
      const payload = {
        items: selectedItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
        billingDay: deliveryDay,
        deliveryAddress,
        contactNumber,
        paymentMethod: 'MANUAL' // Defaulting to invoice/manual for subscriptions
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Subscription created successfully!");
        router.push("/my-account/subscriptions");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to create subscription");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold">Custom Package Builder</h1>
        <p className="text-muted-foreground">Select at least 2 items to build your monthly corporate package.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="border p-4 rounded-lg flex items-center justify-between hover:shadow-sm">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-muted-foreground">৳{p.price}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => addItem(p)}
                disabled={!!selectedItems.find(i => i.productId === p.id)}
              >
                {selectedItems.find(i => i.productId === p.id) ? 'Added' : 'Add'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg h-fit border sticky top-24">
        <h2 className="text-xl font-bold mb-4">Your Package</h2>
        {selectedItems.length === 0 ? (
          <p className="text-muted-foreground text-sm mb-4">No items added yet.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {selectedItems.map(item => (
              <div key={item.productId} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">৳{item.product.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    className="w-16 h-8 text-sm" 
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                    min={1}
                  />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => removeItem(item.productId)}>✕</Button>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 flex justify-between font-bold">
              <span>Total / Month:</span>
              <span>৳{totalPrice}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6 border-t pt-4">
          <div>
            <label className="text-sm font-medium">Delivery Day (Every Month)</label>
            <Input type="number" min={1} max={28} value={deliveryDay} onChange={(e) => setDeliveryDay(e.target.value === '' ? '' : parseInt(e.target.value))} required />
            <p className="text-xs text-muted-foreground mt-1">Select a date between 1 and 28.</p>
          </div>
          <div>
            <label className="text-sm font-medium">Delivery Address</label>
            <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Contact Number</label>
            <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={selectedItems.length < 2}>
            Confirm Subscription
          </Button>
        </form>
      </div>
    </div>
  );
}
