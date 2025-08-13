import { NextRequest, NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { updateRewardSchema } from '@/lib/validations/reward';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/rewards/[id] - Get a specific reward
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const reward = await prisma.reward.findUnique({
      where: {
        id: params.id,
      },
      include: {
        redemptions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            student: {
              select: {
                displayName: true,
                internalCode: true,
              },
            },
            redeemer: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });

    if (!reward) {
      throw new NotFoundError('Reward not found');
    }

    // Check if user has access to this reward
    if (reward.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have access to this reward');
    }

    return NextResponse.json({
      ...reward,
      totalRedemptions: reward._count.redemptions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/rewards/[id] - Update a reward
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const reward = await prisma.reward.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!reward) {
      throw new NotFoundError('Reward not found');
    }

    // Only teachers and admins can update school-wide rewards
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this reward');
    }

    const body = await request.json();
    const validatedData = updateRewardSchema.parse(body);

    // Update reward with audit log
    const updatedReward = await prisma.$transaction(async (tx) => {
      const updated = await tx.reward.update({
        where: {
          id: params.id,
        },
        data: validatedData,
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_REWARD',
          entityType: 'reward',
          entityId: params.id,
          metadata: validatedData,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedReward);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/rewards/[id] - Delete (deactivate) a reward
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const reward = await prisma.reward.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!reward) {
      throw new NotFoundError('Reward not found');
    }

    // Only teachers and admins can delete school-wide rewards
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this reward');
    }

    // Soft delete - just deactivate the reward
    const deactivatedReward = await prisma.$transaction(async (tx) => {
      const deactivated = await tx.reward.update({
        where: {
          id: params.id,
        },
        data: {
          active: false,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE_REWARD',
          entityType: 'reward',
          entityId: params.id,
          metadata: {
            name: reward.name,
          },
        },
      });

      return deactivated;
    });

    return NextResponse.json({ 
      message: 'Reward deactivated successfully',
      reward: deactivatedReward,
    });
  } catch (error) {
    return handleApiError(error);
  }
}