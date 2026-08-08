"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Link from "next/link";

export default function MyQuotationsPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations/my-quotes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setQuotes(data.data || data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotations/${id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Quote ${action}ed successfully!`);
        setQuotes(quotes.map((q: any) => q.id === id ? { ...q, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' } : q));
      }
    } catch (err) {
      toast.error("Failed to perform action");
    }
  };

  if (!user) return <div className="p-6">Please login to view quotes.</div>;
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Quotations</h1>
        <Link href="/quotes">
          <Button>Request New Quote</Button>
        </Link>
      </div>
      
      {quotes.length === 0 ? (
        <p>You have not requested any quotes.</p>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote: any) => (
            <div key={quote.id} className="border p-6 rounded-lg bg-white shadow-sm flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Quote #{quote.id.slice(-6)}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Status: <span className={`font-bold uppercase ${
                    quote.status === 'QUOTED' ? 'text-primary/90' : 
                    quote.status === 'ACCEPTED' ? 'text-success-text' :
                    quote.status === 'REJECTED' ? 'text-destructive' : 'text-yellow-600'
                  }`}>{quote.status}</span>
                </p>
                <div className="space-y-1 mb-4 text-sm">
                  <p><strong>Product:</strong> {quote.product ? quote.product.name : 'General Request'}</p>
                  <p><strong>Quantity:</strong> {quote.quantity}</p>
                  <p><strong>Deadline:</strong> {quote.deadline ? new Date(quote.deadline).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center bg-muted p-4 rounded-md min-w-[250px]">
                {quote.status === 'PENDING' && (
                  <p className="text-sm text-center text-muted-foreground">Admin is reviewing your request.</p>
                )}
                {quote.status === 'QUOTED' && (
                  <>
                    <p className="text-center text-sm font-bold mb-1">Admin Offer</p>
                    <p className="text-center text-2xl text-primary/90 font-bold mb-2">৳{quote.offeredPrice}</p>
                    {quote.adminNotes && (
                      <p className="text-xs text-center text-muted-foreground mb-4 italic">"{quote.adminNotes}"</p>
                    )}
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction(quote.id, 'accept')}>Accept</Button>
                      <Button className="flex-1" variant="destructive" onClick={() => handleAction(quote.id, 'reject')}>Reject</Button>
                    </div>
                  </>
                )}
                {quote.status === 'ACCEPTED' && (
                  <div className="text-center">
                    <p className="text-success-text font-bold mb-2">Offer Accepted (৳{quote.offeredPrice})</p>
                    <p className="text-xs text-muted-foreground">We will contact you to finalize the order.</p>
                  </div>
                )}
                {quote.status === 'REJECTED' && (
                  <p className="text-destructive font-bold text-center">Offer Rejected</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
