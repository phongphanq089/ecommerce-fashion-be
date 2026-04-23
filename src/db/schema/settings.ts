import { pgTable, text, jsonb } from 'drizzle-orm/pg-core';
import { cuid, timestamps } from '../_helpers';

export const settings = pgTable('setting', {
  id: text('id')
    .$defaultFn(() => cuid())
    .primaryKey(),
  key: text('key').unique().notNull(), // e.g., 'header'
  value: jsonb('value').notNull(), // Stores the setting data
  ...timestamps,
});
