'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export function AuthModal() {
  const { isAuthModalOpen, authModalView, openAuthModal, closeAuthModal, login, signup, verify2faLogin } = useAuth();
  
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
  
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [businessType, setBusinessType] = useState('BUSINESS');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');

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
      setBusinessName('');
      setOwnerName('');
      setAddress('');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
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
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (accountType === 'BUYER') {
      signup({ name, email: signupEmail, phone, password: signupPassword });
    } else {
      signup({
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

  return (
    <div className="fixed inset-0 z-[100] flex p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
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
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-700 font-medium text-center">{loginError}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="group relative flex w-full justify-center rounded-md bg-primary-600 py-2.5 px-3 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
                >
                  {show2fa ? 'Verify Code' : 'Sign in'}
                </button>
              </div>
              {!show2fa && (
                <div className="text-sm text-center flex flex-col gap-3 mt-4">
                  <Link href="/forgot-password" onClick={closeAuthModal} className="font-medium text-muted-foreground hover:text-foreground">
                    Forgot your password?
                  </Link>
                  <button type="button" onClick={() => openAuthModal('signup')} className="font-medium text-primary-600 hover:text-primary-700">
                    Don't have an account? Sign up
                  </button>
                </div>
              )}
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

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="w-1/3 rounded-md bg-muted py-2.5 px-3 text-sm font-semibold text-foreground hover:bg-gray-200 border transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 justify-center rounded-md bg-primary-600 py-2.5 px-3 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
                  >
                    Sign up
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
    </div>
  );
}
