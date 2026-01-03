import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  MediaFolderInput,
  UpdateFolderInput,
} from './schema/mediaFolder.schema';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { mediaFolderService } from './media-folder.service';
import { MediaFolderRepository } from './media-folder.repository';

export const mediaFolderController = (fastify: FastifyInstance) => {
  // Tạo repo và service trong controller (truyền fastify.db)
  const repo = new MediaFolderRepository(fastify.db);
  const service = new mediaFolderService(repo);

  return {
    createHandler: async (
      req: FastifyRequest<{ Body?: MediaFolderInput }>,
      reply: FastifyReply
    ) => {
      const newFolder = await service.createFolder(req.body!);
      return sendResponseSuccess(201, reply, 'Success', newFolder);
    },

    getAllHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await service.getAllFoldersAsTree();
      return sendResponseSuccess(200, reply, 'Success', result);
    },

    updateHandler: async (
      req: FastifyRequest<{ Body?: UpdateFolderInput }>,
      reply: FastifyReply
    ) => {
      const updatedFolder = await service.updateFolder(req.body!);
      return sendResponseSuccess(200, reply, 'Success', updatedFolder);
    },

    deleteHandler: async (
      req: FastifyRequest<{ Params?: { id: string } }>,
      reply: FastifyReply
    ) => {
      if (!req.params?.id) {
        return sendResponseSuccess(400, reply, 'Missing required parameters');
      }
      const { id } = req.params;
      const result = await service.deleteFolder(id);
      return sendResponseSuccess(
        200,
        reply,
        `Remove ${result.name} successfully`
      );
    },
  };
};
