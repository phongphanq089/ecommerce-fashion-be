import { authRoutes } from '@/modules/auth/auth.route';
import logRoute from '@/modules/log/log.route';
import mediaRoutes from '@/modules/media/media.route';
import { productRoutes } from '@/modules/product/product.route';
import { collectionRoutes } from '@/modules/collection/collection.route';
import { FastifyInstance } from 'fastify';
import { settingRoutes } from '@/modules/setting/setting.route';
import { navigationRoutes } from '@/modules/navigation/navigation.route';

const registerRoutes = (server: FastifyInstance) => {
  server.register(authRoutes, { prefix: '/api/auth' });
  server.register(mediaRoutes, { prefix: '/api/media' });
  server.register(productRoutes, { prefix: '/api/products' });
  server.register(logRoute, { prefix: '/api/logs' });
  server.register(collectionRoutes, { prefix: '/api/collections' });
  server.register(navigationRoutes, { prefix: '/api/navigate' });
  server.register(settingRoutes, { prefix: '/api/settings' });
};

export default registerRoutes;
