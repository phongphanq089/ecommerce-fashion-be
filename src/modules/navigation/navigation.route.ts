import { routeWithZod } from '@/utils/routeWithZod';
import { FastifyInstance } from 'fastify';
import { NAVIGATION_DOCUMENTATION } from './navigation.docs';
import { authenticate } from '@/middleware/auth.middleware';
import { ROLE_NAME } from '@/constants';
import {
  createNavigationSchema,
  updateNavigationSchema,
} from './navigation.validation';
import { navigationController } from './navigation.controller';

export const navigationRoutes = (fastify: FastifyInstance) => {
  const controller = navigationController(fastify);

  // POST /api/navigation/init-system
  routeWithZod(fastify, {
    url: '/init-system',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: NAVIGATION_DOCUMENTATION.NAVIGATION_SUMMARIES.INIT_SYSTEM,
      description: NAVIGATION_DOCUMENTATION.NAVIGATION_DESCRIPTIONS.INIT_SYSTEM,
      tags: [NAVIGATION_DOCUMENTATION.NAVIGATION_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.initSystemNavigationsHandler,
  });

  // POST /api/navigations
  routeWithZod(fastify, {
    url: '/',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: NAVIGATION_DOCUMENTATION.NAVIGATION_SUMMARIES.CREATE,
      description: NAVIGATION_DOCUMENTATION.NAVIGATION_DESCRIPTIONS.CREATE,
      tags: [NAVIGATION_DOCUMENTATION.NAVIGATION_TAG],
      body: NAVIGATION_DOCUMENTATION.NAVIGATION_SCHEMAS.REQUEST_BODY,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: createNavigationSchema,
    handler: controller.createNavigationHandler,
  });

  // GET /api/navigations
  routeWithZod(fastify, {
    url: '/',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: NAVIGATION_DOCUMENTATION.NAVIGATION_SUMMARIES.GET_ALL,
      description: NAVIGATION_DOCUMENTATION.NAVIGATION_DESCRIPTIONS.GET_ALL,
      tags: [NAVIGATION_DOCUMENTATION.NAVIGATION_TAG],
    },
    handler: controller.getAllNavigationsHandler,
  });

  // GET /api/navigations/tree
  routeWithZod(fastify, {
    url: '/tree',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: NAVIGATION_DOCUMENTATION.NAVIGATION_SUMMARIES.GET_TREE,
      description: NAVIGATION_DOCUMENTATION.NAVIGATION_DESCRIPTIONS.GET_TREE,
      tags: [NAVIGATION_DOCUMENTATION.NAVIGATION_TAG],
    },
    handler: controller.getNavigationTreeHandler,
  });

  // GET /api/navigations/:id
  routeWithZod(fastify, {
    url: '/:id',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: NAVIGATION_DOCUMENTATION.NAVIGATION_SUMMARIES.GET_BY_ID,
      description: NAVIGATION_DOCUMENTATION.NAVIGATION_DESCRIPTIONS.GET_BY_ID,
      tags: [NAVIGATION_DOCUMENTATION.NAVIGATION_TAG],
    },
    handler: controller.getNavigationByIdHandler,
  });

  // PUT /api/navigations/:id
  routeWithZod(fastify, {
    url: '/:id',
    method: 'put',
    disableValidator: true,
    swaggerSchema: {
      summary: NAVIGATION_DOCUMENTATION.NAVIGATION_SUMMARIES.UPDATE,
      description: NAVIGATION_DOCUMENTATION.NAVIGATION_DESCRIPTIONS.UPDATE,
      tags: [NAVIGATION_DOCUMENTATION.NAVIGATION_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: updateNavigationSchema,
    handler: controller.updateNavigationHandler,
  });

  // DELETE /api/navigations/:id
  routeWithZod(fastify, {
    url: '/:id',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      summary: NAVIGATION_DOCUMENTATION.NAVIGATION_SUMMARIES.DELETE,
      description: NAVIGATION_DOCUMENTATION.NAVIGATION_DESCRIPTIONS.DELETE,
      tags: [NAVIGATION_DOCUMENTATION.NAVIGATION_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.deleteNavigationHandler,
  });
};
