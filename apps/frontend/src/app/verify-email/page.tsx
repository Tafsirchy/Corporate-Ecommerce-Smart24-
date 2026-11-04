'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, apiClient } from '@/context/AuthContext';
import { Loader2, CheckCircle, XCircle, Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const otpParam = searchParams.get('otp');

  const { setToken, setUser } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'manual'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');
  
  // Manual fallback inputs
  const [manualEmail, setManualEmail] = useState(emailParam || '');
  const [manualOtp, setManualOtp] = useState(otpParam || tokenParam || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const executeVerification = async (payload: { email?: string; otp?: string; token?: string }) => {
    setStatus('loading');
    setMessage('Verifying your email address...');
    try {
      const res = await apiClient.post('/auth/verify-email', payload);

      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        setToken(res.data.access_token);

        localStorage.setItem('verification_success', Date.now().toString());

        if (res.data.user) {
          setUser(res.data.user);
        }

        setStatus('success');
        setMessage(res.data.message || 'Email successfully verified. You are now logged in.');
        toast.success('Email successfully verified. You are now logged in.');

        setTimeout(() => {
          router.push('/account');
        }, 2500);
      } else {
        setStatus('success');
        setMessage(res.data.message || 'Email successfully verified.');
      }
    } catch (error: any) {
      setStatus('error');
      const errorMsg =
        error.response?.data?.message ||
        'Verification failed. The code may be invalid or expired.';
      const text = Array.isArray(errorMsg) ? errorMsg[0] : errorMsg;
      setMessage(text);
    }
  };

  useEffect(() => {
    if (emailParam && (otpParam || tokenParam)) {
      executeVerification({
        email: emailParam,
        otp: otpParam || tokenParam || undefined,
      });
    } else if (tokenParam) {
      executeVerification({ token: tokenParam });
    } else {
      setStatus('manual');
      setMessage('Please enter your email and the 6-digit verification code sent to your inbox.');
    }
  }, [tokenParam, emailParam, otpParam]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail || !manualOtp) {
      toast.error('Please enter both your email address and verification code.');
      return;
    }
    setIsSubmitting(true);
    await executeVerification({
      email: manualEmail.trim().toLowerCase(),
      otp: manualOtp.trim(),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div>
          {status === 'loading' && (
            <Loader2 className="mx-auto h-14 w-14 text-primary-600 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="mx-auto h-14 w-14 text-emerald-500" />
          )}
          {status === 'error' && (
            <XCircle className="mx-auto h-14 w-14 text-rose-500" />
          )}
          {status === 'manual' && (
            <div className="mx-auto w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
              <Mail className="w-6 h-6" />
            </div>
          )}

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {status === 'loading'
              ? 'Verifying Email'
              : status === 'success'
              ? 'Email Verified!'
              : status === 'error'
              ? 'Verification Issue'
              : 'Enter Verification Code'}
          </h2>

          <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-4">Redirecting you to your account...</p>
            <Link
              href="/account"
              className="w-full flex justify-center py-3 px-4 rounded-xl font-medium text-white bg-primary-600 hover:bg-primary-700 transition shadow-sm"
            >
              Go to My Account
            </Link>
          </div>
        )}

        {(status === 'error' || status === 'manual') && (
          <form onSubmit={handleManualSubmit} className="space-y-4 pt-2 text-left">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={manualOtp}
                  onChange={(e) => setManualOtp(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm tracking-widest font-mono text-center focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-medium text-white bg-primary-600 hover:bg-primary-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify & Log In
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs font-medium text-gray-500 hover:text-gray-800 transition"
              >
                Return to Homepage
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
