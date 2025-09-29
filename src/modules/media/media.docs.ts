// Định nghĩa Tag cho cả module
export const MEDIA_TAG = 'Media';

export const MEDIA_SUMMARIES = {
  UPLOAD_FILE_SINGLE: 'Upload a single file',
};

export const MEDIA_DESCRIPTIONS = {
  UPLOAD_FILE_SINGLE:
    'Uploads a single file to the server. Supports optional metadata including folder ID and alt text. The request must use `multipart/form-data` with a required `file` field. ' +
    'The uploaded file will be stored in the media storage system and metadata will be saved if provided.',
};
