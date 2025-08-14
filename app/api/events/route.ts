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
    } else if (session.user.role !== 'ADMIN') {
      // Non-admins can only see events from their courses
      const courses = await prisma.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true },
      });

      if (courses.length === 0) {
        // If user has no courses, return empty result to avoid issues
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
    // If user is an admin and no courseId is specified, the where clause remains open, fetching all events.

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

    const totalCount = await prisma.behaviorEvent.count({ where });

    const eventsData = await prisma.behaviorEvent.findMany({
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
    });

    // Resiliently fetch creators to prevent crashes from orphaned data
    const creatorIds = [...new Set(eventsData.map(event => event.createdBy))];
    const creators = await prisma.user.findMany({
      where: { id: { in: creatorIds } },
      select: { id: true, name: true },
    });
    const creatorMap = new Map(creators.map(c => [c.id, c.name]));

    const events = eventsData.map(event => ({
      ...event,
      creator: { name: creatorMap.get(event.createdBy) || 'Unbekannter Benutzer' },
    }));

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
    // For now, only allow course teachers to create bulk events
    // TODO: Add proper admin role check when needed
    throw new ForbiddenError('You do not have permission to create events for this course');
  }

  // Process events in transaction
  const results = await prisma.$transaction(async (tx) => {
    const createdEvents = [];

    for (const eventData of validatedData.events) {
      const event = await tx.behaviorEvent.create({
        data: {
          type: eventData.type || 'MANUAL_ACTION',
          studentId: eventData.studentId!,
          courseId: validatedData.courseId,
          payload: eventData.payload || {},
          notes: eventData.notes,
          createdBy: userId,
        },
      });
      createdEvents.push(event);
    }

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'BULK_CREATE_BEHAVIOR_EVENTS',
        entityType: 'course',
        entityId: validatedData.courseId,
        metadata: {
          eventCount: validatedData.events.length,
        },
      },
    });

    return createdEvents;
  });

  return NextResponse.json({
    message: `Successfully created ${results.length} events`,
    events: results,
  }, { status: 201 });
}