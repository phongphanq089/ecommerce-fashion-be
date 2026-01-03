import winston from 'winston';
import { ENV_CONFIG } from '@/config/env';

// Định nghĩa format cho môi trường Development (dễ đọc)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${message} ${stack ? `\n${stack}` : ''}`;
  })
);

// Định nghĩa format cho môi trường Production (JSON để máy dễ đọc/phân tích)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: ENV_CONFIG.IS_PRODUCTION ? 'info' : 'debug',
  format: ENV_CONFIG.IS_PRODUCTION ? prodFormat : devFormat,
  transports: [
    // Luôn luôn ghi ra Console. Trên Cloud, Console chính là nơi Render lấy Log.
    new winston.transports.Console(),
  ],
});

// Chỉ ghi ra file nếu đang ở môi trường Local (Development) nếu bạn thực sự muốn
if (ENV_CONFIG.IS_DEVELOPMENT) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/dev-error.log',
      level: 'error',
    })
  );
}
