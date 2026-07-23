'use client';
import { useAuth, apiClient } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchOrders();
    }
  }, [user, loading, router]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await apiClient.get('/orders');
      setOrders(res.data);
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-4 h-fit">
            <ul className="space-y-1">
              <li>
                <Link href="/account" className="block px-4 py-2.5 text-primary-600 font-semibold bg-primary-50 rounded-md">
                  Manage My Account
                </Link>
              </li>
              <li>
                <Link href="/account" className="block px-4 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="block px-4 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition">
                  My Wishlist & Followed Stores
                </Link>
              </li>
              <li>
                <Link href="/account" className="block px-4 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition">
                  My Reviews
                </Link>
              </li>
              <li>
                <Link href="/account" className="block px-4 py-2.5 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition">
                  My Returns & Cancellations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Profile Information</h2>
            <p className="text-gray-700 mb-2"><strong>Email:</strong> {user.email}</p>
            {user.role && <p className="text-gray-700 mb-2"><strong>Role:</strong> {user.role}</p>}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 border-b pb-2">My Orders</h2>
            
            {loadingOrders ? (
              <p className="text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div>
                <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                <Link href="/shop" className="text-primary-600 hover:underline">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg">#{order.id.substring(0, 8).toUpperCase()}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="font-bold">৳{order.totalAmount}</span>
                      <Link 
                        href={`/track-order?id=${order.id}`}
                        className="text-sm border border-black text-black px-4 py-1 rounded hover:bg-black hover:text-white transition text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
