'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function handleDeleteAccount() {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and your data will be anonymized.')) return;
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
    </div>
  );
}
