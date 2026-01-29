import { db } from '@/db/config';
import { refreshTokens } from '@/db/schema';
import { comparePassword } from '@/utils/jwt';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { ENV_CONFIG } from '@/config/env';
import ms from 'ms';
import { AuthRepository } from './auth.repository';
import { LoginInput, RegisterInput } from './auth.validation';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@/utils/errors';
import { FastifyInstance } from 'fastify';

export class AuthService {
  private repo: AuthRepository;

  constructor(repo: AuthRepository) {
    this.repo = repo;
  }
  async register(data: RegisterInput) {
    const existingUser = await this.repo.findUserByEmail(data.email);

    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    return this.repo.createUser(data);
  }

  async login(server: FastifyInstance, data: LoginInput) {
    const findUserByEmail = await this.repo.findUserByEmail(data.email);

    if (!findUserByEmail) {
      throw new NotFoundError('User not found');
    }

    const isValid = await comparePassword(
      data.password,
      findUserByEmail.password
    );

    if (!isValid) {
      throw new UnauthorizedError(
        'Invalid email or password (Password not match)'
      );
    }

    const accessToken = server.jwt.sign({
      id: findUserByEmail.id,
      email: findUserByEmail.email,
      role: findUserByEmail.role,
    });

    const refreshToken = await this.repo.createRefreshToken(findUserByEmail.id);
    return {
      accessToken,
      refreshToken,
      user: {
        id: findUserByEmail.id,
        email: findUserByEmail.email,
        name: findUserByEmail.name,
        role: findUserByEmail.role,
        avatarUrl: findUserByEmail.avatarUrl,
      },
    };
  }

  async logout(refreshToken: string) {
    const findRefreshToken = await this.repo.findRefreshToken(refreshToken);

    if (!findRefreshToken) {
      throw new NotFoundError('Refresh token not found');
    }

    await this.repo.deleteRefreshToken(refreshToken);
    return { message: 'Logged out successfully' };
  }

  async refresh(server: FastifyInstance, refreshToken: string) {
    const findRefreshToken = await this.repo.findRefreshToken(refreshToken);

    if (!findRefreshToken) {
      throw new NotFoundError('Refresh token not found');
    }

    if (findRefreshToken.revoked) {
      throw new UnauthorizedError('Refresh token revoked');
    }
    if (findRefreshToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }
    const findUserById = await this.repo.findUserById(findRefreshToken.userId);

    if (!findUserById) {
      throw new NotFoundError('User not found');
    }

    const accessToken = server.jwt.sign({
      id: findRefreshToken.userId,
      email: findUserById.email,
      role: findUserById.role,
    });

    // Optional: Rotate Refresh Token (Create new one, delete old one)
    // For now, simpler approach: keep using same refresh token until expiry, or issue new one?
    // Let's implement rotation for better security

    const newRefreshToken = createId();
    const newExpiresAt = new Date(
      Date.now() + ms(ENV_CONFIG.REFRESH_TOKEN_LIFE)
    );

    await db.transaction(async (tx) => {
      await tx
        .update(refreshTokens)
        .set({ revoked: true })
        .where(eq(refreshTokens.token, refreshToken));
      await tx.insert(refreshTokens).values({
        id: createId(),
        token: newRefreshToken,
        userId: findRefreshToken.userId,
        expiresAt: newExpiresAt,
      });
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.repo.getProfile(userId);

    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
