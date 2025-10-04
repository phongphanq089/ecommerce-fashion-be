import { z } from 'zod';

export const mediaFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
  parentId: z.uuid().nullable().optional(),
});

export type MediaFolderInput = z.infer<typeof mediaFolderSchema>;

export const updateFolderSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, 'Folder name cannot be empty'),
});

export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;

export const folderIdSchema = z.object({
  id: z.uuid(),
});
export type FolderIdInput = z.infer<typeof folderIdSchema>;
