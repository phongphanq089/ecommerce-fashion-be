import { z } from 'zod';

export const getLogFileSchema = z.object({
  filename: z.string().min(1, { message: 'Filename is required' }),
});

export const searchLogFileSchema = z.object({
  filename: z.string().min(1, { message: 'Filename is required' }),
  keyword: z.string().min(1, { message: 'Keyword is required' }),
});

export type GetLogFileParams = z.infer<typeof getLogFileSchema>;
export type SearchLogFileParams = z.infer<typeof searchLogFileSchema>;
