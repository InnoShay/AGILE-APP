/**
 * PRISMA Fest — Server Bootstrap
 */

import http from 'http';
import { app } from './app';
import { initSocketServer } from './services/socket';
import { connectRedis } from './utils/redis';
import { logger } from './utils/logger';
import { PrismaClient } from '@prisma/client';

const PORT = parseInt(process.env.PORT || '4000', 10);

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

async function bootstrap() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('✅ Connected to SQLite database');

    // Connect to Redis (graceful fallback to in-memory)
    await connectRedis();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    initSocketServer(server);
    logger.info('✅ Socket.io initialized');

    // Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 PRISMA Fest server running → http://localhost:${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('🔄 Shutting down gracefully...');
      await prisma.$disconnect();
      server.close(() => {
        logger.info('👋 Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
