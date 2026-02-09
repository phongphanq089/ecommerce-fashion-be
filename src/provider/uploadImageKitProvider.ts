import { ENV_CONFIG } from '@/config/env';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: ENV_CONFIG.IMAGE_KIT_PUBLIC_KEY,
  privateKey: ENV_CONFIG.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: ENV_CONFIG.IMAGE_KIT_URL_ENDPOINT,
});

import { ReadStream } from 'fs';
import { Readable } from 'stream';

interface StreamUploadParams {
  file: string | Buffer | ReadStream | Readable;
  fileName: string;
  folderName: string;
}

interface ImageKitUploadResponse {
  fileId: string;
  url: string;
  name: string;
  fileType: string;
  filePath: string;
  size: number;
}

const streamUpload = async (
  file: string | Buffer | ReadStream | Readable,
  fileName: string,
  folderName: string,
  tags: string[] = []
): Promise<ImageKitUploadResponse> => {
  const result = await imagekit.upload({
    file: file as any, // Cast to any to allow Readable stream which works at runtime
    fileName: `product-${fileName}`,
    folder: folderName,
    tags,
    useUniqueFileName: true,
  });
  return {
    fileId: result.fileId,
    url: result.url,
    name: result.name,
    fileType: result.fileType,
    filePath: result.filePath,
    size: result.size,
  };
};

const deleteFile = async (fileId: string): Promise<any> => {
  return await imagekit.deleteFile(fileId);
};

const deleteFolder = async (folderId: string): Promise<any> => {
  return await imagekit.deleteFolder(folderId);
};

const getMedia = async (folder: string): Promise<any> => {
  return await imagekit.listFiles({
    path: `gallery/${folder}`,
  });
};

export const uploadImageKitProvider = {
  streamUpload,
  deleteFile,
  deleteFolder,
  getMedia,
};
