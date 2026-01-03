import { media, mediaFolders } from '@/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

// Input cho create folder
export const mediaFolderCreateSchema = createInsertSchema(mediaFolders, {
  name: z.string().min(1, 'Name is required'),
  parentId: z.string().nullable().optional(),
});

// Input cho update folder
export const mediaFolderUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').optional(),
});

export const mediaFolderWithRelationsSchema = createSelectSchema(
  mediaFolders
).extend({
  media: z.array(createSelectSchema(media)),
  children: z.array(createSelectSchema(mediaFolders)),
});

// Output select (kèm relations nếu cần)
export const mediaFolderSelectSchema = createSelectSchema(mediaFolders);

// Export type để dùng ở service/controller
export type MediaFolderCreateInput = z.infer<typeof mediaFolderCreateSchema>;
export type MediaFolderUpdateInput = z.infer<typeof mediaFolderUpdateSchema>;
export type MediaFolder = z.infer<typeof mediaFolderSelectSchema>;
export type MediaFolderWithRelations = z.infer<
  typeof mediaFolderWithRelationsSchema
>;
