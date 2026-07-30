'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function SignupPage() {
  const { signup } = useAuth();
  
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<'BUYER' | 'BUSINESS'>('BUYER');
  
  // Buyer & Business Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Business Specific Fields
  const [businessType, setBusinessType] = useState('CORPORATE');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accountType === 'BUYER') {
      signup({ name, email, phone, password });
    } else {
      signup({
        name,
        email,
        phone,
        password,
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            {step === 1 ? 'Choose Account Type' : (accountType === 'BUSINESS' ? 'Create Business Account' : 'Create Account')}
          </h2>
        </div>

        {step === 1 ? (
          <div className="mt-8 space-y-4">
            <button
              onClick={() => { setAccountType('BUYER'); setStep(2); }}
              className="w-full text-left px-6 py-4 border rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <h3 className="text-lg font-semibold">Individual Buyer</h3>
              <p className="text-sm text-muted-foreground">Shop for yourself or your family.</p>
            </button>
            <button
              onClick={() => { setAccountType('BUSINESS'); setStep(2); }}
              className="w-full text-left px-6 py-4 border rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <h3 className="text-lg font-semibold">Business Account</h3>
              <p className="text-sm text-muted-foreground">Corporate pricing, bulk orders, and e-procurement.</p>
            </button>
            
            <div className="text-sm text-center mt-6 pt-4">
              <Link href="/login" className="font-medium text-primary/90 hover:text-primary-500">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              
              {accountType === 'BUSINESS' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="relative block w-full rounded-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                    >
                      <option value="CORPORATE">Corporate</option>
                      <option value="LOCAL_SHOP">Local Shop / SME</option>
                      <option value="SUPPLIER">Supplier</option>
                      <option value="GOVERNMENT">Government</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Business Name</label>
                    <input
                      type="text"
                      required
                      className="relative block w-full rounded-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                      placeholder="Acme Corp"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Business Address</label>
                    <input
                      type="text"
                      required
                      className="relative block w-full rounded-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                      placeholder="123 Corporate Ave"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {accountType === 'BUSINESS' ? 'Contact Person Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="+8801XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-md bg-muted py-2 px-3 text-sm font-semibold text-foreground hover:bg-gray-200 border"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 justify-center rounded-md bg-primary-600 py-2 px-3 text-sm font-semibold text-white hover:bg-primary/100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Sign up
              </button>
            </div>
            
            <div className="text-sm text-center pt-2">
              <Link href="/login" className="font-medium text-primary/90 hover:text-primary-500">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
