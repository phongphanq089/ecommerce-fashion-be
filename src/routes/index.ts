import userRoutes from '@/modules/user/user.route';
import { FastifyInstance } from 'fastify';

const registerRoutes = (server: FastifyInstance) => {
  server.register(userRoutes, { prefix: '/api/users' });
};

export default registerRoutes;
