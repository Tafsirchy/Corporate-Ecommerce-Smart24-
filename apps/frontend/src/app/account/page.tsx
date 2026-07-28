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
      case 'CONFIRMED': return 'bg-info-bg text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-success-bg text-green-800';
      case 'CANCELLED': return 'bg-danger-bg text-red-800';
      default: return 'bg-muted text-foreground';
    }
  };

  if (loading) return <div className="p-8 text-center flex-1">Loading...</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground">My Account</h1>
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
          <div className="mb-6">
            <p className="text-muted-foreground text-sm mb-1">Hello, {user.phone || (user.email ? user.email.split('@')[0] : 'User')}</p>
            <div className="inline-flex items-center gap-1 bg-success-fill text-white text-xs font-semibold px-2 py-1 rounded-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Verified Account
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Link href="/account">
                <h3 className="text-[15px] font-semibold text-primary/90 mb-2 hover:text-primary-700 cursor-pointer">
                  Manage My Account
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li>
                  <Link href="/account/profile" className="text-muted-foreground hover:text-primary/90 text-[14px]">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link href="/account/address" className="text-muted-foreground hover:text-primary/90 text-[14px]">
                    Address Book
                  </Link>
                </li>
                <li>
                  <Link href="/account/payment" className="text-muted-foreground hover:text-primary/90 text-[14px]">
                    My Payment Options
                  </Link>
                </li>
              </ul>
            </div>

            {/* Smart24 Rewards Ecosystem */}
            <div>
              <h3 className="text-[15px] font-semibold text-foreground mb-2">
                Loyalty and Reward
              </h3>
              <ul className="space-y-2 pl-4">
                <li>
                  <Link href="/account/membership" className="text-muted-foreground hover:text-primary/90 text-[14px]">
                    My Membership
                  </Link>
                </li>
                <li>
                  <Link href="/account/rewards" className="text-muted-foreground hover:text-primary/90 text-[14px]">
                    Reward Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/account/points-history" className="text-muted-foreground hover:text-primary/90 text-[14px]">
                    Points History
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Link href="/account/orders">
                <h3 className="text-[15px] font-semibold text-foreground mb-2 hover:text-primary/90 cursor-pointer">
                  My Orders
                </h3>
              </Link>
              <ul className="space-y-2 pl-4">
                <li>
                  <Link href="/account/returns" className="text-muted-foreground hover:text-primary/90 text-[14px]">
                    My Returns
                  </Link>
                </li>
                <li>
                  <Link href="/account/cancellations" className="text-muted-foreground hover:text-primary/90 text-[14px]">
                    My Cancellations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-foreground hover:text-primary/90 cursor-pointer">
                <Link href="/account/reviews">My Reviews</Link>
              </h3>
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-foreground hover:text-primary/90 cursor-pointer">
                <Link href="/account/wishlist">My Wishlist & Followed Stores</Link>
              </h3>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-[22px] text-foreground font-normal">Manage My Account</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Profile */}
            <div className="bg-white p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-[15px] text-foreground font-medium">Personal Profile</h3>
                <span className="text-muted-foreground">|</span>
                <Link href="/account/profile/edit" className="text-primary text-[13px] hover:underline uppercase">Edit</Link>
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-foreground mb-4">{user.email || 'tafsirchy@gmail.com'}</p>
                <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-info-text focus:ring-blue-500 border-border rounded-sm" />
                  Receive marketing SMS
                </label>
              </div>
            </div>

            {/* Address Book */}
            <div className="bg-white p-6 col-span-1 md:col-span-2 relative">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-[15px] text-foreground font-medium">Address Book</h3>
                <span className="text-muted-foreground">|</span>
                <Link href="/account/address/edit" className="text-primary text-[13px] hover:underline uppercase">Edit</Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="flex-1">
                  <p className="text-[12px] text-muted-foreground mb-4 uppercase">Default Shipping Address</p>
                  <p className="text-[14px] font-semibold text-foreground mb-1">{user.name || 'User Name'}</p>
                  <p className="text-[13px] text-muted-foreground mb-1 leading-relaxed">House 21, Road 6/A, Sector 12, Uttara, Dhaka...</p>
                  <p className="text-[13px] text-muted-foreground mb-1 leading-relaxed">Dhaka - Dhaka - North - Uttara Sector 12</p>
                  <p className="text-[13px] text-muted-foreground">(+880) {user.phone || '1633996633'}</p>
                </div>

                <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-muted -ml-[1px]"></div>

                <div className="flex-1">
                  <p className="text-[12px] text-muted-foreground mb-4 uppercase">Default Billing Address</p>
                  <p className="text-[14px] font-semibold text-foreground mb-1">{user.name || 'User Name'}</p>
                  <p className="text-[13px] text-muted-foreground mb-1 leading-relaxed">House 21, Road 6/A, Sector 12, Uttara, Dhaka...</p>
                  <p className="text-[13px] text-muted-foreground mb-1 leading-relaxed">Dhaka - Dhaka - North - Uttara Sector 12</p>
                  <p className="text-[13px] text-muted-foreground">(+880) {user.phone || '1633996633'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6">
            <h3 className="text-[15px] text-foreground font-medium mb-4">Recent Orders</h3>
            
            {loadingOrders ? (
              <p className="text-[13px] text-muted-foreground py-4">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-[13px] text-muted-foreground py-4">You haven't placed any orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-muted text-muted-foreground text-[13px]">
                      <th className="py-3 px-4 font-normal w-1/4">Order #</th>
                      <th className="py-3 px-4 font-normal w-1/4">Placed On</th>
                      <th className="py-3 px-4 font-normal w-1/4">Items</th>
                      <th className="py-3 px-4 font-normal w-1/6 text-right">Total</th>
                      <th className="py-3 px-4 font-normal w-1/12 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted transition">
                        <td className="py-4 px-4 text-[13px] text-foreground">{order.id.substring(0, 15)}</td>
                        <td className="py-4 px-4 text-[13px] text-foreground">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="py-4 px-4">
                          {/* Display thumbnail based on order items if available, else placeholder */}
                          <div className="w-10 h-10 bg-muted/80 rounded">
                            <img src="https://via.placeholder.com/40" alt="Item" className="w-full h-full object-cover rounded" />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[13px] text-foreground text-right">৳ {order.totalAmount}</td>
                        <td className="py-4 px-4 text-[13px] text-right">
                          <Link href={`/track-order?id=${order.id}`} className="text-success-text font-medium hover:underline uppercase">Track</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
