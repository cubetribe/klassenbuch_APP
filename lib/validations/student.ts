import { z } from 'zod';
import { colorSchema } from './common';

export const createStudentSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters')
    .regex(/^[a-zA-ZäöüÄÖÜß\s\-\.]+$/, 'Display name contains invalid characters'),
  avatarEmoji: z.string().min(1).max(10).optional(),
});

export const updateStudentSchema = z.object({
  displayName: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-ZäöüÄÖÜß\s\-\.]+$/, 'Display name contains invalid characters')
    .optional(),
  avatarEmoji: z.string().min(1).max(10).optional().nullable(),
  active: z.boolean().optional(),
  currentColor: colorSchema.optional(),
  currentLevel: z.number().int().min(0).max(100).optional(),
  currentXP: z.number().int().min(0).optional(),
});

export const bulkCreateStudentsSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  students: z.array(z.object({
    displayName: z.string()
      .min(1)
      .max(50)
      .regex(/^[a-zA-ZäöüÄÖÜß\s\-\.]+$/, 'Display name contains invalid characters'),
    avatarEmoji: z.string().min(1).max(10).optional(),
  })).min(1, 'At least one student is required').max(100, 'Maximum 100 students at once'),
});

export const studentFilterSchema = z.object({
  courseId: z.string().uuid('Invalid course ID').nullable(),
  active: z.string().nullable().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }).optional(),
  color: z.enum(['BLUE', 'GREEN', 'YELLOW', 'RED']).nullable().optional(),
  search: z.string().nullable().optional(),
});