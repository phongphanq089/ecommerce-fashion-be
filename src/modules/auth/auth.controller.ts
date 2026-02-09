import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { COOKIE_NAME } from '@/constants';
import {
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  VerifyEmailInput,
  ResendVerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.validation';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { AuthRepository } from './auth.repository';
import ms from 'ms';
import { ENV_CONFIG } from '@/config/env';
import { BadRequestError } from '@/utils/errors';

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
      const userAgent = req.headers['user-agent'];
      const ip = req.ip;

      const result = await service.login(req.server, req.body!, userAgent, ip);

      const maxAge = ms(ENV_CONFIG.REFRESH_TOKEN_LIFE);

      reply.setCookie(COOKIE_NAME, result.refreshToken, {
        path: '/',
        httpOnly: true,
        sameSite: ENV_CONFIG.IS_PRODUCTION ? 'none' : 'lax', // Prod khác domain thì dùng 'none', Dev cùng localhost dùng 'lax'
        secure: ENV_CONFIG.IS_PRODUCTION, // Prod bắt buộc true, Dev thì false
        maxAge: maxAge / 1000,
      });

      // Remove refreshToken from body response
      const { refreshToken, ...response } = result;

      return sendResponseSuccess(200, reply, 'Login success', response);
    },

    googleLoginHandler: async (
      req: FastifyRequest<{
        Body?: GoogleLoginInput;
      }>,
      reply: FastifyReply
    ) => {
      const userAgent = req.headers['user-agent'];
      const ip = req.ip;

      const result = await service.googleLogin(
        req.server,
        req.body!.idToken,
        userAgent,
        ip
      );

      const maxAge = ms(ENV_CONFIG.REFRESH_TOKEN_LIFE);

      reply.setCookie(COOKIE_NAME, result.refreshToken, {
        path: '/',
        httpOnly: true,
        sameSite: ENV_CONFIG.IS_PRODUCTION ? 'none' : 'lax',
        secure: ENV_CONFIG.IS_PRODUCTION,
        maxAge: maxAge / 1000,
      });

      const { refreshToken, ...response } = result;
      return sendResponseSuccess(200, reply, 'Google login success', response);
    },

    logOutHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await service.logout(req.cookies[COOKIE_NAME] as string);
      reply.clearCookie(COOKIE_NAME, { path: '/' });
      return sendResponseSuccess(200, reply, 'Logout success', result);
    },

    refreshTokenHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const userAgent = req.headers['user-agent'];
      const ip = req.ip;

      const result = await service.refresh(
        req.server,
        req.cookies[COOKIE_NAME] as string,
        userAgent,
        ip
      );

      const maxAge = ms(ENV_CONFIG.REFRESH_TOKEN_LIFE);

      reply.setCookie(COOKIE_NAME, result.refreshToken, {
        path: '/',
        httpOnly: true,
        sameSite: ENV_CONFIG.IS_PRODUCTION ? 'none' : 'lax', // Prod khác domain thì dùng 'none', Dev cùng localhost dùng 'lax'
        secure: ENV_CONFIG.IS_PRODUCTION, // Prod bắt buộc true, Dev thì false
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
    verifyEmailHandler: async (
      req: FastifyRequest<{ Body?: VerifyEmailInput }>,
      reply: FastifyReply
    ) => {
      if (!req.body?.email || !req.body?.token) {
        throw new BadRequestError('Missing email or token');
      }
      const result = await service.verifyEmail(req.body.email, req.body.token);
      return sendResponseSuccess(200, reply, 'Verify `email success', result);
    },

    resendVerifyEmailHandler: async (
      req: FastifyRequest<{ Body?: ResendVerifyEmailInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.resendVerificationEmail(
        req.body!.email,
        req.body!.urlRedirect
      );
      return sendResponseSuccess(
        200,
        reply,
        'Resend verification email success',
        result
      );
    },
    forgotPasswordHandler: async (
      req: FastifyRequest<{ Body?: ForgotPasswordInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.forgotPassword(
        req.body!.email,
        req.body!.urlRedirect
      );
      return sendResponseSuccess(200, reply, 'Forgot password success', result);
    },
    resetPasswordHandler: async (
      req: FastifyRequest<{ Body?: ResetPasswordInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.resetPassword(
        req.body!.email,
        req.body!.token,
        req.body!.password
      );
      return sendResponseSuccess(200, reply, 'Reset password success', result);
    },
  };
};
