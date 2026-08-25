import app from './app';
import { config } from './config';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './utils/logger';

async function startServer() {
  try {
    // Connect to MongoDB database
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} in [${config.nodeEnv}] mode`);
      logger.info(`📖 OpenAPI Docs available at http://localhost:${config.port}/api-docs`);
      logger.info(`🏥 Health check at http://localhost:${config.port}/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('Database disconnected. HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server: %o', error);
    process.exit(1);
  }
}

startServer();
