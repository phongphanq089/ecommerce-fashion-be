import z from 'zod';

export const uploadSchema = z.object({
  folderId: z.string().optional(),
  altText: z.string().optional(),
});
