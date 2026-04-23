import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { cuid, timestamps, userRoleEnum } from '../_helpers';
import { carts, orders } from './orders';

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
  phone: text('phone').unique(),
  address: text('address'),
  ...timestamps,
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
    ...timestamps,
  },
  (table) => [index('refresh_token_userId_idx').on(table.userId)]
);

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
