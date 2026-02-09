import { authRoutes } from '@/modules/auth/auth.route';
import logRoute from '@/modules/log/log.route';
import mediaRoutes from '@/modules/media/media.route';
import { productRoutes } from '@/modules/product/product.route';
import { FastifyInstance } from 'fastify';

const registerRoutes = (server: FastifyInstance) => {
  server.register(authRoutes, { prefix: '/api/auth' });
  server.register(mediaRoutes, { prefix: '/api/media' });
  server.register(productRoutes, { prefix: '/api/product' });
  server.register(logRoute, { prefix: '/api/logs' });
};

export default registerRoutes;
