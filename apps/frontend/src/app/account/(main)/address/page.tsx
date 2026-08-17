'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function AddressBookPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [addresses, setAddresses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    postcode: '',
    phone: '',
    label: 'HOME',
    isDefaultShipping: false,
    isDefaultBilling: false
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchAddresses();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  async function fetchAddresses() {
    try {
      const res = await apiClient.get('/addresses');
      setAddresses(res.data);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  };

  const handleOpenModal = (address: any = null) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        fullName: address.fullName,
        address: address.address,
        postcode: address.postcode,
        phone: address.phone,
        label: address.label,
        isDefaultShipping: address.isDefaultShipping,
        isDefaultBilling: address.isDefaultBilling
      });
    } else {
      setEditingId(null);
      setFormData({
        fullName: '',
        address: '',
        postcode: '',
        phone: '',
        label: 'HOME',
        isDefaultShipping: false,
        isDefaultBilling: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/addresses/${editingId}`, formData);
        toast.success('Address updated successfully');
      } else {
        await apiClient.post('/addresses', formData);
        toast.success('Address added successfully');
      }
      handleCloseModal();
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  async function handleMakeDefaultShipping(id: string) {
    try {
      await apiClient.patch(`/addresses/${id}/default-shipping`);
      toast.success('Default shipping address updated');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to update default shipping address');
    }
  };

  async function handleMakeDefaultBilling(id: string) {
    try {
      await apiClient.patch(`/addresses/${id}/default-billing`);
      toast.success('Default billing address updated');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to update default billing address');
    }
  };

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <div className="w-full">
        <div className="flex justify-between items-end mb-4 gap-3">
          <h2 className="text-[22px] text-foreground font-normal">Address Book</h2>
          <button
            onClick={() => handleOpenModal()}
              >
                <span className="text-lg leading-none">+</span> ADD NEW ADDRESS
              </button>
            </div>

            {!isDesktop ? (
              addresses.length === 0 ? (
                <div className="bg-white border border-border p-6 text-center text-base text-muted-foreground">
                  No addresses found. Please add a new address.
                </div>
              ) : (
                <ul className="space-y-3">
                  {addresses.map(address => (
                    <li key={address.id} className="bg-white border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base font-semibold text-foreground">{address.fullName}</p>
                            {address.label && (
                              <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 uppercase">
                                {address.label}
                              </span>
                            )}
                          </div>
                          <p className="text-base text-foreground leading-snug mt-1">{address.address}</p>
                          <p className="text-base text-muted-foreground mt-1">{address.postcode} · {address.phone}</p>
                        </div>
                        <button
                          onClick={() => handleOpenModal(address)}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center px-3 text-base text-primary hover:underline uppercase"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                        {address.isDefaultShipping ? (
                          <span className="flex min-h-[44px] items-center text-sm font-semibold text-foreground">Default Shipping</span>
                        ) : (
                          <button onClick={() => handleMakeDefaultShipping(address.id)} className="flex min-h-[44px] items-center px-3 text-sm text-primary hover:underline py-2">
                            Make default shipping
                          </button>
                        )}
                        {address.isDefaultBilling ? (
                          <span className="flex min-h-[44px] items-center text-sm font-semibold text-foreground">Default Billing</span>
                        ) : (
                          <button onClick={() => handleMakeDefaultBilling(address.id)} className="flex min-h-[44px] items-center px-3 text-sm text-primary hover:underline py-2">
                            Make default billing
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div className="bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[15%]">Full Name</th>
                        <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[35%]">Address</th>
                        <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[20%]">Postcode</th>
                        <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[15%]">Phone Number</th>
                        <th className="py-3 px-4 text-[13px] font-normal text-muted-foreground w-[15%] text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {addresses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground text-[14px]">
                            No addresses found. Please add a new address.
                          </td>
                        </tr>
                      ) : (
                        addresses.map(address => (
                          <tr key={address.id} className="border-b border-border last:border-0 hover:bg-muted transition-colors">
                            <td className="py-4 px-4 align-top">
                              <span className="text-[13px] text-foreground">{address.fullName}</span>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className="flex items-start gap-2">
                                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 whitespace-nowrap uppercase">
                                  {address.label}
                                </span>
                                <span className="text-[13px] text-foreground leading-snug">
                                  {address.address}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <span className="text-[13px] text-foreground leading-snug block">
                                {address.postcode}
                              </span>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <span className="text-[13px] text-foreground">{address.phone}</span>
                            </td>
                            <td className="py-4 px-4 align-top">
                              <div className="flex justify-between items-center h-full">
                                <div className="flex flex-col gap-1">
                                  {address.isDefaultShipping ? (
                                    <span className="text-[11px] text-foreground font-semibold whitespace-nowrap">Default Shipping Address</span>
                                  ) : (
                                    <button onClick={() => handleMakeDefaultShipping(address.id)} className="text-[11px] text-primary whitespace-nowrap text-left hover:underline min-h-[32px] py-1">Make default shipping</button>
                                  )}

                                  {address.isDefaultBilling ? (
                                    <span className="text-[11px] text-foreground font-semibold whitespace-nowrap">Default Billing Address</span>
                                  ) : (
                                    <button onClick={() => handleMakeDefaultBilling(address.id)} className="text-[11px] text-primary whitespace-nowrap text-left hover:underline min-h-[32px] py-1">Make default billing</button>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleOpenModal(address)}
                                  className="text-[13px] text-primary font-normal hover:underline pl-4 uppercase min-h-[44px] min-w-[44px]"
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Address Modal */}
          {isModalOpen && (
            <div role="dialog" aria-modal="true" aria-label={editingId ? 'Edit address' : 'Add new address'} className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-end md:justify-center md:items-center z-50">
              <div className="bg-white shadow-xl w-full max-w-2xl rounded-t-2xl md:rounded-xl max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:fade-in duration-300">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl md:rounded-t-xl">
                  <h2 className="text-xl font-semibold">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                  <button onClick={handleCloseModal} aria-label="Close dialog" autoFocus className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-black">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <form onSubmit={handleSaveAddress} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="address-fullName" className="block text-base font-medium text-foreground mb-2">Full Name</label>
                      <input id="address-fullName" required type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} autoComplete="name" className="h-12 w-full border border-input px-3 text-base focus:border-primary" />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="address-details" className="block text-base font-medium text-foreground mb-2">Address Details</label>
                      <input id="address-details" required type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} autoComplete="street-address" className="h-12 w-full border border-input px-3 text-base focus:border-primary" placeholder="House/Apartment, Road, Area" />
                    </div>
                    <div>
                      <label htmlFor="address-postcode" className="block text-base font-medium text-foreground mb-2">Postcode / ZIP</label>
                      <input id="address-postcode" required type="text" inputMode="numeric" value={formData.postcode} onChange={(e) => setFormData({ ...formData, postcode: e.target.value })} autoComplete="postal-code" className="h-12 w-full border border-input px-3 text-base focus:border-primary" />
                    </div>
                    <div>
                      <label htmlFor="address-phone" className="block text-base font-medium text-foreground mb-2">Phone Number</label>
                      <input id="address-phone" required type="text" inputMode="numeric" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} autoComplete="tel" className="h-12 w-full border border-input px-3 text-base focus:border-primary" />
                    </div>
                    <div>
                      <label htmlFor="address-label" className="block text-base font-medium text-foreground mb-2">Label</label>
                      <select id="address-label" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="h-12 w-full border border-input px-3 text-base bg-white focus:border-primary">
                        <option value="HOME">HOME</option>
                        <option value="OFFICE">OFFICE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 mt-2 space-y-2">
                      <label className="flex min-h-11 items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.isDefaultShipping} onChange={(e) => setFormData({ ...formData, isDefaultShipping: e.target.checked })} className="h-5 w-5 text-primary/90 focus:ring-primary-500" />
                        <span className="text-base text-foreground">Make this my default shipping address</span>
                      </label>
                      <label className="flex min-h-11 items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={formData.isDefaultBilling} onChange={(e) => setFormData({ ...formData, isDefaultBilling: e.target.checked })} className="h-5 w-5 text-primary/90 focus:ring-primary-500" />
                        <span className="text-base text-foreground">Make this my default billing address</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={handleCloseModal} className="flex min-h-12 items-center px-6 border border-input font-medium hover:bg-muted">CANCEL</button>
                    <button type="submit" className="flex min-h-12 items-center bg-primary px-8 font-medium text-white hover:bg-primary/90 transition">SAVE</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
        );
}
