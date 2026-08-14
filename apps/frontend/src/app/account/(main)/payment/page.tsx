'use client';
import { useAuth, apiClient } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function PaymentOptionsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  async function fetchPaymentOptions() {
    try {
      const res = await apiClient.get('/payment-options');
      setPaymentOptions(res.data);
    } catch (err) {
      console.error('Failed to fetch payment options', err);
    }
  };

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to remove this payment method?')) {
      try {
        await apiClient.delete(`/payment-options/${id}`);
        toast.success('Payment method removed');
        fetchPaymentOptions();
      } catch (err) {
        toast.error('Failed to remove payment method');
      }
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
              <div className="md:hidden py-8 text-center text-base text-muted-foreground">No saved payment methods found.</div>
            ) : (
              <ul className="space-y-3 md:hidden">
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
                    <button onClick={() => handleDelete(option.id)} className="flex min-h-11 min-w-16 items-center justify-center px-3 text-base text-primary hover:underline">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[20%]">Card Number</th>
                    <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[60%]"></th>
                    <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[20%] text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {paymentOptions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-muted-foreground text-[14px]">
                        No saved payment methods found.
                      </td>
                    </tr>
                  ) : (
                    paymentOptions.map((option) => (
                      <tr key={option.id} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="py-6 px-4 align-middle">
                          <div className="flex items-center gap-4">
                            {renderLogo(option.provider)}
                            <span className="text-[14px] text-foreground font-normal">
                              {/* Mask the account number visually, showing only last 3 digits or just masking middle */}
                              {option.accountNumber.length > 5 
                                ? option.accountNumber.slice(0, 3) + '*****' + option.accountNumber.slice(-3) 
                                : option.accountNumber}
                            </span>
                          </div>
</td>
                        <td className="py-6 px-4 align-middle text-right">
                          <button onClick={() => handleDelete(option.id)} className="flex min-h-11 min-w-16 items-center justify-center px-3 text-base text-primary hover:underline">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
    </div>
      </div>

      {/* Add Payment Method Modal */}
      {isModalOpen && (
        <div role="dialog" aria-modal="true" aria-label="Add payment method" className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white shadow-xl w-full max-w-md pb-[env(safe-area-inset-bottom)]">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Payment Method</h2>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close dialog" autoFocus className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-black">
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
          </div>
        </div>
      )}
    </>
  );
}
