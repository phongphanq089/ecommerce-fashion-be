import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { categories, products } from '@/db/schema';

const productVariantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0).default(0),
  attributes: z
    .array(
      z.object({
        name: z.string().min(1, 'Attribute name is required (e.g. Color)'),
        value: z.string().min(1, 'Attribute value is required (e.g. Red)'),
      })
    )
    .optional(),
});

/**
 * @PRODUCT_SCHEMA
 */
export const createProductSchema = createInsertSchema(products).extend({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long'),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters long' }),
  categoryId: z.string('Invalid category ID'),
  mediaIds: z.array(z.string()).optional(),
  collectionIds: z.array(z.string().cuid('Invalid collection ID')).optional(),
  variants: z
    .array(productVariantSchema)
    .min(1, 'At least one variant is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters long').optional(),
  categoryId: z.uuid('Invalid category ID').optional(),
  mediaIds: z.array(z.uuid()).optional(),
  collectionIds: z.array(z.cuid('Invalid collection ID')).optional(),
  variants: z.array(productVariantSchema).optional(),
});

export const deleteProductSchema = z.object({
  id: z.uuid('Invalid product ID'),
});

export const getProductSchema = z.object({
  id: z.uuid('Invalid product ID'),
});

/**
 * @CATEGORY_SCHEMA
 */
export const createCategorySchema = createInsertSchema(categories).extend({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters long' }),
  parentId: z.cuid().nullable().optional(),
});

export const updateCategorySchema = createInsertSchema(categories).extend({
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters long').optional(),
  parentId: z.cuid().nullable().optional(),
});

export const deleteCategorySchema = z.object({
  id: z.cuid('Invalid category ID'),
});

export const getCategorySchema = z.object({
  id: z.cuid('Invalid category ID'),
});

/**
 * @PRODUCT_TYPE
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductInput = z.infer<typeof getProductSchema>;
/**
 * @CATEGORY_TYPE
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoryInput = z.infer<typeof getCategorySchema>;

/**
 * @ATTRIBUTE_SCHEMA
 */
import { attributes } from '@/db/schema';

export const createAttributeSchema = createInsertSchema(attributes).extend({
  name: z.string().min(1, 'Attribute name is required'),
});

export const updateAttributeSchema = createInsertSchema(attributes).extend({
  name: z.string().min(1, 'Attribute name is required').optional(),
});

export const deleteAttributeSchema = z.object({
  id: z.string().uuid('Invalid attribute ID'),
});

export const getAttributeSchema = z.object({
  id: z.string().uuid('Invalid attribute ID'),
});

/**
 * @ATTRIBUTE_TYPE
 */
export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;
export type DeleteAttributeInput = z.infer<typeof deleteAttributeSchema>;
export type GetAttributeInput = z.infer<typeof getAttributeSchema>;

export const deleteManyProductsSchema = z.object({
  ids: z.array(z.string().uuid('Invalid product ID')),
});

export const deleteManyCategoriesSchema = z.object({
  ids: z.array(z.string().cuid('Invalid category ID')),
});

export const deleteManyAttributesSchema = z.object({
  ids: z.array(z.string().uuid('Invalid attribute ID')),
});

export type DeleteManyProductsInput = z.infer<typeof deleteManyProductsSchema>;
export type DeleteManyCategoriesInput = z.infer<
  typeof deleteManyCategoriesSchema
>;
export type DeleteManyAttributesInput = z.infer<
  typeof deleteManyAttributesSchema
>;
