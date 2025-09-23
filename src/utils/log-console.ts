import { ENV_CONFIG } from '@/config/env';
import chalk from 'chalk';
import CFonts from 'cfonts';

export const LOGGER_CONSOLE = {
  info: (msg: string) => {
    console.log(chalk.cyanBright(`[INFO] ${msg}`));
  },
  success: (msg: string) => {
    console.log(chalk.greenBright(`[SUCCESS] ${msg}`));
  },
  warn: (msg: string) => {
    console.log(chalk.yellowBright(`[WARN] ${msg}`));
  },
  error: (msg: string, err?: any) => {
    console.error(chalk.redBright(`[ERROR] ${msg}`), err || '');
  },

  logStartupInfo: () => {
    console.log(
      CFonts.say('ECOMMERCE API', {
        font: 'block', // 'block', 'simple', '3d', 'simpleBlock', 'chrome'
        align: 'left',
        colors: ['cyan', 'magenta'],
        background: 'transparent',
        letterSpacing: 1,
        lineHeight: 1,
        space: true,
        maxLength: '0',
      })
    );

    console.table({
      'App Name': 'JWT-AUTHENTICATION-REACT-FASTIFY',
      Environment: process.env.NODE_ENV || 'development',
      Host: ENV_CONFIG.HOST,
      Port: ENV_CONFIG.PORT,
      'API Prefix': '/api',
      'JWT Secret':
        ENV_CONFIG.REFRESH_TOKEN_SECRET_SIGNATURE &&
        ENV_CONFIG.ACCESS_TOKEN_SECRET_SIGNATURE
          ? '✔️ Loaded'
          : '❌ Not Set',
      'Started At': new Date().toLocaleString(),
    });

    console.log(
      chalk.greenBright(
        `\n🌐 Ready at: http://${ENV_CONFIG.HOST}:${ENV_CONFIG.PORT}`
      )
    );
    console.log(
      chalk.blueBright(
        `📦 API entry: http://${ENV_CONFIG.HOST}:${ENV_CONFIG.PORT}/api/v1`
      )
    );
    console.log(
      chalk.gray(
        `🧪 Health check: http://${ENV_CONFIG.HOST}:${ENV_CONFIG.PORT}/`
      )
    );
    console.log('');
  },
};
