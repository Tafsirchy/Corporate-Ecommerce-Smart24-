'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      // Small timeout to ensure route change starts before showing modal
      setTimeout(() => openAuthModal('login'), 100);
    }
  }, [user, loading, router, openAuthModal, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground font-semibold animate-pulse">Loading Account...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
