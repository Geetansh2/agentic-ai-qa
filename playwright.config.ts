import { defineConfig } from '@playwright/test';
import { envConfig } from './config/env';

const isCI = !!process.env.CI;

const parsedWorkers = process.env.PLAYWRIGHT_WORKERS
  ? Number(process.env.PLAYWRIGHT_WORKERS)
  : undefined;

const workers =
  parsedWorkers && Number.isFinite(parsedWorkers) && parsedWorkers > 0
    ? parsedWorkers
    : isCI
      ? 1
      : 2;

export default defineConfig({
  testDir: './tests',

  workers,
  retries: 0,

  use: {
    baseURL: envConfig.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  reporter: [['list'], ['allure-playwright']],
});
