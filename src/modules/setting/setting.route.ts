import { FastifyInstance } from 'fastify';
import { routeWithZod } from '@/utils/routeWithZod';
import { settingController } from './setting.controller';
import {
  heroBannerSchema,
  LogoSchema,
  homepageSectionsSchema,
} from './setting.validation';

import { authenticate } from '@/middleware/auth.middleware';
import { ROLE_NAME } from '@/constants';
import { LOGS_DESCRIPTIONS } from '../log/logs.docs';
import { SETTING_DOCUMENTATION } from './setting.docs';

export const settingRoutes = (fastify: FastifyInstance) => {
  const controller = settingController(fastify);

  // GET /api/settings/logo
  routeWithZod(fastify, {
    url: '/logo',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_LOGO,
      // description: LOGS_DESCRIPTIONS,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getLogoHandler,
  });

  // POST /api/settings/logo
  routeWithZod(fastify, {
    url: '/logo',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_LOGO,
      // description: LOGS_DESCRIPTIONS,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.LOGO_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: LogoSchema,
    handler: controller.updateLogoHandler,
  });

  // GET /api/settings/hero-banner
  routeWithZod(fastify, {
    url: '/hero-banner',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_HERO_BANNER,
      description: SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.GET_HERO_BANNER,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getHeroBannerHandler,
  });

  // POST /api/settings/hero-banner
  routeWithZod(fastify, {
    url: '/hero-banner',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_HERO_BANNER,
      description:
        SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.UPDATE_HERO_BANNER,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.HERO_BANNER_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: heroBannerSchema,
    handler: controller.upsertHeroBannerHandler,
  });

  // GET /api/settings/homepage-sections
  routeWithZod(fastify, {
    url: '/homepage-sections',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.GET_HOMEPAGE_SECTIONS,
      description:
        SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.GET_HOMEPAGE_SECTIONS,
      tags: [SETTING_DOCUMENTATION.SETTING],
    },
    handler: controller.getHomepageSectionsHandler,
  });

  // POST /api/settings/homepage-sections
  routeWithZod(fastify, {
    url: '/homepage-sections',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: SETTING_DOCUMENTATION.SETTING_SUMMARIES.UPDATE_HOMEPAGE_SECTIONS,
      description:
        SETTING_DOCUMENTATION.SETTING_DESCRIPTIONS.UPDATE_HOMEPAGE_SECTIONS,
      tags: [SETTING_DOCUMENTATION.SETTING],
      body: SETTING_DOCUMENTATION.REQUEST_BODY.HOMEPAGE_SECTIONS_SCHEMAS,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: homepageSectionsSchema,
    handler: controller.upsertHomepageSectionsHandler,
  });
};
