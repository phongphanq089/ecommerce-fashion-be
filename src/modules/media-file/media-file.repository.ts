import { Database } from '@/plugins/database';
import { eq, count, inArray } from 'drizzle-orm';
import * as schema from '@/db/schema';

/**
 * Repository pattern cho Media và MediaFolder.
 *
 * Nhiệm vụ:
 * - Tách biệt layer truy xuất DB ra khỏi business logic
 * - Cung cấp API nhất quán để thao tác với bảng media / mediaFolder
 */
export class MediaRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }
  /**
   * Tìm folder theo id
   * @param id - ID của folder
   */
  async findFolderById(id: string) {
    return this.db.query.mediaFolders.findFirst({
      where: eq(schema.mediaFolders.id, id),
    });
  }
  /**
   * Tìm folder theo tên (trả về folder đầu tiên tìm được)
   * @param name - Tên của folder
   */
  async findFolderByName(name: string) {
    return this.db.query.mediaFolders.findFirst({
      where: eq(schema.mediaFolders.name, name),
    });
  }
  /**
   * Tạo một folder mới
   * @param name - Tên của folder
   */
  async createFolder(name: string) {
    // .returning() sau insert → trả về [ { id: '...', name: '...' } ] (mảng 1 phần tử)
    // findFirst() → trả về Row | undefined
    // Nhưng insert/update/delete + returning() → luôn là mảng, dù chỉ có 1 row.
    return this.db
      .insert(schema.mediaFolders)
      .values({ name })
      .returning()
      .then((rows) => rows[0]!);
  }
  /**
   * Tạo một bản ghi Media
   * @param data - dữ liệu media
   * @returns Media đã được tạo kèm folder
   */
  async createMedia(data: typeof schema.media.$inferInsert) {
    return this.db
      .insert(schema.media)
      .values(data)
      .returning()
      .then((rows) => rows[0]!);
  }
  /**
   * @description Tạo nhiều media trong một transaction để đảm bảo tính toàn vẹn dữ liệu.
   * Sử dụng map các lệnh create thay vì createMany để có thể trả về danh sách các bản ghi đã tạo.
   * @param data - Mảng dữ liệu media cần tạo
   * @returns Mảng các bản ghi Media đã được tạo thành công
   */
  async createManyMedia(data: (typeof schema.media.$inferInsert)[]) {
    // Drizzle không có createMany + returning đơn giản như Prisma
    // Dùng transaction + map insert riêng để trả về full object
    const results = await this.db.transaction(async (tx) => {
      const created: (typeof schema.media.$inferSelect)[] = [];
      for (const item of data) {
        const [inserted] = await tx
          .insert(schema.media)
          .values(item)
          .returning();
        if (inserted) created.push(inserted);
      }
      return created;
    });
    return results;
  }
  /**
   * Lấy danh sách media (mặc định: tất cả, hoặc theo folder)
   * Có hỗ trợ phân trang
   * @param folderId - ID folder cần lọc (optional)
   * @param page - số trang (default = 1)
   * @param limit - số item mỗi trang (default = 20)
   */
  async findMedia(folderId?: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const whereClause = folderId
      ? eq(schema.media.folderId, folderId)
      : undefined;

    const [items, totalResult] = await Promise.all([
      this.db.query.media.findMany({
        where: whereClause,
        orderBy: (media, { desc }) => desc(media.createdAt),
        limit,
        offset,
        with: {
          folder: true,
        },
      }),
      this.db
        .select({ count: count(schema.media) })
        .from(schema.media)
        .where(whereClause)
        .then((rows) => rows[0]?.count ?? 0),
    ]);

    return {
      items,
      total: Number(totalResult),
      page,
      limit,
      totalPages: Math.ceil(Number(totalResult) / limit),
    };
  }
  /**
   * Tìm media theo ID
   */
  async findUniqueMedia(id: string) {
    return await this.db.query.media.findFirst({
      where: eq(schema.media.id, id),
      with: {
        folder: true,
      },
    });
  }
  /**
   * Xóa 1 media theo ID
   */
  async deleteMediaSingle(id: string) {
    return await this.db
      .delete(schema.media)
      .where(eq(schema.media.id, id))
      .returning()
      .then((rows) => rows[0]!);
  }

  /**
   * Lấy danh sách media theo nhiều ID
   * @returns chỉ select fileId (thường dùng khi cần xóa file bên storage)
   */
  async findManyMediaByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return this.db
      .select({ fileId: schema.media.fileId })
      .from(schema.media)
      .where(inArray(schema.media.id, ids));
  }
  /**
   * Xóa nhiều media cùng lúc
   */
  async deleteMediaMultiple(ids: string[]) {
    if (ids.length === 0) return { count: 0 };
    const deletedRows = await this.db
      .delete(schema.media)
      .where(inArray(schema.media.id, ids))
      .returning();
    return { count: deletedRows.length };
  }
}
