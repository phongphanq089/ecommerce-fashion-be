// src/plugins/database.ts
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { db, pool } from '../db/config'; // <--- IMPORT TỪ FILE CẤU HÌNH MỚI

export type Database = NodePgDatabase<typeof schema>;

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify) => {
  // Không tạo pool hay db ở đây nữa, dùng cái đã import
  fastify.decorate<Database>('db', db);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
};

export default fp(databasePlugin);
