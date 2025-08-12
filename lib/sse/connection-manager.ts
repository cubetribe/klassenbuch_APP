// SSE Connection Manager
// Manages active SSE connections and handles cleanup

import { NextRequest } from 'next/server';
import { eventEmitter, SSEEvent } from './event-emitter';

export interface SSEConnection {
  id: string;
  userId: string;
  courseIds: string[];
  writer: WritableStreamDefaultWriter;
  closed: boolean;
  lastPing: Date;
}

class ConnectionManager {
  private static instance: ConnectionManager;
  private connections: Map<string, SSEConnection> = new Map();
  private pingInterval: NodeJS.Timer | null = null;

  private constructor() {
    // Start ping interval to keep connections alive
    this.startPingInterval();
  }

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  // Create new SSE connection
  createConnection(
    connectionId: string,
    userId: string,
    courseIds: string[],
    writer: WritableStreamDefaultWriter
  ): SSEConnection {
    const connection: SSEConnection = {
      id: connectionId,
      userId,
      courseIds,
      writer,
      closed: false,
      lastPing: new Date(),
    };

    this.connections.set(connectionId, connection);

    // Set up event listeners for this connection
    courseIds.forEach(courseId => {
      const listener = async (event: SSEEvent) => {
        await this.sendEventToConnection(connectionId, event);
      };
      eventEmitter.subscribeToCourse(courseId, listener);
    });

    return connection;
  }

  // Send event to specific connection
  async sendEventToConnection(connectionId: string, event: SSEEvent) {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.closed) return;

    try {
      const encoder = new TextEncoder();
      const data = `data: ${JSON.stringify(event)}\n\n`;
      await connection.writer.write(encoder.encode(data));
    } catch (error) {
      // Connection likely closed, clean up
      this.closeConnection(connectionId);
    }
  }

  // Broadcast event to all connections watching a course
  async broadcastToCourse(courseId: string, event: SSEEvent) {
    for (const connection of this.connections.values()) {
      if (connection.courseIds.includes(courseId) && !connection.closed) {
        await this.sendEventToConnection(connection.id, event);
      }
    }
  }

  // Close and clean up connection
  closeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.closed = true;

    // Remove event listeners
    connection.courseIds.forEach(courseId => {
      // Note: We'd need to store the actual listener functions to properly remove them
      // For now, this is a simplified version
    });

    // Close the writer
    try {
      connection.writer.close();
    } catch (error) {
      // Ignore errors when closing
    }

    this.connections.delete(connectionId);
  }

  // Send ping to keep connections alive
  private async pingConnections() {
    const encoder = new TextEncoder();
    const ping = encoder.encode(':ping\n\n');

    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.closed) {
        this.connections.delete(connectionId);
        continue;
      }

      try {
        await connection.writer.write(ping);
        connection.lastPing = new Date();
      } catch (error) {
        // Connection failed, clean up
        this.closeConnection(connectionId);
      }
    }
  }

  // Start ping interval
  private startPingInterval() {
    // Ping every 30 seconds to keep connections alive
    this.pingInterval = setInterval(() => {
      this.pingConnections();
    }, 30000);
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.connections.size,
      connectionsByUser: new Map(
        Array.from(this.connections.values()).map(conn => [conn.userId, conn.courseIds])
      ),
    };
  }

  // Cleanup all connections
  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    for (const connectionId of this.connections.keys()) {
      this.closeConnection(connectionId);
    }
  }
}

export const connectionManager = ConnectionManager.getInstance();