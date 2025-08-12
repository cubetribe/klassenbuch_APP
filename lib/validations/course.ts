import { z } from 'zod';
import { colorSchema } from './common';

const colorConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: colorSchema,
  emoji: z.string(),
  order: z.number(),
  minXP: z.number().optional(),
  maxXP: z.number().optional(),
});

const levelSystemSchema = z.object({
  startXP: z.number().default(50),
  levelThreshold: z.number().default(100),
  maxLevel: z.number().default(10),
  enableLevels: z.boolean().default(true),
});

const quickActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string(),
  xpChange: z.number(),
  colorChange: z.enum(['up', 'down']).optional(),
  hotkey: z.string().optional(),
});

const autoRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  condition: z.string(),
  action: z.string(),
  active: z.boolean(),
});

const boardModeSettingsSchema = z.object({
  layout: z.enum(['grid', 'list', 'seatmap']).default('grid'),
  showNames: z.boolean().default(true),
  showLevels: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'contrast']).default('light'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
});

export const courseSettingsSchema = z.object({
  colors: z.array(colorConfigSchema).default([
    { id: '1', label: 'Exzellent', color: 'BLUE', emoji: '⭐', order: 1, minXP: 80 },
    { id: '2', label: 'Gut', color: 'GREEN', emoji: '✅', order: 2, minXP: 60, maxXP: 79 },
    { id: '3', label: 'Warnung', color: 'YELLOW', emoji: '⚠️', order: 3, minXP: 30, maxXP: 59 },
    { id: '4', label: 'Kritisch', color: 'RED', emoji: '🚨', order: 4, maxXP: 29 },
  ]),
  levelSystem: levelSystemSchema,
  actions: z.array(quickActionSchema).default([]),
  autoRules: z.array(autoRuleSchema).default([]),
  boardMode: boardModeSettingsSchema,
});

export const createCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  subject: z.string().min(1, 'Subject is required'),
  schoolYear: z.string().min(1, 'School year is required'),
  settings: courseSettingsSchema.optional(),
});

export const updateCourseSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  schoolYear: z.string().min(1).optional(),
  settings: courseSettingsSchema.optional(),
  archived: z.boolean().optional(),
});