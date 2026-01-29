import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // --- Server Configuration ---
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('127.0.0.1'),
  BASE_URL: z.url('BASE_URL must be a valid URL'),

  // --- Database ---
  DATABASE_URL: z.string().min(1, 'Database URL is required'),

  // --- URLs ---
  SENTRY_URL: z
    .string()
    .url('Invalid Sentry URL format')
    .optional()
    .or(z.literal('')),
  CLIENT_ORIGIN: z.string().url('CLIENT_ORIGIN must be a valid URL'),
  SERVER_URL: z.string().url('SERVER_URL must be a valid URL'),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL'),

  // --- Auth / JWT ---
  ACCESS_TOKEN_SECRET_SIGNATURE: z
    .string()
    .min(1, 'Access token secret is required'),
  ACCESS_TOKEN_LIFE: z
    .string()
    .regex(/^\d+[mhd]$/, "Format must be like '1h', '7d', or '30m'"),

  REFRESH_TOKEN_SECRET_SIGNATURE: z
    .string()
    .min(1, 'Refresh token secret is required'),
  REFRESH_TOKEN_LIFE: z
    .string()
    .regex(/^\d+[mhd]$/, "Format must be like '1h', '7d', or '30m'"),

  BCRYPT_ROUNDS: z.coerce.number().default(10),

  // --- Mail Service (Brevo) ---
  BREVO_API_KEY: z.string().min(1, 'Brevo API key is required'),
  ADMIN_EMAIL_ADDRESS: z.string().email('Invalid admin email address'),
  ADMIN_EMAIL_NAME: z.string().min(1, 'Admin email name is required'),

  // --- Security ---
  COOKIE_SECRET: z.string().min(1, 'Cookie secret is required'),

  // --- Image Hosting (ImageKit) ---
  IMAGE_KIT_PUBLIC_KEY: z.string().min(1, 'ImageKit public key is required'),
  IMAGE_KIT_PRIVATE_KEY: z.string().min(1, 'ImageKit private key is required'),
  IMAGE_KIT_URLENDOINT: z.string().url('ImageKit endpoint must be a valid URL'),

  // --- Social Login ---
  GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'Google Client Secret is required'),
});

// Parse and Validate
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');

  // Clean error reporting
  _env.error.issues.forEach((issue) => {
    console.error(`   - [${issue.path.join('.')}] : ${issue.message}`);
  });

  process.exit(1);
}

const envData = _env.data;

export const ENV_CONFIG = {
  ...envData,
  IS_DEVELOPMENT: envData.NODE_ENV === 'development',
  IS_PRODUCTION: envData.NODE_ENV === 'production',

  // Strict typing for Token Life
  ACCESS_TOKEN_LIFE: envData.ACCESS_TOKEN_LIFE as `${number}${'m' | 'h' | 'd'}`,
  REFRESH_TOKEN_LIFE:
    envData.REFRESH_TOKEN_LIFE as `${number}${'m' | 'h' | 'd'}`,
} as const;

export type EnvConfig = z.infer<typeof envSchema>;
