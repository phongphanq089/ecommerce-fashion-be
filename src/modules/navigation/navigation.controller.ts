import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateNavigationDTO,
  NavigationRepository,
  UpdateNavigationDTO,
} from './navigation.repository';
import { NavigationService } from './navigation.service';
import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';

export const navigationController = (fastify: FastifyInstance) => {
  const navigateRepository = new NavigationRepository(fastify.db);
  const navigateService = new NavigationService(navigateRepository);
  return {
    initSystemNavigationsHandler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      try {
        const result = await navigateService.initSystemNavigations();
        return sendResponseSuccess(
          200,
          reply,
          'Init system navigations success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error initializing system navigations'
        );
      }
    },
    createNavigationHandler: async (
      req: FastifyRequest<{ Body: CreateNavigationDTO }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await navigateService.createNavigation(req.body);
        return sendResponseSuccess(
          200,
          reply,
          'Create navigation success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error creating navigation'
        );
      }
    },
    getAllNavigationsHandler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      try {
        const result = await navigateService.getAllNavigations();
        return sendResponseSuccess(
          200,
          reply,
          'Get all navigations success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error getting all navigations'
        );
      }
    },

    getNavigationTreeHandler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      try {
        const result = await navigateService.getNavigationTree();
        return sendResponseSuccess(
          200,
          reply,
          'Get navigation tree success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          500,
          reply,
          error.message || 'Error getting navigation tree'
        );
      }
    },

    getNavigationByIdHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await navigateService.getNavigationById(req.params.id);
        return sendResponseSuccess(
          200,
          reply,
          'Get navigation by id success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          404,
          reply,
          error.message || 'Navigation not found'
        );
      }
    },

    updateNavigationHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: UpdateNavigationDTO;
      }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await navigateService.updateNavigation(
          req.params.id,
          req.body
        );
        return sendResponseSuccess(
          200,
          reply,
          'Update navigation success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          400,
          reply,
          error.message || 'Error updating navigation'
        );
      }
    },

    deleteNavigationHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const result = await navigateService.deleteNavigation(req.params.id);
        return sendResponseSuccess(
          200,
          reply,
          'Delete navigation success',
          result
        );
      } catch (error: any) {
        return sendResponseError(
          400,
          reply,
          error.message || 'Error deleting navigation'
        );
      }
    },
  };
};
