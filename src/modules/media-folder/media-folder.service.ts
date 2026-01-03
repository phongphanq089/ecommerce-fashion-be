import { AppError, ConflictError, NotFoundError } from '@/utils/errors';
import { MediaFolderRepository } from './media-folder.repository';
import {
  MediaFolderInput,
  UpdateFolderInput,
} from './schema/mediaFolder.schema';

export class mediaFolderService {
  private repo: MediaFolderRepository;

  constructor(repo: MediaFolderRepository) {
    this.repo = repo;
  }

  async createFolder(data: MediaFolderInput) {
    // Business logic: Không cho tạo folder trùng tên trong cùng một cấp
    const existing = await this.repo.findByNameAndParent(
      data.name,
      data.parentId || null
    );
    if (existing) {
      throw new ConflictError(
        'A folder with this name already exists at this level.'
      );
    }
    return this.repo.create(data);
  }
  async getAllFoldersAsTree() {
    const allFolders = await this.repo.findAll();

    return allFolders;
  }
  async updateFolder(data: UpdateFolderInput) {
    const folder = await this.repo.findById(data.id);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }
    if (data.name && data.name !== folder.name) {
      const existing = await this.repo.findByNameAndParent(
        data.name,
        folder.parentId
      );
      if (existing) {
        throw new ConflictError(
          'A folder with this name already exists at this level.'
        );
      }
    }
    return this.repo.update(data.id, data);
  }
  async deleteFolder(id: string) {
    const folder = await this.repo.findById(id);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    if (folder.media.length > 0 || folder.children.length > 0) {
      throw new AppError('Cannot delete a non-empty folder.', 400);
    }

    return this.repo.delete(id);
  }
}

// export const mediaFolderService = new MediaFolderService();
