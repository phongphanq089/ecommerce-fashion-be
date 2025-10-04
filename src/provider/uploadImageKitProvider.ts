import { ENV_CONFIG } from '@/config/env';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: ENV_CONFIG.IMAGE_KIT_PUBLIC_KEY,
  privateKey: ENV_CONFIG.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: ENV_CONFIG.IMAGE_KIT_URLENDOINT,
});

interface StreamUploadParams {
  fileBuffer: Buffer;
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
  fileBuffer: Buffer,
  fileName: string,
  folderName: string,
  tags: string[] = []
): Promise<ImageKitUploadResponse> => {
  const result = await imagekit.upload({
    file: fileBuffer,
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
