"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { CategorySidebar, Category } from "@/components/CategorySidebar";
import { BrandSidebar, Brand } from "@/components/BrandSidebar";
import { PriceFilter } from "@/components/PriceFilter";
import { Filter } from "lucide-react";
import { Suspense } from "react";

function BuilderContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Search and Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number; product: any }[]>([]);
  const [deliveryDay, setDeliveryDay] = useState<number | string>(5);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const { user, openAuthModal, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    
    // Fetch categories
    axios.get(`${apiUrl}/categories`).then(res => {
      const data = res.data;
      const map = new Map<string, Category>();
      const roots: Category[] = [];
      data.forEach((item: any) => map.set(item.id, { ...item, children: [] }));
      data.forEach((item: any) => {
        if (item.parentId) {
          const parent = map.get(item.parentId);
          if (parent) parent.children!.push(map.get(item.id)!);
        } else {
          roots.push(map.get(item.id)!);
        }
      });
      setCategories(roots);
    }).catch(console.error);
      
    // Fetch brands
    axios.get(`${apiUrl}/brands`).then(res => setBrands(res.data?.data || res.data)).catch(console.error);
  }, []);

  const fetchProducts = () => {
    setLoadingProducts(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    
    let url = searchQuery && searchQuery.trim().length > 0 
      ? `${apiUrl}/products/search?q=${encodeURIComponent(searchQuery)}&` 
      : `${apiUrl}/products?`;

    url += `page=${page}&limit=12&`;
    
    if (categorySlug) url += `categoryId=${categorySlug}&`;
    if (minPrice !== null) url += `minPrice=${minPrice}&`;
    if (maxPrice !== null) url += `maxPrice=${maxPrice}&`;
    if (selectedBrands.length > 0) url += `brands=${encodeURIComponent(JSON.stringify(selectedBrands))}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data.data?.data || data.data || data);
        if (data.meta?.totalPages) setTotalPages(data.meta.totalPages);
        else if (data.data?.meta?.totalPages) setTotalPages(data.data.meta.totalPages);
      })
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoadingProducts(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, categorySlug, minPrice, maxPrice, selectedBrands]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, categorySlug, minPrice, maxPrice, selectedBrands]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/active`)
      .then(res => res.json())
      .then(data => setActiveOffers(data))
      .catch(err => console.error("Error fetching offers:", err));
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

  const subtotalPrice = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const eligibleOffer = activeOffers.find(o => !o.minAmount || subtotalPrice >= o.minAmount);
  
  const sortedOffers = [...activeOffers].sort((a, b) => (a.minAmount || 0) - (b.minAmount || 0));
  const nextOffer = sortedOffers.find(o => o.minAmount && subtotalPrice < o.minAmount);

  let discountAmount = 0;
  if (eligibleOffer) {
    if (eligibleOffer.discountType === 'PERCENTAGE') {
      discountAmount = (subtotalPrice * eligibleOffer.discountValue) / 100;
    } else {
      discountAmount = eligibleOffer.discountValue;
    }
  }
  const totalPrice = Math.max(0, subtotalPrice - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to create a subscription");
      openAuthModal('login');
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
    <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      <div className="md:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Custom Package Builder</h1>
            <p className="text-muted-foreground mt-1">Select at least 2 items to build your monthly business package.</p>
          </div>
        </div>

        {/* Search & Filter Toggle Bar */}
        <div className="flex gap-2 mb-4 relative z-10">
          <Input 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white"
          />
          <Button 
            variant={isFilterOpen ? "default" : "outline"}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Filter Panel (Collapsible) */}
        {isFilterOpen && (
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="max-h-60 overflow-y-auto pr-2">
                <CategorySidebar categories={categories} basePath="/subscriptions/builder" />
              </div>
            </div>
            {brands.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Brands</h3>
                <div className="max-h-60 overflow-y-auto pr-2">
                  <BrandSidebar 
                    brands={brands} 
                    selectedBrands={selectedBrands} 
                    onChange={setSelectedBrands} 
                  />
                </div>
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-3">Price</h3>
              <PriceFilter 
                minPrice={minPrice} 
                maxPrice={maxPrice} 
                onApply={(min, max) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loadingProducts ? (
            <p className="text-muted-foreground p-4">Loading products...</p>
          ) : (
            products.map((p: any) => (
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
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!loadingProducts && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm font-medium">Page {page} of {totalPages}</span>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="bg-muted p-6 rounded-lg h-fit border sticky top-24">
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeItem(item.productId)}>✕</Button>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 font-bold">
              <div className="flex justify-between text-muted-foreground font-normal mb-1">
                <span>Subtotal:</span>
                <span>৳{subtotalPrice}</span>
              </div>
              {eligibleOffer && (
                <div className="flex justify-between text-success-text mb-2">
                  <span>
                    Discount ({eligibleOffer.discountType === 'PERCENTAGE' ? `${eligibleOffer.discountValue}%` : `৳${eligibleOffer.discountValue}`}):
                  </span>
                  <span>-৳{discountAmount}</span>
                </div>
              )}
              {eligibleOffer?.isFreeDelivery && (
                <div className="flex justify-between text-success-text text-sm mb-2 font-normal">
                  <span>+ Free Delivery</span>
                </div>
              )}
              {nextOffer && (
                <div className="text-sm text-info-text font-normal mb-2 bg-info-bg p-2 rounded">
                  Add ৳{nextOffer.minAmount - subtotalPrice} more to get {nextOffer.discountType === 'PERCENTAGE' ? `${nextOffer.discountValue}%` : `৳${nextOffer.discountValue}`} OFF{nextOffer.isFreeDelivery && ' + Free Delivery'}!
                </div>
              )}
              <div className="flex justify-between text-lg mt-2">
                <span>Total / Month:</span>
                <span>৳{totalPrice}</span>
              </div>
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

export default function CustomPackageBuilder() {
  return (
    <Suspense fallback={<p className="p-10 text-center">Loading builder...</p>}>
      <BuilderContent />
    </Suspense>
  );
}
