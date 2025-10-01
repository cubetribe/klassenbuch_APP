import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/utils/password';
import { registerSchema } from '@/lib/validations/auth';
import { handleApiError, ConflictError } from '@/lib/api/errors';
import { generateToken } from '@/lib/utils/token';
import { sendVerificationEmail } from '@/lib/email/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Generate verification token
    const verificationToken = generateToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        role: validatedData.role,
        verificationToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      verificationToken,
      user.name
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Still return success but inform user that email might not have been sent
    }

    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user,
        emailSent: emailResult.success,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}