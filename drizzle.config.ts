import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql', // Or 'mysql', 'sqlite'
  dbCredentials: {
    // Dùng DIRECT_URL để chạy migration ổn định nhất
    url: process.env.DIRECT_URL!,
  },
});
