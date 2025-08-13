import { NextRequest } from 'next/server';

import { getAuthSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const session = await getAuthSession(request);
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const courseIds = searchParams.get('courseIds');
  
  if (!courseIds) {
    return new Response('Missing courseIds parameter', { status: 400 });
  }

  const courseIdArray = courseIds.split(',');

  // Create SSE response
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString(),
        courseIds: courseIdArray
      });
      
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      // Keep connection alive with periodic heartbeat
      const heartbeat = setInterval(() => {
        try {
          const heartbeatData = JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          });
          
          controller.enqueue(encoder.encode(`data: ${heartbeatData}\n\n`));
        } catch (error) {
          // Connection was closed
          clearInterval(heartbeat);
        }
      }, 30000); // Every 30 seconds

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}