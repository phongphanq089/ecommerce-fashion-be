import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '@/db/schema';
import { ENV_CONFIG } from '@/config/env';
import { createAuthMiddleware, emailOTP } from 'better-auth/plugins';
import { db } from '@/db/config';
import { profiles as profilesTable } from '@/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  baseURL: ENV_CONFIG.BETTER_AUTH_URL,
  secret: ENV_CONFIG.BETTER_AUTH_SECRET!,
  // Cấu hình trustedOrigins để gửi email xác thực
  trustedOrigins: [
    'http://localhost:3000',
    'https://example.com',
    'https://your-production-frontend.com',
  ],
  user: {
    model: schema.users,
    fields: {
      email: 'email',
      password: 'password',
      name: 'name',
      avatarUrl: 'avatarUrl',
      emailVerified: 'emailVerified',
      createdAt: 'createAt',
      updatedAt: 'updateAt',
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`🚀 Đang gửi link reset pass đến ${user.email}`);
      console.log(`🔗 Link là: ${url}`);
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log('=============> Đang gửi OTP cho:', email);
        console.log('=============> Mã là:', otp);

        if (type === 'email-verification') {
          // Gọi Nodemailer gửi mail xác thực
          console.log(
            email,
            `=============>  Xác thực Email Mã của bạn <=============: ${otp}`
          );
        } else if (type === 'sign-in') {
          // Gọi Nodemailer gửi mail login (nếu dùng tính năng login bằng OTP)
        } else if (type === 'forget-password') {
          console.log(
            email,
            `=============> Quên mật khẩu plugins emailOTP <=============: ${otp}`
          );
          // Better-auth tách riêng logic quên mật khẩu ở config khác,
          // nhưng plugin email-otp đôi khi cũng hỗ trợ flow này tùy version.
        }
      },
    }),
  ],
  // hooks: {
  //   after: createAuthMiddleware(async (ctx) => {
  //     const fullName = ctx.body.name || 'New User';
  //     const nameParts = fullName.trim().split(' ');

  //     const firstName = nameParts[0];
  //     const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  //     try {
  //       await db.insert(schema.profiles).values({
  //         userId: ctx.body.id,
  //         firstName,
  //         lastName,
  //       });
  //     } catch (error) {
  //       console.log(error, '======= Error creating profile ======');
  //     }
  //   }),
  // },
  databaseHooks: {
    user: {
      create: {
        // Hook này chạy SAU KHI user đã được insert vào DB thành công
        after: async (user) => {
          console.log('User vừa tạo có ID:', user.id);

          const fullName = user.name || 'New User';
          const nameParts = fullName.trim().split(' ');
          const firstName = nameParts[0];
          const lastName =
            nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

          try {
            const profileData = {
              userId: user.id as string,
              firstName: firstName as string,
              lastName: lastName as string,
            };
            await db.insert(profilesTable).values(profileData);
          } catch (error) {
            console.error('❌ error creating profile:', error);
            // Lưu ý: Không nên throw error ở đây nếu không muốn rollback cả user
          }
        },
      },
    },
  },
});
