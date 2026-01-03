import fp from 'fastify-plugin'; //  Giúp plugin hoạt động đúng lifecycle của Fastify (đảm bảo decorate an toàn)
import { FastifyPluginAsync } from 'fastify';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

export type Database = NodePgDatabase<typeof schema>;

// Rất quan trọng! Cho TypeScript biết fastify.db tồn tại → autocomplete + type-safe khi dùng fastify.db.query.users.findMany()
declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify) => {
  // Tạo connection pool → hiệu suất cao, tái sử dụng connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    max: 20,
    idleTimeoutMillis: 30000, // Cực kỳ quan trọng với Neon (dùng PgBouncer) → tránh lỗi "too many connections" hoặc timeout
    connectionTimeoutMillis: 2000,
  });

  const db = drizzle(pool, { schema }); // Truyền schema để Drizzle hiểu relations → dùng được db.query + with siêu mạnh
  fastify.decorate<Database>('db', db); // Attach db vào instance → dùng được fastify.db khắp nơi

  fastify.addHook('onClose', async () => {
    await pool.end(); // Đóng connection pool khi server tắt
  });
};

export default fp(databasePlugin);
