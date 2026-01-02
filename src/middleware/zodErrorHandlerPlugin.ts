// plugins/zodErrorHandlerPlugin.ts
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '@/utils/logger';
import { AppError, ValidationError } from '@/utils/errors';
import * as Sentry from '@sentry/node';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Plugin xử lý lỗi toàn cục cho Fastify
 *
 * ✅ Tại sao dùng fastify-plugin (fp)?
 * - Giúp Fastify nhận diện đây là plugin chính thức.
 * - Cho phép chia sẻ context giữa các plugin khác.
 * - Đảm bảo plugin được load đúng thời điểm (trước routes, hooks, decorators...).
 */
// src/plugins/zodErrorHandlerPlugin.ts

export const zodErrorHandlerPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler(
    async (error: any, request: FastifyRequest, reply: FastifyReply) => {
      // 1. Zod validation error (từ zodValidate)
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        logger.warn('Zod validation error', {
          url: request.url,
          method: request.method,
          errors: validationError.details,
        });

        return reply.status(400).send({
          success: false,
          message: 'Validation failed',
          errors: Object.fromEntries(
            error.issues.map((issue) => [issue.path.join('.'), issue.message])
          ),
        });
      }

      // 2. Fastify validation error (AJV - nếu còn dùng ở đâu đó)
      if (error.validation) {
        const formattedErrors: Record<string, string[]> = {};
        for (const err of error.validation) {
          const field =
            err.instancePath.substring(1) ||
            err.params?.missingProperty ||
            'general';
          if (!formattedErrors[field]) formattedErrors[field] = [];
          formattedErrors[field].push(err.message ?? 'Invalid');
        }

        logger.warn('AJV validation error', {
          url: request.url,
          errors: formattedErrors,
        });

        return reply.status(400).send({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      // 3. Fastify built-in errors (multipart, payload too large, etc.)
      if (error.statusCode && error.statusCode < 500 && error.message) {
        // Các lỗi 4xx từ Fastify: file too large, no file, bad request...
        logger.warn('Fastify client error', {
          statusCode: error.statusCode,
          message: error.message,
          url: request.url,
        });

        return reply.status(error.statusCode).send({
          success: false,
          message: error.message || 'Bad request',
        });
      }

      // 4. Custom AppError
      if (error instanceof AppError) {
        logger.warn('AppError', {
          message: error.message,
          statusCode: error.statusCode,
        });

        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
          ...(error instanceof ValidationError && { errors: error.errors }),
        });
      }

      // 5. Tất cả lỗi khác → 500 (server error thật sự)
      logger.error('Unexpected server error', {
        error,
        stack: error.stack,
        url: request.url,
        method: request.method,
        body: request.body,
      });
      console.error('🔥 Server Error:', error);

      // Gửi đến Sentry
      Sentry.captureException(error, {
        tags: { route: request.url },
        extra: { body: request.body, query: request.query },
      });

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
