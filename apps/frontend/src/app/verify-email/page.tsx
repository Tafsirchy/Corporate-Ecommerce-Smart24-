'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, apiClient } from '@/context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setToken, setUser } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await apiClient.post('/auth/verify-email', { token });
        
        if (res.data.access_token) {
          // Auto login process
          localStorage.setItem('access_token', res.data.access_token);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
          setToken(res.data.access_token);
          
          // Force storage event for other tabs to auto-login
          localStorage.setItem('verification_success', Date.now().toString());
          
          if (res.data.user) {
            setUser(res.data.user);
          }
          
          setStatus('success');
          setMessage(res.data.message || 'Email successfully verified. You are now logged in.');
          toast.success('Email successfully verified. You are now logged in.');
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push('/account');
          }, 3000);
        } else {
          setStatus('success');
          setMessage(res.data.message || 'Email successfully verified.');
        }
      } catch (error: any) {
        setStatus('error');
        const errorMsg = error.response?.data?.message || 'Verification failed. The token may be invalid or expired.';
        const text = Array.isArray(errorMsg) ? errorMsg[0] : errorMsg;
        setMessage(text);
      }
    };

    verifyEmail();
  }, [token, router, setToken, setUser]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <div>
          {status === 'loading' && (
            <Loader2 className="mx-auto h-16 w-16 text-primary-600 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
          )}
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' ? 'Verifying Email' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h2>
          
          <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div className="pt-4">
            <p className="text-sm text-gray-500 mb-4">Redirecting you to your account...</p>
            <Link
              href="/account"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition"
            >
              Go to My Account
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="pt-4">
            <Link
              href="/"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
