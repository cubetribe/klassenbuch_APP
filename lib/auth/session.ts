import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { NextRequest } from 'next/server';

/**
 * Get authenticated session for API routes
 * Handles both App Router and Pages Router contexts
 */
export async function getAuthSession(req?: NextRequest) {
  try {
    // For App Router API routes, we don't need to pass req/res
    const session = await getServerSession(authOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Session check:', {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });
    }
    
    return session;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
}

/**
 * Verify user has access to a specific resource
 */
export async function verifyAccess(
  userId: string | undefined,
  resourceOwnerId: string,
  userRole?: string
): Promise<boolean> {
  if (!userId) return false;
  
  // Admin has access to everything
  if (userRole === 'ADMIN') return true;
  
  // Owner has access to their resources
  return userId === resourceOwnerId;
}

export function createAuthResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({ 
      error: message,
      authenticated: false 
    }), 
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}