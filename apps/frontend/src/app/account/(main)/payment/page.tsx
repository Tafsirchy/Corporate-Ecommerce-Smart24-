'use client';
import { useAuth, apiClient } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function PaymentOptionsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    provider: 'NAGAD',
    accountNumber: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchPaymentOptions();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!isModalOpen && !deleteConfirmId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setDeleteConfirmId(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen, deleteConfirmId]);

  async function fetchPaymentOptions() {
    try {
      const res = await apiClient.get('/payment-options');
      setPaymentOptions(res.data);
    } catch (err) {
      console.error('Failed to fetch payment options', err);
    }
  };

  async function handleDelete(id: string) {
    setDeleteConfirmId(id);
  };

  async function executeDelete() {
    if (!deleteConfirmId) return;
    try {
      await apiClient.delete(`/payment-options/${deleteConfirmId}`);
      toast.success('Payment method removed');
      setDeleteConfirmId(null);
      fetchPaymentOptions();
    } catch (err) {
      toast.error('Failed to remove payment method');
    }
  };

  async function handleSavePaymentMethod(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient.post('/payment-options', formData);
      toast.success('Payment method added successfully');
      setIsModalOpen(false);
      setFormData({ provider: 'NAGAD', accountNumber: '' });
      fetchPaymentOptions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save payment method');
    }
  };

  const renderLogo = (provider: string) => {
    if (provider === 'NAGAD') {
      return (
        <div className="flex h-8 w-14 items-center justify-center bg-muted text-[13px] font-bold text-foreground whitespace-nowrap">Nagad</div>
      );
    }
    if (provider === 'BKASH') {
      return (
        <div className="flex h-8 w-14 items-center justify-center bg-muted text-[13px] font-bold text-foreground whitespace-nowrap">bKash</div>
      );
    }
    if (provider === 'ROCKET') {
      return (
        <div className="flex h-8 w-14 items-center justify-center bg-muted text-[13px] font-bold text-foreground whitespace-nowrap">Rocket</div>
      );
    }
    return <div className="flex h-8 w-14 items-center justify-center bg-muted text-[13px] font-bold text-foreground whitespace-nowrap">{provider}</div>;
  };

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <>
      {/* Main Content Area */}
      <div className="w-full">
          <div className="mb-6 flex justify-between items-end gap-3">
            <div>
              <h2 className="text-[22px] text-foreground font-normal mb-6">My Payment Options</h2>
              <h3 className="text-[18px] text-foreground font-normal">Select Payment Method</h3>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex min-h-12 items-center gap-2 bg-primary px-6 text-base font-medium text-white hover:bg-primary/90 transition uppercase"
            >
              <span className="text-lg leading-none">+</span> ADD
            </button>
          </div>
          
          <div className="bg-white p-6 shadow-sm">
            <h4 className="text-base text-foreground font-normal mb-4">Digital Wallet</h4>
            
            {paymentOptions.length === 0 ? (
              <div className="py-8 text-center text-base text-muted-foreground">No saved payment methods found.</div>
            ) : !isDesktop ? (
              <ul className="space-y-3">
                {paymentOptions.map(option => (
                  <li key={option.id} className="border border-border p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {renderLogo(option.provider)}
                      <span className="text-base text-foreground">
                        {option.accountNumber.length > 5
                          ? option.accountNumber.slice(0, 3) + '*****' + option.accountNumber.slice(-3)
                          : option.accountNumber}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(option.id)} className="flex min-h-[44px] min-w-[44px] items-center justify-center px-3 text-base text-primary hover:underline uppercase">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ScrollFade className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[20%]">Card Number</th>
                      <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[60%]"></th>
                      <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[20%] text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentOptions.map((option) => (
                      <tr key={option.id} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="py-6 px-4 align-middle">
                          <div className="flex items-center gap-4">
                            {renderLogo(option.provider)}
                            <span className="text-[14px] text-foreground font-normal">
                              {option.accountNumber.length > 5 
                                ? option.accountNumber.slice(0, 3) + '*****' + option.accountNumber.slice(-3) 
                                : option.accountNumber}
                            </span>
                          </div>
                        </td>
                        <td className="py-6 px-4 align-middle"></td>
                        <td className="py-6 px-4 align-middle text-right">
                          <button onClick={() => handleDelete(option.id)} className="flex min-h-[44px] min-w-[44px] items-center justify-center px-3 text-base text-primary hover:underline uppercase ml-auto">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollFade>
            )}
    </div>
      </div>
      {/* Add Payment Method Modal */}
      {isModalOpen && (
        <div role="dialog" aria-modal="true" aria-label="Add payment method" className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-end md:justify-center md:items-center z-50">
          <ScrollFade className="bg-white shadow-xl w-full max-w-md rounded-t-2xl md:rounded-xl max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:fade-in duration-300">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl md:rounded-t-xl">
              <h2 className="text-xl font-semibold">Add Payment Method</h2>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close dialog" autoFocus className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSavePaymentMethod} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="payment-provider" className="block text-base font-medium text-foreground mb-2">Provider</label>
                  <select 
                    id="payment-provider"
                    value={formData.provider} 
                    onChange={(e) => setFormData({...formData, provider: e.target.value})} 
                    className="h-12 w-full border border-input px-3 text-base bg-white focus:border-primary"
                  >
                    <option value="NAGAD">Nagad</option>
                    <option value="BKASH">bKash</option>
                    <option value="ROCKET">Rocket</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="payment-account" className="block text-base font-medium text-foreground mb-2">Account Number</label>
                  <input 
                    id="payment-account"
                    required 
                    type="text" 
                    inputMode="numeric"
                    value={formData.accountNumber} 
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} 
                    autoComplete="off"
                    className="h-12 w-full border border-input px-3 text-base focus:border-primary" 
                    placeholder="e.g. 01700000000"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex min-h-12 items-center px-6 border border-input font-medium hover:bg-muted">CANCEL</button>
                <button type="submit" className="flex min-h-12 items-center bg-primary px-8 font-medium text-white hover:bg-primary/90 transition">SAVE</button>
              </div>
            </form>
          </ScrollFade>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div role="dialog" aria-modal="true" aria-label="Confirm delete" className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-end md:justify-center md:items-center z-50">
          <div className="bg-white shadow-xl w-full max-w-sm rounded-t-2xl md:rounded-xl pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:fade-in duration-300">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl md:rounded-t-xl">
              <h2 className="text-xl font-semibold">Remove Method?</h2>
              <button onClick={() => setDeleteConfirmId(null)} aria-label="Close dialog" className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-base text-muted-foreground mb-8">Are you sure you want to remove this payment method? This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setDeleteConfirmId(null)} className="flex min-h-12 items-center px-6 border border-input font-medium hover:bg-muted">CANCEL</button>
                <button type="button" onClick={executeDelete} className="flex min-h-12 items-center bg-red-600 px-8 font-medium text-white hover:bg-red-700 transition">DELETE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
