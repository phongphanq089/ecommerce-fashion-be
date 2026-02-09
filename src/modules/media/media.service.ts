import { AppError, ConflictError, NotFoundError } from '@/utils/errors';
import { uploadImageKitProvider } from '@/provider/uploadImageKitProvider';

import fs from 'fs/promises';
import { handleExternalCall } from '@/utils/handleExternalCall';
import { toMediaType } from '@/utils/lib';
import { DEFAULT_FOLDER_NAME } from '@/constants';
import {
  CreateMediaDTO,
  DeleteMediaMultipleInput,
  DeleteMediaSingleInput,
  MediaFolderCreateInput,
  MediaFolderUpdateInput,
  MultiFileData,
} from './media.validation';
import { MediaRepository } from './media.repository';

/**
 * MediaService
 * --------------------------------------------------------
 * Quản lý toàn bộ logic liên quan đến Media (ảnh, video, file):
 *  - Upload file đơn lẻ hoặc nhiều file
 *  - Lưu trữ thông tin media vào DB
 *  - Tự động xử lý thư mục mặc định nếu không có folder chỉ định
 *  - Lấy danh sách media theo thư mục + phân trang
 */
class MediaService {
  private repo: MediaRepository;

  constructor(repo: MediaRepository) {
    this.repo = repo;
  }
  // ============================================================================
  // MEDIA FILE SERVICES
  // ============================================================================
  /**
   * @private
   * Xác định thư mục để lưu media:
   *  - Nếu có folderId → tìm trong DB, nếu không tồn tại thì báo lỗi.
   *  - Nếu không có → tìm thư mục mặc định ("All Files"), nếu chưa tồn tại thì tạo mới.
   *
   * @param folderId (optional) ID thư mục người dùng chọn
   * @returns Folder record từ DB
   * @throws NotFoundError nếu folderId không hợp lệ
   */
  private async _getFolderForMedia(folderId?: string) {
    if (folderId) {
      const folder = await this.repo.findFolderById(folderId);
      if (!folder) {
        throw new NotFoundError('Target folder not found');
      }
      return folder;
    } else {
      let defaultFolder = await this.repo.findFolderByName(DEFAULT_FOLDER_NAME);
      if (!defaultFolder) {
        defaultFolder = await this.repo.createFolder(DEFAULT_FOLDER_NAME);
      }
      return defaultFolder;
    }
  }
  /**
   * Upload và lưu nhiều file media cùng lúc
   * --------------------------------------------------------
   * Flow:
   * 1. Xác định folder lưu trữ
   * 2. Upload toàn bộ file lên ImageKit (chạy song song Promise.all)
   * 3. Map dữ liệu upload → Media entity
   * 4. Lưu tất cả media trong 1 transaction
   *
   * @param files Mảng file từ request (MultiFileData)
   * @param folderId (optional) ID thư mục
   * @returns Danh sách media record mới tạo
   */
  async createMediaSingle(data: CreateMediaDTO) {
    const folder = await this._getFolderForMedia(data.folderId);

    const uploadResult = await handleExternalCall(
      () =>
        uploadImageKitProvider.streamUpload(
          data.file,
          data.fileName,
          'media-ak-shop'
        ),
      {
        serviceName: 'Imagekit',
        errorMessage: 'Failed to upload image.',
      }
    );

    const newMedia = await this.repo.createMedia({
      fileName: data.altText ?? `media-${Date.now()}`,
      url: uploadResult.url,
      fileType: toMediaType(data.fileType),
      size: uploadResult.size,
      altText: data.altText ?? '',
      folderId: folder.id ?? null,
      fileId: uploadResult.fileId,
    });

    return newMedia;
  }
  /**
   * Upload và lưu nhiều file media cùng lúc
   * --------------------------------------------------------
   * Flow:
   * 1. Xác định folder lưu trữ
   * 2. Upload toàn bộ file lên ImageKit (chạy song song Promise.all)
   * 3. Map dữ liệu upload → Media entity
   * 4. Lưu tất cả media trong 1 transaction
   *
   * @param files Mảng file từ request (MultiFileData)
   * @param folderId (optional) ID thư mục
   * @returns Danh sách media record mới tạo
   */
  async createMediaMultiple(
    files: AsyncIterableIterator<any>,
    folderId?: string
  ) {
    const folder = await this._getFolderForMedia(folderId);
    // Array to store upload promises
    const uploadPromises: Promise<{
      uploadResult: any;
      originalFilename: string;
      mimetype: string;
    }>[] = [];

    // Iterate over the parts and start uploads immediately
    for await (const part of files) {
      if (part.file) {
        // Validate mimetype on the fly
        const { ALLOW_COMMOM_FILE_TYPES_GALLERY } = await import('@/constants');
        if (!ALLOW_COMMOM_FILE_TYPES_GALLERY.includes(part.mimetype)) {
          // If one file fails, we could throw.
          // But since we are processing a stream, throwing here stops processing subsequent files.
          // For now, let's skip invalid files or throw?
          // Throwing is safer for "all or nothing" logic but difficult with streams.
          // Let's throw to be consistent with previous middleware behavior.
          throw new AppError(`File type ${part.mimetype} is not allowed.`, 415);
        }

        const uploadPromise = handleExternalCall(
          () =>
            uploadImageKitProvider.streamUpload(
              part.file,
              part.filename.split('.')[0] as string,
              'media-ak-shop'
            ),
          {
            serviceName: 'Imagekit',
            errorMessage: 'Failed to upload image.',
          }
        ).then((uploadResult) => ({
          uploadResult,
          originalFilename: part.filename,
          mimetype: part.mimetype,
        }));

        uploadPromises.push(uploadPromise);
      }
    }
    const uploadResults = await Promise.all(uploadPromises);
    const mediaToCreate = uploadResults.map(
      ({ uploadResult, originalFilename, mimetype }) => ({
        fileName: originalFilename ?? `media-${Date.now()}`,
        url: uploadResult.url,
        fileType: toMediaType(mimetype),
        size: uploadResult.size,
        altText: originalFilename,
        folderId: folder.id,
        fileId: uploadResult.fileId,
      })
    );

    if (mediaToCreate.length === 0) {
      throw new AppError('No valid files uploaded', 400);
    }

    const newMedia = await this.repo.createManyMedia(mediaToCreate);

    return newMedia;
  }
  /**
   * Lấy danh sách media (có phân trang)
   * --------------------------------------------------------
   * @param folderId (optional) ID thư mục để lọc
   * @param page (default = 1) số trang hiện tại
   * @param limit (default = 20) số lượng media / trang
   * @returns { data: Media[], pagination: { total, page, limit } }
   */
  async getMediaList(folderId?: string, page: number = 1, limit: number = 20) {
    return await this.repo.findMedia(folderId, page, limit);
  }
  /**
   * Xoá một media (DB + file trên ImageKit)
   * --------------------------------------------------------
   * Flow:
   * 1. Tìm media theo ID
   * 2. Nếu không tồn tại → throw NotFoundError
   * 3. Nếu record bị lỗi (thiếu fileId) → throw AppError
   * 4. Xoá record trong DB
   * 5. Gọi ImageKit API xoá file vật lý (handle error riêng biệt)
   *
   * @param data { Id: string } - ID media cần xoá
   * @returns ID media đã xoá
   */
  async deleteMediaSingle(data: DeleteMediaSingleInput) {
    const media = await this.repo.findUniqueMedia(data.id);

    if (!media) throw new NotFoundError('Media not found');

    if (!media?.fileId)
      throw new AppError('Media record is corrupted: fileId is missing', 500);

    await this.repo.deleteMediaSingle(data.id);

    //// Sau đó xóa file trên ImageKit (nếu fail thì log, không throw)
    await handleExternalCall(
      () => uploadImageKitProvider.deleteFile(media.fileId as string),
      {
        serviceName: 'Imagekit',
        errorMessage: `Failed to delete file ${media.fileId} from ImageKit. It is now an orphan.`,
      }
    );

    return media.id;
  }
  /**
   * Xoá nhiều media cùng lúc (DB + file trên ImageKit)
   * --------------------------------------------------------
   * Flow:
   * 1. Kiểm tra input (Ids không rỗng)
   * 2. Tìm tất cả media ứng với Ids
   *    - Nếu không có record nào → throw NotFoundError
   * 3. Xoá các record trong DB (transaction)
   * 4. Với mỗi fileId còn tồn tại → gọi ImageKit API xoá file vật lý
   * 5. Trả về số lượng media xoá thành công
   *
   * @param data { ids: string[] } - Danh sách ID media cần xoá
   * @returns { count: number, message: string }
   */
  async deleteMediaMultiple(data: DeleteMediaMultipleInput) {
    const { ids } = data;

    if (!ids || ids.length === 0) {
      return { count: 0, message: 'No IDs provided to delete.' };
    }

    const mediasToDelete = await this.repo.findManyMediaByIds(ids);

    if (mediasToDelete.length === 0) {
      throw new NotFoundError('None of the provided IDs match any media.');
    }

    const fileIdsToDelete = mediasToDelete
      .map((media) => media.fileId)
      .filter((fileId): fileId is string => !!fileId);

    const deleteResult = await this.repo.deleteMediaMultiple(ids);

    if (fileIdsToDelete.length > 0) {
      const deletePromises = fileIdsToDelete.map(async (fileId) => {
        return await handleExternalCall(
          () => uploadImageKitProvider.deleteFile(fileId),
          {
            serviceName: 'Imagekit',
            errorMessage: `Failed to delete file ${fileId} from ImageKit. It is now an orphan.`,
          }
        );
      });

      await Promise.all(deletePromises);
    }

    return {
      count: deleteResult.count,
      message: `${deleteResult.count} media item(s) deleted successfully.`,
    };
  }
  // ============================================================================
  // MEDIA FOLDER SERVICES
  // ============================================================================
  async createFolder(data: MediaFolderCreateInput) {
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
  async updateFolder(data: MediaFolderUpdateInput) {
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

export const mediaService = (repo: MediaRepository) => new MediaService(repo);
