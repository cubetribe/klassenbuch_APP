import { NextRequest, NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { updateConsequenceSchema } from '@/lib/validations/consequence';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/consequences/[id] - Get a specific consequence
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const consequence = await prisma.consequence.findUnique({
      where: {
        id: params.id,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            teacherId: true,
          },
        },
        applications: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          include: {
            student: {
              select: {
                displayName: true,
                internalCode: true,
              },
            },
            applier: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!consequence) {
      throw new NotFoundError('Consequence not found');
    }

    // Check if user has access to this consequence
    if (consequence.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have access to this consequence');
    }

    return NextResponse.json({
      ...consequence,
      totalApplications: consequence._count.applications,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/consequences/[id] - Update a consequence
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const consequence = await prisma.consequence.findUnique({
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

    if (!consequence) {
      throw new NotFoundError('Consequence not found');
    }

    if (consequence.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this consequence');
    }

    const body = await request.json();
    const validatedData = updateConsequenceSchema.parse(body);

    // Update consequence with audit log
    const updatedConsequence = await prisma.$transaction(async (tx) => {
      const updated = await tx.consequence.update({
        where: {
          id: params.id,
        },
        data: validatedData,
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_CONSEQUENCE',
          entityType: 'consequence',
          entityId: params.id,
          metadata: validatedData,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedConsequence);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/consequences/[id] - Delete (deactivate) a consequence
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const consequence = await prisma.consequence.findUnique({
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

    if (!consequence) {
      throw new NotFoundError('Consequence not found');
    }

    if (consequence.course.teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this consequence');
    }

    // Soft delete - just deactivate the consequence
    const deactivatedConsequence = await prisma.$transaction(async (tx) => {
      const deactivated = await tx.consequence.update({
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
          action: 'DELETE_CONSEQUENCE',
          entityType: 'consequence',
          entityId: params.id,
          metadata: {
            name: consequence.name,
            courseId: consequence.courseId,
          },
        },
      });

      return deactivated;
    });

    return NextResponse.json({ 
      message: 'Consequence deactivated successfully',
      consequence: deactivatedConsequence,
    });
  } catch (error) {
    return handleApiError(error);
  }
}