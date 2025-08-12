import { z } from 'zod';

// Common validation schemas used across the application

export const idSchema = z.string().uuid('Invalid ID format');

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const colorSchema = z.enum(['BLUE', 'GREEN', 'YELLOW', 'RED']);

export const roleSchema = z.enum(['TEACHER', 'CO_TEACHER', 'ADMIN']);

export const eventTypeSchema = z.enum([
  'COLOR_CHANGE',
  'LEVEL_CHANGE',
  'XP_CHANGE',
  'REWARD_REDEEMED',
  'CONSEQUENCE_APPLIED',
  'AUTO_RULE',
  'MANUAL_ACTION',
]);

export const severitySchema = z.enum(['MINOR', 'MODERATE', 'MAJOR']);