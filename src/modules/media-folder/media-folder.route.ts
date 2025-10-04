import { FastifyInstance } from 'fastify';
import { mediaFolderController } from './media-folder.controller';
import {
  MEDIA_FOLDER_DESCRIPTIONS,
  MEDIA_FOLDER_SUMMARIES,
  MEDIA_FOLDER_TAG,
} from './media.docs';
import {
  folderIdSchema,
  mediaFolderSchema,
  updateFolderSchema,
} from './schema/media-folder.schema';
import { zodValidate } from '@/utils/zodValidate';

export const mediaFolderRoutes = (fastify: FastifyInstance) => {
  fastify.post('/create', {
    schema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_SUMMARIES.CREATE,
      description: MEDIA_FOLDER_DESCRIPTIONS.CREATE,
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            minimum: 1,
          },
          parentId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
    validatorCompiler: ({ schema }) => {
      return (data: any) => true;
    },
    preHandler: [zodValidate(mediaFolderSchema)],
    handler: mediaFolderController.createHandler,
  });
  fastify.get('/folder-getAll', {
    schema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_SUMMARIES.GET_ALL,
      description: MEDIA_FOLDER_DESCRIPTIONS.GET_ALL,
    },
    handler: mediaFolderController.getAllHandler,
  });
  fastify.put('/folder-update', {
    schema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_SUMMARIES.UPDATE,
      description: MEDIA_FOLDER_DESCRIPTIONS.UPDATE,
      body: {
        type: 'object',
        required: ['name', 'id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          name: {
            type: 'string',
            minimum: 1,
          },
        },
      },
    },
    validatorCompiler: ({ schema }) => {
      return (data: any) => true;
    },
    preHandler: [zodValidate(updateFolderSchema)],
    handler: mediaFolderController.updateHandler,
  });
  fastify.delete('/delete', {
    schema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_SUMMARIES.DELETE,
      description: MEDIA_FOLDER_DESCRIPTIONS.DELETE,
      body: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
    validatorCompiler: ({ schema }) => {
      return (data: any) => true;
    },
    preHandler: [zodValidate(folderIdSchema)],
    handler: mediaFolderController.deleteHandler,
  });
};
