import {
  pgTable,
  text,
  timestamp,
  boolean,
  doublePrecision,
  integer,
  primaryKey,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
  cuid,
  timestamps,
  productTypeEnum,
  discountTypeEnum,
} from '../_helpers';
import { media } from './media';
import { cartItems, orderItems } from './orders';

export const categories = pgTable(
  'category',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    name: text('name').unique().notNull(),
    slug: text('slug').unique().notNull(),
    parentId: text('parent_id'),
  },
  (table) => [index('category_parent_idx').on(table.parentId)]
);

export const brands = pgTable('brand', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  logoUrl: text('logo_url'),
  isActive: boolean('is_active').default(true),
  ...timestamps,
});

export const products = pgTable('product', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description').notNull(),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  brandId: text('brand_id')
    .notNull()
    .references(() => brands.id),
  type: productTypeEnum('type').default('SINGLE'),
  summary: text('summary'),
  tags: text('tags').array(),
  thumbnailId: text('thumbnail_id').references(() => media.id),
  isFeatured: boolean('is_featured').default(false),
  isRefunded: boolean('is_refunded').default(false),
  hasWarranty: boolean('has_warranty').default(false),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  metaImageId: text('meta_image_id').references(() => media.id),
  discountType: discountTypeEnum('discount_type').default('FIXED'),
  discountValue: doublePrecision('discount_value').default(0),
  discountStartDate: timestamp('discount_start_date'),
  discountEndDate: timestamp('discount_end_date'),
  disableShipping: boolean('disable_shipping').default(false),
  ...timestamps,
});

export const productVariants = pgTable(
  'product_variant',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    sku: text('sku').unique().notNull(),
    price: doublePrecision('price').notNull(),
    stockQuantity: integer('stock_quantity').default(0),
    productId: text('product_id').notNull(),
    purchasePrice: doublePrecision('purchase_price').default(0),
    lowStockQuantity: integer('low_stock_quantity').default(0),
  },
  (table) => [index('product_variant_product_idx').on(table.productId)]
);

export const productImages = pgTable(
  'product_image',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    displayOrder: integer('display_order').default(0),
    productId: text('product_id').notNull(),
    mediaId: text('media_id').notNull(),
  },
  (table) => [
    unique().on(table.productId, table.mediaId),
    index('product_image_product_idx').on(table.productId),
  ]
);

export const attributes = pgTable(
  'attribute',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    name: text('name').notNull(),
  },
  (table) => [unique().on(table.name)]
);

export const attributeValues = pgTable(
  'attribute_value',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    value: text('value').notNull(),
    attributeId: text('attribute_id')
      .notNull()
      .references(() => attributes.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.attributeId, table.value)]
);

export const attributeValuesToVariants = pgTable(
  'attribute_value_to_variant',
  {
    attributeValueId: text('attribute_value_id')
      .notNull()
      .references(() => attributeValues.id, { onDelete: 'cascade' }),
    productVariantId: text('product_variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.attributeValueId, table.productVariantId] }),
  ]
);

export const productAttributeOptions = pgTable(
  'product_attribute_option',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    attributeValueId: text('attribute_value_id')
      .notNull()
      .references(() => attributeValues.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.attributeValueId] }),
  ]
);

export const collections = pgTable('collection', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  ...timestamps,
});

export const productsToCollections = pgTable(
  'product_to_collection',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').default(0),
  },
  (table) => [primaryKey({ columns: [table.productId, table.collectionId] })]
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'subcategories',
  }),
  children: many(categories, {
    relationName: 'subcategories',
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  collections: many(productsToCollections),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  thumbnail: one(media, {
    fields: [products.thumbnailId],
    references: [media.id],
    relationName: 'product_thumbnail',
  }),
  metaImage: one(media, {
    fields: [products.metaImageId],
    references: [media.id],
    relationName: 'product_metaImage',
  }),
  options: many(productAttributeOptions),
}));

export const productAttributeOptionsRelations = relations(
  productAttributeOptions,
  ({ one }) => ({
    product: one(products, {
      fields: [productAttributeOptions.productId],
      references: [products.id],
    }),
    attributeValue: one(attributeValues, {
      fields: [productAttributeOptions.attributeValueId],
      references: [attributeValues.id],
    }),
  })
);

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    attributes: many(attributeValuesToVariants),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
  })
);

export const attributeValuesRelations = relations(
  attributeValues,
  ({ one, many }) => ({
    attribute: one(attributes, {
      fields: [attributeValues.attributeId],
      references: [attributes.id],
    }),
    variants: many(attributeValuesToVariants),
    productOptions: many(productAttributeOptions),
  })
);

export const attributeValuesToVariantsRelations = relations(
  attributeValuesToVariants,
  ({ one }) => ({
    attributeValue: one(attributeValues, {
      fields: [attributeValuesToVariants.attributeValueId],
      references: [attributeValues.id],
    }),
    productVariant: one(productVariants, {
      fields: [attributeValuesToVariants.productVariantId],
      references: [productVariants.id],
    }),
  })
);

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  media: one(media, {
    fields: [productImages.mediaId],
    references: [media.id],
  }),
}));

export const attributesRelations = relations(attributes, ({ many }) => ({
  values: many(attributeValues),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(productsToCollections),
}));

export const productsToCollectionsRelations = relations(
  productsToCollections,
  ({ one }) => ({
    product: one(products, {
      fields: [productsToCollections.productId],
      references: [products.id],
    }),
    collection: one(collections, {
      fields: [productsToCollections.collectionId],
      references: [collections.id],
    }),
  })
);
