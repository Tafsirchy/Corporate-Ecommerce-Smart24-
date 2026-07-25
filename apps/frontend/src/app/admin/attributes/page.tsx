'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Plus, X, Save, Loader2 } from 'lucide-react';

interface ProductAttributes {
  colors: string[];
  warranties: string[];
  brandComps: string[];
  materials: string[];
  models: string[];
  locations: string[];
  services: string[];
}

const DEFAULT_ATTRIBUTES: ProductAttributes = {
  colors: [],
  warranties: [],
  brandComps: [],
  materials: [],
  models: [],
  locations: [],
  services: []
};

export default function AdminAttributes() {
  const [attributes, setAttributes] = useState<ProductAttributes>(DEFAULT_ATTRIBUTES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newItems, setNewItems] = useState<Record<keyof ProductAttributes, string>>({
    colors: '',
    warranties: '',
    brandComps: '',
    materials: '',
    models: '',
    locations: '',
    services: ''
  });

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const res = await apiClient.get('/settings/product_attributes');
      if (res.data && res.data.value) {
        setAttributes(JSON.parse(res.data.value));
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch attributes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.post('/settings/product_attributes', {
        value: JSON.stringify(attributes)
      });
      toast.success('Attributes saved successfully');
    } catch (error) {
      toast.error('Failed to save attributes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = (key: keyof ProductAttributes) => {
    const val = newItems[key].trim();
    if (!val) return;
    
    if (attributes[key].includes(val)) {
      toast.warning(`${val} already exists in ${key}`);
      return;
    }

    setAttributes(prev => ({
      ...prev,
      [key]: [...prev[key], val]
    }));
    
    setNewItems(prev => ({ ...prev, [key]: '' }));
  };

  const handleRemoveItem = (key: keyof ProductAttributes, item: string) => {
    setAttributes(prev => ({
      ...prev,
      [key]: prev[key].filter(i => i !== item)
    }));
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-500" /></div>;
  }

  const sections: { key: keyof ProductAttributes; title: string; placeholder: string; desc: string }[] = [
    { key: 'colors', title: 'Colors', placeholder: 'e.g., Red, Blue, Space Gray', desc: 'Available colors for products.' },
    { key: 'warranties', title: 'Warranty Types', placeholder: 'e.g., 1 Year Brand Warranty', desc: 'Types of warranties offered.' },
    { key: 'brandComps', title: 'Brand Compatibility', placeholder: 'e.g., Apple, Samsung', desc: 'Which brands the product is compatible with.' },
    { key: 'materials', title: 'Case Materials', placeholder: 'e.g., Silicone, Leather', desc: 'Materials used (mainly for accessories).' },
    { key: 'models', title: 'Compatibility By Model', placeholder: 'e.g., iPhone 15 Pro, Galaxy S24', desc: 'Specific device models.' },
    { key: 'locations', title: 'Locations (Shipped From)', placeholder: 'e.g., Bangladesh, Overseas', desc: 'Shipping origins.' },
    { key: 'services', title: 'Services / Offers', placeholder: 'e.g., free-shipping, cod', desc: 'Service tags (use hyphens for slugs like "free-shipping").' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Product Attributes</h1>
          <p className="text-gray-500 mt-1">Manage dynamic filter options available for products.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(section => (
          <div key={section.key} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900">{section.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{section.desc}</p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newItems[section.key]}
                onChange={e => setNewItems(prev => ({ ...prev, [section.key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAddItem(section.key)}
                placeholder={section.placeholder}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-black focus:border-black text-sm"
              />
              <button 
                onClick={() => handleAddItem(section.key)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg flex items-center justify-center transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {attributes[section.key].length === 0 ? (
                <span className="text-sm text-gray-400 italic">No items added yet.</span>
              ) : (
                attributes[section.key].map(item => (
                  <span key={item} className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md text-sm text-gray-700">
                    {item}
                    <button 
                      onClick={() => handleRemoveItem(section.key, item)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
