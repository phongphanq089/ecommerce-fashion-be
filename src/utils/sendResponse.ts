import { FastifyReply } from 'fastify';

export const sendResponseSuccess = (
  status: number,
  reply: FastifyReply,
  message: string,
  result?: any
) => {
  return reply.status(status).send({
    success: true,
    message,
    ...(result !== undefined && { result }),
  });
};

export const sendResponseError = (
  status: number,
  reply: FastifyReply,
  message: string,
  result?: any
) => {
  return reply.status(status).send({
    success: false,
    message,
    ...(result !== undefined && { result }),
  });
};
