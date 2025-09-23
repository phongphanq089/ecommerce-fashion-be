// src/index.ts

import dotenv from 'dotenv';
import { buildServer } from './app';
import { ENV_CONFIG } from './config/env';
import { LOGGER_CONSOLE } from './utils/log-console';

dotenv.config();

const server = buildServer();

const start = async () => {
  try {
    await server.listen({ port: ENV_CONFIG.PORT, host: ENV_CONFIG.HOST });
    LOGGER_CONSOLE.logStartupInfo();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// process.on('SIGINT', () => {
//   logger.info('🛑 SIGINT received. Exiting...');
//   process.exit(0);
// });

// process.on('SIGTERM', () => {
//   logger.info('🛑 SIGTERM received. Exiting...');
//   process.exit(0);
// });

start();
