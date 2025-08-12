import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { applyConsequenceSchema, bulkApplyConsequenceSchema } from '@/lib/validations/consequence';
import { handleApiError, UnauthorizedError, ValidationError, ForbiddenError, NotFoundError } from '@/lib/api/errors';
import { broadcastConsequenceApplication, broadcastStudentUpdate } from '@/lib/sse/broadcast';

// POST /api/consequences/apply - Apply a consequence to student(s)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    
    // Check if it's a bulk application
    if (body.studentIds && Array.isArray(body.studentIds)) {
      return handleBulkApplication(body, session.user.id);
    }

    // Single application
    const validatedData = applyConsequenceSchema.parse(body);

    // Get student and consequence details
    const [student, consequence] = await Promise.all([
      prisma.student.findUnique({
        where: { id: validatedData.studentId },
        include: {
          course: {
            select: {
              id: true,
              teacherId: true,
            },
          },
        },
      }),
      prisma.consequence.findUnique({
        where: { id: validatedData.consequenceId },
        select: {
          courseId: true,
          name: true,
          notesRequired: true,
          severity: true,
          active: true,
        },
      }),
    ]);

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (!consequence) {
      throw new NotFoundError('Consequence not found');
    }

    if (!consequence.active) {
      throw new ValidationError('Consequence is not active');
    }

    // Check if notes are required
    if (consequence.notesRequired && !validatedData.notes) {
      throw new ValidationError('Notes are required for this consequence');
    }

    // Verify user has permission
    if (student.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to apply consequences to this student');
    }

    // Process application in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create application record
      const application = await tx.consequenceApplication.create({
        data: {
          consequenceId: validatedData.consequenceId,
          studentId: validatedData.studentId,
          courseId: student.course.id,
          appliedBy: session.user.id,
          notes: validatedData.notes,
        },
      });

      // Apply XP penalty based on severity
      let xpPenalty = 0;
      switch (consequence.severity) {
        case 'MINOR':
          xpPenalty = -5;
          break;
        case 'MODERATE':
          xpPenalty = -10;
          break;
        case 'MAJOR':
          xpPenalty = -20;
          break;
      }

      const newXP = Math.max(0, student.currentXP + xpPenalty);
      
      const updatedStudent = await tx.student.update({
        where: { id: validatedData.studentId },
        data: { currentXP: newXP },
      });

      // Create behavior event
      await tx.behaviorEvent.create({
        data: {
          studentId: validatedData.studentId,
          courseId: student.course.id,
          type: 'CONSEQUENCE_APPLIED',
          payload: {
            consequenceId: validatedData.consequenceId,
            consequenceName: consequence.name,
            severity: consequence.severity,
            xpPenalty,
            previousXP: student.currentXP,
            newXP,
          },
          notes: validatedData.notes,
          createdBy: session.user.id,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'APPLY_CONSEQUENCE',
          entityType: 'consequence_application',
          entityId: application.id,
          metadata: {
            studentName: student.displayName,
            consequenceName: consequence.name,
            severity: consequence.severity,
            xpPenalty,
          },
        },
      });

      return {
        application,
        student: updatedStudent,
      };
    });

    // Broadcast the consequence application
    await broadcastConsequenceApplication(student.course.id, {
      studentId: student.id,
      studentName: student.displayName,
      consequenceName: consequence.name,
      severity: consequence.severity,
      xpPenalty,
    });

    // Broadcast student XP update
    await broadcastStudentUpdate(student.course.id, student.id, {
      currentXP: result.student.currentXP,
    });

    return NextResponse.json({
      message: 'Consequence applied successfully',
      application: result.application,
      student: result.student,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function for bulk application
async function handleBulkApplication(body: any, userId: string) {
  const validatedData = bulkApplyConsequenceSchema.parse(body);

  // Get consequence details
  const consequence = await prisma.consequence.findUnique({
    where: { id: validatedData.consequenceId },
    select: {
      name: true,
      courseId: true,
      severity: true,
      notesRequired: true,
      active: true,
    },
  });

  if (!consequence) {
    throw new NotFoundError('Consequence not found');
  }

  if (!consequence.active) {
    throw new ValidationError('Consequence is not active');
  }

  if (consequence.notesRequired && !validatedData.notes) {
    throw new ValidationError('Notes are required for this consequence');
  }

  // Calculate XP penalty
  let xpPenalty = 0;
  switch (consequence.severity) {
    case 'MINOR':
      xpPenalty = -5;
      break;
    case 'MODERATE':
      xpPenalty = -10;
      break;
    case 'MAJOR':
      xpPenalty = -20;
      break;
  }

  // Process applications in transaction
  const results = await prisma.$transaction(async (tx) => {
    const applications = [];

    for (const studentId of validatedData.studentIds) {
      const student = await tx.student.findUnique({
        where: { id: studentId },
      });

      if (!student) continue;

      // Create application
      const application = await tx.consequenceApplication.create({
        data: {
          consequenceId: validatedData.consequenceId,
          studentId,
          courseId: consequence.courseId,
          appliedBy: userId,
          notes: validatedData.notes,
        },
      });

      // Update XP
      const newXP = Math.max(0, student.currentXP + xpPenalty);
      await tx.student.update({
        where: { id: studentId },
        data: { currentXP: newXP },
      });

      // Create behavior event
      await tx.behaviorEvent.create({
        data: {
          studentId,
          courseId: consequence.courseId,
          type: 'CONSEQUENCE_APPLIED',
          payload: {
            consequenceId: validatedData.consequenceId,
            consequenceName: consequence.name,
            severity: consequence.severity,
            xpPenalty,
            bulkApplication: true,
          },
          notes: validatedData.notes,
          createdBy: userId,
        },
      });

      applications.push(application);
    }

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'BULK_APPLY_CONSEQUENCE',
        entityType: 'consequence',
        entityId: validatedData.consequenceId,
        metadata: {
          consequenceName: consequence.name,
          severity: consequence.severity,
          studentCount: validatedData.studentIds.length,
          studentIds: validatedData.studentIds,
          xpPenalty,
        },
      },
    });

    return applications;
  });

  return NextResponse.json({
    message: `Consequence applied to ${results.length} students`,
    successful: results.length,
    applications: results,
  }, { status: 201 });
}