import { ENV_CONFIG } from '@/config/env';
import { PrismaClient } from '@prisma/client';

// khai báo 1 biến để lưu trữ íntance
declare global {
  var prisma: PrismaClient | undefined;
}

// Tạo instance , tái sử dụng  nếu đã tồn tại ( đặt biệt trong  môi trường dev )
export const prisma = global.prisma || new PrismaClient();

if (ENV_CONFIG.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
