import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { parseStudentCSV, validateStudentNames } from '@/lib/utils/csv';
import { generateStudentCode } from '@/lib/utils/student-code';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError, ValidationError } from '@/lib/api/errors';
import { z } from 'zod';

const importSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  csvContent: z.string().min(1, 'CSV content is required'),
});

// POST /api/students/import - Import students from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const { courseId, csvContent } = importSchema.parse(body);

    // Verify user has access to this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        teacherId: true,
        settings: true,
        name: true,
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to add students to this course');
    }

    // Parse CSV content
    let parsedStudents;
    try {
      parsedStudents = parseStudentCSV(csvContent);
    } catch (error: any) {
      throw new ValidationError(error.message);
    }

    if (parsedStudents.length === 0) {
      throw new ValidationError('No valid students found in CSV');
    }

    if (parsedStudents.length > 100) {
      throw new ValidationError('Maximum 100 students can be imported at once');
    }

    // Validate student names
    const { valid, invalid } = validateStudentNames(parsedStudents);

    if (invalid.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Some students have invalid data',
        errors: invalid,
        validCount: valid.length,
      }, { status: 400 });
    }

    // Get initial XP from course settings
    const courseSettings = course.settings as any;
    const initialXP = courseSettings?.levelSystem?.startXP || 50;

    // Prepare students for bulk creation
    const studentsToCreate = [];
    const usedCodes = new Set<string>();
    
    // Get existing internal codes to avoid duplicates
    const existingCodes = await prisma.student.findMany({
      select: { internalCode: true },
    });
    existingCodes.forEach(s => usedCodes.add(s.internalCode));

    for (const student of valid) {
      // Generate unique internal code
      let internalCode: string;
      let attempts = 0;

      do {
        internalCode = generateStudentCode(courseId);
        attempts++;
        if (attempts > 20) {
          throw new Error(`Failed to generate unique code for student: ${student.displayName}`);
        }
      } while (usedCodes.has(internalCode));

      usedCodes.add(internalCode);

      studentsToCreate.push({
        courseId,
        displayName: student.displayName.trim(),
        internalCode,
        avatarEmoji: student.avatarEmoji,
        currentXP: initialXP,
        currentColor: 'GREEN' as const,
        currentLevel: 0,
        active: true,
      });
    }

    // Create all students in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create students
      const createdStudents = await tx.student.createMany({
        data: studentsToCreate,
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'BULK_CREATE_STUDENTS',
          entityType: 'course',
          entityId: courseId,
          metadata: {
            courseName: course.name,
            studentCount: studentsToCreate.length,
            studentNames: studentsToCreate.map(s => s.displayName),
          },
        },
      });

      return createdStudents;
    });

    // Fetch the created students to return them
    const createdStudents = await prisma.student.findMany({
      where: {
        courseId,
        internalCode: {
          in: studentsToCreate.map(s => s.internalCode),
        },
      },
      orderBy: {
        displayName: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.count} students`,
      students: createdStudents,
      importedCount: result.count,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}