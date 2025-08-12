// Global event emitter for server-side events
// This manages real-time event broadcasting across the application

import { EventEmitter } from 'events';

export interface SSEEvent {
  type: 'behavior_event' | 'student_update' | 'course_update' | 'reward_redeemed' | 'consequence_applied';
  courseId: string;
  data: any;
  timestamp: Date;
}

class GlobalEventEmitter extends EventEmitter {
  private static instance: GlobalEventEmitter;

  private constructor() {
    super();
    // Increase max listeners to handle multiple concurrent connections
    this.setMaxListeners(100);
  }

  static getInstance(): GlobalEventEmitter {
    if (!GlobalEventEmitter.instance) {
      GlobalEventEmitter.instance = new GlobalEventEmitter();
    }
    return GlobalEventEmitter.instance;
  }

  // Emit event to specific course channel
  broadcastToCourse(courseId: string, event: SSEEvent) {
    this.emit(`course:${courseId}`, event);
    // Also emit to global channel for admin monitoring
    this.emit('global', event);
  }

  // Subscribe to course events
  subscribeToCourse(courseId: string, listener: (event: SSEEvent) => void) {
    this.on(`course:${courseId}`, listener);
  }

  // Unsubscribe from course events
  unsubscribeFromCourse(courseId: string, listener: (event: SSEEvent) => void) {
    this.off(`course:${courseId}`, listener);
  }

  // Subscribe to all events (admin only)
  subscribeToGlobal(listener: (event: SSEEvent) => void) {
    this.on('global', listener);
  }

  // Unsubscribe from global events
  unsubscribeFromGlobal(listener: (event: SSEEvent) => void) {
    this.off('global', listener);
  }
}

export const eventEmitter = GlobalEventEmitter.getInstance();