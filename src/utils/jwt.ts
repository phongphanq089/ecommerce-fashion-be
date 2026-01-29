import bcrypt from 'bcryptjs';
import { ENV_CONFIG } from '@/config/env';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, ENV_CONFIG.BCRYPT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
