/**
 * UTILITY: routeWithZod
 * ---------------------
 * Cầu nối giữa Fastify, Zod (Validation) và Swagger (Documentation).
 * * TẠI SAO PHẢI DÙNG HÀM NÀY?
 * 1. Tách biệt Schema: Swagger cần JSON Schema thuần, Zod cần Zod Object.
 * Nếu dùng chung, Zod Provider sẽ crash khi đọc JSON Schema (lỗi "reading 'run'").
 * 2. Hỗ trợ Multipart: Fastify mặc định không validate được binary stream qua Zod.
 * Cờ `disableValidator` giúp bypass qua trình biên dịch mặc định để xử lý upload.
 * 3. Fix TypeScript Strict: Thỏa mãn cấu hình 'exactOptionalPropertyTypes: true'
 * bằng cách sử dụng Spread Pattern thay vì gán trực tiếp giá trị undefined.
 */

import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  RouteOptions,
  HTTPMethods,
} from 'fastify';
import { ZodSchema } from 'zod';
import { zodValidate } from './zodValidate';
import { authorize } from '@/middleware/auth.middleware';

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
  method: HttpMethod | HttpMethod[];
  url: string;
  /** Schema JSON thuần dùng để hiển thị trên giao diện Swagger UI */
  swaggerSchema?: any;
  /** Bật true khi dùng Multipart/FileUpload hoặc khi muốn tự validate thủ công */
  disableValidator?: boolean;
  /** Schema Zod dùng để validate thực tế qua middleware */
  bodySchema?: ZodSchema;
  querySchema?: ZodSchema;
  paramsSchema?: ZodSchema;
  /** Mảng các Role được phép truy cập. Nếu truyền vào, sẽ tự động check `authorize` */
  roles?: string[];

  // Hook definitions (Tách riêng để tránh xung đột kiểu dữ liệu optional)
  preHandler?: NonNullable<RouteOptions['preHandler']>;
  onRequest?: NonNullable<RouteOptions['onRequest']>;
  preValidation?: NonNullable<RouteOptions['preValidation']>;
  preSerialization?: NonNullable<RouteOptions['preSerialization']>;
  onSend?: NonNullable<RouteOptions['onSend']>;
  onResponse?: NonNullable<RouteOptions['onResponse']>;

  /** Handler được định nghĩa lại để hỗ trợ Type-safe tốt hơn */
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
    roles,
    ...restOptions
  } = options;

  // --- BƯỚC 1: KHỞI TẠO ZOD VALIDATION ---
  // Chúng ta validate dữ liệu thông qua mảng preHandler thay vì dùng
  // validatorCompiler mặc định để tránh xung đột với Swagger JSON Schema.
  const zodPreHandlers: any[] = [];
  if (roles && roles.length > 0) zodPreHandlers.push(authorize(roles)); // <-- Tự động thêm authorize middleware
  if (bodySchema) zodPreHandlers.push(zodValidate(bodySchema, 'body'));
  if (querySchema) zodPreHandlers.push(zodValidate(querySchema, 'query'));
  if (paramsSchema) zodPreHandlers.push(zodValidate(paramsSchema, 'params'));

  // Gộp các middleware của người dùng truyền vào với middleware của Zod
  const finalPreHandlers = preHandler
    ? Array.isArray(preHandler)
      ? [...preHandler, ...zodPreHandlers]
      : [preHandler, ...zodPreHandlers]
    : zodPreHandlers;

  const fastifyMethod = (
    Array.isArray(method)
      ? method.map((m) => m.toUpperCase())
      : method.toUpperCase()
  ) as HTTPMethods | HTTPMethods[];

  // --- BƯỚC 2: ĐĂNG KÝ ROUTE VỚI FASTIFY ---
  fastify.route({
    method: fastifyMethod,
    url,
    handler,
    ...restOptions,

    // SỬ DỤNG CONDITIONAL SPREAD ( ... && { key: value } )
    // Cách viết này cực kỳ quan trọng: Nó giúp tránh gán 'undefined' vào các thuộc tính optional,
    // thỏa mãn strict mode 'exactOptionalPropertyTypes' của TypeScript.

    ...(swaggerSchema && { schema: swaggerSchema }),
    ...(finalPreHandlers.length > 0 && { preHandler: finalPreHandlers }),
    ...(onRequest && { onRequest }),
    ...(preValidation && { preValidation }),
    ...(preSerialization && { preSerialization }),
    ...(onSend && { onSend }),
    ...(onResponse && { onResponse }),

    // NÚT THOÁT HIỂM (ESCAPE HATCH):
    // Khi disableValidator = true (thường dùng cho Multipart hoặc Proxy Auth), ta gán một no-op function.
    // Điều này ngăn Fastify cố gắng biên dịch Swagger Schema qua Zod Provider gây lỗi crash (cả validator và serializer).
    ...(disableValidator && {
      validatorCompiler: () => () => true,
      serializerCompiler: () => (data: any) => JSON.stringify(data),
    }),
  });
}
