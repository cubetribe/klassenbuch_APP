import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { createRewardSchema } from '@/lib/validations/reward';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';

// GET /api/rewards - Get rewards with optional course filter
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build where clause
    const where: any = {};

    if (courseId) {
      // Verify user has access to this course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { teacherId: true },
      });

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have access to this course');
      }

      where.courseId = courseId;
    } else {
      // Get rewards from user's courses
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });
      
      where.courseId = { in: courses.map(c => c.id) };
    }

    if (!includeInactive) {
      where.active = true;
    }

    const rewards = await prisma.reward.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
      orderBy: [
        { courseId: 'asc' },
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = createRewardSchema.parse(body);

    // Verify user has access to this course
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
      select: { teacherId: true },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to add rewards to this course');
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