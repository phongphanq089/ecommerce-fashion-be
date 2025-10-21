import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import registerRoutes from './routes';
import { ENV_CONFIG } from './config/env';
import fastifyCors from '@fastify/cors';
import { zodErrorHandlerPlugin } from './middleware/zodErrorHandlerPlugin';
import * as Sentry from '@sentry/node';
import multipart from '@fastify/multipart';

export function buildServer() {
  // Khởi tạo Fastify với ZodTypeProvider
  const server = Fastify({
    logger: ENV_CONFIG.NODE_ENV === 'development',
  }).withTypeProvider<ZodTypeProvider>();

  Sentry.init({
    dsn: 'https://058432d00eeeabe1802745fc31ce1ce5@o4510077958750208.ingest.de.sentry.io/4510077962420304',
    integrations: [
      // send console.log, console.warn, and console.error calls as logs to Sentry
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    ],
    // Enable logs to be sent to Sentry
    enableLogs: true,
  });

  // ==== CORS ====  //
  server.register(fastifyCors, {
    origin: [
      ENV_CONFIG.CLIENT_ORIGIN,
      `http://localhost:${ENV_CONFIG.PORT}`,
      'http://127.0.0.1:5371',
      'http://localhost:3000',
      'https://ecommerce-fashion-fe.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  // Thêm validator và serializer của Zod
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // ======================================================
  // Đăng ký Multipart LÊN TRƯỚC để Fastify hiểu content type này
  server.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  // Đăng ký Swagger
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Ecommerce fashion doc api',
        description: 'API documentation for the ecommerce website',
        version: '1.0.0',
      },
      servers: [{ url: ENV_CONFIG.CLIENT_URL }, { url: ENV_CONFIG.SERVER_URL }],
    },
  });

  // Đăng ký Swagger UI để hiển thị tài liệu
  server.register(fastifySwaggerUI, {
    routePrefix: '/docs',

    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    theme: {
      css: [
        {
          filename: 'theme.css',
          content: '.swagger-ui .topbar { background-color: #129c08ff; }',
        },
      ],
      js: [
        {
          filename: 'custom.js',
          content: 'console.log("Swagger UI loaded!");',
        },
      ],
    },
  });

  //  Đăng ký plugin xử lý lỗi
  // Nó nên được đăng ký trước các route
  server.register(zodErrorHandlerPlugin);
  // Sentry.setupFastifyErrorHandler(server);

  // Đăng ký routes như bình thường
  registerRoutes(server);

  // ======= RENDER API DEFAULT ======= //
  server.get('/', async (request, reply) => {
    return reply.send({
      success: true,
      message: [
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '  🚀🚀  WELCOME TO API - ECOMMERCE PROJECT  🚀🚀',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '✅ Status: API is running successfully!',
        `🕒 Timestamp: ${new Date().toISOString()}`,
        '',
        '📌 Version : v1.0.0',
        `📌 Base URL: http://localhost:${ENV_CONFIG.PORT}`,
        `📌 Docs    : http://localhost:${ENV_CONFIG.PORT}/docs`,
        '📌 Author  : Your Name',
        '📌 Repo    : https://github.com/your-repo/ecommerce-api',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      ],
      timestamp: new Date().toISOString(),
    });
  });

  return server;
}
