import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { createConsequenceSchema } from '@/lib/validations/consequence';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';

// GET /api/consequences - Get consequences with optional course filter
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const severity = searchParams.get('severity');
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
      // Get consequences from user's courses
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });
      
      where.courseId = { in: courses.map(c => c.id) };
    }

    if (severity) {
      where.severity = severity;
    }

    if (!includeInactive) {
      where.active = true;
    }

    const consequences = await prisma.consequence.findMany({
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
            applications: true,
          },
        },
      },
      orderBy: [
        { courseId: 'asc' },
        { severity: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group consequences by severity
    const groupedConsequences = consequences.reduce((acc, consequence) => {
      const severity = consequence.severity;
      if (!acc[severity]) {
        acc[severity] = [];
      }
      acc[severity].push({
        ...consequence,
        applicationCount: consequence._count.applications,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      consequences,
      grouped: groupedConsequences,
      totalCount: consequences.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/consequences - Create a new consequence
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = createConsequenceSchema.parse(body);

    // Verify user has access to this course
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
      select: { teacherId: true },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to add consequences to this course');
    }

    // Create consequence with audit log
    const consequence = await prisma.$transaction(async (tx) => {
      const newConsequence = await tx.consequence.create({
        data: {
          name: validatedData.name!,
          courseId: validatedData.courseId!,
          description: validatedData.description,
          emoji: validatedData.emoji,
          severity: validatedData.severity || 'MINOR',
          notesRequired: validatedData.notesRequired || false,
          active: true,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_CONSEQUENCE',
          entityType: 'consequence',
          entityId: newConsequence.id,
          metadata: validatedData,
        },
      });

      return newConsequence;
    });

    return NextResponse.json(consequence, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}