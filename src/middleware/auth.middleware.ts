import { ForbiddenError, UnauthorizedError } from '@/utils/errors';
import { FastifyReply, FastifyRequest } from 'fastify';

export const authenticate = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Authentication required. Token missing.');
    }

    // Verify token using fastify-jwt
    await req.jwtVerify();

    // Optional: Check if user still exists in DB if needed, but for now rely on JWT validity
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const authorize = (roles: string[]) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { role: string };

    if (!user || !user.role) {
      throw new UnauthorizedError('User role not found');
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenError('Access denied');
    }
  };
};
