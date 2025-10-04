import { fileUploadMiddleware } from '@/middleware/fileUpload.middleware';
import { FastifyInstance } from 'fastify';
import { mediaController } from './media.controller';
import { MEDIA_DESCRIPTIONS, MEDIA_SUMMARIES, MEDIA_TAG } from './media.docs';
import {
  deleteMediaMultipleSchema,
  deleteMediaSchema,
} from './schema/media.schema';
import { zodValidate } from '@/utils/zodValidate';
/**
 * Media Routes
 * -------------
 * - POST /upload              → Upload 1 file (multipart, parse qua middleware)
 * - POST /uploads             → Upload nhiều file
 * - GET  /getMedia            → Lấy danh sách media (hỗ trợ folderId + pagination)
 * - DELETE /media-delete-single   → Xóa 1 media theo Id
 * - DELETE /media-delete-multiple → Xóa nhiều media theo danh sách Id
 *
 * 📌 Lưu ý:
 * - Tạm tắt validatorCompiler mặc định của Fastify (do Zod không hỗ trợ multipart binary),
 *   thay vào đó validate bằng Zod trong `preHandler` khi cần.
 * - Middleware `fileUploadMiddleware` chịu trách nhiệm parse file từ multipart.
 * - Schema Swagger chỉ dùng để mô tả request/response (API docs).
 */
export default function mediaRoutes(fastify: FastifyInstance) {
  (fastify.post('/upload', {
    schema: {
      summary: MEDIA_SUMMARIES.UPLOAD_FILE_SINGLE,
      tags: [MEDIA_TAG],
      description: MEDIA_DESCRIPTIONS.UPLOAD_FILE_SINGLE,
      consumes: ['multipart/form-data'],
      querystring: {
        type: 'object',
        properties: {
          folderId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
      body: {
        type: 'object',
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
    validatorCompiler: ({ schema }) => {
      return (data: any) => true;
    },
    preHandler: [fileUploadMiddleware.single],
    handler: mediaController.createMediaSingle,
  }),
    fastify.post('/uploads', {
      schema: {
        summary: MEDIA_SUMMARIES.UPLOAD_FILE_MULTIPLE,
        tags: [MEDIA_TAG],
        description: MEDIA_DESCRIPTIONS.UPLOAD_FILE_MULTIPLE,
        consumes: ['multipart/form-data'],
        querystring: {
          type: 'object',
          properties: {
            folderId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
        body: {
          type: 'object',
          required: ['files'],
          properties: {
            files: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
      },
      validatorCompiler: ({ schema }) => {
        return (data: any) => true;
      },
      preHandler: [fileUploadMiddleware.multiple],
      handler: mediaController.createMediaMultiple,
    }),
    fastify.get('/getMedia', {
      schema: {
        summary: MEDIA_SUMMARIES.GET_MEDIA,
        tags: [MEDIA_TAG],
        description: MEDIA_DESCRIPTIONS.GET_MEDIA,
        querystring: {
          type: 'object',
          properties: {
            folderId: {
              type: 'string',
              format: 'uuid',
              description: 'Filter media by folder ID',
            },
            page: {
              type: 'integer',
              minimum: 1,
              default: 1,
              description: 'Page number for pagination',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
              description: 'Number of items per page',
            },
          },
        },
      },
      validatorCompiler: ({ schema }) => {
        return (data: any) => true;
      },
      handler: mediaController.getMedia,
    }),
    fastify.delete('/media-delete-single', {
      schema: {
        summary: MEDIA_SUMMARIES.DELETE_SINGLE,
        tags: [MEDIA_TAG],
        description: MEDIA_DESCRIPTIONS.DELETE_SINGLE,
        body: {
          type: 'object',
          required: ['Id'],
          properties: {
            Id: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
      },
      validatorCompiler: ({ schema }) => {
        return (data: any) => true;
      },
      preHandler: [zodValidate(deleteMediaSchema)],
      handler: mediaController.deleteMediaSingle,
    }),
    fastify.delete('/media-delete-multiple', {
      schema: {
        summary: MEDIA_SUMMARIES.DELETE_MULTIPLE,
        tags: [MEDIA_TAG],
        description: MEDIA_DESCRIPTIONS.DELETE_MULTIPLE,
        body: {
          type: 'object',
          required: ['Ids'],
          properties: {
            Ids: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid',
              },
            },
          },
        },
      },
      validatorCompiler: ({ schema }) => {
        return (data: any) => true;
      },
      preHandler: [zodValidate(deleteMediaMultipleSchema)],
      handler: mediaController.deleteMediaMultiple,
    }));
}
