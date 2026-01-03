import { logger } from './logger';
import chalk from 'chalk';
import CFonts from 'cfonts';
import { ENV_CONFIG } from '@/config/env';

export const LOGGER_CONSOLE = {
  info: (msg: string) => {
    logger.info(msg);
    if (ENV_CONFIG.IS_DEVELOPMENT) {
      console.log(
        chalk.cyanBright(`[INFO] ${new Date().toLocaleTimeString()} - ${msg}`)
      );
    }
  },

  success: (msg: string) => {
    logger.info(`SUCCESS: ${msg}`);
    if (ENV_CONFIG.IS_DEVELOPMENT) {
      console.log(
        chalk.greenBright(
          `[SUCCESS] ${new Date().toLocaleTimeString()} - ${msg}`
        )
      );
    }
  },

  error: (msg: string, err?: any) => {
    logger.error(`${msg} - ${err?.message || ''}`, { stack: err?.stack });
    console.error(chalk.redBright(`[ERROR] ${msg}`), err || '');
  },

  logStartupInfo: () => {
    // Nếu là Production, chỉ log ngắn gọn để tránh rác log hệ thống
    if (ENV_CONFIG.IS_PRODUCTION) {
      logger.info(
        `Server started on port ${ENV_CONFIG.PORT} in PRODUCTION mode`
      );
      return;
    }

    // 1. Banner rực rỡ cho Dev
    CFonts.say('ECOMMERCE-API', {
      font: 'block',
      align: 'left',
      colors: ['cyan', 'magenta'],
      letterSpacing: 1,
      lineHeight: 1,
      space: true,
    });

    // 2. Bảng trạng thái các biến môi trường (Chỉ check xem có tồn tại hay không)
    console.log(chalk.bold.yellow('--- SYSTEM STATUS ---'));
    console.table({
      'Node Version': process.version,
      Environment: chalk.bold(ENV_CONFIG.NODE_ENV.toUpperCase()),
      Port: ENV_CONFIG.PORT,
      Database: ENV_CONFIG.DATABASE_URL ? '✅ Connected' : '❌ Missing',
      ImageKit: ENV_CONFIG.IMAGE_KIT_PUBLIC_KEY
        ? '✅ Configured'
        : '⚠️ Not Set',
      Sentry: ENV_CONFIG.SENTRY_URL ? '✅ Integrated' : '⚠️ Disabled',
      'Mail Service': ENV_CONFIG.BREVO_API_KEY ? '✅ Active' : '⚠️ Passive',
    });

    // 3. Danh sách URLs để Dev click vào test ngay
    const LOCAL_BASE_URL = `http://${ENV_CONFIG.HOST}:${ENV_CONFIG.PORT}`;

    console.log(chalk.bold.green('\n🚀 SERVER IS READY TO SERVE:'));

    console.log(
      `${chalk.white('➜')}  ${chalk.bold('Local API:')}   ${chalk.blueBright(`${LOCAL_BASE_URL}/api/v1`)}`
    );
    console.log(
      `${chalk.white('➜')}  ${chalk.bold('Swagger UI:')}  ${chalk.blueBright(`${LOCAL_BASE_URL}/docs`)}`
    );
    console.log(
      `${chalk.white('➜')}  ${chalk.bold('Health Check:')} ${chalk.blueBright(`${LOCAL_BASE_URL}/`)}`
    );

    console.log(
      chalk.gray('\n---------------------------------------------------\n')
    );
  },
};
