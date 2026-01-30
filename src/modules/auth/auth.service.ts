import { db } from '@/db/config';
import { refreshTokens } from '@/db/schema';
import { comparePassword, hashPassword } from '@/utils/jwt';
import crypto from 'crypto';
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
  BadRequestError,
} from '@/utils/errors';
import { FastifyInstance } from 'fastify';
import { BrevoProvider } from '@/provider/brevo-provider';

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

    const user = await this.repo.createUser(data);

    const redirectUrl = data.urlRedirect || ENV_CONFIG.URL_REDIRECT_FE;

    await BrevoProvider.sendMail(
      user?.email as string,
      'WELCOME TO ECOMMERCE FASHION',
      {
        name: user?.email as string,
        companyName: 'APK APP',
        companyDomain: 'phongphan.com',
        verificationUrl: `${redirectUrl}/verify-email?email=${user?.email}&token=${user?.verificationToken}`,
        logoUrl:
          'https://ik.imagekit.io/htnacim0q/media-ak-shop/setting/logo-app.png',
        year: `${new Date().getFullYear()}`,
      },
      'src/templates/template-mail.html'
    );

    return user;
  }

  async login(server: FastifyInstance, data: LoginInput) {
    const findUserByEmail = await this.repo.findUserByEmail(data.email);

    if (!findUserByEmail) {
      throw new NotFoundError('User not found');
    }

    const isValid = await comparePassword(
      data.password,
      findUserByEmail.password as string
    );

    if (!isValid) {
      throw new UnauthorizedError(
        'Invalid email or password (Password not match)'
      );
    }

    if (!findUserByEmail.emailVerified) {
      throw new UnauthorizedError('Email not verified');
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

  async verifyEmail(email: string, token: string) {
    const user = await this.repo.findUserByEmail(email);
    if (!user) throw new NotFoundError('User not found');
    if (user.verificationToken !== token)
      throw new UnauthorizedError('Invalid token');
    if (
      user.verificationTokenExpires &&
      user.verificationTokenExpires < new Date()
    ) {
      throw new UnauthorizedError('Token expired');
    }
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await this.repo.updateUser(user);
    return user;
  }

  async resendVerificationEmail(email: string, urlRedirect?: string) {
    const user = await this.repo.findUserByEmail(email);
    if (!user) throw new NotFoundError('User not found');
    if (user.emailVerified) throw new BadRequestError('User already verified');

    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.repo.updateUser(user);

    const redirectUrl = urlRedirect || ENV_CONFIG.URL_REDIRECT_FE;

    await BrevoProvider.sendMail(
      user.email,
      'RESEND VERIFICATION EMAIL',
      {
        name: user.email,
        companyName: 'APK_SHOP',
        companyDomain: 'phongphan.com',
        verificationUrl: `${redirectUrl}/verify-email?email=${user.email}&token=${user.verificationToken}`,
        logoUrl:
          'https://ik.imagekit.io/htnacim0q/media-ak-shop/setting/logo-app.png',
        year: `${new Date().getFullYear()}`,
      },
      'src/templates/template-mail.html'
    );

    return { message: 'Verification email sent successfully' };
  }

  async forgotPassword(email: string, urlRedirect?: string) {
    const user = await this.repo.findUserByEmail(email);
    if (!user) throw new NotFoundError('User not found');
    if (!user.emailVerified) throw new BadRequestError('User not verified');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await this.repo.updateUser(user);

    const redirectUrl = urlRedirect || ENV_CONFIG.URL_REDIRECT_FE;

    await BrevoProvider.sendMail(
      user.email,
      'FORGOT PASSWORD',
      {
        name: user.email,
        companyName: 'APK_SHOP',
        companyDomain: 'phongphan.com',
        // Update URL to use resetToken
        resetPasswordUrl: `${redirectUrl}/reset-password?email=${user.email}&token=${resetToken}`,
        logoUrl:
          'https://ik.imagekit.io/htnacim0q/media-ak-shop/setting/logo-app.png',
        year: `${new Date().getFullYear()}`,
      },
      'src/templates/reset-password.html'
    );

    return { message: 'Reset password email sent successfully' };
  }

  async resetPassword(email: string, token: string, password?: string) {
    const user = await this.repo.findUserByEmail(email);
    if (!user) throw new NotFoundError('User not found');
    if (!user.emailVerified) throw new BadRequestError('User not verified');

    if (
      user.resetPasswordToken !== token ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    if (!password) {
      throw new BadRequestError('Password is required');
    }

    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.repo.updateUser(user);

    return { message: 'Password reset successfully' };
  }
}
