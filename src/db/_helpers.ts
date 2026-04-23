import { createId } from '@paralleldrive/cuid2';
import { pgEnum, timestamp } from 'drizzle-orm/pg-core';

export const cuid = createId;

export const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

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

export const productTypeEnum = pgEnum('product_type', ['SINGLE', 'VARIANT']);
