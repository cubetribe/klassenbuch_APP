import { Color } from '@prisma/client';

interface ColorThreshold {
  minXP?: number;
  maxXP?: number;
}

interface LevelSystem {
  startXP: number;
  levelThreshold: number;
  maxLevel: number;
  enableLevels: boolean;
}

interface CourseSettings {
  colors?: Array<{
    color: string;
    minXP?: number;
    maxXP?: number;
  }>;
  levelSystem?: LevelSystem;
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number, levelThreshold: number = 100, maxLevel: number = 10): number {
  const level = Math.floor(xp / levelThreshold);
  return Math.min(level, maxLevel);
}

/**
 * Calculate color from XP based on course settings
 */
export function calculateColorFromXP(xp: number, settings: CourseSettings): Color {
  const defaultThresholds = [
    { color: 'BLUE', minXP: 80 },
    { color: 'GREEN', minXP: 60, maxXP: 79 },
    { color: 'YELLOW', minXP: 30, maxXP: 59 },
    { color: 'RED', maxXP: 29 },
  ];

  const thresholds = settings.colors || defaultThresholds;

  // Sort thresholds by minXP in descending order
  const sortedThresholds = [...thresholds].sort((a, b) => {
    const aMin = a.minXP ?? -Infinity;
    const bMin = b.minXP ?? -Infinity;
    return bMin - aMin;
  });

  for (const threshold of sortedThresholds) {
    if (threshold.minXP !== undefined && xp >= threshold.minXP) {
      return threshold.color as Color;
    }
    if (threshold.maxXP !== undefined && xp <= threshold.maxXP) {
      return threshold.color as Color;
    }
  }

  return 'GREEN'; // Default color
}

/**
 * Apply XP change and calculate new state
 */
export function applyXPChange(
  currentXP: number,
  xpChange: number,
  settings: CourseSettings
): {
  newXP: number;
  newLevel: number;
  newColor: Color;
  levelChanged: boolean;
  colorChanged: boolean;
} {
  const levelSystem = settings.levelSystem || {
    startXP: 50,
    levelThreshold: 100,
    maxLevel: 10,
    enableLevels: true,
  };

  // Calculate new XP (minimum 0)
  const newXP = Math.max(0, currentXP + xpChange);

  // Calculate old and new levels
  const oldLevel = calculateLevel(currentXP, levelSystem.levelThreshold, levelSystem.maxLevel);
  const newLevel = calculateLevel(newXP, levelSystem.levelThreshold, levelSystem.maxLevel);

  // Calculate old and new colors
  const oldColor = calculateColorFromXP(currentXP, settings);
  const newColor = calculateColorFromXP(newXP, settings);

  return {
    newXP,
    newLevel,
    newColor,
    levelChanged: oldLevel !== newLevel,
    colorChanged: oldColor !== newColor,
  };
}

/**
 * Get the next color in sequence (for manual color changes)
 */
export function getNextColor(currentColor: Color, direction: 'up' | 'down'): Color {
  const colorOrder: Color[] = ['RED', 'YELLOW', 'GREEN', 'BLUE'];
  const currentIndex = colorOrder.indexOf(currentColor);

  if (direction === 'up') {
    const newIndex = Math.min(currentIndex + 1, colorOrder.length - 1);
    return colorOrder[newIndex];
  } else {
    const newIndex = Math.max(currentIndex - 1, 0);
    return colorOrder[newIndex];
  }
}

/**
 * Check if an action has a cooldown
 */
export function isActionOnCooldown(
  lastActionTime: Date | null,
  cooldownMinutes: number
): boolean {
  if (!lastActionTime || cooldownMinutes <= 0) {
    return false;
  }

  const now = new Date();
  const timeSinceAction = now.getTime() - lastActionTime.getTime();
  const cooldownMs = cooldownMinutes * 60 * 1000;

  return timeSinceAction < cooldownMs;
}

/**
 * Calculate remaining cooldown time in seconds
 */
export function getRemainingCooldown(
  lastActionTime: Date | null,
  cooldownMinutes: number
): number {
  if (!lastActionTime || cooldownMinutes <= 0) {
    return 0;
  }

  const now = new Date();
  const timeSinceAction = now.getTime() - lastActionTime.getTime();
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const remaining = cooldownMs - timeSinceAction;

  return Math.max(0, Math.ceil(remaining / 1000));
}