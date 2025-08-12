import { prisma } from '@/lib/db/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface RedemptionCheck {
  canRedeem: boolean;
  reason?: string;
  remainingThisWeek?: number;
}

/**
 * Check if a student can redeem a reward
 */
export async function checkRedemptionEligibility(
  studentId: string,
  rewardId: string
): Promise<RedemptionCheck> {
  // Get student and reward data
  const [student, reward] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      select: {
        currentXP: true,
        currentLevel: true,
        active: true,
      },
    }),
    prisma.reward.findUnique({
      where: { id: rewardId },
      select: {
        costXP: true,
        costLevel: true,
        weeklyLimit: true,
        active: true,
      },
    }),
  ]);

  if (!student) {
    return { canRedeem: false, reason: 'Student not found' };
  }

  if (!student.active) {
    return { canRedeem: false, reason: 'Student is not active' };
  }

  if (!reward) {
    return { canRedeem: false, reason: 'Reward not found' };
  }

  if (!reward.active) {
    return { canRedeem: false, reason: 'Reward is not active' };
  }

  // Check XP requirement
  if (reward.costXP && student.currentXP < reward.costXP) {
    return { 
      canRedeem: false, 
      reason: `Not enough XP. Required: ${reward.costXP}, Current: ${student.currentXP}` 
    };
  }

  // Check level requirement
  if (reward.costLevel && student.currentLevel < reward.costLevel) {
    return { 
      canRedeem: false, 
      reason: `Level too low. Required: Level ${reward.costLevel}, Current: Level ${student.currentLevel}` 
    };
  }

  // Check weekly limit
  if (reward.weeklyLimit) {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const redemptionsThisWeek = await prisma.rewardRedemption.count({
      where: {
        rewardId,
        studentId,
        createdAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    if (redemptionsThisWeek >= reward.weeklyLimit) {
      return { 
        canRedeem: false, 
        reason: `Weekly limit reached (${reward.weeklyLimit} per week)`,
        remainingThisWeek: 0
      };
    }

    return { 
      canRedeem: true,
      remainingThisWeek: reward.weeklyLimit - redemptionsThisWeek
    };
  }

  return { canRedeem: true };
}

/**
 * Get weekly redemption stats for a student
 */
export async function getWeeklyRedemptionStats(
  studentId: string,
  courseId: string
): Promise<{
  totalThisWeek: number;
  byReward: Array<{
    rewardId: string;
    rewardName: string;
    count: number;
    weeklyLimit: number | null;
    remaining: number | null;
  }>;
}> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  // Get all rewards for the course
  const rewards = await prisma.reward.findMany({
    where: {
      courseId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      weeklyLimit: true,
    },
  });

  // Get redemptions this week
  const redemptions = await prisma.rewardRedemption.findMany({
    where: {
      studentId,
      courseId,
      createdAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    select: {
      rewardId: true,
    },
  });

  // Count redemptions by reward
  const redemptionCounts = redemptions.reduce((acc, r) => {
    acc[r.rewardId] = (acc[r.rewardId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Build stats
  const byReward = rewards.map(reward => ({
    rewardId: reward.id,
    rewardName: reward.name,
    count: redemptionCounts[reward.id] || 0,
    weeklyLimit: reward.weeklyLimit,
    remaining: reward.weeklyLimit 
      ? Math.max(0, reward.weeklyLimit - (redemptionCounts[reward.id] || 0))
      : null,
  }));

  return {
    totalThisWeek: redemptions.length,
    byReward,
  };
}

/**
 * Calculate XP after redemption
 */
export function calculateXPAfterRedemption(
  currentXP: number,
  costXP: number | null
): number {
  if (!costXP) return currentXP;
  return Math.max(0, currentXP - costXP);
}