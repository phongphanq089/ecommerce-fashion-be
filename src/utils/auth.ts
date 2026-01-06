import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '@/db/schema';
import { ENV_CONFIG } from '@/config/env';
import { emailOTP } from 'better-auth/plugins';
import { db } from '@/db/config';
import { profiles as profilesTable } from '@/db/schema';
import { BrevoProvider } from '@/provider/brevo-provider';

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
  socialProviders: {
    google: {
      enabled: true,
      clientId: ENV_CONFIG.GOOGLE_CLIENT_ID!,
      clientSecret: ENV_CONFIG.GOOGLE_CLIENT_SECRET!,
    },
  },
  advanced: {
    // Tắt Secure cookie để trình duyệt chịu lưu ở http://
    useSecureCookies: false,
  },

  // 👇 CẤU HÌNH COOKIE CỤ THỂ HƠN
  cookie: {
    secure: false, // Bắt buộc false
    sameSite: 'lax', // Dùng 'lax' thay vì 'none' hay 'strict' cho localhost
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ENV_CONFIG.CLIENT_URL,
  ],
  user: {
    model: schema.users,
    fields: {
      email: 'email',
      password: 'password',
      name: 'name',
      image: 'avatarUrl',
      emailVerified: 'emailVerified',
      createdAt: 'createAt',
      updatedAt: 'updateAt',
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const token = url.split('/reset-password/')[1]?.split('?')[0];

      const clientUrl = ENV_CONFIG.CLIENT_URL || 'http://localhost:3000';
      const frontendLink = `${clientUrl}/reset-password?token=${token}`;

      try {
        await BrevoProvider.sendMail(
          user.email,
          'Reset Password',
          {
            name: user.name || user.email,
            companyName: 'Ecommerce Fashion',
            companyDomain: 'ecommerce-fashion.com',
            resetLink: frontendLink,
            logoUrl:
              'https://trungquandev.com/wp-content/uploads/2020/08/logo-trungquandev-white-bg.jpg',
            year: `${new Date().getFullYear()}`,
          },
          'src/templates/reset-password.html'
        );
      } catch (error: any) {
        console.error('❌ Error sending reset password email:', error);
      }
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (ENV_CONFIG.NODE_ENV === 'development') {
          console.log('=============> Sending OTP to:', email);
          console.log('=============> OTP is:', otp);
        }

        if (type === 'email-verification') {
          try {
            const response = await BrevoProvider.sendMail(
              email,
              'WELCOME TO ECOMMERCE FASHION',
              {
                name: email,
                companyName: 'Trello Clone',
                companyDomain: 'trungquandev.com',
                otp,
                logoUrl:
                  'https://trungquandev.com/wp-content/uploads/2020/08/logo-trungquandev-white-bg.jpg',
                year: `${new Date().getFullYear()}`,
              },
              'src/templates/template-mail.html'
            );
            if (ENV_CONFIG.NODE_ENV === 'development') {
              console.log(
                '✅ OTP sent successfully! MessageId:',
                response.body.messageId
              );
            }
          } catch (error: any) {
            // QUAN TRỌNG: Log chi tiết lỗi ra
            console.error(
              '❌ ERROR SENDING OTP:',
              JSON.stringify(error.body || error, null, 2)
            );
          }
          if (ENV_CONFIG.NODE_ENV === 'development') {
            console.log(
              email,
              `=============>  OTP sent successfully <=============: ${otp}`
            );
          }
        } else if (type === 'sign-in') {
          // Gọi Nodemailer gửi mail login (nếu dùng tính năng login bằng OTP)
        } else if (type === 'forget-password') {
          console.log(
            email,
            `=============> Forgot password plugins emailOTP <=============: ${otp}`
          );
          // Better-auth tách riêng logic quên mật khẩu ở config khác,
          // nhưng plugin email-otp đôi khi cũng hỗ trợ flow này tùy version.
        }
      },
    }),
  ],

  databaseHooks: {
    user: {
      create: {
        // Hook này chạy SAU KHI user đã được insert vào DB thành công
        after: async (user) => {
          console.log('👉 HOOK USER DATA:', JSON.stringify(user, null, 2));

          if (!user || !user.id) {
            console.error('❌ Lỗi: User không có ID, không thể tạo Profile.');
            return;
          }

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
