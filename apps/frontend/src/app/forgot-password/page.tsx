'use client';
import { useState } from 'react';
import { apiClient } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      toast.success('Reset link sent to your email');
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter your email to receive a password reset link.
          </p>
        </div>
        
        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <input
                  type="email"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-primary-600 py-2 px-3 text-sm font-semibold text-white hover:bg-primary/100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 bg-success-bg p-4 rounded-md">
            <p className="text-green-800 text-center font-medium">
              If an account exists for {email}, a reset link has been sent. Check your inbox (or the server console in dev mode).
            </p>
          </div>
        )}

        <div className="text-sm text-center flex flex-col gap-2 mt-4">
          <Link href="/login" className="font-medium text-primary/90 hover:text-primary-500">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
