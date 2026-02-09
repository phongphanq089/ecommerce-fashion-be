import { fileUploadMiddleware } from '@/middleware/fileUpload.middleware';
import { FastifyInstance } from 'fastify';
import { mediaController } from './media.controller';
import {
  MEDIA_FILE_DOCUMENTATION,
  MEDIA_FOLDER_DOCUMENTATION,
  MEDIA_FOLDER_TAG,
  MEDIA_TAG,
} from './media.docs';

import { routeWithZod } from '@/utils/routeWithZod';
import { zodValidate } from '@/utils/zodValidate';
import {
  deleteMediaMultipleSchema,
  deleteMediaSingleSchema,
  mediaFolderCreateSchema,
  mediaFolderUpdateSchema,
} from './media.validation';
import z from 'zod';

export default function mediaRoutes(fastify: FastifyInstance) {
  const controller = mediaController(fastify);

  // ============================================================================
  // MEDIA FILE ROUTES
  // ============================================================================
  routeWithZod(fastify, {
    method: 'post',
    url: '/upload-single',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_FILE_DOCUMENTATION.MEDIA_SUMMARIES.UPLOAD_FILE_SINGLE,
      description:
        MEDIA_FILE_DOCUMENTATION.MEDIA_DESCRIPTIONS.UPLOAD_FILE_SINGLE,
      consumes: ['multipart/form-data'],
      ...MEDIA_FILE_DOCUMENTATION.MEDIA_REQUEST_BODIES.UPLOAD_FILE_SINGLE,
    },
    preHandler: [fileUploadMiddleware.single],
    handler: controller.createMediaSingle,
  });

  routeWithZod(fastify, {
    method: 'post',
    url: '/upload-multiple',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_FILE_DOCUMENTATION.MEDIA_SUMMARIES.UPLOAD_FILE_MULTIPLE,
      description:
        MEDIA_FILE_DOCUMENTATION.MEDIA_DESCRIPTIONS.UPLOAD_FILE_MULTIPLE,
      consumes: ['multipart/form-data'],
      ...MEDIA_FILE_DOCUMENTATION.MEDIA_REQUEST_BODIES.UPLOAD_FILE_MULTIPLE,
    },
    preHandler: [fileUploadMiddleware.multiple],
    handler: controller.createMediaMultiple,
  });
  routeWithZod(fastify, {
    method: 'get',
    url: '/get-media',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_FILE_DOCUMENTATION.MEDIA_SUMMARIES.GET_MEDIA,
      description: MEDIA_FILE_DOCUMENTATION.MEDIA_DESCRIPTIONS.GET_MEDIA,
      ...MEDIA_FILE_DOCUMENTATION.MEDIA_REQUEST_BODIES.GET_MEDIA,
    },
    handler: controller.getMedia,
  });
  routeWithZod(fastify, {
    method: 'delete',
    url: '/delete-single',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_FILE_DOCUMENTATION.MEDIA_SUMMARIES.DELETE_SINGLE,
      description: MEDIA_FILE_DOCUMENTATION.MEDIA_DESCRIPTIONS.DELETE_SINGLE,
      body: MEDIA_FILE_DOCUMENTATION.MEDIA_REQUEST_BODIES.DELETE_SINGLE,
    },
    preHandler: [zodValidate(deleteMediaSingleSchema)],
    handler: controller.deleteMediaSingle,
  });
  routeWithZod(fastify, {
    method: 'delete',
    url: '/delete-multiple',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_FILE_DOCUMENTATION.MEDIA_SUMMARIES.DELETE_MULTIPLE,
      description: MEDIA_FILE_DOCUMENTATION.MEDIA_DESCRIPTIONS.DELETE_MULTIPLE,
      body: MEDIA_FILE_DOCUMENTATION.MEDIA_REQUEST_BODIES.DELETE_MULTIPLE,
    },
    preHandler: [zodValidate(deleteMediaMultipleSchema)],
    handler: controller.deleteMediaMultiple,
  });

  // ============================================================================
  // MEDIA FOLDER ROUTES
  // ============================================================================
  // POST /create
  routeWithZod(fastify, {
    method: 'post',
    url: '/create',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_SUMMARIES.CREATE,
      description: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_DESCRIPTIONS.CREATE,
      body: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_REQUEST_BODIES.CREATE,
    },
    bodySchema: mediaFolderCreateSchema,
    handler: controller.createFolderHandler,
  });

  // GET /folder-getAll
  routeWithZod(fastify, {
    method: 'get',
    url: '/folder-getAll',
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_SUMMARIES.GET_ALL,
      description: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_DESCRIPTIONS.GET_ALL,
    },
    handler: controller.getAllFoldersHandler,
  });

  // PUT /folder-update
  routeWithZod(fastify, {
    method: 'put',
    url: '/folder-update',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_SUMMARIES.UPDATE,
      description: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_DESCRIPTIONS.UPDATE,
      body: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_REQUEST_BODIES.UPDATE,
    },
    bodySchema: mediaFolderUpdateSchema,
    handler: controller.updateFolderHandler,
  });

  routeWithZod(fastify, {
    method: 'delete',
    url: '/delete/:id',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_SUMMARIES.DELETE,
      description: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_DESCRIPTIONS.DELETE,
      params: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_REQUEST_BODIES.DELETE,
    },
    paramsSchema: z.object({
      id: z.uuid(),
    }),

    handler: controller.deleteFolderHandler,
  });
}
