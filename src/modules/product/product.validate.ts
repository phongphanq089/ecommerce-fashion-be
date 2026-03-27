import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { brands, categories, products } from '@/db/schema';

/**
 * @PRODUCT_VARIANT_SCHEMA
 */
const productVariantSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0).default(0),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  lowStockQuantity: z.number().int().min(0).default(0),
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
  categoryId: z.string().min(1, 'Category ID is required'),
  brandId: z.string().min(1, 'Brand ID is required'),
  type: z.enum(['SINGLE', 'VARIANT']).optional(),
  summary: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  thumbnailId: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isRefunded: z.boolean().optional(),
  hasWarranty: z.boolean().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaImageId: z.string().optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional().nullable(),
  discountValue: z
    .number()
    .min(0, 'Discount value must be positive')
    .optional(),
  discountStartDate: z.string().optional().nullable(),
  discountEndDate: z.string().optional().nullable(),
  disableShipping: z.boolean().optional(),
  mediaIds: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).optional(),
  options: z
    .array(
      z.object({
        name: z.string().min(1),
        values: z.array(z.string()).min(1),
      })
    )
    .optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters long').optional(),
  categoryId: z.string().optional(),
  mediaIds: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).optional(),
  brandId: z.string().min(1, 'Brand ID is required'),
  type: z.enum(['SINGLE', 'VARIANT']).optional(),
  summary: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  thumbnailId: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isRefunded: z.boolean().optional(),
  hasWarranty: z.boolean().optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaImageId: z.string().optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional().nullable(),
  discountValue: z
    .number()
    .min(0, 'Discount value must be positive')
    .optional(),
  discountStartDate: z.string().optional().nullable(),
  discountEndDate: z.string().optional().nullable(),
  disableShipping: z.boolean().optional(),
  options: z
    .array(
      z.object({
        name: z.string().min(1),
        values: z.array(z.string()).min(1),
      })
    )
    .optional(),
});

export const deleteProductSchema = z.object({
  id: z.string().min(1, 'Invalid product ID'),
});

export const getProductSchema = z.object({
  id: z.string().min(1, 'Invalid product ID'),
});

export const deleteManyProductsSchema = z.object({
  ids: z.array(z.string().min(1, 'Invalid product ID')),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductInput = z.infer<typeof getProductSchema>;
export type DeleteManyProductsInput = z.infer<typeof deleteManyProductsSchema>;

/**
 * @CATEGORY_SCHEMA
 */
export const createCategorySchema = createInsertSchema(categories).extend({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters long' }),
  parentId: z.string().nullable().optional(),
});

export const updateCategorySchema = createInsertSchema(categories).extend({
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
  slug: z.string().min(3, 'Slug must be at least 3 characters long').optional(),
  parentId: z.string().nullable().optional(),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1, 'Invalid category ID'),
});

export const getCategorySchema = z.object({
  id: z.cuid('Invalid category ID'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type GetCategoryInput = z.infer<typeof getCategorySchema>;

/**
 * @ATTRIBUTE_SCHEMA
 */
import { attributes } from '@/db/schema';

export const createAttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  values: z.array(z.string()).optional(),
});

export const updateAttributeSchema = createInsertSchema(attributes).extend({
  name: z.string().min(1, 'Attribute name is required').optional(),
});

export const deleteAttributeSchema = z.object({
  id: z.string().min(1, 'Invalid attribute ID'),
});

export const getAttributeSchema = z.object({
  id: z.string().min(1, 'Invalid attribute ID'),
});

export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;
export type DeleteAttributeInput = z.infer<typeof deleteAttributeSchema>;
export type GetAttributeInput = z.infer<typeof getAttributeSchema>;

/**
 * @CATEGORY_SCHEMA
 */
export const deleteManyCategoriesSchema = z.object({
  ids: z.array(z.string().min(1, 'Invalid category ID')),
});

export const deleteManyAttributesSchema = z.object({
  ids: z.array(z.string().min(1, 'Invalid attribute ID')),
});

export type DeleteManyCategoriesInput = z.infer<
  typeof deleteManyCategoriesSchema
>;
export type DeleteManyAttributesInput = z.infer<
  typeof deleteManyAttributesSchema
>;

/**
 * @BRAND_SCHEMA
 */
export const createBrandSchema = createInsertSchema(brands).extend({
  name: z.string().min(2, 'Brand name must be at least 2 charaters long'),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters long' }),
  logoUrl: z.url('Invalid  logo url').optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateBrandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 charaters long'),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters long' }),
  logoUrl: z.url('Invalid  logo url').optional().nullable(),
  isActive: z.boolean().default(true),
});

export const deleteBrandSchema = z.object({
  id: z.string().min(1, 'Invalid brand Id'),
});

export const getBrandSchema = z.object({
  id: z.string().min(1, 'Invalid brand Id'),
});

export const deleteManyBrandsSchema = z.object({
  ids: z.array(z.string().min(1, 'Invalid brand Id')),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type GetBrandInput = z.infer<typeof getBrandSchema>;
export type DeleteManyBrandsInput = z.infer<typeof deleteManyBrandsSchema>;
