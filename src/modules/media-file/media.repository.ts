import { prisma } from '@/plugins/prisma';
import { Media, Prisma } from '@prisma/client';

/**
 * Repository pattern cho Media và MediaFolder.
 *
 * Nhiệm vụ:
 * - Tách biệt layer truy xuất DB ra khỏi business logic
 * - Cung cấp API nhất quán để thao tác với bảng media / mediaFolder
 */
export class MediaRepository {
  /**
   * Tìm folder theo id
   * @param id - ID của folder
   */
  async findFolderById(id: string) {
    return prisma.mediaFolder.findUnique({ where: { id } });
  }
  /**
   * Tìm folder theo tên (trả về folder đầu tiên tìm được)
   * @param name - Tên của folder
   */
  async findFolderByName(name: string) {
    return prisma.mediaFolder.findFirst({ where: { name } });
  }
  /**
   * Tạo một folder mới
   * @param name - Tên của folder
   */
  async createFolder(name: string) {
    return prisma.mediaFolder.create({ data: { name } });
  }
  /**
   * Tạo một bản ghi Media
   * @param data - dữ liệu media (dùng Prisma.MediaUncheckedCreateInput)
   * @returns Media đã được tạo kèm folder
   */
  async createMedia(data: Prisma.MediaUncheckedCreateInput): Promise<Media> {
    return prisma.media.create({
      data,
      include: {
        folder: true,
      },
    });
  }
  /**
   * @description Tạo nhiều media trong một transaction để đảm bảo tính toàn vẹn dữ liệu.
   * Sử dụng map các lệnh create thay vì createMany để có thể trả về danh sách các bản ghi đã tạo.
   * @param data - Mảng dữ liệu media cần tạo
   * @returns Mảng các bản ghi Media đã được tạo thành công
   */
  async createManyMedia(
    data: Prisma.MediaUncheckedCreateInput[]
  ): Promise<Media[]> {
    const createPromises = data.map((mediaData) =>
      prisma.media.create({
        data: mediaData,
        include: {
          folder: true,
        },
      })
    );
    return prisma.$transaction(createPromises);
  }

  /**
   * Lấy danh sách media (mặc định: tất cả, hoặc theo folder)
   * Có hỗ trợ phân trang
   * @param folderId - ID folder cần lọc (optional)
   * @param page - số trang (default = 1)
   * @param limit - số item mỗi trang (default = 20)
   */
  async findMedia(folderId?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where = folderId ? { folderId } : {};

    const [items, total] = await prisma.$transaction([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.media.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  /**
   * Tìm media theo ID
   */
  async findUniqueMedia(id: string) {
    return await prisma.media.findUnique({ where: { id } });
  }
  /**
   * Xóa 1 media theo ID
   */
  async deleteMediaSingle(id: string) {
    return await prisma.media.delete({ where: { id } });
  }

  /**
   * Lấy danh sách media theo nhiều ID
   * @returns chỉ select fileId (thường dùng khi cần xóa file bên storage)
   */
  async findManyMediaByIds(ids: string[]) {
    return prisma.media.findMany({
      where: { id: { in: ids } },
      select: { fileId: true },
    });
  }
  /**
   * Xóa nhiều media cùng lúc
   */
  async deleteMediaMultiple(ids: string[]) {
    return await prisma.media.deleteMany({ where: { id: { in: ids } } });
  }
}
