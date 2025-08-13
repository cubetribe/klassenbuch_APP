import { NextRequest, NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { z } from 'zod';

const reportSchema = z.object({
  courseId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  startDate: z.string(),
  endDate: z.string(),
  format: z.enum(['pdf', 'csv']),
});

// POST /api/reports - Generate a report
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = reportSchema.parse(body);

    // Verify user has access to the course if courseId is provided
    if (validatedData.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: validatedData.courseId },
        select: { teacherId: true },
      });

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have access to this course');
      }
    }

    // Build where clause for events query
    const where: any = {
      createdAt: {
        gte: new Date(validatedData.startDate),
        lte: new Date(validatedData.endDate),
      },
    };

    if (validatedData.courseId) {
      where.courseId = validatedData.courseId;
    } else {
      // Get events from user's courses only
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });
      
      where.courseId = { in: courses.map(c => c.id) };
    }

    if (validatedData.studentId) {
      where.studentId = validatedData.studentId;
    }

    // Fetch the data
    const events = await prisma.behaviorEvent.findMany({
      where,
      include: {
        student: {
          select: {
            displayName: true,
            internalCode: true,
            currentXP: true,
            currentLevel: true,
            currentColor: true,
          },
        },
        course: {
          select: {
            name: true,
            subject: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (validatedData.format === 'csv') {
      // Generate CSV
      const csvHeader = 'Date,Student,Course,Event Type,XP Change,Notes\n';
      const csvRows = events.map(event => {
        const date = event.createdAt.toISOString().split('T')[0];
        const student = event.student?.displayName || 'Unknown';
        const course = event.course?.name || 'Unknown';
        const type = event.type;
        const xpChange = event.payload?.xpChange || 0;
        const notes = event.notes || '';
        
        return `${date},"${student}","${course}","${type}",${xpChange},"${notes}"`;
      }).join('\n');

      const csv = csvHeader + csvRows;

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${Date.now()}.csv"`,
        },
      });
    } else {
      // For PDF, return a simple JSON response for now
      // TODO: Implement PDF generation with @react-pdf/renderer
      return NextResponse.json({
        message: 'PDF generation not yet implemented',
        data: {
          events: events.length,
          dateRange: {
            start: validatedData.startDate,
            end: validatedData.endDate,
          },
        },
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}