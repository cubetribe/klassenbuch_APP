import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleApiError, NotFoundError, ValidationError } from '@/lib/api/errors';
import { z } from 'zod';
import { isTokenExpired } from '@/lib/utils/token';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Support both POST (from frontend) and GET (from email link)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      throw new ValidationError('Token is required');
    }

    return await verifyEmailLogic(token);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    return await verifyEmailLogic(token);
  } catch (error) {
    return handleApiError(error);
  }
}

async function verifyEmailLogic(token: string) {
  try {
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
    console.error('Email verification error:', error);
    throw error;
  }
}
