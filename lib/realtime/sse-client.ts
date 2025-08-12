'use client';

// Client-side SSE connection manager
// Handles connection, reconnection, and event processing

import { EventEmitter } from 'events';

export type SSEEventType = 
  | 'behavior_event'
  | 'student_update'
  | 'course_update'
  | 'reward_redeemed'
  | 'consequence_applied'
  | 'connection';

export interface SSEMessage {
  type: SSEEventType;
  courseId?: string;
  data: any;
  timestamp: Date;
}

export interface SSEClientOptions {
  courseIds?: string[];
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: SSEMessage) => void;
}

export class SSEClient extends EventEmitter {
  private eventSource: EventSource | null = null;
  private courseIds: string[];
  private reconnectDelay: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private options: SSEClientOptions;

  constructor(options: SSEClientOptions = {}) {
    super();
    this.courseIds = options.courseIds || [];
    this.reconnectDelay = options.reconnectDelay || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.options = options;
  }

  // Connect to SSE endpoint
  connect(courseIds?: string[]) {
    if (this.isConnecting || this.eventSource?.readyState === EventSource.OPEN) {
      return;
    }

    this.isConnecting = true;
    this.courseIds = courseIds || this.courseIds;

    // Build URL with course IDs
    const params = new URLSearchParams();
    if (this.courseIds.length > 0) {
      params.set('courseIds', this.courseIds.join(','));
    }

    const url = `/api/sse?${params.toString()}`;

    try {
      this.eventSource = new EventSource(url);

      // Handle connection open
      this.eventSource.onopen = () => {
        console.log('[SSE] Connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connect');
        this.options.onConnect?.();
      };

      // Handle messages
      this.eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          message.timestamp = new Date(message.timestamp);
          
          // Emit specific event type
          this.emit(message.type, message);
          
          // Emit general message event
          this.emit('message', message);
          this.options.onMessage?.(message);

          // Handle specific message types
          this.handleMessage(message);
        } catch (error) {
          console.error('[SSE] Failed to parse message:', error);
        }
      };

      // Handle errors
      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        this.isConnecting = false;
        
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.emit('disconnect');
          this.options.onDisconnect?.();
          this.scheduleReconnect();
        }
        
        this.emit('error', error);
        this.options.onError?.(new Error(`SSE connection error: ${error.type}`));
      };
    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  // Handle specific message types
  private handleMessage(message: SSEMessage) {
    switch (message.type) {
      case 'connection':
        console.log('[SSE] Connection established:', message.data);
        break;
      
      case 'behavior_event':
        console.log('[SSE] Behavior event:', message.data);
        break;
      
      case 'student_update':
        console.log('[SSE] Student update:', message.data);
        break;
      
      case 'reward_redeemed':
        console.log('[SSE] Reward redeemed:', message.data);
        break;
      
      case 'consequence_applied':
        console.log('[SSE] Consequence applied:', message.data);
        break;
    }
  }

  // Schedule reconnection attempt
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SSE] Max reconnect attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );

    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Disconnect from SSE
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.emit('disconnect');
    this.options.onDisconnect?.();
  }

  // Update subscribed courses
  updateCourses(courseIds: string[]) {
    this.courseIds = courseIds;
    
    // Reconnect with new course IDs
    if (this.eventSource) {
      this.disconnect();
      this.connect();
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  // Get connection state
  get readyState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED;
  }

  // Clean up
  destroy() {
    this.disconnect();
    this.removeAllListeners();
  }
}

// Singleton instance for global use
let sseClientInstance: SSEClient | null = null;

export function getSSEClient(options?: SSEClientOptions): SSEClient {
  if (!sseClientInstance) {
    sseClientInstance = new SSEClient(options);
  }
  return sseClientInstance;
}

export function destroySSEClient() {
  if (sseClientInstance) {
    sseClientInstance.destroy();
    sseClientInstance = null;
  }
}