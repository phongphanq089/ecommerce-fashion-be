// src/index.ts
import { ENV_CONFIG } from './config/env';
if (ENV_CONFIG.NODE_ENV === 'production') {
  require('module-alias/register');
}
import dotenv from 'dotenv';
import { buildServer } from './app';
import { seedSuperAdmin } from './utils/seed-super-admin';
import { LOGGER_CONSOLE } from './utils/log-console';
import { logger } from './utils/logger';

dotenv.config();

const server = buildServer();

const start = async () => {
  try {
    await server.listen({ port: ENV_CONFIG.PORT, host: ENV_CONFIG.HOST });
    await seedSuperAdmin();
    LOGGER_CONSOLE.logStartupInfo();
  } catch (err) {
    console.error('❌ Failed to resolve path alias "@". Please check paths.');
    server.log.error(err);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT received. Exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received. Exiting...');
  process.exit(0);
});

start();
