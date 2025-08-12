'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app-store';

// Polling statt SSE für Vercel Kompatibilität
export function useRealtimePolling(courseId?: string) {
  const { updateStudent, addBehaviorEvent } = useAppStore();

  // Fetcher function
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  // Poll for updates every 5 seconds (adjust as needed)
  const { data, error, mutate } = useSWR(
    courseId ? `/api/courses/${courseId}/updates` : null,
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    if (data?.students) {
      // Update students in store
      data.students.forEach((student: any) => {
        updateStudent(student.id, student);
      });
    }

    if (data?.events) {
      // Add new events to store
      data.events.forEach((event: any) => {
        addBehaviorEvent(event);
      });
    }
  }, [data, updateStudent, addBehaviorEvent]);

  return {
    isConnected: !error,
    isLoading: !data && !error,
    refresh: mutate,
  };
}

// Hook for manual updates (when user performs actions)
export function useOptimisticUpdate() {
  const { mutate } = useSWR();

  const optimisticUpdate = async (
    action: () => Promise<any>,
    optimisticData: any,
    rollbackData: any
  ) => {
    try {
      // Apply optimistic update
      mutate(optimisticData, false);
      
      // Perform actual action
      const result = await action();
      
      // Revalidate to get real data
      mutate();
      
      return result;
    } catch (error) {
      // Rollback on error
      mutate(rollbackData, false);
      throw error;
    }
  };

  return { optimisticUpdate };
}