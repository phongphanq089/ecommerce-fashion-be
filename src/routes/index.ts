import logRoute from '@/modules/log/log.route';
import mediaRoutes from '@/modules/media-file/media.route';
import { mediaFolderRoutes } from '@/modules/media-folder/media-folder.route';
import userRoutes from '@/modules/user/user.route';
import { FastifyInstance } from 'fastify';

const registerRoutes = (server: FastifyInstance) => {
  server.register(userRoutes, { prefix: '/api/users' });
  server.register(mediaRoutes, { prefix: '/api/media-file' });
  server.register(mediaFolderRoutes, { prefix: '/api/media-folder' });
  server.register(logRoute, { prefix: '/api/logs' });
};

export default registerRoutes;
