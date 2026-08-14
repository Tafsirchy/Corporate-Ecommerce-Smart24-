'use client';
import { useAuth } from '@/context/AuthContext';
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => {
        // Only update if it's currently empty to avoid overwriting user edits
        if (!prev.name && user.name) {
          return {
            name: user.name || '',
            phone: user.phone || '',
            gender: user.gender || '',
            birthday: user.birthday || '',
          };
        }
        return prev;
      });
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
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
    <>
      {/* Main Content Area */}
      <div className="w-full">
          <h2 className="text-[22px] text-foreground font-normal">Edit Profile</h2>
          
          <div className="bg-white p-6 md:p-8">
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-base text-muted-foreground mb-2">Full Name</label>
                  <input 
                    id="name"
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    autoComplete="name"
                    className="w-full h-12 border border-border px-3 text-base focus:outline-none focus:border-primary"
                    placeholder="Enter your first and last name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-base text-muted-foreground mb-2">Email Address</label>
                  <input 
                    id="email"
                    type="email" 
                    value={user.email} 
                    disabled
                    className="w-full h-12 border border-border bg-muted px-3 text-base text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Email cannot be changed here.</p>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-base text-muted-foreground mb-2">Mobile</label>
                  <input 
                    id="phone"
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    autoComplete="tel"
                    className="w-full h-12 border border-border px-3 text-base focus:outline-none focus:border-primary"
                    placeholder="Please enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="birthday" className="block text-base text-muted-foreground mb-2">Birthday</label>
                  <input 
                    id="birthday"
                    type="date" 
                    name="birthday" 
                    value={formData.birthday} 
                    onChange={handleChange} 
                    className="w-full h-12 border border-border px-3 text-base focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-base text-muted-foreground mb-2">Gender</label>
                  <select 
                    id="gender"
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className="w-full h-12 border border-border px-3 text-base focus:outline-none focus:border-primary bg-white"
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
                  className="flex min-h-12 items-center bg-primary text-white px-8 py-3 text-base font-medium hover:bg-primary/90 transition uppercase disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
    </div>
      </>
  );
}
