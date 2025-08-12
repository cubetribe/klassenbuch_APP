import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { generateStudentCSV } from '@/lib/utils/csv';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/api/errors';

// GET /api/students/export - Export students to CSV
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
        select: { 
          teacherId: true,
          name: true,
        },
      });

      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have access to this course');
      }

      where.courseId = courseId;
    } else {
      // Get all students from user's courses
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });
      
      where.courseId = { in: courses.map(c => c.id) };
    }

    if (!includeInactive) {
      where.active = true;
    }

    // Fetch students
    const students = await prisma.student.findMany({
      where,
      select: {
        displayName: true,
        internalCode: true,
        avatarEmoji: true,
        currentColor: true,
        currentLevel: true,
        currentXP: true,
        active: true,
      },
      orderBy: [
        { courseId: 'asc' },
        { displayName: 'asc' },
      ],
    });

    // Transform color enum to German labels
    const colorMap: Record<string, string> = {
      'BLUE': 'Blau',
      'GREEN': 'Grün',
      'YELLOW': 'Gelb',
      'RED': 'Rot',
    };

    const exportData = students.map(student => ({
      ...student,
      currentColor: colorMap[student.currentColor] || student.currentColor,
    }));

    // Generate CSV (convert null to undefined for avatarEmoji)
    const csvContent = generateStudentCSV(exportData.map(s => ({
      ...s,
      avatarEmoji: s.avatarEmoji || undefined
    })));

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'EXPORT_STUDENTS',
        entityType: courseId ? 'course' : 'all',
        entityId: courseId || 'all',
        metadata: {
          studentCount: students.length,
          includeInactive,
        },
      },
    });

    // Return CSV file
    const fileName = courseId 
      ? `students_course_${courseId}_${new Date().toISOString().split('T')[0]}.csv`
      : `students_all_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}