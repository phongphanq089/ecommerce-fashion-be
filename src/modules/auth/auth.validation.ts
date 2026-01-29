import z from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '@/db/schema';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(3),
  avatarUrl: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const getMeSchema = createSelectSchema(users);

export const logoutSchema = z.object({});

export const refreshTokenSchema = z.object({});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  token: z.string(),
});

export const verifyEmailSchema = z.object({
  email: z.email(),
  token: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GetMeInput = z.infer<typeof getMeSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export type Users = typeof users.$inferSelect;
