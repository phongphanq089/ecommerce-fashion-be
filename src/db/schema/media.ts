import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { cuid, timestamps, mediaTypeEnum } from '../_helpers';
import { products, productImages } from './products';

export const mediaFolders = pgTable('media_folder', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  name: text('name').notNull(),
  parentId: text('parent_id'),
});

export const media = pgTable('media', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  fileName: text('file_name').notNull(),
  url: text('url').notNull(),
  fileType: mediaTypeEnum('file_type').notNull(),
  size: integer('size').notNull(),
  altText: text('alt_text'),
  folderId: text('folder_id').references(() => mediaFolders.id),
  fileId: text('file_id'),
  ...timestamps,
});

export const mediaFoldersRelations = relations(
  mediaFolders,
  ({ one, many }) => ({
    parent: one(mediaFolders, {
      fields: [mediaFolders.parentId],
      references: [mediaFolders.id],
      relationName: 'subfolders',
    }),
    children: many(mediaFolders, {
      relationName: 'subfolders',
    }),
    media: many(media),
  })
);

export const mediaRelations = relations(media, ({ one }) => ({
  folder: one(mediaFolders, {
    fields: [media.folderId],
    references: [mediaFolders.id],
  }),
  productImage: one(productImages),
  thumbnail: one(products, {
    fields: [media.id],
    references: [products.thumbnailId],
    relationName: 'product_thumbnail',
  }),
  metaImage: one(products, {
    fields: [media.id],
    references: [products.metaImageId],
    relationName: 'product_metaImage',
  }),
}));
