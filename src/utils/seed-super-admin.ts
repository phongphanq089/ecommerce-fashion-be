import { db } from '@/db/config';
import { profiles, users } from '@/db/schema';
import { ENV_CONFIG } from '@/config/env';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { hashPassword } from './jwt';

export const seedSuperAdmin = async () => {
  if (
    !ENV_CONFIG.SUPER_ADMIN_EMAIL ||
    !ENV_CONFIG.SUPER_ADMIN_PASSWORD ||
    !ENV_CONFIG.SUPER_ADMIN_NAME
  ) {
    console.log(
      '⚠️ SUPER_ADMIN credentials missing in .env. Skipping seeding.'
    );
    return;
  }

  try {
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, ENV_CONFIG.SUPER_ADMIN_EMAIL),
    });

    if (existingAdmin) {
      console.log('✅ Super Admin already exists.');
      return;
    }

    const hashedPassword = await hashPassword(ENV_CONFIG.SUPER_ADMIN_PASSWORD);
    const userId = createId();

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
        email: ENV_CONFIG.SUPER_ADMIN_EMAIL!,
        name: ENV_CONFIG.SUPER_ADMIN_NAME!,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        emailVerified: true,
      });

      const nameParts = ENV_CONFIG.SUPER_ADMIN_NAME!.trim().split(' ');
      const firstName = nameParts[0];
      const lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

      const newProfile: typeof profiles.$inferInsert = {
        userId: userId,
        firstName: firstName as string,
        lastName: lastName as string,
      };

      await tx.insert(profiles).values(newProfile);
    });

    console.log('🚀 Super Admin created successfully!');
  } catch (error) {
    console.error('❌ Failed to seed Super Admin:', error);
  }
};
