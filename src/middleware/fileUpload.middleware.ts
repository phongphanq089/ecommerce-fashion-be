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
  if (!req.isMultipart()) {
    throw new AppError('Request is not multipart', 400);
  }
}

export const fileUploadMiddleware = {
  single: processSingleFile,
  multiple: processMultipleFiles,
};
