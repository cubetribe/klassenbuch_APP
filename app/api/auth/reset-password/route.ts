import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleApiError, NotFoundError, ValidationError } from '@/lib/api/errors';
import { z } from 'zod';
import { isTokenExpired } from '@/lib/utils/token';
import { hashPassword } from '@/lib/utils/password';
import { passwordSchema } from '@/lib/validations/common';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    // Find user with this reset token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Invalid or expired reset token');
    }

    // Check if token has expired
    if (isTokenExpired(user.resetTokenExpiry)) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      throw new ValidationError('Reset token has expired. Please request a new password reset.');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      {
        message: 'Password reset successfully. You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
