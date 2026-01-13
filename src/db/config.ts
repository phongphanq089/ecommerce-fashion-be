// src/db/config.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { ENV_CONFIG } from '@/config/env'; // Hoặc process.env

// 1. Tạo Pool ở ngoài scope plugin
export const pool = new Pool({
  connectionString: ENV_CONFIG.DATABASE_URL, // hoặc process.env.DATABASE_URL
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 2. Tạo instance Drizzle và EXPORT nó ra
export const db = drizzle(pool, { schema });
