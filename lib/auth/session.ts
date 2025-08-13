import { getServerSession } from 'next-auth/next';
import { authOptions } from './config';
import { NextRequest } from 'next/server';

export async function getAuthSession(req?: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
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