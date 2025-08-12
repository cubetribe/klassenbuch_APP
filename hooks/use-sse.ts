'use client';

import { useEffect, useRef, useState } from 'react';
import { SSEClient, SSEMessage, SSEEventType } from '@/lib/realtime/sse-client';

export interface UseSSEOptions {
  courseIds?: string[];
  autoConnect?: boolean;
  onMessage?: (message: SSEMessage) => void;
  onBehaviorEvent?: (event: any) => void;
  onStudentUpdate?: (update: any) => void;
  onRewardRedeemed?: (redemption: any) => void;
  onConsequenceApplied?: (application: any) => void;
}

export function useSSE(options: UseSSEOptions = {}) {
  const {
    courseIds = [],
    autoConnect = true,
    onMessage,
    onBehaviorEvent,
    onStudentUpdate,
    onRewardRedeemed,
    onConsequenceApplied,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const clientRef = useRef<SSEClient | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // Create SSE client
    const client = new SSEClient({
      courseIds,
      onConnect: () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      },
      onError: (err) => {
        setError(err);
        setConnectionStatus('disconnected');
      },
      onMessage: (message) => {
        setLastMessage(message);
        onMessage?.(message);
      },
    });

    // Set up event listeners
    if (onBehaviorEvent) {
      client.on('behavior_event', (message: SSEMessage) => {
        onBehaviorEvent(message.data);
      });
    }

    if (onStudentUpdate) {
      client.on('student_update', (message: SSEMessage) => {
        onStudentUpdate(message.data);
      });
    }

    if (onRewardRedeemed) {
      client.on('reward_redeemed', (message: SSEMessage) => {
        onRewardRedeemed(message.data);
      });
    }

    if (onConsequenceApplied) {
      client.on('consequence_applied', (message: SSEMessage) => {
        onConsequenceApplied(message.data);
      });
    }

    // Connect
    setConnectionStatus('connecting');
    client.connect();
    clientRef.current = client;

    // Cleanup
    return () => {
      client.destroy();
      clientRef.current = null;
    };
  }, [autoConnect, courseIds.join(',')]); // Re-connect when courseIds change

  // Manual connect function
  const connect = (newCourseIds?: string[]) => {
    if (!clientRef.current) {
      // Create new client if it doesn't exist
      const client = new SSEClient({
        courseIds: newCourseIds || courseIds,
        onConnect: () => {
          setIsConnected(true);
          setConnectionStatus('connected');
          setError(null);
        },
        onDisconnect: () => {
          setIsConnected(false);
          setConnectionStatus('disconnected');
        },
        onError: (err) => {
          setError(err);
          setConnectionStatus('disconnected');
        },
        onMessage: (message) => {
          setLastMessage(message);
          onMessage?.(message);
        },
      });
      clientRef.current = client;
    }

    setConnectionStatus('connecting');
    clientRef.current.connect(newCourseIds);
  };

  // Manual disconnect function
  const disconnect = () => {
    clientRef.current?.disconnect();
  };

  // Update courses
  const updateCourses = (newCourseIds: string[]) => {
    clientRef.current?.updateCourses(newCourseIds);
  };

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    error,
    connect,
    disconnect,
    updateCourses,
  };
}

// Hook for course-specific SSE
export function useCourseSSE(courseId: string | undefined, options: Omit<UseSSEOptions, 'courseIds'> = {}) {
  return useSSE({
    ...options,
    courseIds: courseId ? [courseId] : [],
    autoConnect: !!courseId && (options.autoConnect ?? true),
  });
}