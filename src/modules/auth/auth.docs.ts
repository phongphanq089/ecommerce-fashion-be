// modules/auth/auth.docs.ts

export const AUTH_TAG = 'Authentication';

export const AUTH_SUMMARIES = {
  SIGN_UP: 'Register an account (Email/Password)',
  SIGN_IN: 'Login using email.',
  SIGN_OUT: 'Logout.',
  GET_SESSION: 'Get session information.',
  FORGET_PASSWORD: 'Request to reset password (Forgot password)',
  RESET_PASSWORD: 'Reset password (Use token from email)',
  CHANGE_PASSWORD: 'Change password (When logged in)',
  LIST_SESSIONS: 'List all login sessions',
  REVOKE_SESSION: 'Revoke a specific session',
  REVOKE_OTHER_SESSIONS: 'Logout all other sessions',
};

export const AUTH_DESCRIPTIONS = {
  SIGN_UP:
    'Register an account and automatically log in, returning a session cookie.',
  SIGN_IN: 'Login and receive a session cookie HttpOnly.',
  SIGN_OUT: 'Delete the current session cookie.',
  GET_SESSION:
    'Check if the user is logged in. Returns user and session information.',
  FORGET_PASSWORD:
    "Send an email containing a reset password link to the user's email.",
  RESET_PASSWORD: 'Use the token received from email to set a new password.',
  CHANGE_PASSWORD:
    'User logged in wants to change their old password to a new one.',
  LIST_SESSIONS: 'View all login sessions (IP, browser, time) of this user.',
  REVOKE_SESSION:
    'Revoke a specific session (e.g., kick user off a foreign device).',
  REVOKE_OTHER_SESSIONS:
    'Logout from all other devices, keeping only the current device.',
};
