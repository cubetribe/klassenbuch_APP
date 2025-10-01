import { NextRequest, NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { createBehaviorEventSchema, bulkEventSchema, eventFilterSchema } from '@/lib/validations/event';
import { applyXPChange } from '@/lib/utils/behavior-logic';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { broadcastBehaviorEvent, broadcastStudentUpdate } from '@/lib/sse/broadcast';

// GET /api/events - Get behavior events with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = eventFilterSchema.parse({
      studentId: searchParams.get('studentId'),
      courseId: searchParams.get('courseId'),
      type: searchParams.get('type'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    // Build where clause
    const where: any = {};

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

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
      // Get events from user's courses only
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });

      // Handle case where user has no courses
      if (courses.length === 0) {
        return NextResponse.json({
          events: [],
          totalCount: 0,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: false,
        });
      }

      where.courseId = { in: courses.map(c => c.id) };
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [events, totalCount] = await Promise.all([
      prisma.behaviorEvent.findMany({
        where,
        include: {
          student: {
            select: {
              displayName: true,
              internalCode: true,
              avatarEmoji: true,
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
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.behaviorEvent.count({ where }),
    ]);

    return NextResponse.json({
      events,
      totalCount,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + filters.limit < totalCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/events - Create a behavior event
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    
    // Check if it's a bulk operation
    if (body.events) {
      return handleBulkEvents(body, session.user.id);
    }

    // Single event creation
    const validatedData = createBehaviorEventSchema.parse(body);

    // Verify student exists and user has access
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
      include: {
        course: {
          select: {
            teacherId: true,
            settings: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (student.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to create events for this student');
    }

    // Handle XP/Level changes
    let updateData: any = {};
    const eventPayload = { ...validatedData.payload };

    if (validatedData.type === 'XP_CHANGE' && eventPayload.xpChange) {
      const result = applyXPChange(
        student.currentXP,
        eventPayload.xpChange,
        student.course.settings as any
      );

      updateData = {
        currentXP: result.newXP,
        currentLevel: result.newLevel,
        currentColor: result.newColor,
      };

      // Add calculated values to event payload
      eventPayload.previousXP = student.currentXP;
      eventPayload.newXP = result.newXP;
      eventPayload.previousLevel = student.currentLevel;
      eventPayload.newLevel = result.newLevel;
      eventPayload.previousColor = student.currentColor;
      eventPayload.newColor = result.newColor;
    }

    // Handle direct color changes
    if (validatedData.type === 'COLOR_CHANGE' && eventPayload.newColor) {
      updateData.currentColor = eventPayload.newColor;
      eventPayload.previousColor = student.currentColor;
    }

    // Handle level changes
    if (validatedData.type === 'LEVEL_CHANGE' && eventPayload.levelChange) {
      const newLevel = Math.max(0, student.currentLevel + eventPayload.levelChange);
      updateData.currentLevel = newLevel;
      eventPayload.previousLevel = student.currentLevel;
      eventPayload.newLevel = newLevel;
    }

    // Create event and update student in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the event
      const event = await tx.behaviorEvent.create({
        data: {
          studentId: validatedData.studentId,
          courseId: validatedData.courseId,
          type: validatedData.type,
          payload: eventPayload,
          notes: validatedData.notes,
          createdBy: session.user.id,
        },
      });

      // Update student if needed
      if (Object.keys(updateData).length > 0) {
        await tx.student.update({
          where: { id: validatedData.studentId },
          data: updateData,
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_BEHAVIOR_EVENT',
          entityType: 'student',
          entityId: validatedData.studentId,
          metadata: {
            eventType: validatedData.type,
            payload: eventPayload,
            updateData,
          },
        },
      });

      return event;
    });

    // Fetch the complete event with relations
    const completeEvent = await prisma.behaviorEvent.findUnique({
      where: { id: result.id },
      include: {
        student: {
          select: {
            displayName: true,
            internalCode: true,
            currentColor: true,
            currentLevel: true,
            currentXP: true,
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
    });

    // Broadcast the event to connected clients
    await broadcastBehaviorEvent(validatedData.courseId, completeEvent);
    
    // If student was updated, broadcast that too
    if (Object.keys(updateData).length > 0) {
      await broadcastStudentUpdate(
        validatedData.courseId,
        validatedData.studentId,
        updateData
      );
    }

    return NextResponse.json(completeEvent, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Helper function for bulk event creation
async function handleBulkEvents(body: any, userId: string) {
  const validatedData = bulkEventSchema.parse(body);

  // Verify course exists and user has access
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

  if (course.teacherId !== userId) {
    throw new ForbiddenError('You do not have permission to create events for this course');
  }

  // Get all unique student IDs from the events and fetch them
  const studentIds = [...new Set(validatedData.events.map((e) => e.studentId).filter(Boolean) as string[])];
  const students = await prisma.student.findMany({
    where: {
      id: { in: studentIds },
      courseId: validatedData.courseId,
    },
  });
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const studentUpdates: { [studentId: string]: any } = {};
  const createdEventsPayload: any[] = [];

  // Process events in a transaction
  const results = await prisma.$transaction(async (tx) => {
    for (const eventData of validatedData.events) {
      if (!eventData.studentId) continue;

      const student = studentMap.get(eventData.studentId);
      if (!student) {
        console.warn(`Student with ID ${eventData.studentId} not found or not in this course.`);
        continue;
      }

      const eventPayload = { ...(eventData.payload || {}) };
      let updateData: any = {};

      // Handle XP changes for XP_CHANGE events
      // This now also handles color ratings from the Color Rating component
      if (eventData.type === 'XP_CHANGE' && typeof eventPayload.xpChange === 'number') {
        const currentXP = studentUpdates[student.id]?.currentXP ?? student.currentXP;
        const currentColor = studentUpdates[student.id]?.currentColor ?? student.currentColor;
        const currentLevel = studentUpdates[student.id]?.currentLevel ?? student.currentLevel;

        const result = applyXPChange(currentXP, eventPayload.xpChange, course.settings as any);

        updateData = {
          currentXP: result.newXP,
          currentLevel: result.newLevel,
          currentColor: result.newColor,
        };

        // If payload contains a color (from Color Rating), use it instead of calculated color
        // This allows teachers to manually set colors independently of XP thresholds
        if (eventPayload.color) {
          updateData.currentColor = eventPayload.color;
          eventPayload.manualColorOverride = true;
        }

        studentUpdates[student.id] = { ...studentUpdates[student.id], ...updateData };

        eventPayload.previousXP = currentXP;
        eventPayload.newXP = result.newXP;
        eventPayload.previousLevel = currentLevel;
        eventPayload.newLevel = result.newLevel;
        eventPayload.previousColor = currentColor;
        eventPayload.newColor = updateData.currentColor;
      }

      const event = await tx.behaviorEvent.create({
        data: {
          type: eventData.type || 'MANUAL_ACTION',
          studentId: eventData.studentId!,
          courseId: validatedData.courseId,
          payload: eventPayload,
          notes: eventData.notes,
          createdBy: userId,
        },
      });
      createdEventsPayload.push(event);
    }

    for (const [studentId, data] of Object.entries(studentUpdates)) {
      await tx.student.update({
        where: { id: studentId },
        data,
      });
    }

    await tx.auditLog.create({
      data: {
        userId,
        action: 'BULK_CREATE_BEHAVIOR_EVENTS',
        entityType: 'course',
        entityId: validatedData.courseId,
        metadata: {
          eventCount: validatedData.events.length,
          updatedStudentCount: Object.keys(studentUpdates).length,
        },
      },
    });

    return createdEventsPayload;
  });

  // After transaction, broadcast updates for each affected student
  for (const [studentId, data] of Object.entries(studentUpdates)) {
    await broadcastStudentUpdate(validatedData.courseId, studentId, data);
  }

  // Fetch complete events to return to the client
  const completeEvents = await prisma.behaviorEvent.findMany({
    where: { id: { in: results.map(r => r.id) } },
    include: {
      student: {
        select: {
          displayName: true,
          internalCode: true,
          currentColor: true,
          currentLevel: true,
          currentXP: true,
        },
      },
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Broadcast a single event to notify clients about the bulk update
  await broadcastBehaviorEvent(validatedData.courseId, { type: 'BULK_UPDATE', count: results.length });


  return NextResponse.json({
    message: `Successfully created ${results.length} events`,
    events: completeEvents,
  }, { status: 201 });
}