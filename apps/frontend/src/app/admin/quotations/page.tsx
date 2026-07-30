"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

export default function AdminQuotations() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyData, setReplyData] = useState<{ [id: string]: { offeredPrice: number, adminNotes: string } }>({});
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setQuotations(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRespond = async (id: string) => {
    const data = replyData[id];
    if (!data || !data.offeredPrice) {
      toast.error("Please provide an offered price.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations/admin/${id}/respond`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success("Quote response sent!");
        setQuotations(quotations.map((q: any) => q.id === id ? { ...q, status: 'QUOTED', offeredPrice: data.offeredPrice, adminNotes: data.adminNotes } : q));
      }
    } catch (err) {
      toast.error("Failed to respond to quote.");
    }
  };

  const updateReply = (id: string, field: string, value: any) => {
    setReplyData({
      ...replyData,
      [id]: { ...replyData[id], [field]: value }
    });
  };

  if (loading) return <div className="p-6">Loading quotations...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Business Quotations</h1>
      
      <div className="space-y-6">
        {quotations.map((quote: any) => (
          <div key={quote.id} className="bg-white rounded-lg shadow-sm border p-6 flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{quote.companyName}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  quote.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  quote.status === 'QUOTED' ? 'bg-info-bg text-primary-700' :
                  quote.status === 'ACCEPTED' ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-destructive'
                }`}>
                  {quote.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Contact: {quote.contactNumber} | {quote.contactEmail}</p>
              
              <div className="bg-muted p-4 rounded-md mt-4">
                <p><strong>Requested Product:</strong> {quote.product ? quote.product.name : 'General Pricing Request'}</p>
                <p><strong>Quantity:</strong> {quote.quantity}</p>
                <p><strong>Delivery Location:</strong> {quote.deliveryLocation}</p>
                <p><strong>Deadline:</strong> {quote.deadline ? new Date(quote.deadline).toLocaleDateString() : 'N/A'}</p>
                {quote.instructions && (
                  <p className="mt-2 text-sm italic text-muted-foreground">"{quote.instructions}"</p>
                )}
              </div>
            </div>

            <div className="md:w-1/3 bg-muted p-4 rounded-md border flex flex-col justify-center">
              {quote.status === 'PENDING' ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Send Quote Offer</h4>
                  <div>
                    <label className="text-xs text-muted-foreground">Offered Total Price (৳)</label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 50000" 
                      onChange={(e) => updateReply(quote.id, 'offeredPrice', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Notes / Conditions</label>
                    <textarea 
                      className="w-full text-sm border p-2 rounded" 
                      placeholder="e.g. Delivery in 3 installments"
                      onChange={(e) => updateReply(quote.id, 'adminNotes', e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={() => handleRespond(quote.id)}>Send Offer</Button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">You offered:</p>
                  <p className="text-3xl font-bold text-primary/90">৳{quote.offeredPrice}</p>
                  {quote.adminNotes && <p className="text-xs text-muted-foreground italic">"{quote.adminNotes}"</p>}
                  {quote.status === 'ACCEPTED' && <p className="text-success-text font-bold mt-4">Client Accepted</p>}
                  {quote.status === 'REJECTED' && <p className="text-destructive font-bold mt-4">Client Rejected</p>}
                </div>
              )}
            </div>
          </div>
        ))}

        {quotations.length === 0 && (
          <div className="p-8 text-center bg-white rounded-lg border text-muted-foreground">No quotation requests found.</div>
        )}
      </div>
    </div>
  );
}
