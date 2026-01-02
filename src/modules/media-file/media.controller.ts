import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs/promises';
import { mediaService } from './media.service';
import {
  DeleteMediaTypeMultipleInput,
  DeleteMediaTypeSigleInput,
} from './schema/media.schema';
import { MediaRepository } from './media.repository';

export const mediaController = (fastify: FastifyInstance) => {
  const repo = new MediaRepository(fastify.db);
  const service = mediaService(repo);
  return {
    createMediaSingle: async (req: FastifyRequest, reply: FastifyReply) => {
      const file = (req as any).savedFile;

      if (!file) return sendResponseError(400, reply, 'No file uploaded', null);

      try {
        const fileBuffer = await fs.readFile(file.path);

        const folderId = ((req.query as any)?.folderId as string) || '';

        const media = await service.createMediaSingle({
          fileBuffer,
          fileName: file.originalname.split('.')[0],
          fileType: file.mimetype,
          altText: file.originalname,
          folderId: folderId,
        });

        return sendResponseSuccess(201, reply, 'Create media success', media);
      } catch (error) {
        console.error('Error during multiple file upload:', error);
        return sendResponseError(
          500,
          reply,
          'An error occurred during file processing',
          null
        );
      } finally {
        await fs.unlink(file.path);
      }
    },
    createMediaMultiple: async (req: FastifyRequest, reply: FastifyReply) => {
      const files = (req as any).savedFiles;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return sendResponseError(400, reply, 'No files uploaded', null);
      }

      try {
        const { folderId } = req.query as {
          folderId?: string;
        };

        const medias = await service.createMediaMultiple(files, folderId);

        return sendResponseSuccess(200, reply, 'Create media success', medias);
      } catch (error) {
        console.error('Error during multiple file upload:', error);
        return sendResponseError(
          500,
          reply,
          'An error occurred during file processing',
          null
        );
      } finally {
        // Luôn dọn dẹp file tạm sau khi xử lý xong (kể cả khi lỗi)
        const cleanupPromises = files.map((file: any) =>
          fs.unlink(file.path).catch((err) => {
            // Ghi lại lỗi nếu không xóa được file tạm, nhưng không làm crash tiến trình
            console.error(`Failed to delete temporary file: ${file.path}`, err);
          })
        );
        await Promise.all(cleanupPromises);
      }
    },
    getMedia: async (req: FastifyRequest, reply: FastifyReply) => {
      const {
        folderId,
        page = '1',
        limit = '20',
      } = req.query as {
        folderId?: string;
        page?: string;
        limit?: string;
      };

      const data = await service.getMediaList(
        folderId,
        Number(page),
        Number(limit)
      );

      return sendResponseSuccess(201, reply, 'Get List media success', data);
    },
    deleteMediaSingle: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const param = {
        Id: req.params.id,
      };
      const result = await service.deleteMediaSingle(
        param as DeleteMediaTypeSigleInput
      );
      return reply.send({
        succes: true,
        message: 'Media deleted successfully',
        data: result,
      });
    },
    deleteMediaMultiple: async (req: FastifyRequest, reply: FastifyReply) => {
      const { Ids } = req.body as DeleteMediaTypeMultipleInput;

      const result = await service.deleteMediaMutiple({ Ids });

      return reply.send({
        success: true,
        message: 'Media deleted',
        data: result,
      });
    },
  };
};
