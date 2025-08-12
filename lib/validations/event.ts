import { z } from 'zod';
import { eventTypeSchema, colorSchema } from './common';

export const createBehaviorEventSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  courseId: z.string().uuid('Invalid course ID'),
  type: eventTypeSchema,
  payload: z.record(z.any()),
  notes: z.string().optional(),
});

export const quickActionEventSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1, 'At least one student must be selected'),
  courseId: z.string().uuid('Invalid course ID'),
  actionType: z.enum(['xp_change', 'level_change', 'color_change', 'warning', 'praise']),
  value: z.union([
    z.number(), // For XP/level changes
    z.string(), // For color changes or action identifiers
  ]),
  notes: z.string().optional(),
});

export const bulkEventSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  events: z.array(z.object({
    studentId: z.string().uuid(),
    type: eventTypeSchema,
    payload: z.record(z.any()),
    notes: z.string().optional(),
  })).min(1).max(50),
});

export const eventFilterSchema = z.object({
  studentId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  type: eventTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});