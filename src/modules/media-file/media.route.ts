import { fileUploadMiddleware } from '@/middleware/fileUpload.middleware';
import { FastifyInstance } from 'fastify';
import { mediaController } from './media-file.controller';
import {
  MEDIA_DESCRIPTIONS,
  MEDIA_SUMMARIES,
  MEDIA_TAG,
} from './media-file.docs';

import { routeWithZod } from '@/utils/routeWithZod';
import { deleteMediaSingleSchema } from './media-file.validation';
import { zodValidate } from '@/utils/zodValidate';

export default function mediaRoutes(fastify: FastifyInstance) {
  const controller = mediaController(fastify);

  routeWithZod(fastify, {
    method: 'post',
    url: '/upload-single',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_SUMMARIES.UPLOAD_FILE_SINGLE,
      description: MEDIA_DESCRIPTIONS.UPLOAD_FILE_SINGLE,
      consumes: ['multipart/form-data'],
      querystring: {
        type: 'object',
        properties: {
          folderId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['file'],
        properties: {
          file: { type: 'string', format: 'binary' },
        },
      },
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
      summary: MEDIA_SUMMARIES.UPLOAD_FILE_MULTIPLE,
      description: MEDIA_DESCRIPTIONS.UPLOAD_FILE_MULTIPLE,
      consumes: ['multipart/form-data'],
      querystring: {
        type: 'object',
        properties: {
          folderId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['files'],
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    },
    handler: controller.createMediaMultiple,
  });
  routeWithZod(fastify, {
    method: 'get',
    url: '/get-media',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_SUMMARIES.GET_MEDIA,
      description: MEDIA_DESCRIPTIONS.GET_MEDIA,
      querystring: {
        type: 'object',
        properties: {
          folderId: { type: 'string', format: 'uuid' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
    handler: controller.getMedia,
  });
  routeWithZod(fastify, {
    method: 'delete',
    url: '/delete-single',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_SUMMARIES.DELETE_SINGLE,
      description: MEDIA_DESCRIPTIONS.DELETE_SINGLE,
      body: {
        type: 'object',
        required: ['Id'],
        properties: {
          Id: { type: 'string', format: 'uuid' },
        },
      },
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
      summary: MEDIA_SUMMARIES.DELETE_MULTIPLE,
      description: MEDIA_DESCRIPTIONS.DELETE_MULTIPLE,
      body: {
        type: 'object',
        required: ['Ids'],
        properties: {
          Ids: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
      },
    },
    handler: controller.deleteMediaMultiple,
  });
}
