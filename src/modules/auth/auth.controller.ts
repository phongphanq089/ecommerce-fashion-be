import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { COOKIE_NAME } from '@/constants';
import { LoginInput, RegisterInput } from './auth.validation';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { AuthRepository } from './auth.repository';
import ms from 'ms';
import { ENV_CONFIG } from '@/config/env';

export const authController = (fastify: FastifyInstance) => {
  const repo = new AuthRepository(fastify.db);
  const service = new AuthService(repo);
  return {
    registerHandler: async (
      req: FastifyRequest<{
        Body?: RegisterInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.register(req.body!);
      return sendResponseSuccess(200, reply, 'Register success', result);
    },

    loginHandler: async (
      req: FastifyRequest<{
        Body?: LoginInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.login(req.server, req.body!);

      const maxAge = ms(ENV_CONFIG.REFRESH_TOKEN_LIFE);

      reply.setCookie(COOKIE_NAME, result.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: ENV_CONFIG.IS_PRODUCTION,
        sameSite: 'lax',
        maxAge: maxAge / 1000,
      });

      // Remove refreshToken from body response
      const { refreshToken, ...response } = result;

      return sendResponseSuccess(200, reply, 'Login success', response);
    },

    logOutHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await service.logout(req.cookies[COOKIE_NAME] as string);
      reply.clearCookie(COOKIE_NAME, { path: '/' });
      return sendResponseSuccess(200, reply, 'Logout success', result);
    },

    refreshTokenHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await service.refresh(
        req.server,
        req.cookies[COOKIE_NAME] as string
      );

      const maxAge = ms(ENV_CONFIG.REFRESH_TOKEN_LIFE);

      reply.setCookie(COOKIE_NAME, result.refreshToken, {
        path: '/',
        httpOnly: true,
        secure: ENV_CONFIG.IS_PRODUCTION,
        sameSite: 'lax',
        maxAge: maxAge / 1000,
      });

      return sendResponseSuccess(200, reply, 'Refresh token success', {
        accessToken: result.accessToken,
      });
    },

    getMeHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const user = req.user as { id: string };
      const result = await service.getProfile(user.id);
      return sendResponseSuccess(200, reply, 'Get me success', result);
    },
  };
};
