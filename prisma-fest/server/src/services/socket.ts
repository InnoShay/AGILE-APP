/**
 * Socket.io server setup for real-time features.
 * Handles: announcements, event cancellations, check-ins, notifications, live count.
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { incrementLiveCount, decrementLiveCount, getLiveCount } from '../utils/redis';
import { logger } from '../utils/logger';

let io: Server;

/**
 * Initialize Socket.io server with authentication and event handlers.
 */
export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const user = verifyAccessToken(token);
        (socket as any).user = user;
      } catch {
        // Allow unauthenticated connections for public features (live count)
      }
    }
    next();
  });

  io.on('connection', async (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`🔌 Socket connected: ${socket.id}${user ? ` (${user.email})` : ' (anonymous)'}`);

    // Track live visitors
    await incrementLiveCount();
    const liveCount = await getLiveCount();
    io.emit('liveCount:update', { count: liveCount });

    // Join user-specific room for targeted notifications
    if (user) {
      socket.join(`user:${user.userId}`);
      socket.join(`role:${user.role}`);
    }

    // Handle disconnect
    socket.on('disconnect', async () => {
      await decrementLiveCount();
      const count = await getLiveCount();
      io.emit('liveCount:update', { count });
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Broadcast live count every 30 seconds
  setInterval(async () => {
    const count = await getLiveCount();
    io.emit('liveCount:update', { count });
  }, 30000);

  return io;
}

/**
 * Get the Socket.io server instance.
 */
export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

/**
 * Broadcast a new announcement to all connected users.
 */
export function broadcastAnnouncement(announcement: { id: string; title: string; body: string; priority: string }): void {
  getIO().emit('announcement:new', announcement);
}

/**
 * Notify specific user rooms about event cancellation.
 */
export function notifyEventCancelled(userIds: string[], event: { id: string; title: string }): void {
  for (const userId of userIds) {
    getIO().to(`user:${userId}`).emit('event:cancelled', event);
  }
}

/**
 * Update check-in count for organizer screens.
 */
export function broadcastCheckin(eventId: string, data: { registrationId: string; checkedIn: boolean; totalCheckedIn: number }): void {
  getIO().emit(`registration:checkin:${eventId}`, data);
}

/**
 * Send a notification to a specific user.
 */
export function notifyUser(userId: string, notification: { id: string; title: string; body: string; type: string }): void {
  getIO().to(`user:${userId}`).emit('notification:new', notification);
}
