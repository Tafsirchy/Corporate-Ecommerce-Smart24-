'use client';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
                  <Link href="/account/profile" className="text-primary/90 font-semibold text-[14px]">
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
          <h2 className="text-[22px] text-foreground font-normal">My profile</h2>
          
          <div className="bg-white p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6">
              {/* Row 1 */}
              <div>
                <p className="text-[13px] text-muted-foreground mb-2">Full Name</p>
                <p className="text-[14px] text-foreground">{user.name || user.phone || '1633996633'}</p>
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-2">
                  Email Address <span className="text-muted-foreground mx-1">|</span> <Link href="/account/profile/edit" className="text-primary hover:underline">Add</Link>
                </p>
                <p className="text-[14px] text-foreground">{user.email || '@'}</p>
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-2">
                  Mobile <span className="text-muted-foreground mx-1">|</span> <Link href="/account/profile/edit" className="text-primary hover:underline">Change</Link>
                </p>
                <p className="text-[14px] text-foreground mb-3">{user.phone ? `+880 ${user.phone}` : '+880 163*****33'}</p>
                <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-accent focus:ring-orange-500 border-border rounded-sm" />
                  Receive marketing SMS
                </label>
              </div>

              {/* Row 2 */}
              <div>
                <p className="text-[13px] text-muted-foreground mb-2">Birthday</p>
                {user.birthday ? (
                  <p className="text-[14px] text-foreground">{user.birthday}</p>
                ) : (
                  <p className="text-[14px] text-muted-foreground">Please enter your birthday</p>
                )}
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-2">Gender</p>
                {user.gender ? (
                  <p className="text-[14px] text-foreground">{user.gender}</p>
                ) : (
                  <p className="text-[14px] text-muted-foreground">Please enter your gender</p>
                )}
              </div>
              <div className="hidden md:block"></div>
            </div>

            <div className="mt-12 space-y-4 max-w-xs">
              <Link href="/account/profile/edit" className="block w-full bg-primary text-white text-center py-3 text-[14px] font-medium hover:bg-primary/90 transition uppercase">
                Edit Profile
              </Link>
              <Link href="/account/profile/password" className="block w-full bg-primary text-white text-center py-3 text-[14px] font-medium hover:bg-primary/90 transition uppercase">
                Change Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
