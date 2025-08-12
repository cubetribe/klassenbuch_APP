'use client';

import { useEffect } from 'react';
import { useAppStore } from './app-store';
import { useSSE } from '@/hooks/use-sse';

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const {
    currentCourse,
    setRealtimeConnection,
    handleBehaviorEvent,
    handleStudentUpdate,
    handleRewardRedeemed,
    handleConsequenceApplied,
  } = useAppStore();

  const { connectionStatus } = useSSE({
    courseIds: currentCourse ? [currentCourse.id] : [],
    autoConnect: !!currentCourse,
    onBehaviorEvent: handleBehaviorEvent,
    onStudentUpdate: handleStudentUpdate,
    onRewardRedeemed: handleRewardRedeemed,
    onConsequenceApplied: handleConsequenceApplied,
  });

  useEffect(() => {
    setRealtimeConnection(connectionStatus);
  }, [connectionStatus, setRealtimeConnection]);

  return <>{children}</>;
}