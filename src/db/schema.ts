import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  primaryKey,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

const cuid = createId;
// --- ENUMS --- //
export const userRoleEnum = pgEnum('user_role', [
  'CUSTOMER',
  'ADMIN',
  'SUPER_ADMIN',
  'STAFF',
]);
export const mediaTypeEnum = pgEnum('media_type', [
  'IMAGE',
  'VIDEO',
  'DOCUMENT',
  'OTHER',
]);
export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
]);
export const discountTypeEnum = pgEnum('discount_type', [
  'PERCENTAGE',
  'FIXED',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
]);

// --- HELPER CHO TIMESTAMP (DRY code) --- //
const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

// ------------ TABLES ------------ //
/**
 * @USER
 */
export const users = pgTable('users', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationToken: text('verification_token'),
  verificationTokenExpires: timestamp('verification_token_expires'),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('CUSTOMER'),
  password: text('password'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
  googleId: text('google_id').unique(),
  ...timestamps, //  ====> Use helper
});

export const refreshTokens = pgTable(
  'refresh_token',
  {
    id: text('id').primaryKey(),
    token: text('token').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    revoked: boolean('revoked').default(false).notNull(),
    replacedByToken: text('replaced_by_token'),
    expiresAt: timestamp('expires_at').notNull(),
    userAgent: text('user_agent'),
    ip: text('ip'),
    ...timestamps, //  ====> Use helper
  },
  (table) => [index('refresh_token_userId_idx').on(table.userId)]
);

/**
 * @PROFILE
 */
export const profiles = pgTable('profiles', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').unique(),
  bio: text('bio').default(''),
  birthday: timestamp('birthday').defaultNow(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
});

/**
 * @ADDRESS
 */
export const addresses = pgTable('address', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  street: text('street').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  isDefault: boolean('is_default').default(false),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

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
  },
  (table) => [index('product_variant_product_idx').on(table.productId)]
);

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

export const productImages = pgTable(
  'product_image',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    displayOrder: integer('display_order').default(0),
    productId: text('product_id').notNull(),
    mediaId: text('media_id').unique().notNull(),
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

// Junction table cho ProductVariant - AttributeValue (n-n)
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

export const carts = pgTable('cart', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  userId: text('user_id')
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }), // set null nếu muốn giữ cart khi user bị xóa (tùy logic)
  ...timestamps,
});

export const cartItems = pgTable(
  'cart_item',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    quantity: integer('quantity').notNull(),
    cartId: text('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productVariantId: text('product_variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.cartId, table.productVariantId)]
);

export const orders = pgTable('order', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  totalAmount: doublePrecision('total_amount').notNull(),
  status: orderStatusEnum('status').default('PENDING'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  shippingAddressId: text('shipping_address_id').notNull(),
  couponId: text('coupon_id'),
  discountAmount: doublePrecision('discount_amount').default(0),
  ...timestamps,
});

export const orderItems = pgTable(
  'order_item',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    quantity: integer('quantity').notNull(),
    priceAtPurchase: doublePrecision('price_at_purchase').notNull(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),
    productVariantId: text('product_variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
  },
  (table) => [unique().on(table.orderId, table.productVariantId)]
);

export const coupons = pgTable('coupon', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  code: text('code').unique().notNull(),
  discountType: discountTypeEnum('discount_type').notNull(),
  value: doublePrecision('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').default(true),
});

export const payments = pgTable('payment', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  amount: doublePrecision('amount').notNull(),
  status: paymentStatusEnum('status').default('PENDING'),
  method: text('method').notNull(),
  transactionId: text('transaction_id'),
  orderId: text('order_id')
    .unique()
    .notNull()
    .references(() => orders.id),
  ...timestamps,
});

// Relations (phiên bản cũ - dễ dùng nhất)
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  addresses: many(addresses),
  cart: one(carts),
  orders: many(orders),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

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
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    attributes: many(attributeValuesToVariants), // junction table cho n-n
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
}));

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

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  productVariant: one(productVariants, {
    fields: [cartItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
  payment: one(payments),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  productVariant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  orders: many(orders),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

// ------------ END TABLES ------------ //
