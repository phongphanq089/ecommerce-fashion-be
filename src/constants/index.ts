// ===================================
// FILE UPLOAD CONSTANTS
// ===================================
export const LIMIT_COMMON_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export const ALLOW_COMMOM_FILE_TYPES_GALLERY = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/mpeg',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
];

export const DEFAULT_FOLDER_NAME = 'Default Folder';

export const COOKIE_NAME = 'refresh_token';

export const ROLE_NAME = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  STAFF: 'STAFF',
};
