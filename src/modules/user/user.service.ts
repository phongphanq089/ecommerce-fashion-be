// src/modules/user/user.service.ts
import { CreateUserInput } from './user.schema';

// Đây là một CSDL giả lập để minh họa
const db = {
  users: [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
  ],
};

export async function createUser(input: CreateUserInput) {
  const newUser = {
    id: db.users.length + 1,
    ...input,
  };
  db.users.push(newUser);
  return newUser;
}

export async function getUsers() {
  return db.users;
}
