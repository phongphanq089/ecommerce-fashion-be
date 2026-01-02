// src/utils/routeWithZod.ts - PHIÊN BẢN HOÀN CHỈNH 2026
import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  RouteOptions,
} from 'fastify';
import { ZodSchema } from 'zod';
import { zodValidate } from './zodValidate';

type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head';

interface RouteWithZodOptions
  extends Omit<
    RouteOptions,
    | 'handler'
    | 'schema'
    | 'method'
    | 'url'
    | 'preHandler'
    | 'onRequest'
    | 'preValidation'
    | 'preSerialization'
    | 'onSend'
    | 'onResponse'
  > {
  method: HttpMethod;
  url: string;
  swaggerSchema?: any; // cho @fastify/swagger
  disableValidator?: boolean;
  bodySchema?: ZodSchema;
  querySchema?: ZodSchema;
  paramsSchema?: ZodSchema;
  // Các hook Fastify chuẩn - không kế thừa để tránh conflict với exactOptionalPropertyTypes
  preHandler?: NonNullable<RouteOptions['preHandler']>;
  onRequest?: NonNullable<RouteOptions['onRequest']>;
  preValidation?: NonNullable<RouteOptions['preValidation']>;
  preSerialization?: NonNullable<RouteOptions['preSerialization']>;
  onSend?: NonNullable<RouteOptions['onSend']>;
  onResponse?: NonNullable<RouteOptions['onResponse']>;
  // Handler type-safe
  handler: (
    req: FastifyRequest<{
      Body?: any;
      Querystring?: any;
      Params?: any;
    }>,
    reply: FastifyReply
  ) => Promise<any> | any;
}

export function routeWithZod(
  fastify: FastifyInstance,
  options: RouteWithZodOptions
) {
  const {
    method,
    url,
    swaggerSchema,
    disableValidator,
    bodySchema,
    querySchema,
    paramsSchema,
    handler,
    preHandler,
    onRequest,
    preValidation,
    preSerialization,
    onSend,
    onResponse,
    ...restOptions // các option khác: config, attachValidation, etc.
  } = options;

  // Tạo mảng preHandler từ Zod
  const zodPreHandlers: any[] = [];

  if (bodySchema) {
    zodPreHandlers.push(zodValidate(bodySchema, 'body'));
  }
  if (querySchema) {
    zodPreHandlers.push(zodValidate(querySchema, 'query'));
  }
  if (paramsSchema) {
    zodPreHandlers.push(zodValidate(paramsSchema, 'params'));
  }

  // Gộp preHandler từ user + Zod (user middleware chạy trước Zod)
  const finalPreHandlers = preHandler
    ? Array.isArray(preHandler)
      ? [...preHandler, ...zodPreHandlers]
      : [preHandler, ...zodPreHandlers]
    : zodPreHandlers;

  fastify.route({
    method: method.toUpperCase() as any,
    url,
    schema: swaggerSchema,

    // Bỏ validatorCompiler → để Zod + error handler xử lý
    ...(finalPreHandlers.length > 0 && { preHandler: finalPreHandlers }),
    ...(onRequest && { onRequest }),
    ...(preValidation && { preValidation }),
    ...(preSerialization && { preSerialization }),
    ...(onSend && { onSend }),
    ...(onResponse && { onResponse }),
    handler,
    ...restOptions,

    ...(disableValidator && {
      validatorCompiler: () => () => true,
    }),
  });
}
