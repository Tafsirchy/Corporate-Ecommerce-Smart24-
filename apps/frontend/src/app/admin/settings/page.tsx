'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';
import { Loader2, Save, Mail, Info } from 'lucide-react';

export default function AdminSettings() {
  const [supportEmail, setSupportEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get('/settings');
        const settingsData = res.data?.data || res.data;
        const emailSetting = Array.isArray(settingsData) ? settingsData.find((s: any) => s.key === 'SUPPORT_EMAIL') : null;
        if (emailSetting) {
          setSupportEmail(emailSetting.value);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/settings/SUPPORT_EMAIL', { value: supportEmail });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary/90" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Global Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global configuration for your store.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-muted-foreground" />
          Support Email Configuration
        </h2>
        
        <div className="bg-info-bg text-blue-800 p-4 rounded-lg flex items-start gap-3 mb-6 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>This is the email address that will receive notifications whenever a user submits a new Support Ticket via the Contact Us form.</p>
        </div>

        <form onSubmit={handleSave}>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-foreground mb-2">Notification Email Address</label>
            <input
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. support@smart24.com"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2.5 bg-black text-white rounded-lg hover:bg-secondary transition font-medium disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
