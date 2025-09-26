import { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { LOGS_DESCRIPTIONS, LOGS_SUMMARIES, LOGS_TAG } from './logs.docs';
import { createReadStream } from 'fs';
import readline from 'readline';
import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';

export default async function logRoute(fastify: FastifyInstance) {
  const logDir = path.resolve('logs');
  // ===== API GET FILES ==== ///
  (((fastify.get('/files', {
    schema: {
      summary: LOGS_SUMMARIES.GET_FILES,
      description: LOGS_DESCRIPTIONS.GET_FILES,
      tags: [LOGS_TAG],
    },
    handler: async (_, reply) => {
      const files = await fs.readdir(logDir);
      const logFiles = files.filter((f) => f.endsWith('.log'));

      return sendResponseSuccess(200, reply, 'Get Logfile ', logFiles);
    },
  }),
  fastify.get('/view/:filename', {
    schema: {
      summary: LOGS_SUMMARIES.VIEW_FILE,
      description: LOGS_DESCRIPTIONS.VIEW_FILE,
      tags: [LOGS_TAG],
    },
    handler: async (req, reply) => {
      // Bên trong handler của bạn
      const { filename } = req.params as { filename: string };

      // B1: Chuẩn hóa đường dẫn
      const intendedPath = path.normalize(path.join(logDir, filename));

      // B2: Kiểm tra xem đường dẫn đã chuẩn hóa có thực sự nằm trong thư mục log hay không
      if (!intendedPath.startsWith(logDir) || filename.includes('..')) {
        return reply.status(403).send({ error: 'Forbidden: Access denied' });
      }
      const filePath = intendedPath;

      try {
        const raw = await fs.readFile(filePath, 'utf-8');

        const lines = raw
          .split('\n')
          .filter(Boolean) // bỏ dòng trống
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch (err) {
              return { raw: line, error: 'Invalid JSON' };
            }
          });

        return sendResponseSuccess(
          200,
          reply,
          `Get Logfile ${filename}`,
          lines
        );
      } catch (e) {
        return sendResponseError(
          404,
          reply,
          `Log file ${filename} not found`,
          null
        );
      }
    },
  })),
  fastify.get('/search/:filename', {
    schema: {
      summary: LOGS_SUMMARIES.SEARCH_FILE,
      description: LOGS_DESCRIPTIONS.SEARCH_FILE,
      tags: [LOGS_TAG],
    },
    handler: async (req, reply) => {
      // Bên trong handler của bạn
      const { filename } = req.params as { filename: string };

      // B1: Chuẩn hóa đường dẫn
      const intendedPath = path.normalize(path.join(logDir, filename));

      // B2: Kiểm tra xem đường dẫn đã chuẩn hóa có thực sự nằm trong thư mục log hay không
      if (!intendedPath.startsWith(logDir) || filename.includes('..')) {
        return reply.status(403).send({ error: 'Forbidden: Access denied' });
      }

      const { keyword } = req.query as { keyword: string };

      const filePath = path.join(logDir, filename);
      try {
        const fileStream = createReadStream(filePath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        const matches = [];
        // Đọc file theo từng dòng, không load hết vào RAM
        for await (const line of rl) {
          if (line.includes(keyword)) {
            try {
              matches.push(JSON.parse(line));
            } catch {
              matches.push({ raw: line });
            }
          }
        }

        return sendResponseSuccess(
          200,
          reply,
          `Get Logfile ${filename}`,
          matches
        );
      } catch (e) {
        return sendResponseError(
          404,
          reply,
          `Unable to search log file ${filename}`,
          null
        );
      }
    },
  })),
    fastify.delete('/delete/:filename', {
      schema: {
        summary: LOGS_SUMMARIES.DELETE_FILE,
        description: LOGS_DESCRIPTIONS.DELETE_FILE,
        tags: [LOGS_TAG],
      },
      handler: async (req, reply) => {
        const { filename } = req.params as { filename: string };

        const filePath = path.join(logDir, filename);
        try {
          await fs.unlink(filePath);

          return sendResponseSuccess(
            200,
            reply,
            `Log file ${filename} deleted successfully`
          );
        } catch (e) {
          return sendResponseError(
            404,
            reply,
            `Log file ${filePath} not found`,
            null
          );
        }
      },
    }));
}
