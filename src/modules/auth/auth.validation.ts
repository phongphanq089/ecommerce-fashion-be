import z from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { users } from '@/db/schema';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(3),
  avatarUrl: z.string().optional(),
  urlRedirect: z.string().url().optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const getMeSchema = createSelectSchema(users);

export const logoutSchema = z.object({});

export const refreshTokenSchema = z.object({});

export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Please enter valid email address' }),
  urlRedirect: z.string().url().optional(),
});

export const resetPasswordSchema = z.object({
  email: z.email({ message: 'Please enter valid email address' }),
  password: z.string().min(6),
  token: z.string(),
});

export const verifyEmailSchema = z.object({
  email: z.email({ message: 'Please enter valid email address' }),
  token: z.string(),
});

export const resendVerifyEmailSchema = z.object({
  email: z.email({ message: 'Please enter valid email address' }),
  urlRedirect: z.url().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GetMeInput = z.infer<typeof getMeSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerifyEmailInput = z.infer<typeof resendVerifyEmailSchema>;

export type Users = typeof users.$inferSelect;
