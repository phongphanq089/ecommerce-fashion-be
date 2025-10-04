import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export function zodValidate(schema: z.ZodSchema) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = req.body || req.query;
      await schema.parseAsync(data);
    } catch (error) {
      const zodError = fromZodError(error as z.ZodError);
      return reply.status(400).send({
        success: false,
        message: 'Validation failed',
        errors: zodError.details,
      });
    }
  };
}
