'use client';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AddressBookPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

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

  const fetchAddresses = async () => {
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

  const handleSaveAddress = async (e: React.FormEvent) => {
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

  const handleMakeDefaultShipping = async (id: string) => {
    try {
      await apiClient.patch(`/addresses/${id}/default-shipping`);
      toast.success('Default shipping address updated');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to update default shipping address');
    }
  };

  const handleMakeDefaultBilling = async (id: string) => {
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
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          {/* ... Keep the existing sidebar ... */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-1">Hello, {user.name || user.phone || (user.email ? user.email.split('@')[0] : 'User')}</p>
            <div className="inline-flex items-center gap-1 bg-[#4CAF50] text-white text-xs font-semibold px-2 py-1 rounded-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Verified Account
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Link href="/account">
                <h3 className="text-[15px] font-semibold text-primary-600 mb-2 hover:text-primary-700 cursor-pointer">
                  Manage My Account
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li>
                  <Link href="/account/profile" className="text-gray-500 hover:text-primary-600 text-[14px]">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link href="/account/address" className="text-primary-600 font-semibold text-[14px]">
                    Address Book
                  </Link>
                </li>
                <li>
                  <Link href="/account/payment" className="text-gray-500 hover:text-primary-600 text-[14px]">
                    My Payment Options
                  </Link>
                </li>
                <li>
                  <Link href="/account/wallet" className="text-gray-500 hover:text-primary-600 text-[14px]">
                    Smart Wallet
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Link href="/account">
                <h3 className="text-[15px] font-semibold text-gray-800 mb-2 hover:text-primary-600 cursor-pointer">
                  My Orders
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li>
                  <Link href="/account/returns" className="text-gray-500 hover:text-primary-600 text-[14px]">
                    My Returns
                  </Link>
                </li>
                <li>
                  <Link href="/account/cancellations" className="text-gray-500 hover:text-primary-600 text-[14px]">
                    My Cancellations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-gray-800 hover:text-primary-600 cursor-pointer">
                <Link href="/account/reviews">My Reviews</Link>
              </h3>
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-gray-800 hover:text-primary-600 cursor-pointer">
                <Link href="/wishlist">My Wishlist & Followed Stores</Link>
              </h3>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[22px] text-gray-800 font-normal">Address Book</h2>
            <div className="text-[13px] text-[#1a9cb7]">
              {/* Optional: Add global actions if needed, but per-row makes more sense */}
            </div>
          </div>
          
          <div className="bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="py-3 px-4 text-[13px] font-normal text-gray-500 w-[15%]">Full Name</th>
                    <th className="py-3 px-4 text-[13px] font-normal text-gray-500 w-[35%]">Address</th>
                    <th className="py-3 px-4 text-[13px] font-normal text-gray-500 w-[20%]">Postcode</th>
                    <th className="py-3 px-4 text-[13px] font-normal text-gray-500 w-[15%]">Phone Number</th>
                    <th className="py-3 px-4 text-[13px] font-normal text-gray-500 w-[15%] text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {addresses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 text-[14px]">
                        No addresses found. Please add a new address.
                      </td>
                    </tr>
                  ) : (
                    addresses.map(address => (
                      <tr key={address.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 align-top">
                          <span className="text-[13px] text-gray-800">{address.fullName}</span>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-start gap-2">
                            <span className="bg-[#f57224] text-white text-[10px] px-2 py-0.5 rounded-full mt-0.5 whitespace-nowrap uppercase">
                              {address.label}
                            </span>
                            <span className="text-[13px] text-gray-800 leading-snug">
                              {address.address}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <span className="text-[13px] text-gray-800 leading-snug block">
                            {address.postcode}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <span className="text-[13px] text-gray-800">{address.phone}</span>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex justify-between items-center h-full">
                            <div className="flex flex-col gap-1">
                              {address.isDefaultShipping ? (
                                <span className="text-[11px] text-gray-800 font-semibold whitespace-nowrap">Default Shipping Address</span>
                              ) : (
                                <button onClick={() => handleMakeDefaultShipping(address.id)} className="text-[11px] text-[#1a9cb7] whitespace-nowrap text-left hover:underline">Make default shipping</button>
                              )}
                              
                              {address.isDefaultBilling ? (
                                <span className="text-[11px] text-gray-800 font-semibold whitespace-nowrap">Default Billing Address</span>
                              ) : (
                                <button onClick={() => handleMakeDefaultBilling(address.id)} className="text-[11px] text-[#1a9cb7] whitespace-nowrap text-left hover:underline">Make default billing</button>
                              )}
                            </div>
                            <button 
                              onClick={() => handleOpenModal(address)} 
                              className="text-[13px] text-[#1a9cb7] font-normal hover:underline pl-4 uppercase"
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
            
            <div className="p-6 flex justify-end mt-4">
              <button 
                onClick={() => handleOpenModal()}
                className="bg-[#1a9cb7] text-white px-6 py-2.5 text-[14px] font-medium hover:bg-[#158299] transition uppercase flex items-center gap-2"
              >
                <span className="text-lg leading-none">+</span> ADD NEW ADDRESS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full border p-2 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Details</label>
                  <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border p-2 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="House/Apartment, Road, Area" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postcode / ZIP</label>
                  <input required type="text" value={formData.postcode} onChange={(e) => setFormData({...formData, postcode: e.target.value})} className="w-full border p-2 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input required type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <select value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} className="w-full border p-2 rounded focus:ring-primary-500 focus:border-primary-500">
                    <option value="HOME">HOME</option>
                    <option value="OFFICE">OFFICE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.isDefaultShipping} onChange={(e) => setFormData({...formData, isDefaultShipping: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">Make this my default shipping address</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.isDefaultBilling} onChange={(e) => setFormData({...formData, isDefaultBilling: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">Make this my default billing address</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 border rounded hover:bg-gray-50 font-medium">CANCEL</button>
                <button type="submit" className="bg-[#1a9cb7] text-white px-8 py-2 rounded font-medium hover:bg-[#158299] transition">SAVE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
