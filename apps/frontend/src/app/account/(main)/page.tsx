'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useAuth, apiClient } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScrollFade } from '@/components/ui/ScrollFade';

export default function AccountPage() {
  const { user, loading } = useAuth();
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

  async function fetchOrders() {
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

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Profile */}
        <div className="bg-white p-6 flex flex-col rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
            <h3 className="text-base text-foreground font-semibold">Personal Profile</h3>
            <Link href="/account/profile/edit" className="text-primary font-medium hover:underline p-2 -mr-2 uppercase text-sm">Edit</Link>
          </div>
          <div className="flex-1">
            <p className="text-base text-foreground mb-4">{user.email || 'tafsirchy@gmail.com'}</p>
            <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer p-2 -ml-2 rounded-lg hover:bg-muted active:bg-muted/80">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-info-text focus:ring-blue-500 border-border rounded" />
              Receive marketing SMS
            </label>
          </div>
        </div>

        {/* Address Book */}
        <div className="bg-white p-6 col-span-1 md:col-span-2 relative rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
            <h3 className="text-base text-foreground font-semibold">Address Book</h3>
            <Link href="/account/address/edit" className="text-primary font-medium hover:underline p-2 -mr-2 uppercase text-sm">Edit</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Default Shipping</p>
              <p className="text-base font-bold text-foreground mb-2">{user.name || 'User Name'}</p>
              <p className="text-base text-muted-foreground mb-1 leading-relaxed">House 21, Road 6/A, Sector 12, Uttara, Dhaka...</p>
              <p className="text-base text-muted-foreground mb-2 leading-relaxed">Dhaka - Dhaka - North - Uttara Sector 12</p>
              <p className="text-base font-medium text-foreground">(+880) {user.phone || '1633996633'}</p>
            </div>

            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-border -ml-[1px]"></div>

            <div className="flex-1 pt-6 md:pt-0 border-t border-border md:border-0">
              <p className="text-sm text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Default Billing</p>
              <p className="text-base font-bold text-foreground mb-2">{user.name || 'User Name'}</p>
              <p className="text-base text-muted-foreground mb-1 leading-relaxed">House 21, Road 6/A, Sector 12, Uttara, Dhaka...</p>
              <p className="text-base text-muted-foreground mb-2 leading-relaxed">Dhaka - Dhaka - North - Uttara Sector 12</p>
              <p className="text-base font-medium text-foreground">(+880) {user.phone || '1633996633'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
        <h3 className="text-lg text-foreground font-bold mb-6">Recent Orders</h3>
        
        {loadingOrders ? (
          <p className="text-base text-muted-foreground py-4">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-base text-muted-foreground py-4">You haven't placed any orders yet.</p>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="bg-muted/30 p-5 rounded-xl border border-border flex flex-col gap-4 active:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="font-bold text-base text-foreground">#{order.id.substring(0, 8)}</span>
                    <span className="text-sm font-medium text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted/80 rounded-lg overflow-hidden shrink-0 border border-border">
                      <OptimizedImage src="https://via.placeholder.com/48" alt="Item" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-lg font-bold text-foreground">৳ {order.totalAmount}</span>
                      <Link href={`/track-order?id=${order.id}`} className="px-5 py-2.5 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 active:bg-primary/30 transition-colors">
                        Track
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <ScrollFade className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                    <th className="py-4 px-4 font-semibold w-1/4 rounded-tl-lg">Order #</th>
                    <th className="py-4 px-4 font-semibold w-1/4">Placed On</th>
                    <th className="py-4 px-4 font-semibold w-1/4">Items</th>
                    <th className="py-4 px-4 font-semibold w-1/6 text-right">Total</th>
                    <th className="py-4 px-4 font-semibold w-1/12 text-right rounded-tr-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition">
                      <td className="py-5 px-4 text-base font-medium text-foreground">{order.id.substring(0, 15)}</td>
                      <td className="py-5 px-4 text-base text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="py-5 px-4">
                        <div className="w-12 h-12 bg-muted/80 rounded-md border border-border overflow-hidden">
                          <OptimizedImage src="https://via.placeholder.com/48" alt="Item" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-5 px-4 text-base font-bold text-foreground text-right">৳ {order.totalAmount}</td>
                      <td className="py-5 px-4 text-right">
                        <Link href={`/track-order?id=${order.id}`} className="inline-block px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors">Track</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollFade>
          </>
        )}
      </div>
    </div>
  );
}
