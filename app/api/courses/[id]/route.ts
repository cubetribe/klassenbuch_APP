import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { updateCourseSchema } from '@/lib/validations/course';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/courses/[id] - Get a specific course
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      include: {
        students: {
          where: {
            active: true,
          },
          orderBy: {
            displayName: 'asc',
          },
        },
        rewards: {
          where: {
            active: true,
          },
        },
        consequences: {
          where: {
            active: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check if user has access to this course
    if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have access to this course');
    }

    return NextResponse.json(course);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/courses/[id] - Update a course
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      select: {
        teacherId: true,
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this course');
    }

    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    const updatedCourse = await prisma.course.update({
      where: {
        id: params.id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/courses/[id] - Archive/Delete a course
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      select: {
        teacherId: true,
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this course');
    }

    // Soft delete - just archive the course
    const archivedCourse = await prisma.course.update({
      where: {
        id: params.id,
      },
      data: {
        archived: true,
      },
    });

    return NextResponse.json({ 
      message: 'Course archived successfully',
      course: archivedCourse,
    });
  } catch (error) {
    return handleApiError(error);
  }
}