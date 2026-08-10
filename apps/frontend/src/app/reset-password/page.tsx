'use client';
import { useState, useEffect, Suspense } from 'react';
import { apiClient } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      router.push('/login');
    }
  }, [token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, password });
      toast.success('Password updated successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Please enter your new password below.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input
                type="password"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-primary-600 py-2 px-3 text-sm font-semibold text-white hover:bg-primary/100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center flex flex-col gap-2 mt-4">
          <Link href="/login" className="font-medium text-primary/90 hover:text-primary-500">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
