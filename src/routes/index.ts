import logRoute from '@/modules/log/log.route';
import mediaRoutes from '@/modules/media/media.route';
import userRoutes from '@/modules/user/user.route';
import { FastifyInstance } from 'fastify';

const registerRoutes = (server: FastifyInstance) => {
  server.register(userRoutes, { prefix: '/api/users' });
  server.register(mediaRoutes, { prefix: '/api/media' });
  server.register(logRoute, { prefix: '/api/logs' });
};

export default registerRoutes;
