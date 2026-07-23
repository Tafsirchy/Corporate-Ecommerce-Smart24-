'use client';
import { useAuth, apiClient } from '../../../context/AuthContext';
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

  const fetchPaymentOptions = async () => {
    try {
      const res = await apiClient.get('/payment-options');
      setPaymentOptions(res.data);
    } catch (err) {
      console.error('Failed to fetch payment options', err);
    }
  };

  const handleDelete = async (id: string) => {
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

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
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
        <div className="w-[45px] h-[30px] relative flex items-center justify-center">
          <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" alt="Nagad" className="object-contain max-h-[30px]"
               onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
          <span className="hidden text-[#ed1c24] font-bold text-[12px] italic">Nagad</span>
        </div>
      );
    }
    if (provider === 'BKASH') {
      return (
        <div className="w-[45px] h-[30px] relative flex items-center justify-center">
          <img src="https://download.logo.wine/logo/BKash/BKash-Logo.wine.png" alt="bKash" className="object-contain max-h-[30px]"
               onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
          <span className="hidden text-[#e2136e] font-bold text-[12px]">bKash</span>
        </div>
      );
    }
    if (provider === 'ROCKET') {
      return (
        <div className="w-[45px] h-[30px] relative flex items-center justify-center">
          <div className="text-purple-600 font-bold text-[12px]">Rocket</div>
        </div>
      );
    }
    return <div className="font-bold text-[12px]">{provider}</div>;
  };

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <button onClick={logout} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition">
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* User Status */}
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
                <li><Link href="/account/profile" className="text-gray-500 hover:text-primary-600 text-[14px]">My Profile</Link></li>
                <li><Link href="/account/address" className="text-gray-500 hover:text-primary-600 text-[14px]">Address Book</Link></li>
                <li><Link href="/account/payment" className="text-primary-600 font-semibold text-[14px]">My Payment Options</Link></li>
              </ul>
            </div>
            <div>
              <Link href="/account/orders"><h3 className="text-[15px] font-semibold text-gray-800 mb-2 hover:text-primary-600 cursor-pointer">My Orders</h3></Link>
              <ul className="space-y-2 pl-4">
                <li><Link href="/account/returns" className="text-gray-500 hover:text-primary-600 text-[14px]">My Returns</Link></li>
                <li><Link href="/account/cancellations" className="text-gray-500 hover:text-primary-600 text-[14px]">My Cancellations</Link></li>
              </ul>
            </div>
            <div><h3 className="text-[15px] font-semibold text-gray-800 hover:text-primary-600 cursor-pointer"><Link href="/account/reviews">My Reviews</Link></h3></div>
            <div><h3 className="text-[15px] font-semibold text-gray-800 hover:text-primary-600 cursor-pointer"><Link href="/account/wishlist">My Wishlist & Followed Stores</Link></h3></div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-[22px] text-gray-800 font-normal mb-6">My Payment Options</h2>
              <h3 className="text-[18px] text-gray-800 font-normal">Select Payment Method</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 shadow-sm">
            <h4 className="text-[14px] text-gray-700 font-normal mb-4">Digital Wallet</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-[13px] font-normal text-gray-500 w-[20%]">Card Number</th>
                    <th className="py-3 px-4 text-[13px] font-normal text-gray-500 w-[60%]">Expiry Date</th>
                    <th className="py-3 px-4 text-[13px] font-normal text-gray-500 w-[20%] text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {paymentOptions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500 text-[14px]">
                        No saved payment methods found.
                      </td>
                    </tr>
                  ) : (
                    paymentOptions.map((option) => (
                      <tr key={option.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-6 px-4 align-middle">
                          <div className="flex items-center gap-4">
                            {renderLogo(option.provider)}
                            <span className="text-[14px] text-gray-800 font-normal">
                              {/* Mask the account number visually, showing only last 3 digits or just masking middle */}
                              {option.accountNumber.length > 5 
                                ? option.accountNumber.slice(0, 3) + '*****' + option.accountNumber.slice(-3) 
                                : option.accountNumber}
                            </span>
                          </div>
                        </td>
                        <td className="py-6 px-4 align-middle">
                          {/* Empty as per screenshot */}
                        </td>
                        <td className="py-6 px-4 align-middle text-right">
                          <button onClick={() => handleDelete(option.id)} className="text-[13px] text-[#1a9cb7] font-normal hover:underline">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#1a9cb7] text-white px-6 py-2.5 text-[14px] font-medium hover:bg-[#158299] transition uppercase flex items-center gap-2"
              >
                <span className="text-lg leading-none">+</span> ADD NEW PAYMENT METHOD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Payment Method</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSavePaymentMethod} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <select 
                    value={formData.provider} 
                    onChange={(e) => setFormData({...formData, provider: e.target.value})} 
                    className="w-full border p-2 rounded focus:ring-[#1a9cb7] focus:border-[#1a9cb7]"
                  >
                    <option value="NAGAD">Nagad</option>
                    <option value="BKASH">bKash</option>
                    <option value="ROCKET">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.accountNumber} 
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} 
                    className="w-full border p-2 rounded focus:ring-[#1a9cb7] focus:border-[#1a9cb7]" 
                    placeholder="e.g. 01700000000"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded hover:bg-gray-50 font-medium">CANCEL</button>
                <button type="submit" className="bg-[#1a9cb7] text-white px-8 py-2 rounded font-medium hover:bg-[#158299] transition">SAVE</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
