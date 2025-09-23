import dotenv from 'dotenv';

dotenv.config();

export const ENV_CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || '127.0.0.1',
  NODE_ENV: process.env.NODE_ENV || 'development',

  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  // ===== JWT  =============//
  ACCESS_TOKEN_SECRET_SIGNATURE:
    process.env.ACCESS_TOKEN_SECRET_SIGNATURE || '',
  ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE as `${number}${
    | 'm'
    | 'h'
    | 'd'}`,
  REFRESH_TOKEN_SECRET_SIGNATURE:
    process.env.REFRESH_TOKEN_SECRET_SIGNATURE || '',
  REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE as `${number}${
    | 'm'
    | 'h'
    | 'd'}`,
  BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS || '',
  //========================//
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '',
  //========= KEY SEND MAIL =========//
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  ADMIN_EMAIL_ADDRESS: process.env.ADMIN_EMAIL_ADDRESS || '',
  ADMIN_EMAIL_NAME: process.env.ADMIN_EMAIL_NAME || '',
  //====== cookie ======================//
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  // ======== IMAGEKIT ======================//
  IMAGE_KIT_PUBLIC_KEY: process.env.IMAGE_KIT_PUBLIC_KEY || '',
  IMAGE_KIT_PRIVATE_KEY: process.env.IMAGE_KIT_PRIVATE_KEY || '',
  IMAGE_KIT_URLENDOINT: process.env.IMAGE_KIT_URLENDOINT || '',
};
