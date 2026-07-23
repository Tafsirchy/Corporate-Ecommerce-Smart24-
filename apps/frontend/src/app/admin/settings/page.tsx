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
        const emailSetting = res.data.find((s: any) => s.key === 'SUPPORT_EMAIL');
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

  const handleSave = async () => {
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
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>
        <p className="text-gray-500 mt-1">Manage global configuration for your store.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-gray-400" />
          Support Email Configuration
        </h2>
        
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 mb-6 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>This is the email address that will receive notifications whenever a user submits a new Support Ticket via the Contact Us form.</p>
        </div>

        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notification Email Address</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="e.g. support@smart24.com"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
