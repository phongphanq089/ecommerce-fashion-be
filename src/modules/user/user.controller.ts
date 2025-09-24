// src/modules/user/user.controller.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserInput } from './schema/user.schema';
import { createUser, getUsers } from './user.service';

export async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  try {
    const user = await createUser(request.body);
    return reply.code(201).send(user);
  } catch (e) {
    console.error(e);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export async function getUsersHandler() {
  const users = await getUsers();
  return users;
}
