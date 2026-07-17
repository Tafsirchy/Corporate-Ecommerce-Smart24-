'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Account</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-lg text-gray-700"><strong>Email:</strong> {user.email}</p>
        {user.role && <p className="text-lg mt-2 text-gray-700"><strong>Role:</strong> {user.role}</p>}
        
        <div className="mt-8">
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
