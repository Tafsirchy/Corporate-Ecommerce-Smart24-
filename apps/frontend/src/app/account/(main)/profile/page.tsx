'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  async function handleDeleteAccount() {
    setIsDeleteDialogOpen(true);
  };

  async function executeDeleteAccount() {
    try {
      const { apiClient } = await import('@/context/AuthContext');
      await apiClient.delete('/users/me');
      logout();
      router.push('/');
    } catch (error) {
      alert('Failed to delete account');
    }
  };

  if (loading || !user) return null;

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6">
        {/* Row 1 */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Full Name</p>
          <p className="text-base font-medium text-foreground">{user.name || user.phone || '1633996633'}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Address</p>
            <span className="text-muted-foreground">|</span> 
            <Link href="/account/profile/edit" className="text-primary hover:underline text-sm font-semibold uppercase tracking-wider inline-flex items-center min-h-11 px-2 -mx-2">Add</Link>
          </div>
          <p className="text-base font-medium text-foreground">{user.email || '@'}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Mobile</p>
            <span className="text-muted-foreground">|</span> 
            <Link href="/account/profile/edit" className="text-primary hover:underline text-sm font-semibold uppercase tracking-wider inline-flex items-center min-h-11 px-2 -mx-2">Change</Link>
          </div>
          <p className="text-base font-medium text-foreground mb-4">{user.phone ? `+880 ${user.phone}` : '+880 163*****33'}</p>
          <label className="flex min-h-11 items-center gap-3 text-sm text-foreground cursor-pointer p-2 -ml-2 rounded-lg hover:bg-muted active:bg-muted/80">
            <input type="checkbox" defaultChecked className="w-5 h-5 text-accent focus:ring-orange-500 border-border rounded" />
            Receive marketing SMS
          </label>
        </div>

        {/* Row 2 */}
        <div className="pt-6 border-t border-border md:border-0 md:pt-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Birthday</p>
          {user.birthday ? (
            <p className="text-base font-medium text-foreground">{user.birthday}</p>
          ) : (
            <p className="text-base text-muted-foreground">Please enter your birthday</p>
          )}
        </div>
        <div className="pt-6 border-t border-border md:border-0 md:pt-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Gender</p>
          {user.gender ? (
            <p className="text-base font-medium text-foreground">{user.gender}</p>
          ) : (
            <p className="text-base text-muted-foreground">Please enter your gender</p>
          )}
        </div>
        <div className="hidden md:block"></div>
      </div>

      <div className="mt-12 space-y-4 max-w-xs">
        <Link href="/account/profile/edit" className="block w-full bg-primary text-white text-center py-3.5 text-sm font-bold rounded-lg hover:bg-primary/90 transition uppercase shadow-sm">
          Edit Profile
        </Link>
        <Link href="/account/profile/password" className="block w-full border border-primary text-primary text-center py-3.5 text-sm font-bold rounded-lg hover:bg-primary/5 transition uppercase shadow-sm">
          Change Password
        </Link>
        <button onClick={handleDeleteAccount} className="block w-full border border-destructive text-destructive text-center py-3.5 text-sm font-bold rounded-lg hover:bg-destructive/5 transition uppercase shadow-sm">
          Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div role="dialog" aria-modal="true" aria-label="Confirm delete account" className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-end md:justify-center md:items-center z-50">
          <div className="bg-white shadow-xl w-full max-w-sm rounded-t-2xl md:rounded-xl pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:fade-in duration-300">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl md:rounded-t-xl">
              <h2 className="text-xl font-semibold text-destructive">Delete Account?</h2>
              <button onClick={() => setIsDeleteDialogOpen(false)} aria-label="Close dialog" className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-base text-muted-foreground mb-8">Are you sure you want to delete your account? This action cannot be undone and your data will be anonymized.</p>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsDeleteDialogOpen(false)} className="flex min-h-12 items-center px-6 border border-input font-medium hover:bg-muted">CANCEL</button>
                <button type="button" onClick={executeDeleteAccount} className="flex min-h-12 items-center bg-destructive px-8 font-medium text-white hover:bg-destructive/90 transition">DELETE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
