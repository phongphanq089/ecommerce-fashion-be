import { Database } from '@/plugins/database';
import { navigations } from '@/db/schema/navigate';
import { settings } from '@/db/schema/settings';
import {
  categories,
  collections,
  attributes,
  attributeValues,
} from '@/db/schema/products';
import { eq, asc } from 'drizzle-orm';

export type CreateNavigationDTO = typeof navigations.$inferInsert;
export type UpdateNavigationDTO = Partial<CreateNavigationDTO>;

export class NavigationRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async getMegaMenuData() {
    const [cats, cols, attrs, attrVals] = await Promise.all([
      this.db.select().from(categories),
      this.db.select().from(collections).where(eq(collections.isActive, true)),
      this.db.select().from(attributes),
      this.db.select().from(attributeValues),
    ]);

    // Format attributes with their values
    const attributesWithValues = attrs.map((attr: any) => ({
      ...attr,
      values: attrVals.filter((v: any) => v.attributeId === attr.id),
    }));

    return {
      categories: cats,
      collections: cols,
      attributes: attributesWithValues,
    };
  }

  async create(data: CreateNavigationDTO) {
    const [result] = await this.db.insert(navigations).values(data).returning();
    return result;
  }

  async initSystemNavigations(menus: CreateNavigationDTO[]) {
    const existingSystemNavs = await this.db
      .select()
      .from(navigations)
      .where(eq(navigations.isSystem, true));

    const existingLabels = existingSystemNavs.map((nav) => nav.label);
    const toInsert = menus.filter(
      (menu) => !existingLabels.includes(menu.label)
    );

    if (toInsert.length > 0) {
      await this.db.insert(navigations).values(toInsert);
    }

    return {
      inserted: toInsert.length,
      skipped: menus.length - toInsert.length,
    };
  }

  async getAll() {
    return await this.db
      .select()
      .from(navigations)
      .orderBy(asc(navigations.displayOrder));
  }

  async getTree() {
    // Lấy toàn bộ navigation và sắp xếp theo displayOrder
    const allNavigations = await this.db
      .select()
      .from(navigations)
      .orderBy(asc(navigations.displayOrder));

    // Lấy mega menu data dùng chung cho các node có isMegaMenu = true
    const megaMenuData = await this.getMegaMenuData();

    // Xây dựng cây (Tree)
    const navMap = new Map();
    const tree: any[] = [];

    // Khởi tạo map và thêm mảng children rỗng cho mỗi item
    allNavigations.forEach((nav: any) => {
      navMap.set(nav.id, {
        ...nav,
        children: [],
        megaMenu: nav.isMegaMenu ? megaMenuData : null,
      });
    });

    // Lặp qua để gắn children vào parent
    allNavigations.forEach((nav: any) => {
      if (nav.parentId) {
        const parent = navMap.get(nav.parentId);
        if (parent) {
          parent.children.push(navMap.get(nav.id));
        } else {
          // Trường hợp parentId không tồn tại (lỗi data), đẩy vào root tạm
          tree.push(navMap.get(nav.id));
        }
      } else {
        tree.push(navMap.get(nav.id));
      }
    });

    return tree;
  }

  async getById(id: string) {
    const [result] = await this.db
      .select()
      .from(navigations)
      .where(eq(navigations.id, id));
    return result;
  }

  async update(id: string, data: UpdateNavigationDTO) {
    const [result] = await this.db
      .update(navigations)
      .set(data)
      .where(eq(navigations.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(navigations)
      .where(eq(navigations.id, id))
      .returning();
    return result;
  }
}
