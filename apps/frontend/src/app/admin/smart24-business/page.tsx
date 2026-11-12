'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Save, RotateCcw } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import {
  DEFAULT_SMART24_BUSINESS_CONFIG,
  Smart24BusinessConfig,
  parseSettingJson,
} from '@/lib/home-settings';

export default function AdminSmart24BusinessPage() {
  const [config, setConfig] = useState<Smart24BusinessConfig>(
    DEFAULT_SMART24_BUSINESS_CONFIG
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/settings/home_smart24_business');
      setConfig(parseSettingJson(res.data?.value, DEFAULT_SMART24_BUSINESS_CONFIG));
    } catch {
      setConfig(DEFAULT_SMART24_BUSINESS_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.post('/settings/home_smart24_business', {
        value: JSON.stringify(config),
      });
      toast.success('Smart24 Business settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm('Reset Smart24 Business settings to default?')) return;
    setConfig(DEFAULT_SMART24_BUSINESS_CONFIG);
    setIsSaving(true);
    try {
      await apiClient.post('/settings/home_smart24_business', {
        value: JSON.stringify(DEFAULT_SMART24_BUSINESS_CONFIG),
      });
      toast.success('Reset to default');
    } catch {
      toast.error('Failed to reset');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Smart24 Business settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart24 Business</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize both the Offer Slider side card (with optional image) and the Smart24 Business subscription banner.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Offer Slider Right Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
          1. Offer Slider Right-Side Card (Smart24 Business)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Title</label>
            <input
              type="text"
              value={config.sliderCardTitle}
              onChange={(e) => setConfig({ ...config, sliderCardTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Top Badge Text</label>
            <input
              type="text"
              value={config.sliderCardBadge}
              onChange={(e) => setConfig({ ...config, sliderCardBadge: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={config.sliderCardSubtitle}
              onChange={(e) => setConfig({ ...config, sliderCardSubtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Note</label>
            <input
              type="text"
              value={config.sliderFooterNote}
              onChange={(e) => setConfig({ ...config, sliderFooterNote: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Highlight 1</label>
            <input
              type="text"
              value={config.sliderHighlight1}
              onChange={(e) => setConfig({ ...config, sliderHighlight1: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Highlight 2</label>
            <input
              type="text"
              value={config.sliderHighlight2}
              onChange={(e) => setConfig({ ...config, sliderHighlight2: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Label</label>
            <input
              type="text"
              value={config.sliderPrimaryCtaLabel}
              onChange={(e) => setConfig({ ...config, sliderPrimaryCtaLabel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button URL</label>
            <input
              type="text"
              value={config.sliderPrimaryCtaUrl}
              onChange={(e) => setConfig({ ...config, sliderPrimaryCtaUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Label</label>
            <input
              type="text"
              value={config.sliderSecondaryCtaLabel}
              onChange={(e) => setConfig({ ...config, sliderSecondaryCtaLabel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button URL</label>
            <input
              type="text"
              value={config.sliderSecondaryCtaUrl}
              onChange={(e) => setConfig({ ...config, sliderSecondaryCtaUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Optional Card Image (replaces/enhances gradient card middle area)
          </label>
          <ImageUpload
            images={config.sliderCardImageUrl ? [config.sliderCardImageUrl] : []}
            setImages={(urls) => setConfig({ ...config, sliderCardImageUrl: urls[0] || '' })}
            label="Upload Card Image"
          />
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={config.sliderCardImageUrl}
              onChange={(e) => setConfig({ ...config, sliderCardImageUrl: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
              placeholder="Leave empty for default gradient card, or paste/upload image URL"
            />
            {config.sliderCardImageUrl && (
              <button
                type="button"
                onClick={() => setConfig({ ...config, sliderCardImageUrl: '' })}
                className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
              >
                Clear Image
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SubscriptionAd Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-900">
            2. Smart24 Business Subscription Section
          </h2>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={config.adShow}
              onChange={(e) => setConfig({ ...config, adShow: e.target.checked })}
            />
            Show on Home Page
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Label</label>
            <input
              type="text"
              value={config.adBadge}
              onChange={(e) => setConfig({ ...config, adBadge: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input
              type="text"
              value={config.adHeading}
              onChange={(e) => setConfig({ ...config, adHeading: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={2}
            value={config.adDescription}
            onChange={(e) => setConfig({ ...config, adDescription: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Label</label>
            <input
              type="text"
              value={config.adPrimaryCtaLabel}
              onChange={(e) => setConfig({ ...config, adPrimaryCtaLabel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button URL</label>
            <input
              type="text"
              value={config.adPrimaryCtaUrl}
              onChange={(e) => setConfig({ ...config, adPrimaryCtaUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Label</label>
            <input
              type="text"
              value={config.adSecondaryCtaLabel}
              onChange={(e) => setConfig({ ...config, adSecondaryCtaLabel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button URL</label>
            <input
              type="text"
              value={config.adSecondaryCtaUrl}
              onChange={(e) => setConfig({ ...config, adSecondaryCtaUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

