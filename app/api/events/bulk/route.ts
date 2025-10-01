import { NextRequest, NextResponse } from 'next/server';
import { Color, Prisma } from '@prisma/client';
import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { handleApiError, UnauthorizedError, ForbiddenError } from '@/lib/api/errors';
import { z } from 'zod';

const bulkCreateEventsSchema = z.object({
  events: z.array(z.object({
    studentId: z.string(),
    courseId: z.string(),
    type: z.string(),
    payload: z.any(),
    notes: z.string().optional(),
  }))
});

// POST /api/events/bulk - Create multiple behavior events
export async function POST(request: NextRequest) {
  try {
    // Pass request for consistency, even though it's optional
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      console.error('No session found in /api/events/bulk');
      throw new UnauthorizedError('Please log in to access this resource');
    }

    const body = await request.json();
    const { events } = bulkCreateEventsSchema.parse(body);

    // Verify user has access to all courses
    const courseIds = [...new Set(events.map(e => e.courseId))];
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
        teacherId: session.user.id,
      },
      select: { id: true },
    });

    if (courses.length !== courseIds.length) {
      throw new ForbiddenError('You do not have access to all specified courses');
    }

    // Verify all students exist and belong to their courses
    const studentIds = [...new Set(events.map(e => e.studentId))];
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        courseId: { in: courseIds },
      },
      select: { id: true, courseId: true, currentXP: true },
    });

    const studentMap = new Map(students.map(s => [s.id, s]));

    // Validate that each student belongs to the correct course
    for (const event of events) {
      const studentCourseId = studentMap.get(event.studentId)?.courseId;
      if (!studentCourseId || studentCourseId !== event.courseId) {
        throw new ForbiddenError(`Student ${event.studentId} does not belong to course ${event.courseId}`);
      }
    }

    // Create all events in a transaction
    const created = await prisma.$transaction(
      events.map(event => 
        prisma.behaviorEvent.create({
          data: {
            studentId: event.studentId,
            courseId: event.courseId,
            createdBy: session.user.id, // Changed from teacherId to createdBy
            type: event.type,
            payload: event.payload,
            notes: event.notes,
          },
          include: {
            student: {
              select: {
                id: true,
                displayName: true,
                avatarEmoji: true,
              },
            },
          },
        })
      )
    );

    // Update student colors and XP if needed
    const colorChanges = events.filter(e => e.type === 'COLOR_CHANGE');
    if (colorChanges.length > 0) {
      const updates: Prisma.PrismaPromise<any>[] = [];

      for (const event of colorChanges) {
        const student = studentMap.get(event.studentId);
        if (!student) {
          continue;
        }

        const rawXpChange = event.payload?.xpChange;
        const xpChange = typeof rawXpChange === 'number' ? rawXpChange : 0;
        const newXP = Math.max(0, student.currentXP + xpChange);

        // Update cached value to support multiple events for the same student
        student.currentXP = newXP;

        const payloadColor = event.payload?.color;
        const newColor = typeof payloadColor === 'string'
          ? (payloadColor.toUpperCase() as Color)
          : undefined;

        updates.push(
          prisma.student.update({
            where: { id: event.studentId },
            data: {
              currentXP: newXP,
              ...(newColor ? { currentColor: newColor } : {}),
            },
          })
        );
      }

      if (updates.length > 0) {
        await prisma.$transaction(updates);
      }
    }

    // Create audit logs
    await prisma.auditLog.createMany({
      data: events.map(event => ({
        userId: session.user.id,
        action: 'CREATE_BEHAVIOR_EVENT',
        entityType: 'behavior_event',
        entityId: event.studentId,
        metadata: {
          courseId: event.courseId,
          type: event.type,
          payload: event.payload,
        },
      })),
    });

    return NextResponse.json({ 
      created,
      count: created.length 
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}