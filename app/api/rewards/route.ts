import { NextRequest, NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { createRewardSchema } from '@/lib/validations/reward';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';

// GET /api/rewards - Get rewards with optional course filter
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build where clause - rewards are now school-wide
    const where: any = {};

    if (!includeInactive) {
      where.active = true;
    }

    const rewards = await prisma.reward.findMany({
      where,
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group rewards by category
    const groupedRewards = rewards.reduce((acc, reward) => {
      const category = reward.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        ...reward,
        redemptionCount: reward._count.redemptions,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      rewards,
      grouped: groupedRewards,
      totalCount: rewards.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/rewards - Create a new reward
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = createRewardSchema.parse(body);

    // Only admins and teachers can create school-wide rewards
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      throw new ForbiddenError('You do not have permission to create rewards');
    }

    // Create reward with audit log
    const reward = await prisma.$transaction(async (tx) => {
      const newReward = await tx.reward.create({
        data: validatedData,
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_REWARD',
          entityType: 'reward',
          entityId: newReward.id,
          metadata: validatedData,
        },
      });

      return newReward;
    });

    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}