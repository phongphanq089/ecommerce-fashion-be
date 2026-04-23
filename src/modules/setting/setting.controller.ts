import { FastifyReply, FastifyRequest } from 'fastify';
import { SettingService } from './setting.service';
import { SettingRepository } from './setting.repository';
import { CreateNavigationDTO, UpdateNavigationDTO } from './setting.repository';
import {
  HeroBannerSchema,
  LogoSchema,
  LogoSchemaType,
  HomepageSectionsSchemaType,
} from './setting.validation';
import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';

export const settingController = (fastify: any) => {
  const settingRepository = new SettingRepository(fastify.db);
  const settingService = new SettingService(settingRepository);

  return {
    getHeroBannerHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await settingService.getHeroBanner();
        return sendResponseSuccess(
          200,
          reply,
          'Get hero banner success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error getting hero banner'
        );
      }
    },

    upsertHeroBannerHandler: async (
      req: FastifyRequest<{ Body: HeroBannerSchema }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertHeroBanner(req.body);
        return sendResponseSuccess(
          200,
          reply,
          'Update hero banner success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error updating hero banner'
        );
      }
    },

    getLogoHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const result = await settingService.getLogo();
        return sendResponseSuccess(200, reply, 'Get logo success', result);
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error getting logo'
        );
      }
    },

    updateLogoHandler: async (
      req: FastifyRequest<{ Body: LogoSchemaType }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertLogo(req.body);
        return sendResponseSuccess(200, reply, 'Update logo success', result);
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error updating logo'
        );
      }
    },

    getHomepageSectionsHandler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.getHomepageSections();
        return sendResponseSuccess(
          200,
          reply,
          'Get homepage sections success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error getting homepage sections'
        );
      }
    },

    upsertHomepageSectionsHandler: async (
      req: FastifyRequest<{ Body: HomepageSectionsSchemaType }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await settingService.upsertHomepageSections(req.body);
        return sendResponseSuccess(
          200,
          reply,
          'Update homepage sections success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error updating homepage sections'
        );
      }
    },
  };
};
