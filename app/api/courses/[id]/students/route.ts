import { NextRequest, NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/courses/[id]/students - Get all students in a course
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    // Verify course exists and user has access
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      select: {
        teacherId: true,
        name: true,
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have access to this course');
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause
    const where: any = {
      courseId: params.id,
    };

    if (!includeInactive) {
      where.active = true;
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy = { displayName: sortOrder };
        break;
      case 'xp':
        orderBy = { currentXP: sortOrder };
        break;
      case 'level':
        orderBy = { currentLevel: sortOrder };
        break;
      case 'color':
        orderBy = { currentColor: sortOrder };
        break;
      case 'updated':
        orderBy = { updatedAt: sortOrder };
        break;
      default:
        orderBy = { displayName: 'asc' };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        _count: {
          select: {
            events: true,
            redemptions: true,
            consequences: true,
          },
        },
        events: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            createdAt: true,
            type: true,
          },
        },
      },
      orderBy,
    });

    // Transform data for frontend
    const transformedStudents = students.map(student => ({
      ...student,
      eventCount: student._count.events,
      redemptionCount: student._count.redemptions,
      consequenceCount: student._count.consequences,
      lastEvent: student.events[0] || null,
    }));

    return NextResponse.json({
      course: {
        id: params.id,
        name: course.name,
      },
      students: transformedStudents,
      totalCount: transformedStudents.length,
      activeCount: transformedStudents.filter(s => s.active).length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}