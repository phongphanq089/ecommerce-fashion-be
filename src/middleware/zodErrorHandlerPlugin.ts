// plugins/zodErrorHandlerPlugin.ts
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '@/utils/logger';
import { AppError, ValidationError } from '@/utils/errors';
import * as Sentry from '@sentry/node';

/**
 * Plugin xử lý lỗi toàn cục cho Fastify
 *
 * ✅ Tại sao dùng fastify-plugin (fp)?
 * - Giúp Fastify nhận diện đây là plugin chính thức.
 * - Cho phép chia sẻ context giữa các plugin khác.
 * - Đảm bảo plugin được load đúng thời điểm (trước routes, hooks, decorators...).
 */
export const zodErrorHandlerPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler(
    (error: any, request: FastifyRequest, reply: FastifyReply) => {
      /**
       * 1. Xử lý lỗi validation mặc định của Fastify
       * - Khi schema validation (AJV) bị fail, error sẽ có thuộc tính `validation`.
       * - Ta gom lỗi lại theo từng field để trả về dạng dễ đọc cho FE.
       */
      if (error.validation) {
        const formattedErrors: Record<string, string[]> = {};

        for (const err of error.validation) {
          // Lấy tên field từ instancePath (vd: "/email" -> "email")
          const field = err.instancePath.substring(1);

          // Gom lỗi theo field (mỗi field là 1 mảng lỗi)
          if (!formattedErrors[field]) {
            formattedErrors[field] = [];
          }
          formattedErrors[field].push(err.message);
        }

        logger.error('Validation error:', {
          errors: error.validation, // log chi tiết lỗi để debug
          url: request.url,
        });

        return reply.status(400).send({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      /**
       * 2. Xử lý lỗi custom AppError (bao gồm ValidationError riêng của app)
       */
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
          ...(error instanceof ValidationError && { errors: error.errors }),
        });
      }

      /**
       * 3. Xử lý fallback cho các lỗi không xác định
       */
      logger.error('Unexpected error:', error);
      console.error('🔥🔥🔥 Lỗi chưa xác định:', error);

      // Gửi lỗi đến Sentry để nhận cảnh báo
      if (error.statusCode >= 500 || !error.isOperational) {
        Sentry.logger.error('User triggered test log', { action: 'test_log' });
      }

      return reply.status(500).send({
        success: false,
        message: 'Internal Server Error',
      });
    }
  );
});

/**
 * ┌───────────────────────────────────────────────┐
 * │         📌 Luồng xử lý lỗi trong Fastify       │
 * └───────────────────────────────────────────────┘
 *
 *                (Có lỗi xảy ra)
 *                        │
 *                        ▼
 *           ┌──────────────────────────┐
 *           │ error.validation tồn tại? │───► Có
 *           └──────────────────────────┘
 *                        │
 *                       Không
 *                        │
 *                        ▼
 *            ┌────────────────────────┐
 *            │ error instanceof AppError? │───► Có
 *            └────────────────────────┘
 *                        │
 *                       Không
 *                        │
 *                        ▼
 *              ┌──────────────────────┐
 *              │  Lỗi không xác định  │
 *              │   → Trả về 500       │
 *              └──────────────────────┘
 *
 * 👉 Tóm tắt:
 * 1. Nếu là lỗi validation mặc định của Fastify → gom lỗi theo field, trả về 400.
 * 2. Nếu là AppError (custom error trong app) → dùng statusCode & message có sẵn.
 * 3. Nếu là lỗi khác → log & trả về 500 Internal Server Error.
 */
