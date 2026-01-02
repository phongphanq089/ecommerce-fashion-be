import { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { fromZodError } from 'zod-validation-error';

export function zodValidate(
  schema: z.ZodSchema,
  target: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    let data: any;
    if (target === 'body') data = req.body;
    if (target === 'query') data = req.query;
    if (target === 'params') data = req.params;

    try {
      await schema.parseAsync(data);
    } catch (error) {
      console.log(error, '*****');
      const zodError = fromZodError(error as z.ZodError);
      return reply.status(400).send({
        success: false,
        message: `${target} validation failed`,
        errors: zodError.details,
      });
    }
  };
}
