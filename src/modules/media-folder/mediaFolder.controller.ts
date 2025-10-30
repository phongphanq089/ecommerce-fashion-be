import { FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify';
import {
  FolderIdInput,
  MediaFolderInput,
  UpdateFolderInput,
} from './schema/mediaFolder.schema';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { mediaFolderService } from './media.service';

export const mediaFolderController = {
  createHandler: async (
    req: FastifyRequest<{ Body: MediaFolderInput }>,
    reply: FastifyReply
  ) => {
    const newFolder = await mediaFolderService.createFolder(req.body);
    return sendResponseSuccess(201, reply, 'Success', newFolder);
  },
  async getAllHandler(req: FastifyRequest, reply: FastifyReply) {
    const result = await mediaFolderService.getAllFoldersAsTree();
    return sendResponseSuccess(201, reply, 'Success', result);
  },
  async updateHandler(
    req: FastifyRequest<{ Body: UpdateFolderInput }>,
    reply: FastifyReply
  ) {
    const updatedFolder = await mediaFolderService.updateFolder(req.body);

    return sendResponseSuccess(201, reply, 'Success', updatedFolder);
  },

  async deleteHandler(
    req: FastifyRequest<{ Params: FolderIdInput }>,
    reply: FastifyReply
  ) {
    const { id } = req.params;

    const result = await mediaFolderService.deleteFolder(id);
    return sendResponseSuccess(
      201,
      reply,
      `Remove ${result.name} successfully`
    );
  },
};
