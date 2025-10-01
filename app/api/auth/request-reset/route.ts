import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleApiError } from '@/lib/api/errors';
import { z } from 'zod';
import { generateToken, getTokenExpiry } from '@/lib/utils/token';
import { sendPasswordResetEmail } from '@/lib/email/service';

const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestResetSchema.parse(body);

    // Find user with this email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // IMPORTANT: Always return success to prevent user enumeration attacks
    // Don't reveal whether the email exists or not
    const successMessage = 'If an account exists with this email, a password reset link has been sent.';

    if (!user) {
      // Still return success even if user doesn't exist (security best practice)
      return NextResponse.json(
        { message: successMessage },
        { status: 200 }
      );
    }

    // Generate reset token with 1 hour expiry
    const resetToken = generateToken();
    const resetTokenExpiry = getTokenExpiry(1); // 1 hour

    // Update user with reset token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // Still return success to user (don't expose email sending failures)
    }

    return NextResponse.json(
      { message: successMessage },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
