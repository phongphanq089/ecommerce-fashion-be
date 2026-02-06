import { authRoutes } from '@/modules/auth/auth.route';
import logRoute from '@/modules/log/log.route';
import mediaRoutes from '@/modules/media-file/media.route';
import { mediaFolderRoutes } from '@/modules/media-folder/media-folder.route';
import { productRoutes } from '@/modules/product/product.route';
import { FastifyInstance } from 'fastify';

const registerRoutes = (server: FastifyInstance) => {
  server.register(authRoutes, { prefix: '/api/auth' });
  server.register(mediaRoutes, { prefix: '/api/media-file' });
  server.register(mediaFolderRoutes, { prefix: '/api/media-folder' });
  server.register(productRoutes, { prefix: '/api/product' });
  server.register(logRoute, { prefix: '/api/logs' });
};

export default registerRoutes;
