// src/modules/user/user.controller.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserInput } from './schema/user.schema';
import { createUser, getUsers } from './user.service';

export async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  const user = await createUser(request.body);
  return reply.code(201).send(user);
}

export async function getUsersHandler() {
  const users = await getUsers();
  return users;
}
