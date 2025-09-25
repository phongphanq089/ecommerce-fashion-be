import { AppError } from './errors';
import { logger } from '@/utils/logger';

interface ExternalCallOptions {
  serviceName: string; // Tên dịch vụ bên ngoài (dùng để log cho dễ trace lỗi)
  errorMessage: string; // Thông báo lỗi trả về cho client
}

/**
 * Hàm helper dùng để bọc (wrap) một lời gọi tới dịch vụ bên ngoài (API, SDK...).
 *
 * Cách hoạt động:
 * - Nhận vào một hàm `apiCall` (async) đại diện cho request đến dịch vụ ngoài.
 * - Thực thi trong try/catch.
 * - Nếu lỗi xảy ra:
 *   1. Ghi log chi tiết cho developer (bao gồm tên service + error gốc).
 *   2. Ném ra `AppError` với HTTP status 502 (Bad Gateway) để error handler toàn cục xử lý.
 *
 * Tại sao dùng 502?
 * - Vì lỗi xuất phát từ upstream service (bên ngoài), không phải lỗi của server nội bộ.
 *
 * @param apiCall - Hàm async trả về Promise (thường là lời gọi API ngoài).
 * @param options - Cấu hình gồm tên service và message trả về cho client.
 * @returns Kết quả của lời gọi API nếu thành công.
 */
export async function handleExternalCall<T>(
  apiCall: () => Promise<T>,
  options: ExternalCallOptions
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    // 1. Log chi tiết cho dev dễ debug
    logger.error(`Error calling external service: ${options.serviceName}`, {
      originalError: error.message,
      //  Nếu dùng axios có thể log thêm error.response?.data
    });

    // 2. Ném AppError có cấu trúc để global error handler xử lý
    throw new AppError(options.errorMessage, 502);
  }
}

/**
 *  Ví dụ sử dụng:
 *
 * export const mediaService = {
 *   async uploadImage(file: any): Promise<string> {
 *     const result = await handleExternalCall(
 *       // Truyền lời gọi API vào dưới dạng callback
 *       () => cloudflareApi.upload(file),
 *       {
 *         serviceName: 'Cloudflare',
 *         errorMessage: 'Failed to upload image.',
 *       }
 *     );
 *
 *     return result.url;
 *   },
 * };
 */
