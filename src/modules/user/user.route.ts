// src/modules/user/user.route.ts
import { FastifyInstance } from 'fastify';
import { createUserHandler, getUsersHandler } from './user.controller';
import {
  createUserSchema,
  userResponseSchema,
  usersResponseSchema,
} from './user.schema';
// Import trực tiếp Zod schema thay vì $ref

async function userRoutes(server: FastifyInstance) {
  server.post(
    '/',
    {
      schema: {
        summary: 'Create a new user', // Thêm mô tả cho endpoint
        tags: ['Users'], // Gom nhóm các endpoint
        body: createUserSchema, // Dùng trực tiếp Zod schema
        response: {
          201: userResponseSchema, // Dùng trực tiếp Zod schema
        },
      },
    },
    createUserHandler
  );

  server.get(
    '/',
    {
      schema: {
        summary: 'Get all users',
        tags: ['Users'],
        response: {
          200: usersResponseSchema,
        },
      },
    },
    getUsersHandler
  );
}

export default userRoutes;
