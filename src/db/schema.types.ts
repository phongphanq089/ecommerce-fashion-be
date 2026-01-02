import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { media, mediaFolders } from './schema';

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

// ---------- Media ----------
export const mediaCreateSchema = createInsertSchema(media, {
  fileName: z.string().min(1, 'File name is required'),
  url: z.string().url('Invalid URL'),
  fileType: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER']),
  size: z.number().int().positive('Size must be positive'),
  altText: z.string().optional(),
  folderId: z.string().uuid().nullable(),
  fileId: z.string().min(1, 'File ID from storage is required'),
});

export const mediaSelectSchema = createSelectSchema(media);

export const mediaWithFolderSchema = mediaSelectSchema.extend({
  folder: mediaFolderSelectSchema.nullable(),
});

// Types
export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;
export type Media = z.infer<typeof mediaSelectSchema>;
export type MediaWithFolder = z.infer<typeof mediaWithFolderSchema>;

// ---------- Delete Inputs (dùng trong controller) ----------
export const deleteMediaSingleSchema = z.object({
  Id: z.string().uuid('Invalid media ID'),
});

export const deleteMediaMultipleSchema = z.object({
  Ids: z
    .array(z.string().uuid('Invalid media ID'))
    .min(1, 'At least one ID required'),
});

export type DeleteMediaSingleInput = z.infer<typeof deleteMediaSingleSchema>;
export type DeleteMediaMultipleInput = z.infer<
  typeof deleteMediaMultipleSchema
>;
