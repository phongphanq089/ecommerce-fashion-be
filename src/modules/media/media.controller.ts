import { sendResponseSuccess } from '@/utils/sendResponse';
import { FastifyReply, FastifyRequest } from 'fastify';

export const mediaController = {
  createMedia: (req: FastifyRequest, reply: FastifyReply) => {
    const file = req.file as any;

    console.log(file);

    return sendResponseSuccess(200, reply, 'Create media success', {});
  },
};
