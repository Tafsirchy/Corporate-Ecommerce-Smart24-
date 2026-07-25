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
  const [values, setValues] = useState<{value: string, label: string}[]>([]);
  const [newValueVal, setNewValueVal] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filtersRes, catsRes] = await Promise.all([
        apiClient.get('/filters/admin/all'),
        apiClient.get('/categories')
      ]);
      setFilters(filtersRes.data);
      setCategories(catsRes.data);
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
    setValues([...values, { value: newValueVal.trim(), label: newValueVal.trim() }]);
    setNewValueVal('');
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
    setValues([]);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        key, label, type, status, 
        categoryIds: selectedCategories,
        values
      };

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

  const handleDelete = async (id: string) => {
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

  const handleApprove = async (id: string) => {
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Filter' : 'Add New Filter'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key (slug)</label>
            <input type="text" required value={key} onChange={e => setKey(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black" placeholder="e.g. storage_capacity" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label (Display Name)</label>
            <input type="text" required value={label} onChange={e => setLabel(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black" placeholder="e.g. Storage Capacity" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select required value={type} onChange={e => setType(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black">
              <option value="CHECKBOX">Checkbox (Multi-select)</option>
              <option value="RADIO">Radio (Single-select)</option>
              <option value="SWATCH">Color Swatch</option>
              <option value="RANGE">Range (Min/Max)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select required value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-black focus:border-black">
              <option value="ACTIVE">Active</option>
              <option value="SUGGESTED">Suggested (Hidden)</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Scoped Categories (Leave empty for All)</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-2 rounded">
              {categories.map(c => (
                <label key={c.id} className="flex items-center gap-1.5 text-sm cursor-pointer p-1">
                  <input type="checkbox" checked={selectedCategories.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCategories([...selectedCategories, c.id]);
                      else setSelectedCategories(selectedCategories.filter(id => id !== c.id));
                    }} className="rounded text-black" />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {type !== 'RANGE' && (
            <div className="md:col-span-2 border p-4 rounded-lg bg-gray-50">
              <label className="block text-sm font-bold text-gray-900 mb-2">Predefined Values</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={newValueVal} onChange={e => setNewValueVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddValue())}
                  placeholder="Add value (e.g. 128GB)" className="flex-1 px-3 py-2 border rounded text-sm" />
                <button type="button" onClick={handleAddValue} className="bg-black text-white px-4 py-2 rounded text-sm">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {values.map(v => (
                  <span key={v.value} className="bg-white border px-2 py-1 rounded text-sm flex items-center gap-1">
                    {v.label}
                    <button type="button" onClick={() => handleRemoveValue(v.value)} className="text-red-500 hover:text-red-700 font-bold ml-1">&times;</button>
                  </span>
                ))}
                {values.length === 0 && <span className="text-sm text-gray-500 italic">No values added yet.</span>}
              </div>
            </div>
          )}

          <div className="md:col-span-2 flex gap-3 pt-4">
            <button type="submit" className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800">
              {isEditing ? 'Update Filter' : 'Create Filter'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-medium hover:bg-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mb-4 flex gap-4 border-b">
        <button 
          onClick={() => setActiveTab('ALL')} 
          className={`pb-2 font-medium ${activeTab === 'ALL' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
        >
          All Filters
        </button>
        <button 
          onClick={() => setActiveTab('SUGGESTED')} 
          className={`pb-2 font-medium flex items-center gap-2 ${activeTab === 'SUGGESTED' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
        >
          Suggested Queue
          {filters.filter(f => f.status === 'SUGGESTED').length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              {filters.filter(f => f.status === 'SUGGESTED').length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Key</th>
              <th className="p-4 font-medium text-gray-600">Label</th>
              <th className="p-4 font-medium text-gray-600">Type</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFilters.map(filter => (
              <tr key={filter.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{filter.key}</td>
                <td className="p-4">{filter.label}</td>
                <td className="p-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{filter.type}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    filter.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    filter.status === 'SUGGESTED' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {filter.status}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  {filter.status === 'SUGGESTED' && (
                    <button onClick={() => handleApprove(filter.id)} className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded" title="Approve">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => handleEdit(filter)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(filter.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded" title={filter.status === 'SUGGESTED' ? 'Reject' : 'Delete'}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredFilters.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No filters found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
