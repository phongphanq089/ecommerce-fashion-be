import { media, mediaFolders } from '@/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============================================================================
// SHARED TYPES & DTOs
// ============================================================================

export interface CreateMediaDTO {
  fileBuffer: Buffer;
  fileName: string;
  fileType: string;
  altText?: string;
  folderId?: string;
}

export type MultiFileData = {
  path: string;
  filename: string;
  mimetype: string;
  originalname: string;
};

// ============================================================================
// MEDIA SCHEMAS & TYPES
// ============================================================================

// Base Schemas
export const mediaSelectSchema = createSelectSchema(media);
export const mediaCreateSchema = createInsertSchema(media, {
  fileName: z.string().min(1, 'File name is required'),
  url: z.url('Invalid URL'),
  fileType: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER']),
  size: z.number().int().positive('Size must be positive'),
  altText: z.string().optional(),
  folderId: z.string().nullable(),
  fileId: z.string().min(1, 'File ID from storage is required'),
});

// Operations Schemas (Delete)
export const deleteMediaSingleSchema = z.object({
  id: z.string().describe('Invalid media ID'),
});

export const deleteMediaMultipleSchema = z.object({
  ids: z
    .array(z.string().describe('Invalid media ID'))
    .min(1, 'At least one ID required'),
});

// Types
export type Media = z.infer<typeof mediaSelectSchema>;
export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;
export type DeleteMediaSingleInput = z.infer<typeof deleteMediaSingleSchema>;
export type DeleteMediaMultipleInput = z.infer<
  typeof deleteMediaMultipleSchema
>;

// ============================================================================
// FOLDER SCHEMAS & TYPES
// ============================================================================

// Base Schemas
export const mediaFolderSelectSchema = createSelectSchema(mediaFolders);

export const mediaFolderCreateSchema = createInsertSchema(mediaFolders, {
  name: z.string().min(1, 'Name is required'),
  parentId: z.string().nullable().optional(),
});

export const mediaFolderUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required').optional(),
});

// Relations Schemas
export const mediaFolderWithRelationsSchema = mediaFolderSelectSchema.extend({
  media: z.array(mediaSelectSchema),
  children: z.array(mediaFolderSelectSchema),
});

export const mediaWithFolderSchema = mediaSelectSchema.extend({
  folder: mediaFolderSelectSchema.nullable(),
});

// Types
export type MediaWithFolder = z.infer<typeof mediaWithFolderSchema>;
export type MediaFolder = z.infer<typeof mediaFolderSelectSchema>;
export type MediaFolderCreateInput = z.infer<typeof mediaFolderCreateSchema>;
export type MediaFolderUpdateInput = z.infer<typeof mediaFolderUpdateSchema>;
export type MediaFolderWithRelations = z.infer<
  typeof mediaFolderWithRelationsSchema
>;
