import { fileUploadMiddleware } from '@/middleware/fileUpload.middleware';
import { FastifyInstance } from 'fastify';
import { authenticate } from '@/middleware/auth.middleware';
import { ROLE_NAME } from '@/constants';
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
  // MEDIA FILE ROUTES (Base: /api/media)
  // ============================================================================

  // GET / (Lấy danh sách media)
  routeWithZod(fastify, {
    method: 'get',
    url: '/',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_FILE_DOCUMENTATION.MEDIA_SUMMARIES.GET_MEDIA,
      description: MEDIA_FILE_DOCUMENTATION.MEDIA_DESCRIPTIONS.GET_MEDIA,
      ...MEDIA_FILE_DOCUMENTATION.MEDIA_REQUEST_BODIES.GET_MEDIA,
    },
    handler: controller.getMedia,
  });

  // POST /upload (Upload 1 file)
  routeWithZod(fastify, {
    method: 'post',
    url: '/upload',
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

  // POST /upload/multiple (Upload nhiều file)
  routeWithZod(fastify, {
    method: 'post',
    url: '/upload/multiple',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_FILE_DOCUMENTATION.MEDIA_SUMMARIES.UPLOAD_FILE_MULTIPLE,
      description:
        MEDIA_FILE_DOCUMENTATION.MEDIA_DESCRIPTIONS.UPLOAD_FILE_MULTIPLE,
      consumes: ['multipart/form-data'],
      ...MEDIA_FILE_DOCUMENTATION.MEDIA_REQUEST_BODIES.UPLOAD_FILE_MULTIPLE,
    },
    preHandler: [authenticate, fileUploadMiddleware.multiple],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.createMediaMultiple,
  });

  // DELETE / (Xóa 1 file)
  routeWithZod(fastify, {
    method: 'delete',
    url: '/',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_FILE_DOCUMENTATION.MEDIA_SUMMARIES.DELETE_SINGLE,
      description: MEDIA_FILE_DOCUMENTATION.MEDIA_DESCRIPTIONS.DELETE_SINGLE,
      body: MEDIA_FILE_DOCUMENTATION.MEDIA_REQUEST_BODIES.DELETE_SINGLE,
    },
    preHandler: [authenticate, zodValidate(deleteMediaSingleSchema)],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.deleteMediaSingle,
  });

  // POST /delete-many (Xóa nhiều file - Dùng POST cho an toàn)
  routeWithZod(fastify, {
    method: 'post',
    url: '/delete-many',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_TAG],
      summary: MEDIA_FILE_DOCUMENTATION.MEDIA_SUMMARIES.DELETE_MULTIPLE,
      description: MEDIA_FILE_DOCUMENTATION.MEDIA_DESCRIPTIONS.DELETE_MULTIPLE,
      body: MEDIA_FILE_DOCUMENTATION.MEDIA_REQUEST_BODIES.DELETE_MULTIPLE,
    },
    preHandler: [authenticate, zodValidate(deleteMediaMultipleSchema)],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.deleteMediaMultiple,
  });

  // ============================================================================
  // MEDIA FOLDER ROUTES (Base: /api/media/folders)
  // ============================================================================

  // GET /folders (Lấy danh sách thư mục)
  routeWithZod(fastify, {
    method: 'get',
    url: '/folders',
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_SUMMARIES.GET_ALL,
      description: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_DESCRIPTIONS.GET_ALL,
    },
    handler: controller.getAllFoldersHandler,
  });

  // POST /folders (Tạo thư mục)
  routeWithZod(fastify, {
    method: 'post',
    url: '/folders',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_SUMMARIES.CREATE,
      description: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_DESCRIPTIONS.CREATE,
      body: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_REQUEST_BODIES.CREATE,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: mediaFolderCreateSchema,
    handler: controller.createFolderHandler,
  });

  // PUT /folders/:id (Cập nhật thư mục)
  routeWithZod(fastify, {
    method: 'put',
    url: '/folders/:id',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_SUMMARIES.UPDATE,
      description: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_DESCRIPTIONS.UPDATE,
      body: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_REQUEST_BODIES.UPDATE,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: mediaFolderUpdateSchema,
    handler: controller.updateFolderHandler,
  });

  // DELETE /folders/:id (Xóa thư mục)
  routeWithZod(fastify, {
    method: 'delete',
    url: '/folders/:id',
    disableValidator: true,
    swaggerSchema: {
      tags: [MEDIA_FOLDER_TAG],
      summary: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_SUMMARIES.DELETE,
      description: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_DESCRIPTIONS.DELETE,
      params: MEDIA_FOLDER_DOCUMENTATION.MEDIA_FOLDER_REQUEST_BODIES.DELETE,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    paramsSchema: z.object({
      id: z.string(),
    }),

    handler: controller.deleteFolderHandler,
  });
}
