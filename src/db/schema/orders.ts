import {
  pgTable,
  text,
  timestamp,
  boolean,
  doublePrecision,
  integer,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { cuid, timestamps, orderStatusEnum, discountTypeEnum, paymentStatusEnum } from '../_helpers';
import { users, addresses } from './users';
import { productVariants } from './products';

export const carts = pgTable('cart', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  userId: text('user_id')
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
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
