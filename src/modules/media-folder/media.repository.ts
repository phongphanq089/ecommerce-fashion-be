import { prisma } from '@/plugins/prisma';
import {
  MediaFolderInput,
  UpdateFolderInput,
} from './schema/media-folder.schema';

export class MediaFolderRepository {
  async create(data: MediaFolderInput) {
    return prisma.mediaFolder.create({ data });
  }
  async findAll() {
    return prisma.mediaFolder.findMany({
      orderBy: { name: 'asc' },
    });
  }
  async findById(id: string) {
    return prisma.mediaFolder.findUnique({
      where: { id },
      include: {
        media: true, // Lấy cả các media trong folder
        children: true, // Lấy cả các folder con
      },
    });
  }
  async findByNameAndParent(name: string, parentId: string | null) {
    return prisma.mediaFolder.findFirst({
      where: { name, parentId },
    });
  }
  async update(id: string, data: UpdateFolderInput) {
    return prisma.mediaFolder.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.mediaFolder.delete({ where: { id } });
  }
}
