// mediaFolder.routes.ts
import { FastifyInstance } from 'fastify';
import { mediaFolderController } from './mediaFolder.controller';
import {
  MEDIA_FOLDER_DESCRIPTIONS,
  MEDIA_FOLDER_SUMMARIES,
  MEDIA_FOLDER_TAG,
} from './mediaFolder.docs';

import { routeWithZod } from '@/utils/routeWithZod';
import {
  mediaFolderCreateSchema,
  mediaFolderUpdateSchema,
} from '@/db/schema.types';
import z from 'zod';

export const mediaFolderRoutes = (fastify: FastifyInstance) => {
  const controller = mediaFolderController(fastify);

  // POST /create
  routeWithZod(fastify, {
    method: 'post',
    url: '/create',
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_SUMMARIES.CREATE,
      description: MEDIA_FOLDER_DESCRIPTIONS.CREATE,
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          parentId: { type: 'string', format: 'uuid', nullable: true },
        },
      },
    },
    bodySchema: mediaFolderCreateSchema,
    handler: controller.createHandler,
  });

  // GET /folder-getAll
  fastify.get('/folder-getAll', {
    schema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_SUMMARIES.GET_ALL,
      description: MEDIA_FOLDER_DESCRIPTIONS.GET_ALL,
    },
    handler: controller.getAllHandler,
  });

  // PUT /folder-update
  routeWithZod(fastify, {
    method: 'put',
    url: '/folder-update',
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_SUMMARIES.UPDATE,
      description: MEDIA_FOLDER_DESCRIPTIONS.UPDATE,
      body: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
        },
      },
    },
    bodySchema: mediaFolderUpdateSchema,
    handler: controller.updateHandler,
  });

  routeWithZod(fastify, {
    method: 'delete',
    url: '/delete/:id',
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_SUMMARIES.DELETE,
      description: MEDIA_FOLDER_DESCRIPTIONS.DELETE,
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
    paramsSchema: z.object({
      id: z.string().uuid(),
    }),
    handler: controller.deleteHandler,
  });
};
