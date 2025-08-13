import { z } from 'zod';

export const createRewardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  costXP: z.number().int().positive().optional(),
  costLevel: z.number().int().positive().optional(),
  weeklyLimit: z.number().int().positive().max(10).optional(),
  category: z.string().min(1).max(50),
  emoji: z.string().min(1).max(10).optional(),
}).refine(
  (data) => data.costXP || data.costLevel,
  {
    message: 'Either costXP or costLevel must be specified',
    path: ['costXP'],
  }
);

export const updateRewardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  costXP: z.number().int().positive().optional(),
  costLevel: z.number().int().positive().optional(),
  weeklyLimit: z.number().int().positive().max(10).optional().nullable(),
  category: z.string().min(1).max(50).optional(),
  emoji: z.string().min(1).max(10).optional().nullable(),
  active: z.boolean().optional(),
});

export const redeemRewardSchema = z.object({
  rewardId: z.string().uuid('Invalid reward ID'),
  studentId: z.string().uuid('Invalid student ID'),
  notes: z.string().max(500).optional(),
});

export const bulkRedeemSchema = z.object({
  rewardId: z.string().uuid('Invalid reward ID'),
  studentIds: z.array(z.string().uuid()).min(1).max(30),
  notes: z.string().max(500).optional(),
});