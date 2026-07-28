'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminSecurityPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generate2FA = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/2fa/generate');
      setQrCode(res.data.qrCodeDataUrl);
      setSecret(res.data.secret);
      toast.info('Scan the QR code with your authenticator app');
    } catch (e: any) {
      toast.error('Failed to generate 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    if (!code) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/2fa/turn-on', { code });
      toast.success('2FA has been enabled successfully!');
      setQrCode(null);
      setSecret(null);
      setCode('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">Security Settings</h2>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-foreground">
            Two-Factor Authentication (2FA)
          </h3>
          <div className="mt-2 max-w-xl text-sm text-muted-foreground">
            <p>
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
          </div>
          
          {!qrCode ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={generate2FA}
                disabled={loading}
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                Set up 2FA
              </button>
            </div>
          ) : (
            <div className="mt-5 border-t border-border pt-5">
              <h4 className="text-sm font-medium text-foreground">1. Scan this QR Code</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Use Google Authenticator, Authy, or your preferred TOTP app.
              </p>
              <div className="mt-3">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded" />
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Or enter this code manually: <strong className="text-foreground">{secret}</strong>
              </div>

              <h4 className="mt-6 text-sm font-medium text-foreground">2. Enter the 6-digit code</h4>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="000000"
                  className="block w-32 rounded-md border-0 py-1.5 text-foreground ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3 tracking-widest text-center"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={enable2FA}
                  disabled={loading}
                  className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
