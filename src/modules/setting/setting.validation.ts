import { z } from 'zod';

export const heroBannerSchema = z.object({
  imageUrl: z.string().optional().nullable(),
  mobileImageUrl: z.string().optional().nullable(),
  heading: z.string().optional().nullable(),
  subheading: z.string().optional().nullable(),
  buttonText: z.string().optional().nullable(),
  buttonLink: z.string().optional().nullable(),
});

export type HeroBannerSchema = z.infer<typeof heroBannerSchema>;

export const LogoSchema = z.object({
  imageUrl: z.string().optional().nullable(),
});

export type LogoSchemaType = z.infer<typeof LogoSchema>;

export const homepageSectionsSchema = z.object({
  showNewArrivals: z.boolean().default(true),
  showFlashSales: z.boolean().default(true),
});

export type HomepageSectionsSchemaType = z.infer<typeof homepageSectionsSchema>;
