import { NextRequest, NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { updateStudentSchema } from '@/lib/validations/student';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/students/[id] - Get a specific student
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const student = await prisma.student.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
            teacherId: true,
          },
        },
        events: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            creator: {
              select: {
                name: true,
              },
            },
          },
        },
        redemptions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          include: {
            reward: true,
          },
        },
        consequences: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          include: {
            consequence: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Check if user has access to this student
    if (student.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have access to this student');
    }

    return NextResponse.json(student);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/students/[id] - Update a student
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const student = await prisma.student.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: {
          select: {
            teacherId: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (student.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this student');
    }

    const body = await request.json();
    const validatedData = updateStudentSchema.parse(body);

    // Update student with audit log
    const updatedStudent = await prisma.$transaction(async (tx) => {
      const updated = await tx.student.update({
        where: {
          id: params.id,
        },
        data: validatedData,
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_STUDENT',
          entityType: 'student',
          entityId: params.id,
          metadata: validatedData,
        },
      });

      // If XP or color changed, create behavior event
      if (validatedData.currentXP !== undefined || validatedData.currentColor !== undefined) {
        await tx.behaviorEvent.create({
          data: {
            studentId: params.id,
            courseId: student.courseId,
            type: validatedData.currentColor ? 'COLOR_CHANGE' : 'XP_CHANGE',
            payload: {
              changes: validatedData,
              previousValues: {
                currentXP: student.currentXP,
                currentColor: student.currentColor,
                currentLevel: student.currentLevel,
              },
            },
            createdBy: session.user.id,
          },
        });
      }

      return updated;
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/students/[id] - Delete (deactivate) a student
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const student = await prisma.student.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: {
          select: {
            teacherId: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (student.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this student');
    }

    // Soft delete - just deactivate the student
    const deactivatedStudent = await prisma.$transaction(async (tx) => {
      const deactivated = await tx.student.update({
        where: {
          id: params.id,
        },
        data: {
          active: false,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE_STUDENT',
          entityType: 'student',
          entityId: params.id,
          metadata: {
            displayName: student.displayName,
            courseId: student.courseId,
          },
        },
      });

      return deactivated;
    });

    return NextResponse.json({ 
      message: 'Student deactivated successfully',
      student: deactivatedStudent,
    });
  } catch (error) {
    return handleApiError(error);
  }
}