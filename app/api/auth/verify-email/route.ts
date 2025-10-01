import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleApiError, NotFoundError, ValidationError } from '@/lib/api/errors';
import { z } from 'zod';
import { isTokenExpired } from '@/lib/utils/token';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    // Find user with this verification token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        verificationToken: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Invalid verification token');
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          message: 'Email already verified',
          alreadyVerified: true,
        },
        { status: 200 }
      );
    }

    // Update user to set emailVerified and clear verificationToken
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    return NextResponse.json(
      {
        message: 'Email verified successfully',
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
