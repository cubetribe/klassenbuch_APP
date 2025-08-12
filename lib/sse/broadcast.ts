// Broadcast utilities for sending real-time updates
// Used by API routes to send events to connected clients

import { eventEmitter, SSEEvent } from './event-emitter';
import { connectionManager } from './connection-manager';

export interface BroadcastOptions {
  excludeUserId?: string; // Exclude specific user from broadcast
  includeUserIds?: string[]; // Only send to specific users
}

// Broadcast behavior event
export async function broadcastBehaviorEvent(
  courseId: string,
  event: any,
  options?: BroadcastOptions
) {
  const sseEvent: SSEEvent = {
    type: 'behavior_event',
    courseId,
    data: event,
    timestamp: new Date(),
  };

  // Emit through event emitter (for new connections)
  eventEmitter.broadcastToCourse(courseId, sseEvent);

  // Also broadcast to existing connections
  await connectionManager.broadcastToCourse(courseId, sseEvent);
}

// Broadcast student update
export async function broadcastStudentUpdate(
  courseId: string,
  studentId: string,
  updates: any,
  options?: BroadcastOptions
) {
  const sseEvent: SSEEvent = {
    type: 'student_update',
    courseId,
    data: {
      studentId,
      updates,
    },
    timestamp: new Date(),
  };

  eventEmitter.broadcastToCourse(courseId, sseEvent);
  await connectionManager.broadcastToCourse(courseId, sseEvent);
}

// Broadcast course update
export async function broadcastCourseUpdate(
  courseId: string,
  updates: any,
  options?: BroadcastOptions
) {
  const sseEvent: SSEEvent = {
    type: 'course_update',
    courseId,
    data: updates,
    timestamp: new Date(),
  };

  eventEmitter.broadcastToCourse(courseId, sseEvent);
  await connectionManager.broadcastToCourse(courseId, sseEvent);
}

// Broadcast reward redemption
export async function broadcastRewardRedemption(
  courseId: string,
  redemption: {
    studentId: string;
    studentName: string;
    rewardName: string;
    costXP?: number;
  },
  options?: BroadcastOptions
) {
  const sseEvent: SSEEvent = {
    type: 'reward_redeemed',
    courseId,
    data: redemption,
    timestamp: new Date(),
  };

  eventEmitter.broadcastToCourse(courseId, sseEvent);
  await connectionManager.broadcastToCourse(courseId, sseEvent);
}

// Broadcast consequence application
export async function broadcastConsequenceApplication(
  courseId: string,
  application: {
    studentId: string;
    studentName: string;
    consequenceName: string;
    severity: string;
    xpPenalty: number;
  },
  options?: BroadcastOptions
) {
  const sseEvent: SSEEvent = {
    type: 'consequence_applied',
    courseId,
    data: application,
    timestamp: new Date(),
  };

  eventEmitter.broadcastToCourse(courseId, sseEvent);
  await connectionManager.broadcastToCourse(courseId, sseEvent);
}

// Utility to create SSE-formatted response
export function formatSSEMessage(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// Utility to create SSE comment (for keep-alive)
export function formatSSEComment(comment: string): string {
  return `: ${comment}\n\n`;
}