import { media, mediaFolders } from '@/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

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

export const mediaFolderWithRelationsSchema = createSelectSchema(
  mediaFolders
).extend({
  media: z.array(createSelectSchema(media)),
  children: z.array(createSelectSchema(mediaFolders)),
});

export const mediaFolderSelectSchema = createSelectSchema(mediaFolders);

export const mediaWithFolderSchema = mediaSelectSchema.extend({
  folder: mediaFolderSelectSchema.nullable(),
});

export type Media = z.infer<typeof mediaSelectSchema>;

export type MediaWithFolder = z.infer<typeof mediaWithFolderSchema>;

// ---------- Delete Inputs (dùng trong controller) ----------
export const deleteMediaSingleSchema = z.object({
  Id: z.string().uuid('Invalid media ID'),
});

export const deleteMediaMultipleSchema = z.object({
  Ids: z.array(z.uuid('Invalid media ID')).min(1, 'At least one ID required'),
});

export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;
export type DeleteMediaSingleInput = z.infer<typeof deleteMediaSingleSchema>;
export type DeleteMediaMultipleInput = z.infer<
  typeof deleteMediaMultipleSchema
>;

import { ReadStream } from 'fs';
import { Readable } from 'stream';

export interface CreateMediaDTO {
  file: Buffer | ReadStream | string | Readable;
  fileName: string;
  fileType: string;
  altText?: string;
  folderId?: string;
}

export type MultiFileData = {
  file: Readable;
  filename: string;
  mimetype: string;
  originalname: string;
};
