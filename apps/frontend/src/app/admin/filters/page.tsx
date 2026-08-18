'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Loader2, Check } from 'lucide-react';

interface FilterDefinition {
  id: string;
  key: string;
  label: string;
  type: string;
  categoryIds: string[];
  status: string;
  displayOrder: number;
  values: any[];
  rangeConfig?: {
    min: number;
    max: number;
    step?: number;
    unit?: string;
  };
}

export default function AdminFilters() {
  const [filters, setFilters] = useState<FilterDefinition[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUGGESTED'>('ALL');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState('CHECKBOX');
  const [status, setStatus] = useState('ACTIVE');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [values, setValues] = useState<{value: string, label: string, colorHex?: string}[]>([]);
  const [newValueVal, setNewValueVal] = useState('');
  const [newValueColor, setNewValueColor] = useState('#000000');

  // Range config state
  const [rangeMin, setRangeMin] = useState<number | string>(0);
  const [rangeMax, setRangeMax] = useState<number | string>(100);
  const [rangeStep, setRangeStep] = useState<number | string>(1);
  const [rangeUnit, setRangeUnit] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [filtersRes, catsRes] = await Promise.all([
        apiClient.get('/filters/admin/all'),
        apiClient.get('/categories')
      ]);
      setFilters(filtersRes.data?.data || filtersRes.data);
      setCategories(catsRes.data?.data || catsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddValue = () => {
    if (!newValueVal.trim()) return;
    if (values.find(v => v.value === newValueVal.trim())) {
      toast.warning('Value already exists');
      return;
    }
    const newVal: any = { value: newValueVal.trim(), label: newValueVal.trim() };
    if (type === 'SWATCH') {
      newVal.colorHex = newValueColor;
    }
    setValues([...values, newVal]);
    setNewValueVal('');
    setNewValueColor('#000000');
  };

  const handleRemoveValue = (valToRemove: string) => {
    setValues(values.filter(v => v.value !== valToRemove));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setKey('');
    setLabel('');
    setType('CHECKBOX');
    setStatus('ACTIVE');
    setSelectedCategories([]);
    setCategorySearch('');
    setValues([]);
    setRangeMin(0);
    setRangeMax(100);
    setRangeStep(1);
    setRangeUnit('');
    setNewValueColor('#000000');
  };

  const handleEdit = (filter: FilterDefinition) => {
    setIsEditing(true);
    setCurrentId(filter.id);
    setKey(filter.key);
    setLabel(filter.label);
    setType(filter.type);
    setStatus(filter.status);
    setSelectedCategories(filter.categoryIds || []);
    setValues(filter.values || []);
    
    if (filter.rangeConfig) {
      setRangeMin(filter.rangeConfig.min ?? 0);
      setRangeMax(filter.rangeConfig.max ?? 100);
      setRangeStep(filter.rangeConfig.step ?? 1);
      setRangeUnit(filter.rangeConfig.unit || '');
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: any = {
        key, label, type, status, 
        categoryIds: selectedCategories,
      };

      if (type === 'RANGE') {
        payload.rangeConfig = {
          min: Number(rangeMin),
          max: Number(rangeMax),
          step: Number(rangeStep) || 1,
          unit: rangeUnit || undefined
        };
      } else {
        payload.values = values;
      }

      if (isEditing && currentId) {
        await apiClient.patch(`/filters/${currentId}`, payload);
        toast.success('Filter updated');
      } else {
        await apiClient.post('/filters', payload);
        toast.success('Filter created');
      }
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save filter');
    }
  };

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this filter? This will break existing product filters of this type.')) return;
    try {
      await apiClient.delete(`/filters/${id}`);
      toast.success('Filter deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete filter');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading filters...</div>;

  async function handleApprove(id: string) {
    try {
      await apiClient.patch(`/filters/${id}`, { status: 'ACTIVE' });
      toast.success('Filter approved');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve filter');
    }
  };

  const filteredFilters = activeTab === 'ALL' 
    ? filters 
    : filters.filter(f => f.status === 'SUGGESTED');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Filter Definitions</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-border mb-8">
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Filter' : 'Add New Filter'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Key (slug)</label>
            <input type="text" required value={key} onChange={e => setKey(e.target.value)}
              className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black" placeholder="e.g. storage_capacity" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Label (Display Name)</label>
            <input type="text" required value={label} onChange={e => setLabel(e.target.value)}
              className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black" placeholder="e.g. Storage Capacity" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Type</label>
            <select required value={type} onChange={e => setType(e.target.value)}
              className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black">
              <option value="CHECKBOX">Checkbox (Multi-select)</option>
              <option value="RADIO">Radio (Single-select)</option>
              <option value="SWATCH">Color Swatch</option>
              <option value="RANGE">Range (Min/Max)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select required value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black">
              <option value="ACTIVE">Active</option>
              <option value="SUGGESTED">Suggested (Hidden)</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-foreground">Scoped Categories (Leave empty for All)</label>
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                className="px-3 py-1.5 min-h-[44px] text-base border rounded focus:ring-black focus:border-black w-full sm:w-64"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border p-3 rounded">
              {[...categories]
                .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(c => (
                <label key={c.id} className="flex items-center gap-3 text-base cursor-pointer min-h-[44px] p-2 hover:bg-muted rounded">
                  <input type="checkbox" checked={selectedCategories.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCategories([...selectedCategories, c.id]);
                      else setSelectedCategories(selectedCategories.filter(id => id !== c.id));
                    }} className="w-5 h-5 rounded text-black focus:ring-black border-gray-300" />
                  {c.name}
                </label>
              ))}
              {categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                <div className="col-span-full text-sm text-muted-foreground p-2">No categories match your search.</div>
              )}
            </div>
          </div>

          {type !== 'RANGE' && (
            <div className="md:col-span-2 border p-4 rounded-lg bg-muted">
              <label className="block text-sm font-bold text-foreground mb-2">Predefined Values</label>
              <div className="flex gap-2 mb-3">
                {type === 'SWATCH' && (
                  <input type="color" value={newValueColor} onChange={e => setNewValueColor(e.target.value)}
                    className="h-[44px] w-12 border rounded cursor-pointer p-1" title="Select Color" />
                )}
                <input type="text" value={newValueVal} onChange={e => setNewValueVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddValue())}
                  placeholder="Add value (e.g. 128GB)" className="flex-1 px-4 py-2 min-h-[44px] text-base border rounded" />
                <button type="button" onClick={handleAddValue} className="bg-black text-white px-4 py-2 min-h-[44px] text-base rounded font-medium">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {values.map(v => (
                  <span key={v.value} className="bg-white border px-3 py-1.5 min-h-[36px] rounded flex items-center gap-2">
                    {v.colorHex && (
                      <span className="w-4 h-4 rounded-full border border-border inline-block" style={{ backgroundColor: v.colorHex }}></span>
                    )}
                    <span className="text-sm font-medium">{v.label}</span>
                    <button type="button" onClick={() => handleRemoveValue(v.value)} className="text-destructive hover:text-red-700 font-bold flex items-center justify-center w-6 h-6 rounded-full hover:bg-danger-bg">&times;</button>
                  </span>
                ))}
                {values.length === 0 && <span className="text-sm text-muted-foreground italic">No values added yet.</span>}
              </div>
            </div>
          )}

          {type === 'RANGE' && (
            <div className="md:col-span-2 border p-4 rounded-lg bg-muted grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1 sm:col-span-2 md:col-span-4">
                <label className="block text-sm font-bold text-foreground mb-1">Range Configuration</label>
                <p className="text-xs text-muted-foreground mb-2">Set the limits and unit for the range slider.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Min Value</label>
                <input type="number" required value={rangeMin} onChange={e => setRangeMin(e.target.value)}
                  className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Max Value</label>
                <input type="number" required value={rangeMax} onChange={e => setRangeMax(e.target.value)}
                  className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Step</label>
                <input type="number" required min="0.01" step="0.01" value={rangeStep} onChange={e => setRangeStep(e.target.value)}
                  className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Unit (Optional)</label>
                <input type="text" value={rangeUnit} onChange={e => setRangeUnit(e.target.value)} placeholder="e.g. $, GB, kg"
                  className="w-full px-4 py-2 min-h-[44px] text-base border rounded focus:ring-black focus:border-black" />
              </div>
            </div>
          )}

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-4">
            <button type="submit" className="bg-black text-white px-6 py-2 min-h-[44px] text-base rounded font-medium hover:bg-secondary">
              {isEditing ? 'Update Filter' : 'Create Filter'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="bg-muted/80 text-foreground px-6 py-2 min-h-[44px] text-base rounded font-medium hover:bg-muted-foreground/20">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mb-4 flex gap-4 border-b">
        <button 
          onClick={() => setActiveTab('ALL')} 
          className={`pb-2 min-h-[44px] font-medium flex items-center ${activeTab === 'ALL' ? 'border-b-2 border-black text-black' : 'text-muted-foreground hover:text-black'}`}
        >
          All Filters
        </button>
        <button 
          onClick={() => setActiveTab('SUGGESTED')} 
          className={`pb-2 min-h-[44px] font-medium flex items-center gap-2 ${activeTab === 'SUGGESTED' ? 'border-b-2 border-black text-black' : 'text-muted-foreground hover:text-black'}`}
        >
          Suggested Queue
          {filters.filter(f => f.status === 'SUGGESTED').length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              {filters.filter(f => f.status === 'SUGGESTED').length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="p-4 font-medium text-muted-foreground">Key</th>
                <th className="p-4 font-medium text-muted-foreground">Label</th>
                <th className="p-4 font-medium text-muted-foreground">Type</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFilters.map(filter => (
                <tr key={filter.id} className="hover:bg-muted">
                  <td className="p-4 font-medium text-foreground">{filter.key}</td>
                  <td className="p-4">{filter.label}</td>
                  <td className="p-4"><span className="bg-muted text-foreground px-2 py-1 rounded text-xs font-bold">{filter.type}</span></td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      filter.status === 'ACTIVE' ? 'bg-success-bg text-success-text' :
                      filter.status === 'SUGGESTED' ? 'bg-yellow-100 text-yellow-700' : 'bg-danger-bg text-destructive'
                    }`}>
                      {filter.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {filter.status === 'SUGGESTED' && (
                      <button onClick={() => handleApprove(filter.id)} className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-success-text hover:text-green-800 hover:bg-success-bg rounded transition-colors" title="Approve">
                        <Check size={20} />
                      </button>
                    )}
                    <button onClick={() => handleEdit(filter)} className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-black hover:bg-muted rounded transition-colors" title="Edit">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDelete(filter.id)} className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted rounded transition-colors" title={filter.status === 'SUGGESTED' ? 'Reject' : 'Delete'}>
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredFilters.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No filters found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {filteredFilters.map(filter => (
            <div key={filter.id} className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <div className="font-bold text-base text-foreground">{filter.label}</div>
                <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${
                  filter.status === 'ACTIVE' ? 'bg-success-bg text-success-text' :
                  filter.status === 'SUGGESTED' ? 'bg-yellow-100 text-yellow-700' : 'bg-danger-bg text-destructive'
                }`}>
                  {filter.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div><span className="font-medium text-foreground">Key:</span> {filter.key}</div>
                <div><span className="font-medium text-foreground">Type:</span> <span className="bg-muted text-foreground px-2 py-0.5 rounded text-xs font-bold">{filter.type}</span></div>
              </div>
              <div className="flex gap-2 mt-2 pt-4 border-t border-border">
                {filter.status === 'SUGGESTED' && (
                  <button onClick={() => handleApprove(filter.id)} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-success-text bg-success-bg rounded-lg text-sm font-medium transition-colors">
                    <Check size={18} /> Approve
                  </button>
                )}
                <button onClick={() => handleEdit(filter)} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-primary-600 bg-primary-50 rounded-lg text-sm font-medium transition-colors">
                  <Edit2 size={18} /> Edit
                </button>
                <button onClick={() => handleDelete(filter.id)} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 text-destructive bg-danger-bg rounded-lg text-sm font-medium transition-colors">
                  <Trash2 size={18} /> {filter.status === 'SUGGESTED' ? 'Reject' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
          {filteredFilters.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No filters found</div>
          )}
        </div>
      </div>
    </div>
  );
}
