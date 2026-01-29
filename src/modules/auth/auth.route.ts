import { routeWithZod } from '@/utils/routeWithZod';
import { FastifyInstance } from 'fastify';
import { AUTH_DESCRIPTIONS, AUTH_SUMMARIES, AUTH_TAG } from './auth.docs';
import { authenticate } from '@/middleware/auth.middleware';
import { authController } from './auth.controller';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from './auth.validation';

export const authPlugin = (fastify: FastifyInstance) => {
  const controller = authController(fastify);

  routeWithZod(fastify, {
    method: 'post',
    url: '/register',
    disableValidator: true,

    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.SIGN_UP,
      description: AUTH_DESCRIPTIONS.SIGN_UP,
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
          avatarUrl: { type: 'string', nullable: true },
        },
      },
    },
    bodySchema: registerSchema,
    handler: controller.registerHandler,
  });
  routeWithZod(fastify, {
    method: 'post',
    url: '/login',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.SIGN_IN,
      description: AUTH_DESCRIPTIONS.SIGN_IN,
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    bodySchema: loginSchema,
    handler: controller.loginHandler,
  });
  routeWithZod(fastify, {
    method: 'post',
    url: '/refresh-token',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Refresh Access Token',
      description: 'Uses HttpOnly Cookie "refresh_token"',
    },
    handler: controller.refreshTokenHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/logout',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.SIGN_OUT,
      description: AUTH_DESCRIPTIONS.SIGN_OUT,
    },
    handler: controller.logOutHandler,
  });

  routeWithZod(fastify, {
    method: 'get',
    url: '/me',
    preHandler: [authenticate],
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.GET_ME,
      description: AUTH_DESCRIPTIONS.GET_ME,
      security: [{ bearerAuth: [] }],
    },
    handler: controller.getMeHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/verify-email',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.VERIFY_EMAIL,
      description: AUTH_SUMMARIES.VERIFY_EMAIL,
      body: {
        type: 'object',
        required: ['email', 'token'],
        properties: {
          email: { type: 'string', format: 'email' },
          token: { type: 'string' },
        },
      },
    },

    bodySchema: verifyEmailSchema,
    handler: controller.verifyEmailHandler,
  });
};
