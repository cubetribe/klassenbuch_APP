"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/stores';
import { mockUser, mockCourses, mockStudents } from '@/lib/mock-data';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, setUser, setCourses, setStudents } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    // Mock authentication check
    if (!isAuthenticated) {
      setUser(mockUser);
      setCourses(mockCourses);
      setStudents(mockStudents);
    }
  }, [isAuthenticated, setUser, setCourses, setStudents]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}