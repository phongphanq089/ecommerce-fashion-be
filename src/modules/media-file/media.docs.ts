// Định nghĩa Tag cho cả module
export const MEDIA_TAG = 'Media';

export const MEDIA_SUMMARIES = {
  UPLOAD_FILE_SINGLE: 'Upload a single file',
  UPLOAD_FILE_MULTIPLE: 'Upload multiple files',
  GET_MEDIA: 'Get list of media files',
  DELETE_SINGLE: 'Delete a single media file',
  DELETE_MULTIPLE: 'Delete multiple media files',
};

export const MEDIA_DESCRIPTIONS = {
  UPLOAD_FILE_SINGLE:
    'Uploads a single file to the server. ' +
    'Supports optional metadata including `folderId` and `altText`. ' +
    'The request must use `multipart/form-data` with a required `file` field. ' +
    'The uploaded file will be stored in the media storage system and metadata saved if provided.',

  UPLOAD_FILE_MULTIPLE:
    'Uploads multiple files to the server. ' +
    'Supports optional metadata including `folderId` and `altText` (applies to each file). ' +
    'The request must use `multipart/form-data` with a required `files` field. ' +
    'All uploaded files will be stored in the media storage system.',

  GET_MEDIA:
    'Fetch a paginated list of media files. ' +
    'Optionally filter by `folderId`. Pagination is controlled by `page` and `limit` query params.',

  DELETE_SINGLE: 'Delete a single media file by its `Id` (UUID).',

  DELETE_MULTIPLE:
    'Delete multiple media files at once by passing an array of `Id` (UUID).',
};
