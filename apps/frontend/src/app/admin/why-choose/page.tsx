'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import {
  DEFAULT_WHY_CHOOSE_CONFIG,
  WhyChooseConfig,
  WhyChooseFeature,
  parseSettingJson,
} from '@/lib/home-settings';

export default function AdminWhyChoosePage() {
  const [config, setConfig] = useState<WhyChooseConfig>(DEFAULT_WHY_CHOOSE_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [icon, setIcon] = useState('🚀');
  const [text, setText] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/settings/home_why_choose');
      setConfig(parseSettingJson(res.data?.value, DEFAULT_WHY_CHOOSE_CONFIG));
    } catch {
      setConfig(DEFAULT_WHY_CHOOSE_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveConfig(nextConfig: WhyChooseConfig) {
    setIsSaving(true);
    try {
      await apiClient.post('/settings/home_why_choose', {
        value: JSON.stringify(nextConfig),
      });
      setConfig(nextConfig);
      toast.success('Why Choose Smart24 updated');
    } catch {
      toast.error('Failed to save Why Choose Smart24 settings');
    } finally {
      setIsSaving(false);
    }
  }

  function openNewModal() {
    setEditingId(null);
    setIcon('✨');
    setText('');
    setIsActive(true);
    setIsModalOpen(true);
  }

  function openEditModal(item: WhyChooseFeature) {
    setEditingId(item.id);
    setIcon(item.icon);
    setText(item.text);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  }

  async function handleFeatureSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Feature text is required');
      return;
    }

    const updatedFeatures = editingId
      ? config.features.map((f) =>
          f.id === editingId
            ? { ...f, icon: icon.trim() || '✨', text: text.trim(), isActive }
            : f
        )
      : [
          ...config.features,
          {
            id: Date.now().toString(),
            icon: icon.trim() || '✨',
            text: text.trim(),
            isActive,
          },
        ];

    setIsModalOpen(false);
    await saveConfig({ ...config, features: updatedFeatures });
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this highlight item?')) return;
    const updatedFeatures = config.features.filter((f) => f.id !== id);
    await saveConfig({ ...config, features: updatedFeatures });
  }

  async function handleToggle(id: string) {
    const updatedFeatures = config.features.map((f) =>
      f.id === id ? { ...f, isActive: !f.isActive } : f
    );
    await saveConfig({ ...config, features: updatedFeatures });
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Why Choose Smart24 settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Why Choose Smart24</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the badge label and scrolling feature highlights below the Hero section.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700"
        >
          <Plus size={16} />
          Add Highlight
        </button>
      </div>

      {/* Badge Text Setting */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Badge Text
          </label>
          <input
            type="text"
            value={config.badgeText}
            onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Why Choose Smart24"
          />
        </div>
        <button
          onClick={() => saveConfig(config)}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Badge'}
        </button>
      </div>

      {/* Highlights Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
              <th className="p-4">Icon</th>
              <th className="p-4">Text</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {config.features.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 text-xl">{item.icon}</td>
                <td className="p-4 font-medium text-gray-900">{item.text}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Highlight' : 'Add Highlight'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFeatureSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji / Icon</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="🚀"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text *</label>
                <input
                  type="text"
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Fast Delivery"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

