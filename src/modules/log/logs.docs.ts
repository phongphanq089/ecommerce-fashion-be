// Định nghĩa Tag cho cả module
export const LOGS_TAG = 'Logs';

export const LOGS_SUMMARIES = {
  GET_FILES: 'Get list of log files',
  VIEW_FILE: 'View content of a specific log file',
  SEARCH_FILE: 'Search content within a log file',
  DELETE_FILE: 'Delete a specific log file',
};

export const LOGS_DESCRIPTIONS = {
  GET_FILES:
    'Retrieves a list of all available log file names from the server.',
  VIEW_FILE:
    'Reads a log file by its name and returns its content. Each line is parsed as a separate JSON object.',
  SEARCH_FILE:
    'Searches for a specific keyword within a log file and returns all matching lines.',
  DELETE_FILE:
    'Permanently deletes a specific log file from the server. This action is irreversible.',
};
