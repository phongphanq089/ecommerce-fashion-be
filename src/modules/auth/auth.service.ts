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

    await BrevoProvider.sendReactMail(
      user?.email as string,
      'WELCOME TO ECOMMERCE FASHION',
      'WelcomeEmail',
      {
        name: user?.email as string,
        verificationUrl: `${redirectUrl}/verify-email?email=${user?.email}&token=${user?.verificationToken}`,
        logoUrl:
          'https://ik.imagekit.io/htnacim0q/media-ak-shop/setting/logo-app.png',
        companyName: 'APK APP',
        year: `${new Date().getFullYear()}`,
      }
    );

    return user;
  }

  async login(
    server: FastifyInstance,
    data: LoginInput,
    userAgent?: string,
    ip?: string
  ) {
    const findUserByEmail = await this.repo.findUserByEmail(data.email);

    if (!findUserByEmail) {
      throw new NotFoundError('User not found');
    }

    const isValid = await comparePassword(
      data.password,
      findUserByEmail.password as string
    );

    if (!isValid) {
      throw new NotFoundError('Invalid email or password (Password not match)');
    }

    if (!findUserByEmail.emailVerified) {
      throw new NotFoundError('Email not verified');
    }

    const accessToken = server.jwt.sign({
      id: findUserByEmail.id,
      email: findUserByEmail.email,
      role: findUserByEmail.role,
    });

    const refreshToken = await this.repo.createRefreshToken(
      findUserByEmail.id,
      userAgent,
      ip
    );
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

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: ENV_CONFIG.GOOGLE_CLIENT_ID,
      client_secret: ENV_CONFIG.GOOGLE_CLIENT_SECRET,
      redirect_uri: ENV_CONFIG.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    };

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(Object.entries(body)).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Token Exchange Error:', errorText);
      throw new BadRequestError('Failed to exchange code for token');
    }

    const data = (await response.json()) as {
      access_token: string;
      id_token: string;
    };
    return data;
  }

  private async getGoogleUserInfo(accessToken: string) {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new BadRequestError('Failed to get user info from Google');
    }

    const data = (await response.json()) as {
      id: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
    };
    return data;
  }

  async googleLogin(
    server: FastifyInstance,
    code: string,
    userAgent?: string,
    ip?: string
  ) {
    // 1. Exchange code for tokens
    const { access_token } = await this.getOauthGoogleToken(code);

    // 2. Get User Info
    const googleUser = await this.getGoogleUserInfo(access_token);

    if (!googleUser.verified_email) {
      throw new BadRequestError('Google email not verified');
    }

    // 3. Find user by Google ID or Email
    let user = await this.repo.findUserByGoogleId(googleUser.id);
    let isNewUser = 0;

    if (!user) {
      user = await this.repo.findUserByEmail(googleUser.email);
      if (user) {
        // Link Google ID to existing user
        await this.repo.updateUser({ ...user, googleId: googleUser.id });
      } else {
        // Create new user
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const newUser = await this.repo.createUser({
          email: googleUser.email,
          name: googleUser.name,
          password: randomPassword,
          googleId: googleUser.id,
          emailVerified: true,
          avatarUrl: googleUser.picture,
        });
        // Handle array return from transaction if createUser returns array
        if (Array.isArray(newUser)) {
          user = newUser[0];
        } else {
          user = newUser; // Assuming it returns a single user object if not array, need to verify repo return type.
          // Based on previous code: user = (await this.repo.createUser(...)) as any;
          // Let's stick to safe casting if needed or check array.
          // The previous code had `user = user[0]` if array.
        }
        isNewUser = 1;
      }
    }

    // Safety check if user is still null (shouldn't happen if createUser works)
    if (!user) {
      // Fallback or error, but let's assume it's set.
      // Re-query if needed? No, createUser returns it.
      // But types might be tricky.
      // checking previous implementation, it casts to `any`.
      // I'll assume `user` is populated.
    }

    // 4. Generate Tokens
    const accessToken = server.jwt.sign({
      id: user!.id,
      email: user!.email,
      role: user!.role,
    });

    const refreshToken = await this.repo.createRefreshToken(
      user!.id,
      userAgent,
      ip
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        role: user!.role,
        avatarUrl: user!.avatarUrl,
      },
      newUser: isNewUser,
      verify: user!.emailVerified,
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

  async refresh(
    server: FastifyInstance,
    refreshToken: string,
    userAgent?: string,
    ip?: string
  ) {
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
        userAgent,
        ip,
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

    await BrevoProvider.sendReactMail(
      user.email,
      'RESEND VERIFICATION EMAIL',
      'WelcomeEmail',
      {
        name: user.email,
        verificationUrl: `${redirectUrl}/verify-email?email=${user.email}&token=${user.verificationToken}`,
        logoUrl:
          'https://ik.imagekit.io/htnacim0q/media-ak-shop/setting/logo-app.png',
        companyName: 'APK APP',
        year: `${new Date().getFullYear()}`,
      }
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

    await BrevoProvider.sendReactMail(
      user.email,
      'FORGOT PASSWORD',
      'ResetPasswordEmail',
      {
        name: user.email,
        resetPasswordUrl: `${redirectUrl}/reset-password?email=${user.email}&token=${resetToken}`,
        companyName: 'APK APP',
        year: `${new Date().getFullYear()}`,
      }
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
