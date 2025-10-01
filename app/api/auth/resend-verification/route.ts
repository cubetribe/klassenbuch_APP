import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleApiError, NotFoundError, ValidationError } from '@/lib/api/errors';
import { z } from 'zod';
import { generateToken, getTokenExpiry } from '@/lib/utils/token';
import { sendVerificationEmail } from '@/lib/email/service';

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resendVerificationSchema.parse(body);

    // Find user with this email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundError('No user found with this email address');
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          message: 'Email is already verified',
          alreadyVerified: true,
        },
        { status: 200 }
      );
    }

    // Generate new verification token
    const verificationToken = generateToken();

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationToken,
      user.name
    );

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Failed to send verification email');
    }

    return NextResponse.json(
      {
        message: 'Verification email sent successfully. Please check your inbox.',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
