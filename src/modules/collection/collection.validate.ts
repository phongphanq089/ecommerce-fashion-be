import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { collections } from '@/db/schema';

export const createCollectionSchema = createInsertSchema(collections).extend({
  name: z.string().min(2, 'Collection name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional().nullable(),
  imageUrl: z.url('Invalid image URL').optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateCollectionSchema = createInsertSchema(collections).extend({
  name: z
    .string()
    .min(2, 'Collection name must be at least 2 characters')
    .optional(),
  slug: z.string().min(2, 'Slug must be at least 2 characters').optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.url('Invalid image URL').optional().nullable(),
  isActive: z.boolean().optional(),
});

export const deleteCollectionSchema = z.object({
  id: z.cuid('Invalid collection ID'),
});

export const addProductsToCollectionSchema = z.object({
  productIds: z.array(z.string('Invalid product ID')),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type DeleteCollectionInput = z.infer<typeof deleteCollectionSchema>;
export type AddProductsToCollectionInput = z.infer<
  typeof addProductsToCollectionSchema
>;
