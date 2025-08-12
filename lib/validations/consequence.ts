import { z } from 'zod';
import { severitySchema } from './common';

export const createConsequenceSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  severity: severitySchema,
  notesRequired: z.boolean().default(false),
  emoji: z.string().emoji().optional(),
});

export const updateConsequenceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  severity: severitySchema.optional(),
  notesRequired: z.boolean().optional(),
  emoji: z.string().emoji().optional().nullable(),
  active: z.boolean().optional(),
});

export const applyConsequenceSchema = z.object({
  consequenceId: z.string().uuid('Invalid consequence ID'),
  studentId: z.string().uuid('Invalid student ID'),
  notes: z.string().min(1).max(1000),
}).refine(
  (data) => {
    // Notes will be validated against notesRequired in the API
    return true;
  }
);

export const bulkApplyConsequenceSchema = z.object({
  consequenceId: z.string().uuid('Invalid consequence ID'),
  studentIds: z.array(z.string().uuid()).min(1).max(30),
  notes: z.string().min(1).max(1000),
});