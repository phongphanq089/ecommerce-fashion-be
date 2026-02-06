import {
  ALLOW_COMMOM_FILE_TYPES_GALLERY,
  LIMIT_COMMON_FILE_SIZE,
} from '@/constants';
import { AppError } from '@/utils/errors';
import { FastifyReply, FastifyRequest } from 'fastify';

async function processSingleFile(req: FastifyRequest, reply: FastifyReply) {
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

  // Attach the file stream and metadata directly to the request
  (req as any).savedFile = {
    file: data.file, // This is a Readable stream
    originalname: data.filename,
    mimetype: data.mimetype,
  };
}

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
      throw new AppError(`File type ${part.mimetype} is not allowed.`, 415);
    }

    savedFiles.push({
      file: part.file, // This is a Readable stream
      originalname: part.filename,
      mimetype: part.mimetype,
    });
  }

  if (savedFiles.length === 0) {
    throw new AppError('No valid files uploaded.', 400);
  }

  // Gắn mảng các file streams đã lưu vào request
  (req as any).savedFiles = savedFiles;
}

export const fileUploadMiddleware = {
  single: processSingleFile,
  multiple: processMultipleFiles,
};
