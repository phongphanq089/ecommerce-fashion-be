export interface CreateMediaDTO {
  fileBuffer: Buffer;
  fileName: string;
  fileType: string;
  altText?: string;
  folderId?: string;
}

export type MultiFileData = {
  path: string;
  filename: string;
  mimetype: string;
  originalname: string;
};
