import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { createCourseSchema } from '@/lib/validations/course';
import { handleApiError, UnauthorizedError } from '@/lib/api/errors';

// GET /api/courses - Get all courses for the authenticated teacher
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const courses = await prisma.course.findMany({
      where: {
        teacherId: session.user.id,
      },
      include: {
        _count: {
          select: {
            students: true,
            events: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match frontend expectations
    const transformedCourses = courses.map(course => ({
      ...course,
      settings: course.settings || {},
      studentCount: course._count.students,
      eventCount: course._count.events,
    }));

    return NextResponse.json(transformedCourses);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    const course = await prisma.course.create({
      data: {
        name: validatedData.name,
        subject: validatedData.subject,
        schoolYear: validatedData.schoolYear,
        teacherId: session.user.id,
        settings: validatedData.settings || {},
        archived: false,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}