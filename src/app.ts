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

export function buildServer() {
  // Khởi tạo Fastify với ZodTypeProvider
  const server = Fastify().withTypeProvider<ZodTypeProvider>();

  // Thêm validator và serializer của Zod
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // Đăng ký Swagger
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Ecommerce fashion doc api',
        description: 'API documentation for the ecommerce website',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${ENV_CONFIG.PORT}` }],
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
