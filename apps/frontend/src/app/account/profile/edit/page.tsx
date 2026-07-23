'use client';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EditProfilePage() {
  const { user, loading, updateProfile, logout } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    birthday: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        birthday: user.birthday || '',
      });
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await updateProfile(formData);
    setIsSubmitting(false);
    if (success) {
      router.push('/account/profile');
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
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-1">Hello, {user.phone || (user.email ? user.email.split('@')[0] : 'User')}</p>
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
                  <Link href="/account/profile" className="text-primary-600 font-semibold text-[14px]">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link href="/account/address" className="text-gray-500 hover:text-primary-600 text-[14px]">
                    Address Book
                  </Link>
                </li>
                <li>
                  <Link href="/account/payment" className="text-gray-500 hover:text-primary-600 text-[14px]">
                    My Payment Options
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
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-[22px] text-gray-800 font-normal">Edit Profile</h2>
          
          <div className="bg-white p-6 md:p-8">
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] text-gray-500 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-2.5 text-[14px] focus:outline-none focus:border-[#1a9cb7]"
                    placeholder="Enter your first and last name"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-gray-500 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 p-2.5 text-[14px] text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
                </div>
                
                <div>
                  <label className="block text-[13px] text-gray-500 mb-2">Mobile</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-2.5 text-[14px] focus:outline-none focus:border-[#1a9cb7]"
                    placeholder="Please enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-gray-500 mb-2">Birthday</label>
                  <input 
                    type="date" 
                    name="birthday" 
                    value={formData.birthday} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-2.5 text-[14px] focus:outline-none focus:border-[#1a9cb7]"
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] text-gray-500 mb-2">Gender</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-2.5 text-[14px] focus:outline-none focus:border-[#1a9cb7] bg-white"
                  >
                    <option value="">Please choose your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#1a9cb7] text-white px-8 py-3 text-[14px] font-medium hover:bg-[#158299] transition uppercase disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
