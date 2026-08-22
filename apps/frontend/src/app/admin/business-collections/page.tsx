'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function AdminBusinessCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [expandedSlot, setExpandedSlot] = useState<number | null>(1); // Accordion state

  // We have exactly 8 grid positions to manage
  const gridPositions = Array.from({ length: 8 }, (_, i) => i + 1);

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    try {
      setIsLoadingPage(true);
      const res = await apiClient.get('/business-collections/admin/all');
      setCollections(res.data);
    } catch (error) {
      toast.error('Failed to fetch business collections');
    } finally {
      setIsLoadingPage(false);
    }
  };

  const getCollectionForPosition = (position: number) => {
    return collections.find(c => c.position === position) || {
      title: '', subtitle: '', buttonText: 'Shop Now', imageUrl: '', targetUrl: '', isActive: true
    };
  };


  async function handleSubmit(e: React.FormEvent, position: number) {
    e.preventDefault();
    const data = getCollectionForPosition(position);
    
    if (!data.imageUrl) {
      return toast.error('Please upload an image first');
    }
    if (!data.title || !data.subtitle || !data.buttonText || !data.targetUrl) {
      return toast.error('Please fill all fields');
    }

    setIsLoading(true);
    try {
      await apiClient.put(`/business-collections/${position}`, {
        title: data.title,
        subtitle: data.subtitle,
        buttonText: data.buttonText,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        isActive: data.isActive
      });
      toast.success(`Slot ${position} saved successfully`);
      fetchCollections();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save slot');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocalField = (position: number, field: string, value: any) => {
    setCollections(prev => {
      const existing = prev.find(c => c.position === position);
      if (existing) {
        return prev.map(c => c.position === position ? { ...c, [field]: value } : c);
      } else {
        const newObj = { position, title: '', subtitle: '', buttonText: 'Shop Now', imageUrl: '', targetUrl: '', isActive: true, [field]: value };
        return [...prev, newObj];
      }
    });
  };

  async function toggleStatus(position: number) {
    const data = getCollectionForPosition(position);
    if (!data.id) return toast.error('Save the slot before toggling status');
    
    // Optimistic Update
    setCollections(prev => prev.map(c => 
      c.position === position ? { ...c, isActive: !data.isActive } : c
    ));
    
    try {
      await apiClient.put(`/business-collections/${position}`, {
        ...data,
        isActive: !data.isActive
      });
      toast.success('Status updated');
    } catch (error) {
      // Revert on failure
      setCollections(prev => prev.map(c => 
        c.position === position ? { ...c, isActive: data.isActive } : c
      ));
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Business Collections</h1>
      <p className="text-muted-foreground mb-8">Manage the 8 dynamic slots in the home page bento grid.</p>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {isLoadingPage ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          gridPositions.map(pos => {
            const data = getCollectionForPosition(pos);
          const isLarge = pos === 1; // Position 1 is the large 2x2 card in our layout
          
          return (
            <div key={pos} className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="flex justify-between items-center mb-2 pb-2">
                <button 
                  type="button"
                  onClick={() => setExpandedSlot(expandedSlot === pos ? null : pos)}
                  className="flex-1 flex items-center gap-2 text-left text-lg font-bold min-h-[44px]"
                  aria-expanded={expandedSlot === pos}
                >
                  <span className="bg-primary-100 text-primary-800 w-8 h-8 flex items-center justify-center rounded-full text-sm">
                    {pos}
                  </span>
                  Slot {pos} {isLarge && <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground ml-2">Large Card (2x2)</span>}
                </button>
                <div className="flex items-center gap-3">
                  {data.id && (
                    <button 
                      type="button"
                      onClick={() => toggleStatus(pos)}
                      className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-semibold ${data.isActive ? 'bg-success-bg text-success-text' : 'bg-danger-bg text-destructive'}`}
                    >
                      {data.isActive ? 'Active' : 'Inactive'}
                    </button>
                  )}
                </div>
              </div>
              
              {expandedSlot === pos && (
                <form onSubmit={(e) => handleSubmit(e, pos)} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                    <input 
                      type="text" required value={data.title || ''} 
                      onChange={e => updateLocalField(pos, 'title', e.target.value)}
                      placeholder="e.g. Elevate your workspace"
                      className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-primary-600 focus:border-primary-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Subtitle</label>
                    <input 
                      type="text" required value={data.subtitle || ''} 
                      onChange={e => updateLocalField(pos, 'subtitle', e.target.value)}
                      placeholder="e.g. SPRING COLLECTION"
                      className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-primary-600 focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Button Text</label>
                    <input 
                      type="text" required value={data.buttonText || ''} 
                      onChange={e => updateLocalField(pos, 'buttonText', e.target.value)}
                      placeholder="e.g. Shop Now"
                      className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-primary-600 focus:border-primary-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Target URL</label>
                    <input 
                      type="text" required value={data.targetUrl || ''} 
                      onChange={e => updateLocalField(pos, 'targetUrl', e.target.value)}
                      placeholder="e.g. /shop/category"
                      className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-primary-600 focus:border-primary-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <ImageUpload 
                      images={data.imageUrl ? [data.imageUrl] : []}
                      setImages={(imgs) => updateLocalField(pos, 'imageUrl', imgs[0] || '')}
                      multiple={false}
                      label="Image"
                    />
                  </div>
                  
                  <div className="md:col-span-2 pt-4 text-right">
                    <button 
                      type="submit" disabled={isLoading}
                      className="bg-primary-600 text-white px-6 py-2 min-h-[44px] text-base rounded font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors w-full md:w-auto"
                    >
                      Save Slot {pos}
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
