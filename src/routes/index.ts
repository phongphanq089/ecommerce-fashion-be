import logRoute from '@/modules/log/log.route';
import userRoutes from '@/modules/user/user.route';
import { FastifyInstance } from 'fastify';

const registerRoutes = (server: FastifyInstance) => {
  server.register(userRoutes, { prefix: '/api/users' });
  server.register(logRoute, { prefix: '/api/logs' });
};

export default registerRoutes;
