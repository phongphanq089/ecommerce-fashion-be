import { FastifyInstance } from 'fastify';
import { createUserHandler, getUsersHandler } from './user.controller';
import {
  createUserSchema,
  userResponseSchema,
  usersResponseSchema,
} from './schema/user.schema';
import { USER_DESCRIPTIONS, USER_SUMMARIES, USER_TAG } from './user.docs';

async function userRoutes(server: FastifyInstance) {
  server.post(
    '/',
    {
      schema: {
        summary: USER_SUMMARIES.CREATE,
        description: USER_DESCRIPTIONS.CREATE,
        tags: [USER_TAG],
        body: createUserSchema,
        response: {
          201: userResponseSchema,
        },
      },
    },
    createUserHandler
  );

  server.get(
    '/',
    {
      schema: {
        summary: USER_SUMMARIES.GET_ALL,
        description: USER_DESCRIPTIONS.GET_ALL,
        tags: [USER_TAG],
        response: {
          200: usersResponseSchema,
        },
      },
    },
    getUsersHandler
  );
}

export default userRoutes;
