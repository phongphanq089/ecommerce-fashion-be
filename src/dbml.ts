import * as schema from './db/schema'; // Trỏ đúng vào file schema của bạn
import { pgGenerate } from 'drizzle-dbml-generator';

const out = './schema.dbml';
const relational = true;

pgGenerate({ schema, out, relational });
console.log('✅ Đã tạo xong file schema.dbml');
