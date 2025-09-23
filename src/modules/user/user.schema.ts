// src/modules/user/user.schema.ts
import { z } from 'zod';

const userCore = {
  name: z.string({
    error: 'Name is required',
  }),
  email: z.string().email(),
};

// Export trực tiếp các schema
export const createUserSchema = z.object({
  ...userCore,
});

export const userResponseSchema = z.object({
  id: z.number(),
  ...userCore,
});

export const usersResponseSchema = z.array(userResponseSchema);

export type CreateUserInput = z.infer<typeof createUserSchema>;
