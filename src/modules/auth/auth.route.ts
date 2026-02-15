import { routeWithZod } from '@/utils/routeWithZod';
import { FastifyInstance } from 'fastify';
import { AUTH_DESCRIPTIONS, AUTH_SUMMARIES, AUTH_TAG } from './auth.docs';
import { authenticate } from '@/middleware/auth.middleware';
import { authController } from './auth.controller';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendVerifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from './auth.validation';
import { ROLE_NAME } from '@/constants';

export const authRoutes = (fastify: FastifyInstance) => {
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
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          urlRedirect: { type: 'string', format: 'url', nullable: true },
        },
      },
    },
    bodySchema: registerSchema,
    handler: controller.registerHandler,
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
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
          isMobile: { type: 'boolean', nullable: true },
        },
      },
    },
    bodySchema: loginSchema,
    handler: controller.loginHandler,
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
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

  routeWithZod(fastify, {
    method: 'post',
    url: '/resend-verify-email',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Resend Verification Email',
      description: 'Resend Verification Email',
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          urlRedirect: { type: 'string', format: 'url', nullable: true },
        },
      },
    },
    bodySchema: resendVerifyEmailSchema,
    handler: controller.resendVerifyEmailHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/forgot-password',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Forgot Password',
      description: 'Forgot Password',
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          urlRedirect: { type: 'string', format: 'url', nullable: true },
        },
      },
    },
    bodySchema: forgotPasswordSchema,
    handler: controller.forgotPasswordHandler,
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute',
      },
    },
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/reset-password',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Reset Password',
      description: 'Reset Password',
      body: {
        type: 'object',
        required: ['email', 'password', 'token'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          token: { type: 'string' },
        },
      },
    },
    bodySchema: resetPasswordSchema,
    handler: controller.resetPasswordHandler,
  });

  // ===== api text authorization =====
  routeWithZod(fastify, {
    method: 'get',
    url: '/users-all',
    disableValidator: true,
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],

    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Get All Users',
      description: 'Get All Users',
      security: [{ bearerAuth: [] }],
    },

    bodySchema: verifyEmailSchema,
    handler: async (req, reply) => {
      return 'Users fetched successfully';
    },
  });
  routeWithZod(fastify, {
    method: 'post',
    url: '/google',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Google Login',
      description: 'Login with Google Authorization Code',
      body: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string' },
          urlRedirect: { type: 'string', format: 'url', nullable: true },
          isMobile: { type: 'boolean', nullable: true },
        },
      },
    },
    bodySchema: googleLoginSchema,
    handler: controller.googleLoginHandler,
  });
};
