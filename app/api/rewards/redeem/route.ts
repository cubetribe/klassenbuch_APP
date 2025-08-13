import { NextRequest, NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { redeemRewardSchema, bulkRedeemSchema } from '@/lib/validations/reward';
import { checkRedemptionEligibility, calculateXPAfterRedemption } from '@/lib/utils/redemption-logic';
import { handleApiError, UnauthorizedError, ValidationError, ForbiddenError } from '@/lib/api/errors';
import { broadcastRewardRedemption, broadcastStudentUpdate } from '@/lib/sse/broadcast';

// POST /api/rewards/redeem - Redeem a reward for student(s)
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    
    // Check if it's a bulk redemption
    if (body.studentIds && Array.isArray(body.studentIds)) {
      return handleBulkRedemption(body, session.user.id);
    }

    // Single redemption
    const validatedData = redeemRewardSchema.parse(body);

    // Check eligibility
    const eligibility = await checkRedemptionEligibility(
      validatedData.studentId,
      validatedData.rewardId
    );

    if (!eligibility.canRedeem) {
      throw new ValidationError(eligibility.reason || 'Cannot redeem reward');
    }

    // Get student and reward details
    const [student, reward] = await Promise.all([
      prisma.student.findUnique({
        where: { id: validatedData.studentId },
        include: {
          course: {
            select: {
              id: true,
              teacherId: true,
            },
          },
        },
      }),
      prisma.reward.findUnique({
        where: { id: validatedData.rewardId },
        select: {
          costXP: true,
          courseId: true,
          name: true,
        },
      }),
    ]);

    if (!student || !reward) {
      throw new ValidationError('Student or reward not found');
    }

    // Verify user has permission
    if (student.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to redeem rewards for this student');
    }

    // Process redemption in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create redemption record
      const redemption = await tx.rewardRedemption.create({
        data: {
          rewardId: validatedData.rewardId,
          studentId: validatedData.studentId,
          courseId: student.course.id,
          redeemedBy: session.user.id,
          notes: validatedData.notes,
        },
      });

      // Update student XP if needed
      let updatedStudent = student;
      if (reward.costXP) {
        const newXP = calculateXPAfterRedemption(student.currentXP, reward.costXP);
        
        updatedStudent = await tx.student.update({
          where: { id: validatedData.studentId },
          data: { currentXP: newXP },
          include: {
            course: {
              select: {
                id: true,
                teacherId: true,
              }
            }
          }
        });

        // Create behavior event for XP change
        await tx.behaviorEvent.create({
          data: {
            studentId: validatedData.studentId,
            courseId: student.course.id,
            type: 'REWARD_REDEEMED',
            payload: {
              rewardId: validatedData.rewardId,
              rewardName: reward.name,
              costXP: reward.costXP || 0,
              previousXP: student.currentXP,
              newXP,
            },
            notes: validatedData.notes,
            createdBy: session.user.id,
          },
        });
      } else {
        // Create behavior event without XP change
        await tx.behaviorEvent.create({
          data: {
            studentId: validatedData.studentId,
            courseId: student.course.id,
            type: 'REWARD_REDEEMED',
            payload: {
              rewardId: validatedData.rewardId,
              rewardName: reward.name,
            },
            notes: validatedData.notes,
            createdBy: session.user.id,
          },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'REDEEM_REWARD',
          entityType: 'redemption',
          entityId: redemption.id,
          metadata: {
            studentName: student.displayName,
            rewardName: reward.name,
            costXP: reward.costXP || 0,
          },
        },
      });

      return {
        redemption,
        student: updatedStudent,
      };
    });

    // Broadcast the redemption event
    await broadcastRewardRedemption(student.course.id, {
      studentId: student.id,
      studentName: student.displayName,
      rewardName: reward.name,
      costXP: reward.costXP || 0,
    });

    // If XP was updated, broadcast student update
    if (reward.costXP) {
      await broadcastStudentUpdate(student.course.id, student.id, {
        currentXP: result.student.currentXP,
      });
    }

    return NextResponse.json({
      message: 'Reward redeemed successfully',
      redemption: result.redemption,
      student: result.student,
      remainingThisWeek: eligibility.remainingThisWeek 
        ? eligibility.remainingThisWeek - 1 
        : undefined,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function for bulk redemption
async function handleBulkRedemption(body: any, userId: string) {
  const validatedData = bulkRedeemSchema.parse(body);

  // Get reward details
  const reward = await prisma.reward.findUnique({
    where: { id: validatedData.rewardId },
    select: {
      name: true,
      courseId: true,
      costXP: true,
      costLevel: true,
    },
  });

  if (!reward) {
    throw new ValidationError('Reward not found');
  }

  // Check permissions and eligibility for all students
  const eligibilityChecks = await Promise.all(
    validatedData.studentIds.map(async (studentId) => {
      const eligibility = await checkRedemptionEligibility(studentId, validatedData.rewardId);
      return {
        studentId,
        ...eligibility,
      };
    })
  );

  const eligible = eligibilityChecks.filter(e => e.canRedeem);
  const ineligible = eligibilityChecks.filter(e => !e.canRedeem);

  if (eligible.length === 0) {
    throw new ValidationError('No students are eligible for this reward');
  }

  // Process redemptions in transaction
  const results = await prisma.$transaction(async (tx) => {
    const redemptions = [];

    for (const { studentId } of eligible) {
      const student = await tx.student.findUnique({
        where: { id: studentId },
      });

      if (!student) continue;

      // Create redemption
      const redemption = await tx.rewardRedemption.create({
        data: {
          rewardId: validatedData.rewardId,
          studentId,
          courseId: reward.courseId,
          redeemedBy: userId,
          notes: validatedData.notes,
        },
      });

      // Update XP if needed
      if (reward.costXP) {
        const newXP = calculateXPAfterRedemption(student.currentXP, reward.costXP);
        await tx.student.update({
          where: { id: studentId },
          data: { currentXP: newXP },
        });
      }

      // Create behavior event
      await tx.behaviorEvent.create({
        data: {
          studentId,
          courseId: reward.courseId,
          type: 'REWARD_REDEEMED',
          payload: {
            rewardId: validatedData.rewardId,
            rewardName: reward.name,
            bulkRedemption: true,
          },
          notes: validatedData.notes,
          createdBy: userId,
        },
      });

      redemptions.push(redemption);
    }

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'BULK_REDEEM_REWARD',
        entityType: 'reward',
        entityId: validatedData.rewardId,
        metadata: {
          rewardName: reward.name,
          studentCount: eligible.length,
          studentIds: eligible.map(e => e.studentId),
        },
      },
    });

    return redemptions;
  });

  return NextResponse.json({
    message: `Reward redeemed for ${results.length} students`,
    successful: eligible.length,
    failed: ineligible.length,
    ineligibleStudents: ineligible,
    redemptions: results,
  }, { status: 201 });
}