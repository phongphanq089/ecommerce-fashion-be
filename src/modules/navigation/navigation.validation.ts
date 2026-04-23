import { navigationTypeEnum } from '@/db/schema';
import z from 'zod';

// Helper để trích xuất mảng enum values từ pgEnum Drizzle
const navTypeValues = navigationTypeEnum.enumValues as [string, ...string[]];

export const createNavigationSchema = z.object({
  type: z.enum(navTypeValues),
  label: z.string().min(1, 'Label is required'),
  href: z.string().nullable().optional(),
  categoryType: z.string().nullable().optional(),
  displayOrder: z.number().int().default(0),
  parentId: z.string().nullable().optional(),
  metadata: z.any().optional(), // jsonb
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false),
  isMegaMenu: z.boolean().default(false),
});

export const updateNavigationSchema = createNavigationSchema.partial();
