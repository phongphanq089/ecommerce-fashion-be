import { fileUploadMiddleware } from '@/middleware/fileUpload.middleware';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { mediaController } from './media.controller';
import { uploadSchema } from './schema/media.schema';
import { sendResponseError } from '@/utils/sendResponse';
import { MEDIA_DESCRIPTIONS, MEDIA_SUMMARIES, MEDIA_TAG } from './media.docs';

export default function mediaRoutes(fastify: FastifyInstance) {
  fastify.post('/upload', {
    schema: {
      summary: MEDIA_SUMMARIES.UPLOAD_FILE_SINGLE,
      tags: [MEDIA_TAG],
      description: MEDIA_DESCRIPTIONS.UPLOAD_FILE_SINGLE,
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
          folderId: {
            type: 'string',
            description: 'Optional folder ID to upload to',
          },
          altText: {
            type: 'string',
            description: 'Optional alt text for the media',
          },
        },
      },
    },
    // ⚠️ Tạm thời tắt validate mặc định (do đang dùng fastify-type-provider-zod),
    // nếu không sẽ bị lỗi vì Zod không hỗ trợ binary trong multipart
    validatorCompiler: ({ schema }) => {
      return (data: any) => true;
    },
    // ✅ Validate lại bằng Zod trong preHandler,
    // đảm bảo các field folderId và altText hợp lệ, loại bỏ field thừa
    preHandler: [
      fileUploadMiddleware.single, // Middleware xử lý multipart, parse file vào req.file
      async (req: FastifyRequest, reply: FastifyReply) => {
        const parsed = uploadSchema.safeParse(req.body);
        if (!parsed.success) {
          return sendResponseError(400, reply, parsed.error.message);
        }
        // Ghi đè req.body bằng dữ liệu đã parse (sạch sẽ, đúng schema)
        req.body = parsed.data;
      },
    ],
    handler: mediaController.createMedia,
  });
}
