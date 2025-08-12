"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/stores/app-store';
import { SSEProvider } from '@/lib/stores/sse-integration';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { checkAuth } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Set user in store directly from session
      const { user, isAuthenticated } = useAppStore.getState();
      if (!user || user.id !== session.user.id) {
        useAppStore.setState({
          user: {
            id: session.user.id as string,
            email: session.user.email as string,
            name: session.user.name as string,
            role: (session.user as any).role || 'TEACHER',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          isAuthenticated: true
        });
      }
    }
  }, [session, status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <SSEProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SSEProvider>
  );
}