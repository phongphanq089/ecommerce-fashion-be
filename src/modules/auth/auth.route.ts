import { routeWithZod } from '@/utils/routeWithZod';
import { FastifyInstance, HTTPMethods } from 'fastify';
import { AUTH_DESCRIPTIONS, AUTH_SUMMARIES, AUTH_TAG } from './auth.docs';
import { betterAuthHandler } from './auth.handler';

export const authPlugin = (fastify: FastifyInstance) => {
  routeWithZod(fastify, {
    method: 'post',
    url: '/sign-up/email', // URL chính xác của better-auth đây là url của better-auth nên phải đúng
    disableValidator: true, // Tắt validate của Fastify để Better-Auth tự lo, hoặc bật nếu muốn Swagger validate giúp
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
    handler: betterAuthHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/sign-in/email',
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
    handler: betterAuthHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/sign-out',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.SIGN_OUT,
      description: AUTH_DESCRIPTIONS.SIGN_OUT,
      body: { type: 'object' }, // Body rỗng
    },
    handler: betterAuthHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/email-otp/send-verification-otp',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Send OTP to verify email',
      body: {
        type: 'object',
        required: ['email', 'type'],
        properties: {
          email: { type: 'string', format: 'email' },
          type: { type: 'string', enum: ['email-verification', 'sign-in'] },
        },
      },
    },
    handler: betterAuthHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/email-otp/verify-email', // Tên chuẩn của better-auth là verify-email
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Enter OTP to verify email',
      body: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string' },
        },
      },
    },
    handler: betterAuthHandler,
  });

  routeWithZod(fastify, {
    method: 'get',
    url: '/get-session',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.GET_SESSION,
      description: AUTH_DESCRIPTIONS.GET_SESSION,
    },
    handler: betterAuthHandler,
  });

  // 5. FORGET PASSWORD (Quên mật khẩu)
  routeWithZod(fastify, {
    method: 'post',
    url: '/request-password-reset',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.FORGET_PASSWORD,
      description: AUTH_DESCRIPTIONS.FORGET_PASSWORD,
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          redirectTo: {
            type: 'string',
            description:
              'Frontend URL to redirect after clicking a link in an email',
          },
        },
      },
    },
    handler: betterAuthHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/reset-password',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.RESET_PASSWORD,
      description: AUTH_DESCRIPTIONS.RESET_PASSWORD,
      body: {
        type: 'object',
        required: ['newPassword', 'token'],
        properties: {
          newPassword: { type: 'string' },
          token: { type: 'string' },
        },
      },
    },
    handler: betterAuthHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/change-password',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.CHANGE_PASSWORD,
      description: AUTH_DESCRIPTIONS.CHANGE_PASSWORD,
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
          revokeOtherSessions: { type: 'boolean', default: false },
        },
      },
    },
    handler: betterAuthHandler,
  });

  // 8. LIST SESSIONS (Xem danh sách thiết bị)
  routeWithZod(fastify, {
    method: 'get',
    url: '/list-sessions',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.LIST_SESSIONS,
      description: AUTH_DESCRIPTIONS.LIST_SESSIONS,
    },
    handler: betterAuthHandler,
  });

  // 9. REVOKE SESSION (Đăng xuất thiết bị khác)
  routeWithZod(fastify, {
    method: 'post',
    url: '/revoke-session',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.REVOKE_SESSION,
      description: AUTH_DESCRIPTIONS.REVOKE_SESSION,
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: {
            type: 'string',
            description: 'Session Token need to revoke',
          },
        },
      },
    },
    handler: betterAuthHandler,
  });

  // 10. REVOKE OTHER SESSIONS (Đăng xuất tất cả thiết bị khác)
  routeWithZod(fastify, {
    method: 'post',
    url: '/revoke-other-sessions',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: AUTH_SUMMARIES.REVOKE_OTHER_SESSIONS,
      description: AUTH_DESCRIPTIONS.REVOKE_OTHER_SESSIONS,
      body: { type: 'object' },
    },
    handler: betterAuthHandler,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/sign-in/social',
    disableValidator: true,
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Đăng nhập mạng xã hội (Google, Github...)',
      body: {
        type: 'object',
        required: ['provider'],
        properties: {
          provider: { type: 'string', enum: ['google', 'facebook', 'github'] },
          callbackURL: {
            type: 'string',
            description: 'Link frontend muốn redirect về sau khi login xong',
          },
        },
      },
    },
    handler: betterAuthHandler,
  });

  routeWithZod(fastify, {
    method: 'get',
    url: '/callback/:id', // :id sẽ ứng với 'google', 'facebook', 'github'...
    disableValidator: true, // Tắt validate vì Google trả về query param rất dài
    swaggerSchema: {
      tags: [AUTH_TAG],
      summary: 'Callback từ Social Login',
      description:
        'API này được Google/Facebook gọi tự động sau khi login thành công.',
      hide: true, // Ẩn khỏi Swagger cho đỡ rối (hoặc để hiện tùy bạn)
    },
    handler: betterAuthHandler,
  });
};
