import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { createStudentSchema, studentFilterSchema } from '@/lib/validations/student';
import { generateStudentCode } from '@/lib/utils/student-code';
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/api/errors';

// GET /api/students - Get students with optional filters
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Students API - Starting request');
    console.log('🔍 Environment:', process.env.NODE_ENV);
    console.log('🔍 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Session:', session ? 'EXISTS' : 'NULL');
    console.log('🔍 User ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('❌ No session - throwing UnauthorizedError');
      throw new UnauthorizedError();
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Extract raw parameters - searchParams.get() returns string | null
    const rawParams = {
      courseId: searchParams.get('courseId'),
      active: searchParams.get('active'),
      color: searchParams.get('color'),
      search: searchParams.get('search'),
    };
    
    // Validate and transform the parameters properly
    const filters = studentFilterSchema.parse(rawParams);

    // Build where clause
    const where: any = {};
    
    if (filters.courseId) {
      // Verify user has access to this course
      const course = await prisma.course.findUnique({
        where: { id: filters.courseId },
        select: { teacherId: true },
      });

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
        throw new ForbiddenError('You do not have access to this course');
      }

      where.courseId = filters.courseId;
    } else {
      // Get all students from user's courses
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });
      
      where.courseId = { in: courses.map(c => c.id) };
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.color) {
      where.currentColor = filters.color;
    }

    if (filters.search) {
      where.displayName = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        _count: {
          select: {
            events: true,
            redemptions: true,
            consequences: true,
          },
        },
      },
      orderBy: [
        { courseId: 'asc' },
        { displayName: 'asc' },
      ],
    });

    return NextResponse.json({ students });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = createStudentSchema.parse(body);

    // Verify user has access to this course
    const course = await prisma.course.findUnique({
      where: { id: validatedData.courseId },
      select: { 
        teacherId: true,
        settings: true,
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to add students to this course');
    }

    // Generate unique internal code
    let internalCode: string;
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 10) {
      internalCode = generateStudentCode(validatedData.courseId);
      const existing = await prisma.student.findUnique({
        where: { internalCode },
      });
      codeExists = !!existing;
      attempts++;
    }

    if (attempts >= 10) {
      throw new Error('Failed to generate unique student code');
    }

    // Get initial XP from course settings
    const courseSettings = course.settings as any;
    const initialXP = courseSettings?.levelSystem?.startXP || 50;

    // Create student with audit log
    const student = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.student.create({
        data: {
          courseId: validatedData.courseId,
          displayName: validatedData.displayName,
          internalCode: internalCode!,
          avatarEmoji: validatedData.avatarEmoji,
          currentXP: initialXP,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_STUDENT',
          entityType: 'student',
          entityId: newStudent.id,
          metadata: {
            courseId: validatedData.courseId,
            displayName: validatedData.displayName,
          },
        },
      });

      return newStudent;
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}