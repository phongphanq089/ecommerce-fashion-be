import {
  ALLOW_COMMOM_FILE_TYPES_GALLERY,
  LIMIT_COMMON_FILE_SIZE,
} from '@/constants';
import { AppError } from '@/utils/errors';
import { FastifyReply, FastifyRequest } from 'fastify';
import path from 'path';
import { pipeline } from 'stream';
import util from 'util';
import fs from 'fs';
import crypto from 'crypto';

const pump = util.promisify(pipeline);

async function processSingleFile(req: FastifyRequest, reply: FastifyReply) {
  console.log('=========================> Lỗi lỗi');
  const data = await req.file({
    limits: {
      fileSize: LIMIT_COMMON_FILE_SIZE,
    },
  });

  if (!data) {
    throw new AppError('No file uploaded.', 400);
  }

  if (!ALLOW_COMMOM_FILE_TYPES_GALLERY.includes(data.mimetype)) {
    throw new AppError('File type is invalid.', 415);
  }

  const tmpFolder = path.join(__dirname, '../../tmp');

  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder, { recursive: true });
  }

  const ext = path.extname(data.filename);
  const name = crypto.randomBytes(16).toString('hex');
  const newFilename = `${Date.now()}-${name}${ext}`;
  const filePath = path.join(tmpFolder, newFilename);

  await pump(data.file, fs.createWriteStream(filePath));

  (req as any).savedFile = {
    path: filePath,
    originalname: data.filename,
    mimetype: data.mimetype,
  };
}

// --- HÀM XỬ LÝ NHIỀU FILE (MỚI) --- ✨
async function processMultipleFiles(req: FastifyRequest, reply: FastifyReply) {
  const savedFiles = [];
  const parts = req.files({
    limits: {
      fileSize: LIMIT_COMMON_FILE_SIZE,
    },
  });

  for await (const part of parts) {
    // Kiểm tra định dạng file
    if (!ALLOW_COMMOM_FILE_TYPES_GALLERY.includes(part.mimetype)) {
      // Bỏ qua file không hợp lệ hoặc throw lỗi tùy theo yêu cầu nghiệp vụ
      // Ở đây chúng ta sẽ throw lỗi để dừng toàn bộ quá trình upload
      throw new AppError(`File type ${part.mimetype} is not allowed.`, 415);
    }

    // Logic tạo file và lưu trữ tương tự như hàm single
    const tmpFolder = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(tmpFolder)) {
      fs.mkdirSync(tmpFolder, { recursive: true });
    }

    const ext = path.extname(part.filename);
    const name = crypto.randomBytes(16).toString('hex');
    const newFilename = `${Date.now()}-${name}${ext}`;
    const filePath = path.join(tmpFolder, newFilename);

    await pump(part.file, fs.createWriteStream(filePath));

    savedFiles.push({
      path: filePath,
      originalname: part.filename,
      mimetype: part.mimetype,
    });
  }

  if (savedFiles.length === 0) {
    throw new AppError('No valid files uploaded.', 400);
  }

  // Gắn mảng các file đã lưu vào request
  (req as any).savedFiles = savedFiles;
}

// Xuất ra dưới dạng một object để dễ quản lý và mở rộng
// Sau này bạn có thể thêm `multiple: processMultipleFiles` vào đây
export const fileUploadMiddleware = {
  single: processSingleFile,
  multiple: processMultipleFiles,
};
