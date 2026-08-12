'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function BusinessSavedListsPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLists();
  }, []);

  async function fetchLists() {
    try {
      const res = await apiClient.get('/saved-list');
      setLists(res.data);
    } catch (err: any) {
      toast.error('Failed to fetch saved lists');
    } finally {
      setLoading(false);
    }
  };

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this saved list?')) return;
    try {
      await apiClient.delete(`/saved-list/${id}`);
      toast.success('List deleted');
      fetchLists();
    } catch (err: any) {
      toast.error('Failed to delete list');
    }
  };

  async function handleAddToCart(list: any) {
    try {
      for (const item of list.productItems) {
        await apiClient.post('/cart/items', {
          productId: item.productId,
          quantity: item.qty || 1
        });
      }
      toast.success('Added all items to cart!');
    } catch (err) {
      toast.error('Failed to add some items to cart');
    }
  };

  return (
    <div className="p-4 sm:p-8 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Purchase Lists</h1>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : lists.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-muted-foreground border border-border">
          You don't have any saved lists yet. Add items from the bulk order page.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map(list => (
            <div key={list.id} className="bg-white rounded-xl shadow border border-border p-6 flex flex-col">
              <h2 className="text-xl font-bold mb-2">{list.name}</h2>
              <p className="text-muted-foreground mb-4">{list.productItems.length} items</p>
              
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => handleAddToCart(list)}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="px-4 text-red-600 hover:text-red-800 border border-red-200 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
