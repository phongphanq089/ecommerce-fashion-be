export const MEDIA_TAG = 'Media';
export const MEDIA_FOLDER_TAG = 'Media Folders';

export const MEDIA_FILE_DOCUMENTATION = {
  MEDIA_SUMMARIES: {
    UPLOAD_FILE_SINGLE: 'Upload a single file',
    UPLOAD_FILE_MULTIPLE: 'Upload multiple files',
    GET_MEDIA: 'Get list of media files',
    DELETE_SINGLE: 'Delete a single media file',
    DELETE_MULTIPLE: 'Delete multiple media files',
  },
  MEDIA_DESCRIPTIONS: {
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
  },
  MEDIA_REQUEST_BODIES: {
    UPLOAD_FILE_SINGLE: {
      querystring: {
        type: 'object',
        properties: {
          folderId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['file'],
        properties: {
          file: { type: 'string', format: 'binary' },
        },
      },
    },
    UPLOAD_FILE_MULTIPLE: {
      querystring: {
        type: 'object',
        properties: {
          folderId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['files'],
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    },
    GET_MEDIA: {
      querystring: {
        type: 'object',
        properties: {
          folderId: { type: 'string', format: 'uuid' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
    DELETE_SINGLE: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
    DELETE_MULTIPLE: {
      type: 'object',
      required: ['ids'],
      properties: {
        ids: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
  },
};

export const MEDIA_FOLDER_DOCUMENTATION = {
  MEDIA_FOLDER_SUMMARIES: {
    CREATE: 'Create a new media folder',
    GET_ALL: 'Get all media folders as a tree',
    UPDATE: 'Update a media folder',
    DELETE: 'Delete an empty media folder',
  },
  MEDIA_FOLDER_DESCRIPTIONS: {
    CREATE:
      'Creates a new folder. Can be a root folder (parentId is null) or a subfolder.',
    GET_ALL:
      'Retrieves all media folders and structures them in a parent-child tree format.',
    UPDATE: 'Updates the name of a specific folder.',
    DELETE: 'Deletes a folder only if it contains no media and no subfolders.',
  },
  MEDIA_FOLDER_REQUEST_BODIES: {
    CREATE: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        parentId: { type: 'string', format: 'cuid', nullable: true },
      },
    },
    UPDATE: {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'string', format: 'cuid' },
        name: { type: 'string' },
      },
    },
    DELETE: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
      },
    },
  },
};
