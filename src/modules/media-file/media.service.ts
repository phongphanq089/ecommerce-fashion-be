import { AppError, NotFoundError } from '@/utils/errors';
import { uploadImageKitProvider } from '@/provider/uploadImageKitProvider';
import {
  DeleteMediaTypeMultipleInput,
  DeleteMediaTypeSigleInput,
} from './schema/media.schema';
import { MediaRepository } from './media.repository';
import fs from 'fs/promises';
import { handleExternalCall } from '@/utils/handleExternalCall';
import { toMediaType } from '@/utils/lib';
import { DEFAULT_FOLDER_NAME } from '@/constants';
import { CreateMediaDTO, MultiFileData } from './schema/type';

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

  constructor() {
    this.repo = new MediaRepository();
  }
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
    const uploadResult = await handleExternalCall(
      () =>
        uploadImageKitProvider.streamUpload(
          data.fileBuffer,
          data.fileName,
          'media-ak-shop'
        ),
      {
        serviceName: 'Imagekit',
        errorMessage: 'Failed to upload image.',
      }
    );

    const folder = await this._getFolderForMedia(data.folderId);

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
  async createMediaMultiple(files: MultiFileData[], folderId?: string) {
    const folder = await this._getFolderForMedia(folderId);
    const uploadPromises = files.map(async (file) => {
      const fileBuffer = await fs.readFile(file.path);
      const uploadResult = await handleExternalCall(
        () =>
          uploadImageKitProvider.streamUpload(
            fileBuffer,
            file.originalname.split('.')[0] as string,
            'media-ak-shop'
          ),
        {
          serviceName: 'Imagekit',
          errorMessage: 'Failed to upload image.',
        }
      );
      return { uploadResult, originalFile: file };
    });

    const uploadResults = await Promise.all(uploadPromises);

    const mediaToCreate = uploadResults.map(
      ({ uploadResult, originalFile }) => ({
        fileName: originalFile.originalname ?? `media-${Date.now()}`,
        url: uploadResult.url,
        fileType: toMediaType(originalFile.mimetype),
        size: uploadResult.size,
        altText: originalFile.originalname,
        folderId: folder.id,
        fileId: uploadResult.fileId,
      })
    );
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
  async getMediaList(
    folderId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
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
  async deleteMediaSingle(data: DeleteMediaTypeSigleInput) {
    const media = await this.repo.findUniqueMedia(data.Id);

    if (!media) throw new NotFoundError('Media not found');

    if (!media?.fileId)
      throw new AppError('Media record is corrupted: fileId is missing', 500);

    await this.repo.deleteMediaSingle(data.Id);

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
   * @param data { Ids: string[] } - Danh sách ID media cần xoá
   * @returns { count: number, message: string }
   */
  async deleteMediaMutiple(data: DeleteMediaTypeMultipleInput): Promise<any> {
    const { Ids } = data;

    if (!Ids || Ids.length === 0) {
      return { count: 0, message: 'No IDs provided to delete.' };
    }

    const mediasToDelete = await this.repo.findManyMediaByIds(Ids);

    if (mediasToDelete.length === 0) {
      throw new NotFoundError('None of the provided IDs match any media.');
    }

    const fileIdsToDelete = mediasToDelete
      .map((media) => media.fileId)
      .filter((fileId): fileId is string => !!fileId);

    const deleteResult = await this.repo.deleteMediaMultiple(Ids);

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
}

export const mediaService = new MediaService();
