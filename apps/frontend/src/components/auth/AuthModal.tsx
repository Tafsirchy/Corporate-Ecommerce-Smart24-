'use client';
import { useState, useEffect } from 'react';
import { useAuth, apiClient } from '@/context/AuthContext';
import { X, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { ScrollFade } from '@/components/ui/ScrollFade';

export function AuthModal() {
  const { isAuthModalOpen, authModalView, setAuthModalView, openAuthModal, closeAuthModal, login, signup, verify2faLogin, verifyOtp, resetPassword } = useAuth();
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [show2fa, setShow2fa] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState('');

  // Signup State
  const [signupStep, setSignupStep] = useState(1);
  const [accountType, setAccountType] = useState<'BUYER' | 'BUSINESS'>('BUYER');
  const [isLoading, setIsLoading] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [businessType, setBusinessType] = useState('BUSINESS');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset Password Verify State
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
      setShow2fa(false);
      setTempToken('');
      setCode('');
      setSignupStep(1);
      setAccountType('BUYER');
      setName('');
      setSignupEmail('');
      setPhone('');
      setSignupPassword('');
      setConfirmPassword('');
      setShowLoginPassword(false);
      setShowSignupPassword(false);
      setShowConfirmPassword(false);
      setSignupError('');
      setBusinessName('');
      setOwnerName('');
      setAddress('');
      setOtpInput('');
      setOtpError('');
      setForgotEmail('');
      setResetOtp('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setShowResetPassword(false);
      setShowResetConfirmPassword(false);
      setResetError('');
    }
  }, [isAuthModalOpen]);

  // Listen for storage events (e.g., when the user verifies their email in another tab)
  useEffect(() => {
    if (!isAuthModalOpen) return;
    
    const handleStorage = (e: StorageEvent) => {
      // If the access_token is set in another tab, auto close the modal
      if (e.key === 'access_token' && e.newValue) {
        toast.success("Login successful from another tab!");
        closeAuthModal();
        // Option to reload if necessary: window.location.reload();
      }
      // Or if we specifically use verification_success key
      if (e.key === 'verification_success' && e.newValue) {
        toast.success("Email verified! You are now logged in.");
        closeAuthModal();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    try {
      if (show2fa) {
        const res = await verify2faLogin({ tempToken, code });
        if (res?.error) setLoginError(res.error);
      } else {
        const res = await login({ email: loginEmail, password: loginPassword });
        if (res?.twoFactorRequired) {
          setShow2fa(true);
          setTempToken(res.tempToken);
        } else if (res?.error) {
          setLoginError(res.error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (signupPassword !== confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (accountType === 'BUYER') {
        res = await signup({ name, email: signupEmail, phone, password: signupPassword });
      } else {
        res = await signup({
          name,
          email: signupEmail,
          phone,
          password: signupPassword,
          role: 'BUSINESS',
          businessProfile: {
            businessType,
            businessName,
            ownerName: ownerName || name,
            address
          }
        });
      }
      
      if (res?.error) {
        setSignupError(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setIsLoading(true);
    try {
      const res = await verifyOtp({ email: signupEmail, otp: otpInput });
      if (res?.error) {
        setOtpError(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('Reset code sent to your email');
      setAuthModalView('reset-password-verify');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPassword({ email: forgotEmail, otp: resetOtp, password: resetNewPassword });
      if (!result.success) {
        setResetError(result.error || "Password reset failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 0) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 0) return { width: '0%', color: 'bg-gray-200', text: '' };
    if (score <= 2) return { width: '33%', color: 'bg-red-500', text: 'Weak' };
    if (score <= 4) return { width: '66%', color: 'bg-yellow-500', text: 'Good' };
    return { width: '100%', color: 'bg-green-500', text: 'Strong' };
  };
  const strength = calculatePasswordStrength(signupPassword);
  const resetStrength = calculatePasswordStrength(resetNewPassword);

  return (
    <ScrollFade className="fixed inset-0 z-[100] flex p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full ${authModalView === 'signup' && signupStep === 2 ? 'max-w-xl' : 'max-w-md'} bg-white rounded-2xl shadow-xl p-6 m-auto transition-all`}>
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors z-10 bg-white/80 backdrop-blur-sm"
        >
          <X size={20} />
        </button>

        {authModalView === 'login' ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
                Sign in
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
              <div className="-space-y-px rounded-md shadow-sm">
                {!show2fa ? (
                  <>
                    <div>
                      <input
                        type="email"
                        required
                        className="relative block w-full rounded-t-md border-0 py-2.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                        placeholder="Email address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        className="relative block w-full rounded-b-md border-0 py-2.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3 pr-10"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground z-20"
                      >
                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </>
                ) : (
                  <div>
                    <input
                      type="text"
                      required
                      className="relative block w-full rounded-md border-0 py-2.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3 text-center tracking-widest"
                      placeholder="6-digit 2FA Code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {loginError && (
                <div className="rounded-md bg-red-50 p-3 text-center space-y-2">
                  <p className="text-sm text-red-700 font-medium">{loginError}</p>
                  {loginError.includes('verify your email') && (
                    <button
                      type="button"
                      onClick={async () => {
                        setSignupEmail(loginEmail);
                        openAuthModal('verification-pending');
                        try {
                          await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/resend-verification' || 'http://localhost:4000/api/v1/auth/resend-verification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: loginEmail })
                          });
                          toast.success('A new verification code has been sent!');
                        } catch (e) {
                          toast.error('Failed to resend code');
                        }
                      }}
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Enter Code or Resend Verification
                    </button>
                  )}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 px-4 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm shadow-primary-200 transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isLoading ? 'Processing...' : (show2fa ? 'Verify Code' : 'Sign in')}
                </button>
              </div>
              {!show2fa && (
                <div className="text-sm text-center flex flex-col gap-3 mt-4">
                  <button type="button" onClick={() => openAuthModal('forgot-password')} className="font-medium text-muted-foreground hover:text-foreground">
                    Forgot your password?
                  </button>
                  <button type="button" onClick={() => openAuthModal('signup')} className="font-medium text-primary-600 hover:text-primary-700">
                    Don't have an account? Sign up
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : authModalView === 'verification-pending' ? (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Verify your email
              </h2>
              <p className="mt-4 text-muted-foreground">
                We've sent a 6-digit verification code to <span className="font-semibold text-foreground">{signupEmail}</span>.
              </p>
            </div>
            <form onSubmit={handleVerifyOtpSubmit} className="max-w-xs mx-auto space-y-4">
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="relative block w-full rounded-md border-0 py-3 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 text-center tracking-[0.5em] text-2xl font-semibold px-3"
                  placeholder="------"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\\D/g, ''))}
                />
              </div>
              {otpError && (
                <div className="rounded-md bg-red-50 p-2">
                  <p className="text-sm text-red-700 font-medium">{otpError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || otpInput.length < 6}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 px-4 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm shadow-primary-200 transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {isLoading ? 'Processing...' : 'Verify Code'}
              </button>
            </form>
          </div>
        ) : authModalView === 'forgot-password' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
                Forgot Password
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Enter your email to receive a password reset link.
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleForgotSubmit}>
              <div>
                <input
                  type="email"
                  required
                  className="relative block w-full rounded-md border-0 py-2.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading || !forgotEmail}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 px-4 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm shadow-primary-200 transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isLoading ? 'Processing...' : 'Send Reset Code'}
                </button>
              </div>
            </form>
            <div className="text-sm text-center flex flex-col gap-2 mt-4">
              <button type="button" onClick={() => openAuthModal('login')} className="font-medium text-primary-600 hover:text-primary-700">
                Back to sign in
              </button>
            </div>
          </div>
        ) : authModalView === 'reset-password-verify' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
                Set New Password
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                We've sent a verification code to <span className="font-semibold text-foreground">{forgotEmail}</span>. Enter it below along with your new password.
              </p>
            </div>
            
            <form className="mt-8 space-y-4" onSubmit={handleResetPasswordSubmit}>
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="relative block w-full rounded-md border-0 py-3 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary-600 text-center tracking-[0.5em] text-2xl font-semibold px-3"
                  placeholder="------"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-0.5">New Password</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    required
                    className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3 pr-10"
                    placeholder="••••••••"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground z-20"
                  >
                    {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {resetNewPassword && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${resetStrength.color}`} 
                        style={{ width: resetStrength.width }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">{resetStrength.text}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-0.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showResetConfirmPassword ? "text" : "password"}
                    required
                    className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3 pr-10"
                    placeholder="••••••••"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground z-20"
                  >
                    {showResetConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {resetConfirmPassword && resetNewPassword !== resetConfirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {resetError && (
                <div className="rounded-md bg-red-50 p-2">
                  <p className="text-sm text-red-700 font-medium text-center">{resetError}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading || resetOtp.length < 6}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 px-4 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm shadow-primary-200 transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {isLoading ? 'Processing...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
                {signupStep === 1 ? 'Choose Account Type' : (accountType === 'BUSINESS' ? 'Create Business Account' : 'Create Account')}
              </h2>
            </div>

            {signupStep === 1 ? (
              <div className="mt-8 space-y-4">
                <button
                  onClick={() => { setAccountType('BUYER'); setSignupStep(2); }}
                  className="w-full text-left px-6 py-4 border rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-foreground">Individual Buyer</h3>
                  <p className="text-sm text-muted-foreground mt-1">Shop for yourself or your family.</p>
                </button>
                <button
                  onClick={() => { setAccountType('BUSINESS'); setSignupStep(2); }}
                  className="w-full text-left px-6 py-4 border rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-foreground">Business Account</h3>
                  <p className="text-sm text-muted-foreground mt-1">Business pricing, bulk orders, and e-procurement.</p>
                </button>
                
                <div className="text-sm text-center mt-6 pt-4 border-t">
                  <button type="button" onClick={() => openAuthModal('login')} className="font-medium text-primary-600 hover:text-primary-700">
                    Already have an account? Sign in
                  </button>
                </div>
              </div>
            ) : (
              <form className="mt-4 space-y-4" onSubmit={handleSignupSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 rounded-md shadow-sm">
                  {accountType === 'BUSINESS' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-0.5">Business Type</label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3"
                        >
                          <option value="BUSINESS">Business</option>
                          <option value="LOCAL_SHOP">Local Shop / SME</option>
                          <option value="SUPPLIER">Supplier</option>
                          <option value="MANUFACTURER">Manufacturer</option>
                          <option value="DISTRIBUTOR">Distributor</option>
                          <option value="WHOLESALER">Wholesaler</option>
                          <option value="RETAILER">Retailer</option>
                          <option value="RESTAURANT">Restaurant / Food Business</option>
                          <option value="SERVICE_PROVIDER">Service Provider</option>
                          <option value="CORPORATE">Corporate</option>
                          <option value="GOVERNMENT">Government</option>
                          <option value="EDUCATIONAL">Educational Institution</option>
                          <option value="NGO">NGO / Non-Profit</option>
                          <option value="INDIVIDUAL_SELLER">Individual Seller</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-0.5">Business Name</label>
                        <input
                          type="text"
                          required
                          className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3"
                          placeholder="Acme Corp"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-0.5">
                      {accountType === 'BUSINESS' ? 'Contact Person Name' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {accountType === 'BUSINESS' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-0.5">Business Address</label>
                      <input
                        type="text"
                        required
                        className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3"
                        placeholder="123 Business Ave"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Email Address</label>
                    <input
                      type="email"
                      required
                      className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3"
                      placeholder="john@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3"
                      placeholder="+8801XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Password</label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        required
                        className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3 pr-10"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground z-20"
                      >
                        {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {signupPassword && (
                      <div className="mt-2">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${strength.color}`} 
                            style={{ width: strength.width }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-right">{strength.text}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-0.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="relative block w-full rounded-md border-0 py-2 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm px-3 pr-10"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground z-20"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPassword && signupPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                    {confirmPassword && signupPassword === confirmPassword && (
                      <p className="text-xs text-green-500 mt-1">Passwords match</p>
                    )}
                  </div>
                </div>

                {signupError && (
                  <div className="rounded-md bg-red-50 p-3 mt-4 md:col-span-2">
                    <p className="text-sm text-red-700 font-medium text-center">{signupError}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="w-1/3 rounded-lg bg-muted py-3 px-4 text-sm font-semibold text-foreground hover:bg-gray-200 border transition-all active:scale-[0.98]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 px-4 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm shadow-primary-200 transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    {isLoading ? 'Processing...' : 'Sign up'}
                  </button>
                </div>
                
                <div className="text-sm text-center pt-4 border-t mt-6">
                  <button type="button" onClick={() => openAuthModal('login')} className="font-medium text-primary-600 hover:text-primary-700">
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </ScrollFade>
  );
}
