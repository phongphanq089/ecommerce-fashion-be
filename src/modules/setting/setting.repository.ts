import { Database } from '@/plugins/database';
import { navigations } from '@/db/schema/navigate';
import { settings } from '@/db/schema/settings';
import { eq, asc } from 'drizzle-orm';

export type CreateNavigationDTO = typeof navigations.$inferInsert;
export type UpdateNavigationDTO = Partial<CreateNavigationDTO>;

export class SettingRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  async getSettingByKey(key: string) {
    const [result] = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return result;
  }

  async upsertSetting(key: string, value: any) {
    const [result] = await this.db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return result;
  }
}
