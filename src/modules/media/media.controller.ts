import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs/promises';
import { mediaService } from './media.service';
import { MediaRepository } from './media.repository';
import {
  DeleteMediaMultipleInput,
  DeleteMediaSingleInput,
  MediaFolderCreateInput,
  MediaFolderUpdateInput,
} from './media.validation';

export const mediaController = (fastify: FastifyInstance) => {
  const repo = new MediaRepository(fastify.db);
  const service = mediaService(repo);
  return {
    // ============================================================================
    // MEDIA FILE CONTROLLER
    // ============================================================================
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
      req: FastifyRequest<{ Body?: DeleteMediaSingleInput }>,
      reply: FastifyReply
    ) => {
      const id = req.body?.id;
      if (!id) {
        return sendResponseError(400, reply, 'No id provided', null);
      }
      const result = await service.deleteMediaSingle({ id });
      return sendResponseSuccess(
        200,
        reply,
        'Media deleted successfully',
        result
      );
    },
    deleteMediaMultiple: async (
      req: FastifyRequest<{ Body?: DeleteMediaMultipleInput }>,
      reply: FastifyReply
    ) => {
      const ids = req.body?.ids;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return sendResponseError(400, reply, 'No ids provided', null);
      }
      const result = await service.deleteMediaMultiple({ ids });

      return sendResponseSuccess(200, reply, 'Media deleted', result);
    },
    // ============================================================================
    // MEDIA FOLDER CONTROLLER
    // ============================================================================
    createFolderHandler: async (
      req: FastifyRequest<{ Body?: MediaFolderCreateInput }>,
      reply: FastifyReply
    ) => {
      if (!req.body) {
        return sendResponseError(400, reply, 'Missing body', null);
      }
      const newFolder = await service.createFolder(req.body!);
      return sendResponseSuccess(200, reply, 'Success', newFolder);
    },

    getAllFoldersHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await service.getAllFoldersAsTree();
      return sendResponseSuccess(200, reply, 'Success', result);
    },

    updateFolderHandler: async (
      req: FastifyRequest<{ Body?: MediaFolderUpdateInput }>,
      reply: FastifyReply
    ) => {
      if (!req.body) {
        return sendResponseError(400, reply, 'Missing body', null);
      }
      const updatedFolder = await service.updateFolder(req.body!);
      return sendResponseSuccess(200, reply, 'Success', updatedFolder);
    },

    deleteFolderHandler: async (
      req: FastifyRequest<{ Params?: { id: string } }>,
      reply: FastifyReply
    ) => {
      const id = req.params?.id;
      if (!id) {
        return sendResponseError(400, reply, 'Missing id parameters');
      }
      const result = await service.deleteFolder(id);
      return sendResponseSuccess(
        200,
        reply,
        `Remove ${result.name} successfully`
      );
    },
  };
};
