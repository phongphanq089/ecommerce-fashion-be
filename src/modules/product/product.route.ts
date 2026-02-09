import { routeWithZod } from '@/utils/routeWithZod';
import { FastifyInstance } from 'fastify';
import {
  CATEGORY_TAG,
  PRODUCT_TAG,
  ATTRIBUTE_TAG,
  PAGINATION_QUERYSTRING,
  PRODUCT_DOCUMENTATION,
  CATEGORY_DOCUMENTATION,
  ATTRIBUTE_DOCUMENTATION,
} from './product.docs';
import {
  createCategorySchema,
  createProductSchema,
  createAttributeSchema,
  deleteManyProductsSchema,
  deleteManyCategoriesSchema,
  deleteManyAttributesSchema,
} from './product.validate';
import { productController } from './product.controller';

export const productRoutes = (fastify: FastifyInstance) => {
  const controller = productController(fastify);

  // ======= PRODUCT ROUTE ======= //
  routeWithZod(fastify, {
    url: '/create-product',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      body: PRODUCT_DOCUMENTATION.PRODUCT_REQUEST_BODIES.CREATE_PRODUCT,
      summary: PRODUCT_DOCUMENTATION.PRODUCT_SUMMARIES.CREATE_PRODUCT,
      description: PRODUCT_DOCUMENTATION.PRODUCT_DESCRIPTIONS.CREATE_PRODUCT,
      tags: [PRODUCT_TAG],
    },
    bodySchema: createProductSchema,
    handler: controller.createProductHandler,
  });

  routeWithZod(fastify, {
    url: '/products',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: PRODUCT_DOCUMENTATION.PRODUCT_SUMMARIES.GET_ALL_PRODUCTS,
      description: PRODUCT_DOCUMENTATION.PRODUCT_DESCRIPTIONS.GET_ALL_PRODUCTS,
      tags: [PRODUCT_TAG],
      querystring: PAGINATION_QUERYSTRING,
    },
    handler: controller.getAllProductsHandler,
  });

  routeWithZod(fastify, {
    url: '/product/:id',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: PRODUCT_DOCUMENTATION.PRODUCT_SUMMARIES.GET_PRODUCT_BY_ID,
      description: PRODUCT_DOCUMENTATION.PRODUCT_DESCRIPTIONS.GET_PRODUCT_BY_ID,
      tags: [PRODUCT_TAG],
    },
    handler: controller.getProductByIdHandler,
  });

  routeWithZod(fastify, {
    url: '/update-product/:id',
    method: 'put',
    disableValidator: true,
    swaggerSchema: {
      summary: PRODUCT_DOCUMENTATION.PRODUCT_SUMMARIES.UPDATE_PRODUCT,
      description: PRODUCT_DOCUMENTATION.PRODUCT_DESCRIPTIONS.UPDATE_PRODUCT,
      tags: [PRODUCT_TAG],
    },
    handler: controller.updateProductHandler,
  });

  routeWithZod(fastify, {
    url: '/delete-product/:id',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      summary: PRODUCT_DOCUMENTATION.PRODUCT_SUMMARIES.DELETE_PRODUCT,
      description: PRODUCT_DOCUMENTATION.PRODUCT_DESCRIPTIONS.DELETE_PRODUCT,
      tags: [PRODUCT_TAG],
    },
    handler: controller.deleteProductHandler,
  });

  routeWithZod(fastify, {
    url: '/delete-products',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      body: PRODUCT_DOCUMENTATION.PRODUCT_REQUEST_BODIES.DELETE_MANY_PRODUCTS,
      summary: PRODUCT_DOCUMENTATION.PRODUCT_SUMMARIES.DELETE_MANY_PRODUCTS,
      description:
        PRODUCT_DOCUMENTATION.PRODUCT_DESCRIPTIONS.DELETE_MANY_PRODUCTS,
      tags: [PRODUCT_TAG],
    },
    bodySchema: deleteManyProductsSchema,
    handler: controller.deleteManyProductsHandler,
  });

  // ======= CATEGORY ROUTE ======= //
  routeWithZod(fastify, {
    url: '/create-category',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      body: CATEGORY_DOCUMENTATION.CATEGORY_REQUEST_BODIES.CREATE_CATEGORY,
      summary: CATEGORY_DOCUMENTATION.CATEGORY_SUMMARIES.CREATE_CATEGORY,
      description: CATEGORY_DOCUMENTATION.CATEGORY_DESCRIPTIONS.CREATE_CATEGORY,
      tags: [CATEGORY_TAG],
    },
    bodySchema: createCategorySchema,
    handler: controller.createCategoryHandler,
  });

  routeWithZod(fastify, {
    url: '/categories',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: CATEGORY_DOCUMENTATION.CATEGORY_SUMMARIES.GET_ALL_CATEGORY,
      description:
        CATEGORY_DOCUMENTATION.CATEGORY_DESCRIPTIONS.GET_ALL_CATEGORY,
      tags: [CATEGORY_TAG],
      querystring: PAGINATION_QUERYSTRING,
    },
    handler: controller.getAllCategoriesHandler,
  });

  routeWithZod(fastify, {
    url: '/category/:id',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: CATEGORY_DOCUMENTATION.CATEGORY_SUMMARIES.GET_CATEGORY_BY_ID,
      description:
        CATEGORY_DOCUMENTATION.CATEGORY_DESCRIPTIONS.GET_CATEGORY_BY_ID,
      tags: [CATEGORY_TAG],
    },
    handler: controller.getCategoryByIdHandler,
  });

  routeWithZod(fastify, {
    url: '/update-category/:id',
    method: 'put',
    disableValidator: true,
    swaggerSchema: {
      summary: CATEGORY_DOCUMENTATION.CATEGORY_SUMMARIES.UPDATE_CATEGORY,
      description: CATEGORY_DOCUMENTATION.CATEGORY_DESCRIPTIONS.UPDATE_CATEGORY,
      tags: [CATEGORY_TAG],
    },
    handler: controller.updateCategoryHandler,
  });

  routeWithZod(fastify, {
    url: '/delete-category/:id',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      summary: CATEGORY_DOCUMENTATION.CATEGORY_SUMMARIES.DELETE_CATEGORY,
      description: CATEGORY_DOCUMENTATION.CATEGORY_DESCRIPTIONS.DELETE_CATEGORY,
      tags: [CATEGORY_TAG],
    },
    handler: controller.deleteCategoryHandler,
  });

  routeWithZod(fastify, {
    url: '/delete-categories',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      body: CATEGORY_DOCUMENTATION.CATEGORY_REQUEST_BODIES
        .DELETE_MANY_CATEGORIES,
      summary: CATEGORY_DOCUMENTATION.CATEGORY_SUMMARIES.DELETE_MANY_CATEGORIES,
      description:
        CATEGORY_DOCUMENTATION.CATEGORY_DESCRIPTIONS.DELETE_MANY_CATEGORIES,
      tags: [CATEGORY_TAG],
    },
    bodySchema: deleteManyCategoriesSchema,
    handler: controller.deleteManyCategoriesHandler,
  });

  // ======= ATTRIBUTE ROUTE ======= //
  routeWithZod(fastify, {
    url: '/attributes/create',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      body: ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_REQUEST_BODIES.CREATE_ATTRIBUTE,
      summary: ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_SUMMARIES.CREATE_ATTRIBUTE,
      description:
        ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_DESCRIPTIONS.CREATE_ATTRIBUTE,
      tags: [ATTRIBUTE_TAG],
    },
    bodySchema: createAttributeSchema,
    handler: controller.createAttributeHandler,
  });

  routeWithZod(fastify, {
    url: '/attributes',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_SUMMARIES.GET_ALL_ATTRIBUTES,
      description:
        ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_DESCRIPTIONS.GET_ALL_ATTRIBUTES,
      tags: [ATTRIBUTE_TAG],
      querystring: PAGINATION_QUERYSTRING,
    },
    handler: controller.getAllAttributesHandler,
  });

  routeWithZod(fastify, {
    url: '/attributes/:id',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_SUMMARIES.GET_ATTRIBUTE_BY_ID,
      description:
        ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_DESCRIPTIONS.GET_ATTRIBUTE_BY_ID,
      tags: [ATTRIBUTE_TAG],
    },
    handler: controller.getAttributeByIdHandler,
  });

  routeWithZod(fastify, {
    url: '/attributes/:id',
    method: 'put',
    disableValidator: true,
    swaggerSchema: {
      summary: ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_SUMMARIES.UPDATE_ATTRIBUTE,
      description:
        ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_DESCRIPTIONS.UPDATE_ATTRIBUTE,
      tags: [ATTRIBUTE_TAG],
    },
    handler: controller.updateAttributeHandler,
  });

  routeWithZod(fastify, {
    url: '/attributes/:id',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      summary: ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_SUMMARIES.DELETE_ATTRIBUTE,
      description:
        ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_DESCRIPTIONS.DELETE_ATTRIBUTE,
      tags: [ATTRIBUTE_TAG],
    },
    handler: controller.deleteAttributeHandler,
  });

  routeWithZod(fastify, {
    url: '/attributes/delete-many',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      body: ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_REQUEST_BODIES
        .DELETE_MANY_ATTRIBUTES,
      summary:
        ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_SUMMARIES.DELETE_MANY_ATTRIBUTES,
      description:
        ATTRIBUTE_DOCUMENTATION.ATTRIBUTE_DESCRIPTIONS.DELETE_MANY_ATTRIBUTES,
      tags: [ATTRIBUTE_TAG],
    },
    bodySchema: deleteManyAttributesSchema,
    handler: controller.deleteManyAttributesHandler,
  });
};
