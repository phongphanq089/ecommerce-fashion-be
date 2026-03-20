import { routeWithZod } from '@/utils/routeWithZod';
import { FastifyInstance } from 'fastify';
import {
  COLLECTION_DOCUMENTATION,
  COLLECTION_TAG,
  PAGINATION_QUERYSTRING,
} from './collection.docs';
import {
  createCollectionSchema,
  updateCollectionSchema,
  addProductsToCollectionSchema,
} from './collection.validate';
import { collectionController } from './collection.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { ROLE_NAME } from '@/constants';

export const collectionRoutes = (fastify: FastifyInstance) => {
  const controller = collectionController(fastify);

  // GET / (Lấy tất cả bộ sưu tập)
  routeWithZod(fastify, {
    url: '/',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary:
        COLLECTION_DOCUMENTATION.COLLECTION_SUMMARIES.GET_ALL_COLLECTIONS,
      description:
        COLLECTION_DOCUMENTATION.COLLECTION_DESCRIPTIONS.GET_ALL_COLLECTIONS,
      tags: [COLLECTION_TAG],
      querystring: PAGINATION_QUERYSTRING,
    },
    handler: controller.getAllCollectionsHandler,
  });

  // POST / (Tạo mới bộ sưu tập)
  routeWithZod(fastify, {
    url: '/',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      body: COLLECTION_DOCUMENTATION.COLLECTION_REQUEST_BODIES
        .CREATE_COLLECTION,
      summary: COLLECTION_DOCUMENTATION.COLLECTION_SUMMARIES.CREATE_COLLECTION,
      description:
        COLLECTION_DOCUMENTATION.COLLECTION_DESCRIPTIONS.CREATE_COLLECTION,
      tags: [COLLECTION_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: createCollectionSchema,
    handler: controller.createCollectionHandler,
  });

  // GET /:id (Lấy chi tiết)
  routeWithZod(fastify, {
    url: '/:id',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary:
        COLLECTION_DOCUMENTATION.COLLECTION_SUMMARIES.GET_COLLECTION_BY_ID,
      description:
        COLLECTION_DOCUMENTATION.COLLECTION_DESCRIPTIONS.GET_COLLECTION_BY_ID,
      tags: [COLLECTION_TAG],
    },
    handler: controller.getCollectionByIdHandler,
  });

  // PUT /:id (Cập nhật)
  routeWithZod(fastify, {
    url: '/:id',
    method: 'put',
    disableValidator: true,
    swaggerSchema: {
      summary: COLLECTION_DOCUMENTATION.COLLECTION_SUMMARIES.UPDATE_COLLECTION,
      description:
        COLLECTION_DOCUMENTATION.COLLECTION_DESCRIPTIONS.UPDATE_COLLECTION,
      tags: [COLLECTION_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: updateCollectionSchema,
    handler: controller.updateCollectionHandler,
  });

  // DELETE /:id (Xóa)
  routeWithZod(fastify, {
    url: '/:id',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      summary: COLLECTION_DOCUMENTATION.COLLECTION_SUMMARIES.DELETE_COLLECTION,
      description:
        COLLECTION_DOCUMENTATION.COLLECTION_DESCRIPTIONS.DELETE_COLLECTION,
      tags: [COLLECTION_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.deleteCollectionHandler,
  });

  // POST /:id/products (Thêm SP vào collection)
  routeWithZod(fastify, {
    url: '/:id/products',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      body: COLLECTION_DOCUMENTATION.COLLECTION_REQUEST_BODIES.ADD_PRODUCTS,
      summary: COLLECTION_DOCUMENTATION.COLLECTION_SUMMARIES.ADD_PRODUCTS,
      description:
        COLLECTION_DOCUMENTATION.COLLECTION_DESCRIPTIONS.ADD_PRODUCTS,
      tags: [COLLECTION_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: addProductsToCollectionSchema,
    handler: controller.addProductsHandler,
  });
};
