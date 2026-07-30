'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

function TrackReturnContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [returnReq, setReturnReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchReturn(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchReturn = async (returnId: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/returns/${returnId}`);
      setReturnReq(res.data);
    } catch (e) {
      toast.error('Failed to load return details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-info-bg text-blue-800';
      case 'REFUNDED': return 'bg-success-bg text-green-800';
      case 'REJECTED': return 'bg-danger-bg text-red-800';
      default: return 'bg-muted text-foreground';
    }
  };

  const renderTimeline = (status: string) => {
    const steps = [
      { id: 'PENDING', label: 'Return Requested' },
      { id: 'APPROVED', label: 'Approved & Processing' },
      { id: 'REFUNDED', label: 'Refund Completed' },
    ];

    let currentStepIndex = 0;
    if (status === 'APPROVED') currentStepIndex = 1;
    if (status === 'REFUNDED') currentStepIndex = 2;
    if (status === 'REJECTED') currentStepIndex = -1; // special case

    if (status === 'REJECTED') {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-danger-bg rounded-lg border border-red-100 mt-6">
          <div className="w-12 h-12 bg-danger-bg text-destructive rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-red-800">Return Rejected</h3>
          <p className="text-sm text-destructive mt-1">Unfortunately, your return request was rejected.</p>
        </div>
      );
    }

    return (
      <div className="relative mt-8">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-muted/80">
          <div style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
        </div>
        <div className="flex justify-between w-full">
          {steps.map((step, index) => (
            <div key={step.id} className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mb-2 ${index <= currentStepIndex ? 'border-primary bg-white' : 'border-border bg-muted'}`}>
                {index < currentStepIndex ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : index === currentStepIndex ? (
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                ) : null}
              </div>
              <span className="text-xs font-semibold">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
      <h1 className="text-3xl font-bold mb-8">Track Return</h1>
      
      {!id ? (
        <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); const val = (e.target as any).returnId.value; if(val) window.location.href = `/track-return?id=${val}` }}>
            <label className="block text-sm font-medium text-foreground mb-2">Return ID</label>
            <input 
              name="returnId"
              type="text" 
              required
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black mb-4"
              placeholder="Enter your return ID"
            />
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 font-medium">
              Track Return
            </button>
          </form>
        </div>
      ) : loading ? (
        <div className="text-center py-12">Loading return details...</div>
      ) : returnReq ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">Return #{returnReq.id.substring(0, 8).toUpperCase()}</h2>
              <p className="text-sm text-muted-foreground">Requested on: {new Date(returnReq.createdAt).toLocaleString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnReq.status)}`}>
              {returnReq.status}
            </span>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              {renderTimeline(returnReq.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
              <div>
                <h3 className="font-bold mb-4 text-foreground">Return Info</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Order ID:</span> <Link href={`/track-order?id=${returnReq.orderId}`} className="text-primary hover:underline">{returnReq.orderId.substring(0, 8).toUpperCase()}</Link></p>
                  <p><span className="font-medium text-foreground">Reason:</span> {returnReq.reason}</p>
                  {returnReq.comments && <p><span className="font-medium text-foreground">Comments:</span> {returnReq.comments}</p>}
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded border">
                <h3 className="font-bold mb-4 text-foreground">Product Info</h3>
                {returnReq.orderItem ? (
                  <div className="flex gap-4">
                    <div className="w-[60px] h-[60px] flex-shrink-0 bg-white rounded border p-1">
                      {returnReq.orderItem.product?.images?.[0] ? (
                        <OptimizedImage src={returnReq.orderItem.product.images[0]} alt="product" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground line-clamp-2">{returnReq.orderItem.product?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Qty: {returnReq.orderItem.quantity}</p>
                      <p className="font-bold text-sm text-foreground mt-1">৳{returnReq.orderItem.priceAtPurchase}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Full Order Return</p>
                )}

                {returnReq.refundAmount && (
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="font-bold text-foreground">Refund Amount:</span>
                    <span className="font-bold text-lg text-primary">৳{returnReq.refundAmount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-destructive bg-danger-bg rounded">
          Return request not found or you do not have permission to view it.
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/account/returns" className="text-primary hover:underline">
          &larr; Back to My Returns
        </Link>
      </div>
    </div>
  );
}

export default function TrackReturnPage() {
  return (
    <Suspense fallback={<div className="container py-10 text-center">Loading tracking information...</div>}>
      <TrackReturnContent />
    </Suspense>
  );
}
