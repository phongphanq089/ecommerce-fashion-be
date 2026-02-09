import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateCategoryInput,
  CreateProductInput,
  UpdateCategoryInput,
  UpdateProductInput,
  CreateAttributeInput,
  UpdateAttributeInput,
  DeleteManyProductsInput,
  DeleteManyCategoriesInput,
  DeleteManyAttributesInput,
} from './product.validate';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';

export const productController = (fastify: FastifyInstance) => {
  const repo = new ProductRepository(fastify.db);
  const service = new ProductService(repo);
  return {
    // ===== PRODUCT CONTROLLER ===== //
    createProductHandler: async (
      req: FastifyRequest<{ Body: CreateProductInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.createProduct(
        req.body as CreateProductInput
      );
      return sendResponseSuccess(200, reply, 'Create product success', result);
    },

    getAllProductsHandler: async (
      req: FastifyRequest<{
        Querystring?: {
          page?: number;
          limit?: number;
          search?: string;
          categoryId?: string;
          minPrice?: number;
          maxPrice?: number;
          sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
        };
      }>,
      reply: FastifyReply
    ) => {
      if (!req.query?.page || !req.query?.limit) {
        return sendResponseSuccess(
          200,
          reply,
          'Get all products success',
          null
        );
      }
      const result = await service.getAllProducts({
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        search: req.query.search,
        categoryId: req.query.categoryId,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        sort: req.query.sort,
      });
      return sendResponseSuccess(
        200,
        reply,
        'Get all products success',
        result
      );
    },

    getProductByIdHandler: async (
      req: FastifyRequest<{ Params?: { id: string } }>,
      reply: FastifyReply
    ) => {
      if (!req.params?.id) {
        return sendResponseSuccess(200, reply, 'Get product success', null);
      }
      const result = await service.getProductById(req.params.id);
      return sendResponseSuccess(200, reply, 'Get product success', result);
    },

    updateProductHandler: async (
      req: FastifyRequest<{
        Params?: { id: string };
        Body: UpdateProductInput;
      }>,
      reply: FastifyReply
    ) => {
      if (!req.params?.id) {
        return sendResponseSuccess(200, reply, 'Update product success', null);
      }
      const result = await service.updateProduct(
        req.params.id,
        req.body as UpdateProductInput
      );
      return sendResponseSuccess(200, reply, 'Update product success', result);
    },

    deleteProductHandler: async (
      req: FastifyRequest<{ Params?: { id: string } }>,
      reply: FastifyReply
    ) => {
      if (!req.params?.id) {
        return sendResponseSuccess(200, reply, 'Delete product success', null);
      }
      await service.deleteProduct(req.params.id);
      return sendResponseSuccess(200, reply, 'Delete product success', null);
    },

    deleteManyProductsHandler: async (
      req: FastifyRequest<{ Body: DeleteManyProductsInput }>,
      reply: FastifyReply
    ) => {
      await service.deleteManyProducts(req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Delete many products success',
        null
      );
    },

    // ===== PRODUCT CONTROLLER ===== //

    createCategoryHandler: async (
      req: FastifyRequest<{ Body: CreateCategoryInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.createCategory(
        req.body as CreateCategoryInput
      );
      return sendResponseSuccess(200, reply, 'Create category success', result);
    },

    getAllCategoriesHandler: async (
      req: FastifyRequest<{ Querystring?: { page?: number; limit?: number } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getAllCategories(
        Number(req.query?.page) || 1,
        Number(req.query?.limit) || 10
      );
      return sendResponseSuccess(
        200,
        reply,
        'Get all categories success',
        result
      );
    },

    getCategoryByIdHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getCategoryById(req.params.id);
      return sendResponseSuccess(200, reply, 'Get category success', result);
    },

    updateCategoryHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: UpdateCategoryInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.updateCategory(
        req.params.id,
        req.body as UpdateCategoryInput
      );
      return sendResponseSuccess(200, reply, 'Update category success', result);
    },

    deleteCategoryHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      await service.deleteCategory(req.params.id);
      return sendResponseSuccess(200, reply, 'Delete category success', null);
    },

    deleteManyCategoriesHandler: async (
      req: FastifyRequest<{ Body: DeleteManyCategoriesInput }>,
      reply: FastifyReply
    ) => {
      await service.deleteManyCategories(req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Delete many categories success',
        null
      );
    },

    // ===== PRODUCT CONTROLLER ===== //

    createAttributeHandler: async (
      req: FastifyRequest<{ Body: CreateAttributeInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.createAttribute(
        req.body as CreateAttributeInput
      );
      return sendResponseSuccess(
        200,
        reply,
        'Create attribute success',
        result
      );
    },

    getAllAttributesHandler: async (
      req: FastifyRequest<{ Querystring?: { page?: number; limit?: number } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getAllAttributes(
        Number(req.query?.page) || 1,
        Number(req.query?.limit) || 10
      );
      return sendResponseSuccess(
        200,
        reply,
        'Get all attributes success',
        result
      );
    },

    getAttributeByIdHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getAttributeById(req.params.id);
      return sendResponseSuccess(200, reply, 'Get attribute success', result);
    },

    updateAttributeHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: UpdateAttributeInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.updateAttribute(
        req.params.id,
        req.body as UpdateAttributeInput
      );
      return sendResponseSuccess(
        200,
        reply,
        'Update attribute success',
        result
      );
    },

    deleteAttributeHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      await service.deleteAttribute(req.params.id);
      return sendResponseSuccess(200, reply, 'Delete attribute success', null);
    },

    deleteManyAttributesHandler: async (
      req: FastifyRequest<{ Body: DeleteManyAttributesInput }>,
      reply: FastifyReply
    ) => {
      await service.deleteManyAttributes(req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Delete many attributes success',
        null
      );
    },
  };
};
