import {
  pgEnum,
  integer,
  text,
  pgTable,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { cuid, timestamps } from '../_helpers';
import { relations } from 'drizzle-orm';

export const navigationTypeEnum = pgEnum('navigation_type', [
  'MAIN_LINK',
  'CATEGORY_GROUP',
  'CATEGORY_ITEM',
]);

export const navigations = pgTable(
  'navigation',
  {
    id: text('id')
      .$defaultFn(() => cuid())
      .primaryKey(),
    type: navigationTypeEnum('type').notNull(),
    label: text('label').notNull(), // Tên hiển thị ("SHOP ALL", "Shop By Type", "Black")
    href: text('href'), // Đường dẫn URL, có thể null đối với CATEGORY_GROUP
    categoryType: text('category_type'), // Ví dụ: 'text', 'color' (chỉ dùng cho CATEGORY_GROUP)
    displayOrder: integer('display_order').default(0).notNull(), // Dùng để FE sắp xếp
    parentId: text('parent_id'), // Reference đến id của nhóm cha
    metadata: jsonb('metadata'), // Lưu trữ JSON như { "hex": "#000", "split": true }
    isActive: boolean('is_active').default(true),
    isSystem: boolean('is_system').default(false), // Không cho phép xoá nếu là true
    isMegaMenu: boolean('is_mega_menu').default(false), // Nếu true thì trả về cấu trúc mega menu
    ...timestamps,
  },
  (table) => [index('navigation_parent_idx').on(table.parentId)]
);

export const navigationsRelations = relations(navigations, ({ one, many }) => ({
  parent: one(navigations, {
    fields: [navigations.parentId],
    references: [navigations.id],
    relationName: 'children_navigation',
  }),
  children: many(navigations, {
    relationName: 'children_navigation',
  }),
}));
