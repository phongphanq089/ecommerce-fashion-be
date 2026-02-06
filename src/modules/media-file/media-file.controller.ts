import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fs from 'fs/promises';
import { mediaService } from './media-file.service';
import { MediaRepository } from './media-file.repository';
import {
  DeleteMediaMultipleInput,
  DeleteMediaSingleInput,
} from './media-file.validation';

export const mediaController = (fastify: FastifyInstance) => {
  const repo = new MediaRepository(fastify.db);
  const service = mediaService(repo);
  return {
    createMediaSingle: async (req: FastifyRequest, reply: FastifyReply) => {
      const file = (req as any).savedFile;

      if (!file) return sendResponseError(400, reply, 'No file uploaded', null);

      try {
        const folderId = ((req.query as any)?.folderId as string) || '';

        const media = await service.createMediaSingle({
          file: file.file,
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
      }
    },
    createMediaMultiple: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const parts = req.files({
          limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit example, adjust as needed or import constant
          },
        });

        const { folderId } = req.query as {
          folderId?: string;
        };

        const medias = await service.createMediaMultiple(parts, folderId);

        return sendResponseSuccess(200, reply, 'Create media success', medias);
      } catch (error) {
        console.error('Error during multiple file upload:', error);
        return sendResponseError(
          500,
          reply,
          'An error occurred during file processing',
          null
        );
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
      const body = {
        Id: req.body?.Id,
      };
      if (!body.Id) {
        return sendResponseError(400, reply, 'No id provided', null);
      }
      const result = await service.deleteMediaSingle(
        body as DeleteMediaSingleInput
      );
      return reply.send({
        succes: true,
        message: 'Media deleted successfully',
        data: result,
      });
    },
    deleteMediaMultiple: async (
      req: FastifyRequest<{ Body?: DeleteMediaMultipleInput }>,
      reply: FastifyReply
    ) => {
      const body = {
        Ids: req.body?.Ids,
      };
      if (!body.Ids || !Array.isArray(body.Ids) || body.Ids.length === 0) {
        return sendResponseError(400, reply, 'No ids provided', null);
      }
      const result = await service.deleteMediaMutiple(
        body as DeleteMediaMultipleInput
      );

      return reply.send({
        success: true,
        message: 'Media deleted',
        data: result,
      });
    },
  };
};
