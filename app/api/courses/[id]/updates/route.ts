import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.id;

    // Verify user has access to this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: session.user.id,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get latest updates (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Get updated students
    const students = await prisma.student.findMany({
      where: {
        courseId,
        updatedAt: {
          gte: fiveMinutesAgo,
        },
      },
      select: {
        id: true,
        displayName: true,
        currentXP: true,
        currentLevel: true,
        currentColor: true,
        updatedAt: true,
      },
    });

    // Get recent behavior events
    const events = await prisma.behaviorEvent.findMany({
      where: {
        courseId,
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        student: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      students,
      events,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Updates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}