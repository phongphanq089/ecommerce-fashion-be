export const MEDIA_FOLDER_TAG = 'Media Folders';

export const MEDIA_FOLDER_SUMMARIES = {
  CREATE: 'Create a new media folder',
  GET_ALL: 'Get all media folders as a tree',
  UPDATE: 'Update a media folder',
  DELETE: 'Delete an empty media folder',
};

export const MEDIA_FOLDER_DESCRIPTIONS = {
  CREATE:
    'Creates a new folder. Can be a root folder (parentId is null) or a subfolder.',
  GET_ALL:
    'Retrieves all media folders and structures them in a parent-child tree format.',
  UPDATE: 'Updates the name of a specific folder.',
  DELETE: 'Deletes a folder only if it contains no media and no subfolders.',
};
