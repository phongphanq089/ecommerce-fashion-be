import { Database } from '@/plugins/database';
import { RegisterInput } from './auth.validation';
import { profiles, refreshTokens, users } from '@/db/schema';
import { createId } from '@paralleldrive/cuid2';
import { hashPassword } from '@/utils/jwt';
import { eq } from 'drizzle-orm';
import { ENV_CONFIG } from '@/config/env';
import ms from 'ms';

export class AuthRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findUserByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }
  async findUserById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }
  async findRefreshToken(refreshToken: string) {
    return this.db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, refreshToken),
    });
  }

  async createRefreshToken(userId: string) {
    const expiresAt = new Date(Date.now() + ms(ENV_CONFIG.REFRESH_TOKEN_LIFE));
    const refreshToken = createId();

    await this.db.insert(refreshTokens).values({
      id: createId(),
      token: refreshToken,
      userId: userId,
      expiresAt: expiresAt,
    });

    return refreshToken;
  }

  async createUser(data: RegisterInput) {
    const { email, password, name, avatarUrl } = data;

    const hashedPassword = await hashPassword(password);
    const userId = createId();

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

    await this.db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email,
        name,
        password: hashedPassword,
        avatarUrl,
        emailVerified: false,
      });

      const newProfile: typeof profiles.$inferInsert = {
        userId: userId,
        firstName: firstName as string,
        lastName: lastName as string,
      };

      await tx.insert(profiles).values(newProfile);
    });

    return { message: 'User registered successfully' };
  }

  async deleteRefreshToken(refreshToken: string) {
    return this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));
  }

  async getProfile(userId: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        password: false,
      },
      with: {
        profile: true,
      },
    });
  }
}
