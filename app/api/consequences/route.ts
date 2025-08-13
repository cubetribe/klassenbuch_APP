import { NextRequest, NextResponse } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { createConsequenceSchema } from '@/lib/validations/consequence';
import { handleApiError, UnauthorizedError, NotFoundError, ForbiddenError } from '@/lib/api/errors';

// GET /api/consequences - Get consequences with optional course filter
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const severity = searchParams.get('severity');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build where clause - consequences are now school-wide
    const where: any = {};

    if (severity) {
      where.severity = severity;
    }

    if (!includeInactive) {
      where.active = true;
    }

    const consequences = await prisma.consequence.findMany({
      where,
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: [
        { severity: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group consequences by severity
    const groupedConsequences = consequences.reduce((acc, consequence) => {
      const severity = consequence.severity;
      if (!acc[severity]) {
        acc[severity] = [];
      }
      acc[severity].push({
        ...consequence,
        applicationCount: consequence._count.applications,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      consequences,
      grouped: groupedConsequences,
      totalCount: consequences.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/consequences - Create a new consequence
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession(request);
    
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = createConsequenceSchema.parse(body);

    // Only admins and teachers can create school-wide consequences
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      throw new ForbiddenError('You do not have permission to create consequences');
    }

    // Create consequence with audit log
    const consequence = await prisma.$transaction(async (tx) => {
      const newConsequence = await tx.consequence.create({
        data: {
          name: validatedData.name!,
          description: validatedData.description,
          emoji: validatedData.emoji,
          severity: validatedData.severity || 'MINOR',
          notesRequired: validatedData.notesRequired || false,
          active: true,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_CONSEQUENCE',
          entityType: 'consequence',
          entityId: newConsequence.id,
          metadata: validatedData,
        },
      });

      return newConsequence;
    });

    return NextResponse.json(consequence, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}