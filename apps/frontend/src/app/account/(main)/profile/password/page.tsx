'use client';
import { useAuth, apiClient } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirmation password do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/users/me/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      router.push('/account/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <div className="w-full">
        <h2 className="text-[22px] text-foreground font-normal">Change Password</h2>

        <div className="bg-white p-6 md:p-8">
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-base text-muted-foreground mb-2">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full h-12 border border-border px-3 text-base focus:outline-none focus:border-primary"
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-base text-muted-foreground mb-2">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full h-12 border border-border px-3 text-base focus:outline-none focus:border-primary"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-base text-muted-foreground mb-2">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full h-12 border border-border px-3 text-base focus:outline-none focus:border-primary"
                placeholder="Re-enter your new password"
              />
            </div>

            <div className="pt-4 mt-auto sticky bottom-0 bg-white pb-[max(1rem,env(safe-area-inset-bottom))] z-10 -mx-6 px-6 md:static md:bg-transparent md:pb-0 md:mx-0 md:px-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full md:w-auto justify-center min-h-12 items-center bg-primary text-white px-8 py-3 text-base font-medium hover:bg-primary/90 transition uppercase disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}